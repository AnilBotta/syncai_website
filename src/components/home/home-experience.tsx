"use client";

import dynamic from "next/dynamic";
import { useRef, type ReactNode } from "react";
import { ReactLenis } from "lenis/react";
import { useFrameloopPause, useWebglGate } from "@/components/three/use-webgl-gate";
import { ScrollProgressBridge } from "@/components/three/experience/scroll-progress-bridge";
import { CHAPTER_COUNT } from "@/components/three/experience/layout";
import { StaticHome } from "./static-home";
import { ProgressRail } from "./hud/progress-rail";
import { SkipTour } from "./hud/skip-tour";
import { ChapterSnap } from "./hud/chapter-snap";

const ExperienceCanvas = dynamic(() => import("@/components/three/experience/experience-canvas"), {
  ssr: false,
});

type HomeExperienceProps = {
  children: ReactNode;
};

/**
 * The cinematic homepage tour: a pinned WebGL canvas with DOM chapters
 * scrolling over it. Mobile / reduced-motion / no-WebGL visitors (and the
 * server render) get the static dark homepage instead.
 */
export function HomeExperience({ children }: HomeExperienceProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const enabled = useWebglGate();
  const paused = useFrameloopPause(wrapperRef, enabled);

  if (!enabled) {
    return <StaticHome />;
  }

  return (
    <>
      {/* Inertia scrolling for the cinematic scrub feel (window scroll). */}
      <ReactLenis root />

      <div ref={wrapperRef} className="relative bg-bg-deep" style={{ height: `${CHAPTER_COUNT * 100}vh` }}>
        <ScrollProgressBridge targetRef={wrapperRef} />

        {/* Pinned scene */}
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <ExperienceCanvas paused={paused} />
          {/* Cinematic vignette for copy legibility */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(2,2,3,0.65)_100%)]"
          />
        </div>

        {/* Chapters scroll over the pinned scene */}
        <div className="absolute inset-0">{children}</div>

        <ProgressRail targetRef={wrapperRef} />
        <SkipTour targetRef={wrapperRef} />
        <ChapterSnap targetRef={wrapperRef} />
      </div>
    </>
  );
}
