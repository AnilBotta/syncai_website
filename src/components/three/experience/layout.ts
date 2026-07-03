import * as THREE from "three";

/**
 * World layout of the cinematic tour. One chapter = one viewport height of
 * scroll. Stations descend along a winding path; the camera curve keeps each
 * station framed for its chapter.
 */
export const CHAPTERS = [
  "hero",
  "websites",
  "voice",
  "workflow",
  "strategy",
  "results",
  "cta",
] as const;

export type ChapterId = (typeof CHAPTERS)[number];

export const CHAPTER_COUNT = CHAPTERS.length;

/** Station world positions (what the camera looks at per chapter). */
export const STATION_POSITIONS: Record<ChapterId, THREE.Vector3> = {
  hero: new THREE.Vector3(0, 0, 0),
  websites: new THREE.Vector3(7, -3, -10),
  voice: new THREE.Vector3(-7, -6, -20),
  workflow: new THREE.Vector3(7, -9, -30),
  strategy: new THREE.Vector3(-6, -12, -40),
  results: new THREE.Vector3(0, -15, -50),
  cta: new THREE.Vector3(0, -18, -60),
};

/** Camera positions per chapter (roughly in front of each station). */
const CAMERA_POINTS = [
  new THREE.Vector3(0, 0.4, 7),
  new THREE.Vector3(4.2, -2.4, -3.6),
  new THREE.Vector3(-4, -5.2, -13.6),
  new THREE.Vector3(4, -8.2, -23.6),
  new THREE.Vector3(-3.4, -11.2, -33.6),
  new THREE.Vector3(0, -13.6, -41),
  new THREE.Vector3(0, -17, -52.5),
];

export const cameraCurve = new THREE.CatmullRomCurve3(CAMERA_POINTS, false, "catmullrom", 0.35);

/**
 * Horizontal framing offset per chapter: looking right of a station pushes it
 * left on screen (copy sits right), and vice versa. Keeps the 3D focal point
 * clear of the overlay text.
 */
const LOOK_OFFSETS: Record<ChapterId, number> = {
  hero: -1.6, // copy left → orb right of center
  websites: -1.8, // copy left → screens right
  voice: 2.4, // copy right → waveform left
  workflow: -2.4, // copy left → pipeline right
  strategy: 2.4, // copy right → core left
  results: 0,
  cta: 0,
};

/** Vertical framing offsets (looking above a station pushes it down-screen). */
const LOOK_OFFSETS_Y: Partial<Record<ChapterId, number>> = {
  results: 0.8,
  cta: 1.4, // center copy → core glows low behind the CTA buttons
};

export const lookCurve = new THREE.CatmullRomCurve3(
  CHAPTERS.map((id) => {
    const target = STATION_POSITIONS[id].clone();
    target.x += LOOK_OFFSETS[id];
    target.y += LOOK_OFFSETS_Y[id] ?? 0;
    return target;
  }),
  false,
  "catmullrom",
  0.35
);

/** 0-1 progress at which a chapter is centered. */
export function chapterCenter(index: number) {
  return index / (CHAPTER_COUNT - 1);
}
