"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Workflow automation station — a node graph with glowing pulses traveling
 * along the edges (data flowing through an automation).
 */

const NODES: THREE.Vector3[] = [
  new THREE.Vector3(-2.6, 0.9, 0),
  new THREE.Vector3(-1.2, -0.6, 0.5),
  new THREE.Vector3(0, 1.1, -0.4),
  new THREE.Vector3(0.2, -1, 0.3),
  new THREE.Vector3(1.5, 0.2, 0.6),
  new THREE.Vector3(2.7, -0.7, -0.2),
  new THREE.Vector3(2.5, 1.2, 0.2),
  new THREE.Vector3(-2.4, -1.2, -0.5),
];

const EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 4],
  [3, 4],
  [4, 5],
  [4, 6],
  [7, 1],
  [7, 3],
  [2, 6],
];

const PULSES_PER_EDGE = 2;
const dummy = new THREE.Object3D();
const from = new THREE.Vector3();
const to = new THREE.Vector3();

export function WorkflowPipelineStation() {
  const group = useRef<THREE.Group>(null);
  const pulses = useRef<THREE.InstancedMesh>(null);

  const edgePositions = useMemo(() => {
    const array = new Float32Array(EDGES.length * 6);
    EDGES.forEach(([a, b], i) => {
      array.set([NODES[a].x, NODES[a].y, NODES[a].z], i * 6);
      array.set([NODES[b].x, NODES[b].y, NODES[b].z], i * 6 + 3);
    });
    return array;
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      group.current.rotation.y += delta * 0.06;
    }
    if (pulses.current) {
      let index = 0;
      for (let e = 0; e < EDGES.length; e += 1) {
        const [a, b] = EDGES[e];
        for (let p = 0; p < PULSES_PER_EDGE; p += 1) {
          const phase = (t * 0.35 + e * 0.13 + p * 0.5) % 1;
          from.copy(NODES[a]);
          to.copy(NODES[b]);
          dummy.position.lerpVectors(from, to, phase);
          const scale = 0.6 + Math.sin(phase * Math.PI) * 0.7;
          dummy.scale.setScalar(scale);
          dummy.updateMatrix();
          pulses.current.setMatrixAt(index, dummy.matrix);
          index += 1;
        }
      }
      pulses.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={group}>
      {/* Nodes */}
      {NODES.map((node, index) => (
        <mesh key={index} position={node}>
          <sphereGeometry args={[index === 4 ? 0.28 : 0.16, 24, 24]} />
          <meshStandardMaterial
            color="#5d60cc"
            emissive={index === 4 ? "#7577e0" : "#5d60cc"}
            emissiveIntensity={index === 4 ? 2.4 : 1.2}
          />
        </mesh>
      ))}

      {/* Edges */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[edgePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          color="#8e90ee"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* Traveling pulses */}
      <instancedMesh ref={pulses} args={[undefined, undefined, EDGES.length * PULSES_PER_EDGE]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshBasicMaterial
          color="#c0c1ff"
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </instancedMesh>
    </group>
  );
}
