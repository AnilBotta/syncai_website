"use client";

import { EffectComposer, Bloom } from "@react-three/postprocessing";

/**
 * Hyperreal glow pass — mounted only on high-quality tier desktops.
 * Threshold tuned so only emissive cores and additive hotspots bloom.
 */
export default function Effects() {
  return (
    <EffectComposer>
      <Bloom
        intensity={0.85}
        luminanceThreshold={0.35}
        luminanceSmoothing={0.25}
        mipmapBlur
      />
    </EffectComposer>
  );
}
