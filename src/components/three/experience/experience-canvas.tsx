"use client";

import { lazy, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraRig } from "./camera-rig";
import { QualityProvider, useQuality } from "./quality";
import { AmbientField } from "./ambient-field";
import { Station } from "./stations/station";
import { ImageScreenStation } from "./stations/image-screen-station";
import { VideoScreenStation } from "./stations/video-screen-station";

// Postprocessing is its own lazy chunk — only fetched on high-tier desktops.
const Effects = lazy(() => import("./effects"));

function GatedEffects() {
  const { high } = useQuality();
  if (!high) {
    return null;
  }
  return (
    <Suspense fallback={null}>
      <Effects />
    </Suspense>
  );
}

type ExperienceCanvasProps = {
  paused?: boolean;
};

/** The single persistent canvas behind the homepage tour. */
export default function ExperienceCanvas({ paused = false }: ExperienceCanvasProps) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={paused ? "never" : "always"}
      gl={{ antialias: false, powerPreference: "high-performance", alpha: true }}
      camera={{ position: [0, 0.4, 7], fov: 50 }}
      className="!bg-transparent"
    >
      <QualityProvider>
        <ambientLight intensity={0.5} />
        <directionalLight position={[6, 8, 6]} intensity={1.2} color="#c0c1ff" />

        <CameraRig />
        <AmbientField />

        {/* Image "screens" the camera flies to (Suspense covers texture load). */}
        <Suspense fallback={null}>
          <Station id="hero" chapterIndex={0}>
            <VideoScreenStation src="/brand/SyncAi_tech_build_solutions_202607222256.mp4" />
          </Station>
          <Station id="websites" chapterIndex={1}>
            <VideoScreenStation src="/brand/Screens_scrolling_up_down_mouse_202607222310.mp4" height={3.8} />
          </Station>
          <Station id="voice" chapterIndex={2}>
            <VideoScreenStation src="/brand/AI_voice_assistant_speaking_sound_202607281335.mp4" height={3.8} />
          </Station>
          <Station id="workflow" chapterIndex={3}>
            <VideoScreenStation src="/brand/Animate_n8n_workflow_visualization_202607281352.mp4" height={4.0} />
          </Station>
          <Station id="strategy" chapterIndex={4}>
            <VideoScreenStation src="/brand/Animate_AI_strategy_dashboard_UI_202607281406.mp4" height={3.8} />
          </Station>
          <Station id="results" chapterIndex={5}>
            <ImageScreenStation src="/brand/tour-results.png" height={4.0} />
          </Station>
          <Station id="cta" chapterIndex={6}>
            <ImageScreenStation src="/brand/tour-cta.png" />
          </Station>
        </Suspense>

        <GatedEffects />
      </QualityProvider>
    </Canvas>
  );
}
