"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/**
 * Counts up to a figure the first time it scrolls into view.
 *
 * Values arrive as display strings ("2016", "4.9", "48h"), so the numeric part is
 * pulled out and any prefix/suffix preserved. Decimal places are matched to the
 * target, otherwise "4.9" would animate to a jittering "4.87654".
 *
 * Anything without a leading number renders as-is, and reduced motion shows the
 * final value immediately.
 *
 * The animated value is held as null until the first frame runs, so the resting
 * states are *derived* rather than assigned — setState only ever happens inside a
 * rAF callback, never synchronously in the effect body.
 */
export function StatCounter({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduceMotion = useReducedMotion();
  const [animated, setAnimated] = useState<string | null>(null);

  const match = value.match(/^(\D*)([\d.]+)(.*)$/);
  const target = match ? Number(match[2]) : NaN;
  const numeric = Boolean(match) && !Number.isNaN(target);
  const decimals = match && match[2].includes(".") ? match[2].split(".")[1].length : 0;

  useEffect(() => {
    if (!numeric || !match || reduceMotion || !inView) return;

    const duration = 1100;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // easeOutCubic — fast start, settles gently on the number.
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimated(`${match[1]}${(target * eased).toFixed(decimals)}${match[3]}`);
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // `match` is derived from `value`, so tracking `value` covers it.
  }, [inView, reduceMotion, numeric, target, decimals, value]); // eslint-disable-line react-hooks/exhaustive-deps

  const resting =
    numeric && match && !reduceMotion ? `${match[1]}${(0).toFixed(decimals)}${match[3]}` : value;

  return (
    <div ref={ref}>
      <p className="font-serif text-4xl leading-none text-foreground tabular-nums sm:text-5xl">
        {animated ?? resting}
      </p>
      <p className="mt-3 text-sm leading-6 text-muted">{label}</p>
    </div>
  );
}
