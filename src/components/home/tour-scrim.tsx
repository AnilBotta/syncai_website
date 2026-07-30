"use client";

import { useEffect, useRef } from "react";
import { scrollProgress } from "@/components/three/experience/scroll-progress";
import { SCRIM_MIX, scrimMix } from "./tour-config";

type TourScrimProps = {
  /** True while the stage is off-screen or the tab is hidden. */
  paused?: boolean;
};

/**
 * Peak alpha at the outer edge of the copy column.
 *
 * Measured, not taste: peak luminance behind the copy runs 117-121 on four of
 * the seven chapters and spikes to 237 over a lit tablet screen. Against that,
 * body copy only clears 4.5:1 at roughly this much cover. Tune here — every
 * stop below scales from it.
 */
const PEAK = 0.5;

/**
 * The scrim lifts toward white, not down toward black.
 *
 * With dark copy on bright footage the danger is the opposite of before: the
 * copy column is not uniformly bright. Measured across the joined tour it runs
 * from Y 211 down to Y 121, dipping to Y 71 on the darkest beats — where dark
 * text loses all contrast and can even end up lighter than what is behind it.
 * Washing those stretches toward white gives the copy a consistent bed, and on
 * already-bright frames it reads as light bloom rather than a panel.
 */
const SCRIM_RGB = "250,250,252";

/** Below this much movement a repaint is not worth the compositor work. */
const OPACITY_EPSILON = 0.004;

/**
 * Stops are in rem, not percent, on purpose. The copy column is
 * `max-w-xl` (36rem) inside `lg:px-20` (5rem), so it ends at a fixed 656px on
 * every viewport at or above 1024px. Percentages would have to cover 64% of a
 * 1024px screen and only 34% of a 1920px one to protect the same text.
 */
function sideGradient(direction: "right" | "left") {
  const a = (fraction: number) => `rgba(${SCRIM_RGB},${(PEAK * fraction).toFixed(3)})`;
  return [
    `linear-gradient(to ${direction}`,
    `${a(1)} 0`,
    `${a(0.977)} 26rem`,
    `${a(0.837)} 41rem`, // 656px — outer edge of the copy column
    `${a(0.395)} 50rem`,
    `${a(0.093)} 62rem`,
    `rgba(${SCRIM_RGB},0) 74rem)`,
  ].join(",");
}

/** Flat cover: carries mobile, where the copy spans the whole viewport. */
const FLAT = `rgba(${SCRIM_RGB},${(PEAK * 1.067).toFixed(3)})`;

/**
 * Never animated. Takes over the old radial vignette's real job — keeping the
 * site header and the bottom edge legible — which it did far better than it
 * ever protected the copy.
 */
// TEST (revert): the dark top/bottom bands fight bright footage. Original was
// rgba(4,6,14,0.55) at the top and 0.45 at the bottom.
const EDGES =
  "linear-gradient(to bottom, rgba(4,6,14,0) 0, rgba(4,6,14,0) 18%, rgba(4,6,14,0) 70%, rgba(4,6,14,0) 100%)";

/**
 * Contrast cover between the hero video and the chapter copy.
 *
 * Three stacked layers whose opacities are cross-faded per frame from the same
 * `scrollProgress` store that drives the video, so the cover follows whichever
 * side the current chapter's copy sits on. Only `opacity` is written — that
 * stays on the compositor, whereas animating gradient stops would re-raster the
 * whole viewport every frame alongside video decode.
 *
 * Stage-level rather than per-chapter by necessity: two chapters are on screen
 * at once through every transition, so per-chapter scrims would meet as a hard
 * horizontal seam across mid-screen.
 */
export function TourScrim({ paused = false }: TourScrimProps) {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const flatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paused) {
      return;
    }
    const layers = [leftRef.current, rightRef.current, flatRef.current];
    if (layers.some((layer) => !layer)) {
      return;
    }

    let frame = 0;
    const shown = [-1, -1, -1];

    const tick = () => {
      frame = requestAnimationFrame(tick);
      const mix = scrimMix(scrollProgress.current);
      for (let i = 0; i < 3; i += 1) {
        if (Math.abs(mix[i] - shown[i]) < OPACITY_EPSILON) {
          continue;
        }
        shown[i] = mix[i];
        layers[i]!.style.opacity = mix[i].toFixed(3);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [paused]);

  // Server render and first paint use the hero's mix, so the copy is covered
  // before hydration rather than flashing over bare footage.
  const [initialLeft, initialRight, initialFlat] = SCRIM_MIX[0];

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0" style={{ backgroundImage: EDGES }} />
      {/* Below md the copy spans the viewport, so there is no side to favour —
          the flat layer carries it alone and the gradients are not mounted. */}
      <div
        ref={leftRef}
        className="absolute inset-0 hidden md:block"
        style={{ backgroundImage: sideGradient("right"), opacity: initialLeft }}
      />
      <div
        ref={rightRef}
        className="absolute inset-0 hidden md:block"
        style={{ backgroundImage: sideGradient("left"), opacity: initialRight }}
      />
      {/* Mobile carries the full flat cover, always on and never animated:
          measured peak luminance in the centre band is the worst anywhere in
          the clip (148), and with copy spanning the viewport there is nothing
          to cross-fade between. */}
      <div className="absolute inset-0 md:hidden" style={{ backgroundColor: FLAT }} />
      {/* Desktop's flat layer is the animated one — mostly idle, but it is what
          sinks the CTA's burned-in headline. */}
      <div
        ref={flatRef}
        className="absolute inset-0 hidden md:block"
        style={{ backgroundColor: FLAT, opacity: initialFlat }}
      />
    </div>
  );
}
