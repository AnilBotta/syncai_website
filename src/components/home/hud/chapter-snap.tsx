"use client";

import { useEffect, type RefObject } from "react";
import { useLenis } from "lenis/react";
import Snap from "lenis/snap";
import { CHAPTER_COUNT } from "@/components/three/experience/layout";

type ChapterSnapProps = {
  targetRef: RefObject<HTMLElement | null>;
};

/**
 * Snaps the scroll to the nearest chapter once the user stops, so the copy
 * and the 3D station always settle perfectly framed. Proximity mode: within
 * the tour every stop is near a chapter, while scrolling on past the tour
 * (FAQ, footer) releases cleanly.
 */
export function ChapterSnap({ targetRef }: ChapterSnapProps) {
  const lenis = useLenis();

  useEffect(() => {
    const wrapper = targetRef.current;
    if (!lenis || !wrapper) {
      return;
    }

    const snap = new Snap(lenis, {
      type: "proximity",
      distanceThreshold: "70%",
      duration: 0.8,
      debounce: 350,
    });

    let removers: (() => void)[] = [];

    const computePoints = () => {
      removers.forEach((remove) => remove());
      removers = [];
      const rect = wrapper.getBoundingClientRect();
      const top = window.scrollY + rect.top;
      const scrollable = rect.height - window.innerHeight;
      for (let i = 0; i < CHAPTER_COUNT; i += 1) {
        removers.push(snap.add(top + (i / (CHAPTER_COUNT - 1)) * scrollable));
      }
    };

    computePoints();
    window.addEventListener("resize", computePoints);

    return () => {
      window.removeEventListener("resize", computePoints);
      snap.destroy();
    };
  }, [lenis, targetRef]);

  return null;
}
