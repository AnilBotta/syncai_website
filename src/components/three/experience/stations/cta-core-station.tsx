"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";
import type { Mesh } from "three";
import * as THREE from "three";

/** Final CTA station — a bright inviting core, pulsing like a doorbell. */
export function CtaCoreStation() {
  const halo = useRef<Mesh>(null);

  useFrame((state) => {
    if (halo.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.6) * 0.12;
      halo.current.scale.setScalar(pulse);
    }
  });

  return (
    <group>
      <Sphere args={[0.9, 48, 48]}>
        <MeshDistortMaterial
          color="#5d60cc"
          emissive="#8e90ee"
          emissiveIntensity={2.2}
          roughness={0.15}
          metalness={0.4}
          distort={0.3}
          speed={1.2}
        />
      </Sphere>
      <mesh ref={halo} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[1.6, 0.02, 12, 96]} />
        <meshBasicMaterial
          color="#c0c1ff"
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
