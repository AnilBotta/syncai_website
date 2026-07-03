"use client";

import { useState, type RefObject } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { CHAPTERS, CHAPTER_COUNT } from "@/components/three/experience/layout";

const LABELS: Record<(typeof CHAPTERS)[number], string> = {
  hero: "SyncAI",
  websites: "AI Websites",
  voice: "Voice & Chat",
  workflow: "Automation",
  strategy: "Strategy",
  results: "Results",
  cta: "Book a Call",
};

type ProgressRailProps = {
  targetRef: RefObject<HTMLElement | null>;
};

/** Right-edge chapter dots for the tour — clickable and keyboard navigable. */
export function ProgressRail({ targetRef }: ProgressRailProps) {
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setActive(Math.round(value * (CHAPTER_COUNT - 1)));
  });

  function jumpTo(index: number) {
    const wrapper = targetRef.current;
    if (!wrapper) {
      return;
    }
    const rect = wrapper.getBoundingClientRect();
    const top = window.scrollY + rect.top;
    const scrollable = rect.height - window.innerHeight;
    window.scrollTo({
      top: top + (index / (CHAPTER_COUNT - 1)) * scrollable,
      behavior: "smooth",
    });
  }

  return (
    <nav
      aria-label="Tour chapters"
      className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 lg:flex"
    >
      {CHAPTERS.map((id, index) => (
        <button
          key={id}
          type="button"
          onClick={() => jumpTo(index)}
          aria-label={`Go to ${LABELS[id]}`}
          aria-current={active === index ? "step" : undefined}
          className="group flex cursor-pointer items-center justify-end gap-2"
        >
          <span className="translate-x-1 text-xs font-semibold text-brand-glow-text opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:opacity-100">
            {LABELS[id]}
          </span>
          <span
            className={
              active === index
                ? "size-2.5 rounded-full bg-brand-soft shadow-[0_0_12px_rgba(160,120,255,0.8)] transition-all"
                : "size-2 rounded-full bg-white/25 transition-all group-hover:bg-white/50"
            }
          />
        </button>
      ))}
    </nav>
  );
}
