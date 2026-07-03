"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import * as THREE from "three";

const COLUMNS = [
  { x: -1.6, height: 1.4, color: "#6001d1" },
  { x: 0, height: 2.4, color: "#9400D3" },
  { x: 1.6, height: 3.2, color: "#a078ff" },
];

/** Results station — a rising 3D bar-chart constellation. */
export function ResultsStation() {
  const group = useRef<Group>(null);

  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.08;
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={group}>
      {COLUMNS.map((column, index) => (
        <group key={index} position={[column.x, column.height / 2 - 1.2, 0]}>
          <mesh>
            <boxGeometry args={[0.5, column.height, 0.5]} />
            <meshStandardMaterial
              color="#0a0a0c"
              emissive={column.color}
              emissiveIntensity={0.9}
              roughness={0.3}
              metalness={0.5}
            />
          </mesh>
          {/* Glowing cap */}
          <mesh position={[0, column.height / 2 + 0.05, 0]}>
            <boxGeometry args={[0.54, 0.06, 0.54]} />
            <meshBasicMaterial
              color="#d0bcff"
              transparent
              opacity={0.9}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}

      {/* Base ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -1.35, 0]}>
        <torusGeometry args={[2.6, 0.012, 12, 96]} />
        <meshBasicMaterial
          color="#a078ff"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
