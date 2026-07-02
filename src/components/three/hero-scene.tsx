"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PointMaterial, Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as random from "maath/random";
import type { Group, Points } from "three";
import * as THREE from "three";

const OUTER_COUNT = 2200;
const INNER_COUNT = 900;
const LINK_COUNT = 600;

function NeuralOrb() {
  const group = useRef<Group>(null);
  const outer = useRef<Points>(null);
  const inner = useRef<Points>(null);

  const outerPositions = useMemo(
    () => random.inSphere(new Float32Array(OUTER_COUNT * 3), { radius: 2.2 }) as Float32Array,
    []
  );
  const innerPositions = useMemo(
    () => random.inSphere(new Float32Array(INNER_COUNT * 3), { radius: 1.35 }) as Float32Array,
    []
  );

  // Nearest-neighbour "synapses", computed once.
  const linePositions = useMemo(() => {
    const lines = new Float32Array(LINK_COUNT * 6);
    for (let i = 0; i < LINK_COUNT; i += 1) {
      const a = Math.floor((i * 137) % OUTER_COUNT);
      let best = -1;
      let bestDistance = Infinity;
      // Sample a small window of candidates instead of a full O(n^2) pass.
      for (let j = 1; j <= 24; j += 1) {
        const candidate = (a + j * 41) % OUTER_COUNT;
        const dx = outerPositions[a * 3] - outerPositions[candidate * 3];
        const dy = outerPositions[a * 3 + 1] - outerPositions[candidate * 3 + 1];
        const dz = outerPositions[a * 3 + 2] - outerPositions[candidate * 3 + 2];
        const distance = dx * dx + dy * dy + dz * dz;
        if (distance < bestDistance && distance > 0.001) {
          bestDistance = distance;
          best = candidate;
        }
      }
      if (best >= 0 && bestDistance < 1.1) {
        lines.set(outerPositions.slice(a * 3, a * 3 + 3), i * 6);
        lines.set(outerPositions.slice(best * 3, best * 3 + 3), i * 6 + 3);
      }
    }
    return lines;
  }, [outerPositions]);

  useFrame((state, delta) => {
    if (group.current) {
      // Slow idle spin plus gentle pointer-follow.
      group.current.rotation.y += delta * 0.08;
      group.current.rotation.x = THREE.MathUtils.lerp(
        group.current.rotation.x,
        state.pointer.y * 0.18,
        0.04
      );
      group.current.rotation.z = THREE.MathUtils.lerp(
        group.current.rotation.z,
        state.pointer.x * 0.12,
        0.04
      );
      const breathe = 1 + Math.sin(state.clock.elapsedTime * 0.6) * 0.02;
      group.current.scale.setScalar(breathe);
    }
    if (inner.current) {
      inner.current.rotation.y -= delta * 0.14;
    }
    if (outer.current) {
      outer.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <group ref={group}>
      <points ref={outer}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[outerPositions, 3]} />
        </bufferGeometry>
        <PointMaterial
          transparent
          color="#d0bcff"
          size={0.028}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <points ref={inner}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[innerPositions, 3]} />
        </bufferGeometry>
        <PointMaterial
          transparent
          color="#a078ff"
          size={0.022}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          transparent
          opacity={0.16}
          color="#9400D3"
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      <Sphere args={[0.55, 48, 48]}>
        <MeshDistortMaterial
          color="#4B0082"
          emissive="#6001d1"
          emissiveIntensity={0.9}
          roughness={0.25}
          metalness={0.4}
          distort={0.35}
          speed={1.5}
        />
      </Sphere>
    </group>
  );
}

type HeroSceneProps = {
  paused?: boolean;
};

export default function HeroScene({ paused = false }: HeroSceneProps) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={paused ? "never" : "always"}
      gl={{ antialias: false, powerPreference: "high-performance", alpha: true }}
      camera={{ position: [0, 0, 6], fov: 45 }}
      className="!bg-transparent"
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[4, 3, 5]} intensity={40} color="#a078ff" />
      <NeuralOrb />
    </Canvas>
  );
}
