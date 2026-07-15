"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  /** Max tilt in degrees. */
  max?: number;
};

/** Pointer-tracked 3D tilt with a soft glare. Static on touch and reduced motion. */
export function TiltCard({ children, className, max = 8 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(pointerY, [0, 1], [max, -max]), {
    stiffness: 220,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(pointerX, [0, 1], [-max, max]), {
    stiffness: 220,
    damping: 22,
  });
  const glareX = useTransform(pointerX, [0, 1], ["20%", "80%"]);
  const glareY = useTransform(pointerY, [0, 1], ["20%", "80%"]);
  const glare = useTransform(
    [glareX, glareY],
    ([x, y]) => `radial-gradient(400px circle at ${x} ${y}, var(--accent-glow), transparent 60%)`
  );

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch" || !ref.current) {
      return;
    }
    const rect = ref.current.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width);
    pointerY.set((event.clientY - rect.top) / rect.height);
  }

  function onPointerLeave() {
    pointerX.set(0.5);
    pointerY.set(0.5);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 900 }}
      className={`relative ${className || ""}`}
    >
      {children}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{ background: glare }}
      />
    </motion.div>
  );
}
