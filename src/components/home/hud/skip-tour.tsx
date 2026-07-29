"use client";

import { useState, type RefObject } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { ChevronsDown } from "lucide-react";

type SkipTourProps = {
  targetRef: RefObject<HTMLElement | null>;
};

/** "Skip tour" pill for impatient visitors — jumps past the pinned tour. */
export function SkipTour({ targetRef }: SkipTourProps) {
  const [visible, setVisible] = useState(true);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    // Tuned for 5 chapters: hide once the last one is coming into frame.
    setVisible(value < 0.8);
  });

  function skip() {
    const wrapper = targetRef.current;
    if (!wrapper) {
      return;
    }
    const rect = wrapper.getBoundingClientRect();
    window.scrollTo({
      top: window.scrollY + rect.top + rect.height - window.innerHeight,
      behavior: "smooth",
    });
  }

  if (!visible) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={skip}
      className="fixed bottom-6 left-1/2 z-40 inline-flex -translate-x-1/2 cursor-pointer items-center gap-1.5 rounded-full border border-border-subtle bg-bg-deep/70 px-4 py-2 text-xs font-semibold text-muted backdrop-blur-md transition hover:border-brand-soft/40 hover:text-brand-glow-text"
    >
      Skip tour
      <ChevronsDown className="size-3.5" />
    </button>
  );
}
