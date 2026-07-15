"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import * as THREE from "three";

/**
 * AI Websites station — three floating glowing "screens" (wireframe panels)
 * orbiting a small emissive lead-capture core.
 */
export function WebsitesStation() {
  const group = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!group.current) {
      return;
    }
    group.current.rotation.y += delta * 0.12;
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.15;
  });

  const panels = [
    { position: [0, 0.4, 0] as const, rotation: [0, 0, 0] as const, size: [2.6, 1.6] as const },
    { position: [-1.9, -0.5, 0.8] as const, rotation: [0, 0.7, 0] as const, size: [1.7, 1.1] as const },
    { position: [1.9, -0.7, 0.6] as const, rotation: [0, -0.7, 0] as const, size: [1.7, 1.1] as const },
  ];

  return (
    <group ref={group}>
      {panels.map((panel, index) => (
        <group key={index} position={panel.position} rotation={panel.rotation}>
          {/* Glass face */}
          <mesh>
            <planeGeometry args={[panel.size[0], panel.size[1]]} />
            <meshBasicMaterial
              color="#5d60cc"
              transparent
              opacity={0.12}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          {/* Glowing frame */}
          <lineSegments>
            <edgesGeometry args={[new THREE.PlaneGeometry(panel.size[0], panel.size[1])]} />
            <lineBasicMaterial color="#8e90ee" transparent opacity={0.85} />
          </lineSegments>
          {/* Content lines */}
          {[0.3, 0.05, -0.2].map((y, lineIndex) => (
            <mesh key={lineIndex} position={[-panel.size[0] * 0.12, y * panel.size[1], 0.01]}>
              <planeGeometry args={[panel.size[0] * 0.55, 0.045]} />
              <meshBasicMaterial
                color="#c0c1ff"
                transparent
                opacity={0.5 - lineIndex * 0.12}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
          ))}
        </group>
      ))}

      {/* Lead-capture core */}
      <mesh position={[0, -0.2, 1.4]}>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial color="#5d60cc" emissive="#7577e0" emissiveIntensity={2.2} />
      </mesh>
    </group>
  );
}
