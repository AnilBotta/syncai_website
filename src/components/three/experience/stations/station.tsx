"use client";

import { useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { scrollProgress } from "../scroll-progress";
import { CHAPTER_COUNT, chapterCenter, STATION_POSITIONS, type ChapterId } from "../layout";

type StationProps = {
  id: ChapterId;
  chapterIndex: number;
  children: ReactNode;
};

/**
 * Places a station at its world position and culls it (visibility + skipped
 * child animation) when the tour is more than ~1.2 chapters away.
 */
export function Station({ id, chapterIndex, children }: StationProps) {
  const group = useRef<Group>(null);
  const position = STATION_POSITIONS[id];

  useFrame(() => {
    if (!group.current) {
      return;
    }
    const distance = Math.abs(scrollProgress.current - chapterCenter(chapterIndex)) * (CHAPTER_COUNT - 1);
    group.current.visible = distance < 1.25;
  });

  return (
    <group ref={group} position={position}>
      {children}
    </group>
  );
}

/** Read inside station children to skip per-frame work while culled. */
export function isStationActive(chapterIndex: number, range = 1.25) {
  const distance = Math.abs(scrollProgress.current - chapterCenter(chapterIndex)) * (CHAPTER_COUNT - 1);
  return distance < range;
}
