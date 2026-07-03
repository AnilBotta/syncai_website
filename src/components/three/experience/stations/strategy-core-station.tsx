"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";
import type { Group, Mesh } from "three";
import * as THREE from "three";

/**
 * Strategy & consulting station — wireframe icosahedron shell around a molten
 * emissive core with two orbiting gyroscope rings.
 */
export function StrategyCoreStation() {
  const shell = useRef<Mesh>(null);
  const ringA = useRef<Group>(null);
  const ringB = useRef<Group>(null);

  useFrame((_, delta) => {
    if (shell.current) {
      shell.current.rotation.y += delta * 0.15;
      shell.current.rotation.x += delta * 0.05;
    }
    if (ringA.current) {
      ringA.current.rotation.x += delta * 0.4;
    }
    if (ringB.current) {
      ringB.current.rotation.y += delta * 0.3;
      ringB.current.rotation.z += delta * 0.2;
    }
  });

  return (
    <group>
      {/* Wireframe shell */}
      <mesh ref={shell}>
        <icosahedronGeometry args={[1.9, 1]} />
        <meshBasicMaterial
          color="#a078ff"
          wireframe
          transparent
          opacity={0.28}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Molten core */}
      <Sphere args={[0.7, 48, 48]}>
        <MeshDistortMaterial
          color="#4B0082"
          emissive="#9400D3"
          emissiveIntensity={1.8}
          roughness={0.2}
          metalness={0.5}
          distort={0.45}
          speed={2}
        />
      </Sphere>

      {/* Gyroscope rings */}
      <group ref={ringA}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.35, 0.015, 12, 96]} />
          <meshBasicMaterial
            color="#d0bcff"
            transparent
            opacity={0.6}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
      <group ref={ringB}>
        <mesh rotation={[0, 0, Math.PI / 3]}>
          <torusGeometry args={[1.6, 0.01, 12, 96]} />
          <meshBasicMaterial
            color="#a078ff"
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}
