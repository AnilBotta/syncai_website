"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

type ChapterProps = {
  children: ReactNode;
  /** Which side the copy panel sits on (opposite the video's focal point). */
  align?: "left" | "right" | "center";
};

/**
 * One viewport-height overlay block, faded by its own scroll position.
 *
 * Driven by progress rather than `whileInView` because the hero video is
 * scrubbed: an intersection trigger fires once at a threshold and then runs a
 * tween on its own clock, so scrolling slowly would finish the copy's fade
 * while the video was still mid-beat. Tying both to scroll keeps them together,
 * and makes parking mid-chapter look deliberate instead of half-finished.
 */
export function Chapter({ children, align = "left" }: ChapterProps) {
  const ref = useRef<HTMLDivElement>(null);
  // 0 when the block's top reaches the viewport bottom, 1 when its bottom
  // leaves the top — so the block is centered on screen at 0.5.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0.18, 0.38, 0.62, 0.82], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0.18, 0.42], [40, 0]);
  // Without this, links inside a fully faded chapter stay clickable.
  const pointerEvents = useTransform(opacity, (value) => (value > 0.15 ? "auto" : "none"));

  return (
    <div
      ref={ref}
      className={cn(
        "pointer-events-none relative flex h-screen items-center px-5 sm:px-10 lg:px-20",
        align === "left" ? "justify-start" : align === "right" ? "justify-end" : "justify-center"
      )}
    >
      <motion.div
        style={{ opacity, y, pointerEvents }}
        className={cn("w-full max-w-xl", align === "center" && "text-center")}
      >
        {children}
      </motion.div>
    </div>
  );
}
