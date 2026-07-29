"use client";

import { useRef, type ReactNode } from "react";
import { ReactLenis } from "lenis/react";
import { useFrameloopPause } from "@/components/three/use-webgl-gate";
import { ScrollProgressBridge } from "@/components/three/experience/scroll-progress-bridge";
import { SCRUB_CHAPTER_COUNT } from "./tour-config";
import { useScrollTourMode } from "./use-scroll-tour-mode";
import { ScrubVideo } from "./scrub-video";
import { StaticHome } from "./static-home";
import { NightSky } from "./night-sky";
import { ProgressRail } from "./hud/progress-rail";
import { SkipTour } from "./hud/skip-tour";

type HomeExperienceProps = {
  children: ReactNode;
};

/**
 * The cinematic homepage tour: a pinned hero video whose playhead is scrubbed
 * by scroll, with DOM chapters scrolling over it. Reduced-motion visitors get
 * the static dark homepage; everyone else — phones included — gets the tour.
 *
 * The 3D station/camera stack under `components/three/experience` is no longer
 * mounted here. It is kept in the tree, but note that its layout assumes seven
 * chapters while this wrapper is now five, so re-mounting the canvas would
 * need `layout.ts` revisited.
 */
export function HomeExperience({ children }: HomeExperienceProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mode = useScrollTourMode();
  const paused = useFrameloopPause(wrapperRef, mode === "scrub");

  if (mode === "reduced") {
    return <StaticHome />;
  }

  return (
    <>
      {/* Inertia scrolling for the cinematic scrub feel (window scroll). */}
      <ReactLenis root />

      <div
        ref={wrapperRef}
        className="theme-dark relative bg-bg-deep"
        style={{ height: `${SCRUB_CHAPTER_COUNT * 100}vh` }}
      >
        <ScrollProgressBridge targetRef={wrapperRef} />

        {/* Pinned stage */}
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <NightSky />
          <ScrubVideo paused={paused} />
          {/* Cinematic vignette for copy legibility */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_48%,rgba(5,7,15,0.55)_100%)]"
          />
        </div>

        {/* Chapters scroll over the pinned stage */}
        <div className="absolute inset-0">{children}</div>

        <ProgressRail targetRef={wrapperRef} />
        <SkipTour targetRef={wrapperRef} />
      </div>
    </>
  );
}
