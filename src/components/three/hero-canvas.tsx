"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useReducedMotion } from "framer-motion";

const HeroScene = dynamic(() => import("./hero-scene"), {
  ssr: false,
  loading: () => <HeroImageFallback />,
});

function HeroImageFallback() {
  return (
    <div className="relative h-full w-full">
      <Image
        src="/brand/stunning_3d_ai_operations_hub_visualization_for_a_premium_saas_website._central.png"
        alt="AI operations hub visualization"
        width={1792}
        height={1024}
        priority
        className="h-full w-full object-cover opacity-90"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-transparent to-transparent opacity-80" />
    </div>
  );
}

let webglCache: boolean | null = null;

function supportsWebGL() {
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

function useIsMobile() {
  return useSyncExternalStore(
    subscribeToMobile,
    () => window.matchMedia(MOBILE_QUERY).matches,
    // Server snapshot: assume mobile so SSR/hydration show the safe fallback.
    () => true
  );
}

/**
 * Gates the WebGL hero scene: phones, reduced-motion users, and browsers
 * without WebGL get the static brand image instead. The frameloop pauses
 * when the hero is off-screen or the tab is hidden.
 */
export function HeroCanvas() {
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  const enabled = !isMobile && !reduceMotion && supportsWebGL();

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
  }, [enabled]);

  return (
    <div ref={containerRef} className="h-full w-full">
      {enabled ? <HeroScene paused={paused} /> : <HeroImageFallback />}
    </div>
  );
}
