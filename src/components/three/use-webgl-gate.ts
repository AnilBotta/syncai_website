"use client";

import { useEffect, useState, useSyncExternalStore, type RefObject } from "react";
import { useReducedMotion } from "framer-motion";

let webglCache: boolean | null = null;

export function supportsWebGL() {
  if (typeof document === "undefined") {
    return false;
  }
  if (webglCache === null) {
    try {
      const canvas = document.createElement("canvas");
      webglCache = Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
    } catch {
      webglCache = false;
    }
  }
  return webglCache;
}

const MOBILE_QUERY = "(max-width: 768px)";

function subscribeToMobile(callback: () => void) {
  const media = window.matchMedia(MOBILE_QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

export function useIsMobile() {
  return useSyncExternalStore(
    subscribeToMobile,
    () => window.matchMedia(MOBILE_QUERY).matches,
    // Server snapshot: assume mobile so SSR/hydration render the safe fallback.
    () => true
  );
}

/**
 * Single gate for all WebGL experiences: false on mobile, reduced motion,
 * or missing WebGL. SSR always returns false (static fallback is the
 * server-rendered output).
 */
export function useWebglGate() {
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  return !isMobile && !reduceMotion && supportsWebGL();
}

/**
 * True when rendering should pause: container off-screen or tab hidden.
 */
export function useFrameloopPause(containerRef: RefObject<HTMLElement | null>, enabled: boolean) {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!enabled || !containerRef.current) {
      return;
    }

    let inView = true;
    let tabVisible = !document.hidden;
    const sync = () => setPaused(!(inView && tabVisible));

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        sync();
      },
      { threshold: 0.05 }
    );
    observer.observe(containerRef.current);

    const onVisibility = () => {
      tabVisible = !document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled, containerRef]);

  return paused;
}
