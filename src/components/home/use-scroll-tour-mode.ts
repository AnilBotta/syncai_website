"use client";

import { useSyncExternalStore } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * "ssr" and "scrub" render identical markup — they differ only in whether the
 * scrub loop runs — so the hydration render always matches the server render.
 * "reduced" swaps in the static homepage after mount.
 */
export type TourMode = "ssr" | "scrub" | "reduced";

/** Hydration state never changes again, so there is nothing to subscribe to. */
const subscribeToNothing = () => () => {};

/**
 * Gate for the scroll-scrubbed tour. Unlike the WebGL gate this replaces for
 * the homepage, there is no mobile cutoff: phones get the same experience,
 * with a smaller video rendition chosen at runtime inside ScrubVideo.
 */
export function useScrollTourMode(): TourMode {
  const reduceMotion = useReducedMotion();
  const mounted = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false
  );

  if (!mounted) {
    return "ssr";
  }
  return reduceMotion ? "reduced" : "scrub";
}
