"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { PointMaterial } from "@react-three/drei";
import type { Points } from "three";
import * as THREE from "three";

/*
 * The field has to extend well BEYOND the end of the camera path, not just to
 * it. The camera descends to y -17 / z -52.5 and looks at the CTA station at
 * z -60, so a field stopping at z -72 left almost nothing in front of the lens
 * by the later chapters — visible stars fell from ~1050 (hero) to ~64 (cta) and
 * the sky read as empty from chapter 3 on. These bounds clear the last station
 * with margin, and COUNT scales with the larger volume to hold density steady.
 */
const SPREAD_X = 52; // -26 .. 26
const TOP_Y = 8;
const DEPTH_Y = 46; // 8 .. -38   (last station y -18)
const NEAR_Z = 12;
const DEPTH_Z = 124; // 12 .. -112 (last station z -60)
const COUNT = 5600;

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
      array[i * 3] = (random() - 0.5) * SPREAD_X; // x
      array[i * 3 + 1] = TOP_Y - random() * DEPTH_Y; // y: above hero to well below cta
      array[i * 3 + 2] = NEAR_Z - random() * DEPTH_Z; // z: past the final station
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
