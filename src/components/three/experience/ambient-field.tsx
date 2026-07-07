"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { PointMaterial } from "@react-three/drei";
import type { Points } from "three";
import * as THREE from "three";

const COUNT = 2200;

/** Sparse dust/starfield spanning the whole camera path for depth. */
export function AmbientField() {
  const points = useRef<Points>(null);

  const positions = useMemo(() => {
    // Deterministic mulberry32 PRNG: same field every render, lint-pure.
    let seed = 1337;
    const random = () => {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    const array = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i += 1) {
      array[i * 3] = (random() - 0.5) * 44; // x
      array[i * 3 + 1] = 6 - random() * 32; // y: from above hero to below cta
      array[i * 3 + 2] = 10 - random() * 82; // z: spans the full path
    }
    return array;
  }, []);

  useFrame((_, delta) => {
    if (points.current) {
      points.current.rotation.y += delta * 0.004;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <PointMaterial
        transparent
        color="#aec6ff"
        size={0.05}
        sizeAttenuation
        opacity={0.65}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
