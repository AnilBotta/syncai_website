"use client";

import { useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import * as THREE from "three";
import { scrollProgress } from "../scroll-progress";
import { CHAPTER_COUNT, chapterCenter, STATION_POSITIONS, type ChapterId } from "../layout";

type StationProps = {
  id: ChapterId;
  chapterIndex: number;
  children: ReactNode;
};

// Full size while within this many chapters of the focus...
const FULL_RANGE = 0.28;
// ...then shrinks to nothing by this distance, so neighbouring stations
// never linger inside the current chapter's frame.
const FADE_RANGE = 0.72;

/**
 * Places a station at its world position and scale-fades it with distance
 * from its chapter: the active station is full size, neighbours warp away.
 */
export function Station({ id, chapterIndex, children }: StationProps) {
  const group = useRef<Group>(null);
  const scale = useRef(chapterIndex === 0 ? 1 : 0);
  const position = STATION_POSITIONS[id];

  useFrame((_, delta) => {
    if (!group.current) {
      return;
    }

    const distance =
      Math.abs(scrollProgress.current - chapterCenter(chapterIndex)) * (CHAPTER_COUNT - 1);
    const t = THREE.MathUtils.clamp((FADE_RANGE - distance) / (FADE_RANGE - FULL_RANGE), 0, 1);
    const target = t * t * (3 - 2 * t); // smoothstep

    scale.current += (target - scale.current) * (1 - Math.exp(-8 * delta));
    group.current.scale.setScalar(Math.max(scale.current, 0.0001));
    group.current.visible = scale.current > 0.01;
  });

  return (
    <group ref={group} position={position}>
      {children}
    </group>
  );
}

/** Read inside station children to skip per-frame work while culled. */
export function isStationActive(chapterIndex: number, range = FADE_RANGE) {
  const distance =
    Math.abs(scrollProgress.current - chapterCenter(chapterIndex)) * (CHAPTER_COUNT - 1);
  return distance < range;
}
