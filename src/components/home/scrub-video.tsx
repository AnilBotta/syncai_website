"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { scrollProgress } from "@/components/three/experience/scroll-progress";
import { progressToTime } from "./tour-config";
import {
  DESKTOP_RENDITION_QUERY,
  TOUR_POSTER,
  TOUR_VIDEO_1080,
  TOUR_VIDEO_720,
} from "./tour-media";

type ScrubVideoProps = {
  /** True while the stage is off-screen or the tab is hidden. */
  paused?: boolean;
};

/**
 * Lenis already trails raw input by ~100-150ms, so this only needs to take the
 * edge off. CameraRig's 3.5 would stack ~285ms on top and the frame would
 * visibly lag the copy, which moves on Lenis's clock alone.
 */
const SCRUB_LAMBDA = 10;

/** Half a frame at 25fps — below this a seek is not worth issuing. */
const SEEK_EPSILON = 1 / 40;

/** If nothing has painted this long after metadata, fall back to the poster. */
const FIRST_FRAME_TIMEOUT_MS = 3000;

type NetworkInformation = {
  saveData?: boolean;
  effectiveType?: string;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
};

function connection() {
  return (navigator as Navigator & { connection?: NetworkInformation }).connection;
}

/** Data-saver or a 2G-class link: skip the download and stay on the poster. */
function prefersLessData() {
  const link = connection();
  if (!link) {
    return false;
  }
  return Boolean(link.saveData) || /(^|-)2g$/.test(link.effectiveType ?? "");
}

function subscribeToConnection(onChange: () => void) {
  const link = connection();
  link?.addEventListener?.("change", onChange);
  return () => link?.removeEventListener?.("change", onChange);
}

function onIdle(run: () => void) {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(run, { timeout: 1200 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(run, 0);
  return () => window.clearTimeout(id);
}

/**
 * The pinned hero: a muted video whose playhead is driven by scroll position
 * rather than by playback. Sits behind the chapter copy and fills the sticky
 * stage.
 *
 * Reads scroll from the `scrollProgress` module store that ScrollProgressBridge
 * feeds — the same polling pattern CameraRig and Station use — so no extra
 * scroll subscription and no React re-render per frame.
 */
export function ScrubVideo({ paused = false }: ScrubVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [painted, setPainted] = useState(false);
  /** Set only from the first-frame timeout — usually iOS Low Power Mode. */
  const [stalled, setStalled] = useState(false);
  const lowData = useSyncExternalStore(
    subscribeToConnection,
    prefersLessData,
    () => false
  );
  const degraded = lowData || stalled;

  // Attach the source after hydration so the poster is the LCP element and the
  // video does not compete for bandwidth with the rest of the page. Choosing
  // the rendition here rather than in JSX keeps the markup hydration-safe.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    if (lowData) {
      return;
    }
    return onIdle(() => {
      video.muted = true; // the JSX prop alone is unreliable through hydration
      video.preload = "auto";
      video.src = window.matchMedia(DESKTOP_RENDITION_QUERY).matches
        ? TOUR_VIDEO_1080
        : TOUR_VIDEO_720;
      video.load();
    });
  }, [lowData]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || degraded) {
      return;
    }

    let timeout = 0;
    let hasPainted = false;

    const onMeta = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) {
        return;
      }
      setReady(true);
      // Nothing painted in time usually means iOS Low Power Mode blocked the
      // decoder. Leave the poster up rather than showing a black rectangle.
      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        if (!hasPainted) {
          setStalled(true);
        }
      }, FIRST_FRAME_TIMEOUT_MS);
    };

    const markPainted = () => {
      hasPainted = true;
      window.clearTimeout(timeout);
      setPainted(true);
    };

    const withFrameCallback = video as HTMLVideoElement & {
      requestVideoFrameCallback?: (callback: () => void) => number;
    };
    if (typeof withFrameCallback.requestVideoFrameCallback === "function") {
      withFrameCallback.requestVideoFrameCallback(markPainted);
    } else {
      video.addEventListener("seeked", markPainted, { once: true });
    }

    video.addEventListener("loadedmetadata", onMeta);
    if (video.readyState >= 1) {
      onMeta();
    }

    // iOS will not paint frames from a video that has never been activated.
    let unlocked = false;
    const unlock = () => {
      if (unlocked) {
        return;
      }
      unlocked = true;
      const played = video.play();
      if (played) {
        played
          .then(() => video.pause())
          .catch(() => {
            unlocked = false; // Low Power Mode rejects; retry on a real gesture
          });
      }
    };
    unlock();
    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("touchstart", unlock, { passive: true });

    return () => {
      window.clearTimeout(timeout);
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("seeked", markPainted);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, [degraded]);

  // The scrub loop.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !ready || paused || degraded) {
      return;
    }

    let frame = 0;
    let last = performance.now();
    let smoothed = video.currentTime;
    let seeking = false;

    const onSeeked = () => {
      seeking = false;
    };
    video.addEventListener("seeked", onSeeked);

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const delta = Math.min((now - last) / 1000, 0.1); // clamp tab-away jumps
      last = now;

      const { duration } = video;
      if (!Number.isFinite(duration) || duration <= 0) {
        return;
      }

      const target = progressToTime(scrollProgress.current, duration);
      smoothed += (target - smoothed) * (1 - Math.exp(-SCRUB_LAMBDA * delta));

      // Assigning currentTime mid-seek makes Safari stutter, so let the
      // decoder set the pace.
      if (seeking || Math.abs(smoothed - video.currentTime) < SEEK_EPSILON) {
        return;
      }
      seeking = true;
      // Seeking to exactly `duration` fires `ended` and can blank the frame.
      video.currentTime = Math.min(Math.max(smoothed, 0), duration - 1e-3);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      video.removeEventListener("seeked", onSeeked);
    };
  }, [ready, paused, degraded]);

  // Release the decoder and stop buffering when the tour unmounts.
  useEffect(() => {
    const video = videoRef.current;
    return () => {
      if (!video) {
        return;
      }
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, []);

  return (
    // scale-[1.15] on both layers crops in past what object-cover already
    // trims, pushing the footage's subject clear of the copy panel. The
    // wrapper's overflow-hidden keeps the overspill off screen.
    <div className="absolute inset-0 overflow-hidden">
      {/* Painted immediately and kept underneath, so the stage is never black.
          Not next/image: this is a plain background layer on a remote host, and
          routing it through the optimizer would mean configuring remotePatterns
          for no benefit. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={TOUR_POSTER}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full scale-[1.15] object-cover"
      />
      <video
        ref={videoRef}
        muted
        playsInline
        preload="none"
        disablePictureInPicture
        disableRemotePlayback
        aria-hidden
        tabIndex={-1}
        className={`absolute inset-0 h-full w-full scale-[1.15] object-cover transition-opacity duration-500 ${
          painted && !degraded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
