/**
 * Layout of the scroll-scrubbed homepage tour. One chapter = one viewport
 * height of scroll; scroll progress drives the hero video's playhead.
 *
 * Separate from `three/experience/layout.ts` on purpose: that module's
 * CHAPTER_COUNT of 7 still describes the 3D station/camera layout, which stays
 * in the tree even though the canvas is no longer mounted.
 */
export const SCRUB_CHAPTERS = ["hero", "websites", "voice", "workflow", "strategy"] as const;

export type ScrubChapterId = (typeof SCRUB_CHAPTERS)[number];

export const SCRUB_CHAPTER_COUNT = SCRUB_CHAPTERS.length;

/** 0-1 progress at which a chapter is centered. */
export function scrubChapterCenter(index: number) {
  return index / (SCRUB_CHAPTER_COUNT - 1);
}

/** Measured source duration (ffprobe: 34.087007s). Only used to space BEATS. */
export const SOURCE_DURATION = 34.087;

/**
 * Video time each chapter should be centered on, one entry per chapter.
 *
 * Currently evenly spaced, which makes `progressToTime` a plain linear map.
 * Scene detection on the source found only one hard cut (5.04s) — it is a
 * continuously animated piece rather than five hard-cut beats — so there is
 * nothing better to key off yet. Softer transitions were detected at 5.04,
 * 10.08, 16.68, 22.72 and 25.2s; if the footage is meant to land on specific
 * moments, replace these five numbers and the copy will follow.
 */
export const BEATS = [0, 8.52175, 17.0435, 25.56525, 34.087];

/**
 * Map scroll progress (0-1) to a video timestamp, piecewise-linear through
 * BEATS. Normalises against the real duration so a re-encode of a slightly
 * different length stays in sync.
 */
export function progressToTime(progress: number, duration: number) {
  const t = Math.min(Math.max(progress, 0), 1);
  const last = BEATS[BEATS.length - 1];
  if (BEATS.length < 2 || last <= 0) {
    return t * duration;
  }
  const scale = duration / last;
  const position = t * (BEATS.length - 1);
  const index = Math.min(Math.floor(position), BEATS.length - 2);
  const fraction = position - index;
  return (BEATS[index] + (BEATS[index + 1] - BEATS[index]) * fraction) * scale;
}
