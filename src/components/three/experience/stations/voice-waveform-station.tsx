"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const BAR_COUNT = 72;
const RADIUS = 2.1;

const dummy = new THREE.Object3D();

/**
 * Voice agent station — a radial equalizer ring: bars around a circle whose
 * heights ripple like live speech, plus an emissive voice core.
 */
export function VoiceWaveformStation() {
  const bars = useRef<THREE.InstancedMesh>(null);
  const core = useRef<THREE.Mesh>(null);

  const angles = useMemo(
    () => Array.from({ length: BAR_COUNT }, (_, i) => (i / BAR_COUNT) * Math.PI * 2),
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (bars.current) {
      for (let i = 0; i < BAR_COUNT; i += 1) {
        const angle = angles[i];
        // Two overlapping waves make it feel like speech, not a metronome.
        const height =
          0.35 +
          Math.abs(Math.sin(t * 2.2 + i * 0.55)) * 0.9 +
          Math.abs(Math.sin(t * 1.3 + i * 0.21)) * 0.45;
        dummy.position.set(Math.cos(angle) * RADIUS, 0, Math.sin(angle) * RADIUS);
        dummy.scale.set(1, height, 1);
        dummy.rotation.set(0, -angle, 0);
        dummy.updateMatrix();
        bars.current.setMatrixAt(i, dummy.matrix);
      }
      bars.current.instanceMatrix.needsUpdate = true;
      bars.current.rotation.y = t * 0.1;
    }
    if (core.current) {
      const pulse = 1 + Math.sin(t * 2.4) * 0.08;
      core.current.scale.setScalar(pulse);
    }
  });

  return (
    <group>
      <instancedMesh ref={bars} args={[undefined, undefined, BAR_COUNT]}>
        <boxGeometry args={[0.07, 1, 0.07]} />
        <meshBasicMaterial
          color="#a078ff"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </instancedMesh>

      {/* Voice core */}
      <mesh ref={core}>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshStandardMaterial color="#4B0082" emissive="#9400D3" emissiveIntensity={2} />
      </mesh>

      {/* Halo rings */}
      {[1.2, 1.55].map((radius, index) => (
        <mesh key={index} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius, 0.012, 12, 96]} />
          <meshBasicMaterial
            color="#d0bcff"
            transparent
            opacity={0.35 - index * 0.12}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
