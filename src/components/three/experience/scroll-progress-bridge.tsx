"use client";

import { useEffect, type RefObject } from "react";
import { useScroll } from "framer-motion";
import { setScrollProgress } from "./scroll-progress";

type ScrollProgressBridgeProps = {
  targetRef: RefObject<HTMLElement | null>;
};

/** Streams the wrapper's scroll progress (0-1) into the module store. */
export function ScrollProgressBridge({ targetRef }: ScrollProgressBridgeProps) {
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    setScrollProgress(scrollYProgress.get());
    return scrollYProgress.on("change", setScrollProgress);
  }, [scrollYProgress]);

  return null;
}
