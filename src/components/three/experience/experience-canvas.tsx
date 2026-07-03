"use client";

import { lazy, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraRig } from "./camera-rig";
import { QualityProvider, useQuality } from "./quality";
import { AmbientField } from "./ambient-field";
import { Station } from "./stations/station";
import { HeroOrbStation } from "./stations/hero-orb-station";
import { WebsitesStation } from "./stations/websites-station";
import { VoiceWaveformStation } from "./stations/voice-waveform-station";
import { WorkflowPipelineStation } from "./stations/workflow-pipeline-station";
import { StrategyCoreStation } from "./stations/strategy-core-station";
import { ResultsStation } from "./stations/results-station";
import { CtaCoreStation } from "./stations/cta-core-station";

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
        <directionalLight position={[6, 8, 6]} intensity={1.2} color="#c9b8ff" />

        <CameraRig />
        <AmbientField />

        <Station id="hero" chapterIndex={0}>
          <HeroOrbStation />
        </Station>
        <Station id="websites" chapterIndex={1}>
          <WebsitesStation />
        </Station>
        <Station id="voice" chapterIndex={2}>
          <VoiceWaveformStation />
        </Station>
        <Station id="workflow" chapterIndex={3}>
          <WorkflowPipelineStation />
        </Station>
        <Station id="strategy" chapterIndex={4}>
          <StrategyCoreStation />
        </Station>
        <Station id="results" chapterIndex={5}>
          <ResultsStation />
        </Station>
        <Station id="cta" chapterIndex={6}>
          <CtaCoreStation />
        </Station>

        <GatedEffects />
      </QualityProvider>
    </Canvas>
  );
}
