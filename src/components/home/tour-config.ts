/**
 * Layout of the scroll-scrubbed homepage tour. One chapter = one viewport
 * height of scroll; scroll progress drives the hero video's playhead.
 *
 * Separate from `three/experience/layout.ts` on purpose: that module's
 * CHAPTER_COUNT of 7 still describes the 3D station/camera layout, which stays
 * in the tree even though the canvas is no longer mounted.
 */
export const SCRUB_CHAPTERS = [
  "hero",
  "websites",
  "voice",
  "workflow",
  "strategy",
  "results",
  "cta",
] as const;

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
 * Measured off the footage frame by frame, not guessed — the clip is cut into
 * seven segments that match these chapters one for one:
 *
 *   0.0-3.5s   brain / AI hub                    hero
 *   4.0-6.5s   three screens, "Elevate Your..."  websites
 *   8.0-13.5s  voice avatar + waveform           voice
 *   14.0-17.5s n8n workflow diagram              workflow
 *   19.0-22.5s scoring dashboard + roadmap       strategy
 *   24.0-28.0s bar charts, growth arrow          results
 *   29.0-34.0s "Ready to sync your business"     cta
 *
 * Each value is the middle of its segment, where the visual reads most
 * clearly. A chapter is centered on screen at progress i/(count-1), and
 * progressToTime maps that exactly onto BEATS[i], so the copy lands on its
 * own footage. Nudge a number here to shift when that chapter's text arrives.
 */
export const BEATS = [1.5, 5.0, 11.0, 15.5, 20.5, 26.0, 31.0];

/**
 * Map scroll progress (0-1) to a video timestamp, piecewise-linear through
 * BEATS.
 *
 * BEATS are absolute times measured against SOURCE_DURATION, so the only
 * rescaling applied is the ratio between that and the rendition actually
 * playing — the two encodes differ by ~20ms. Scrolling between two chapters
 * plays the footage between their beats at a constant rate.
 */
export function progressToTime(progress: number, duration: number) {
  const t = Math.min(Math.max(progress, 0), 1);
  if (BEATS.length < 2) {
    return t * duration;
  }
  const scale = Number.isFinite(duration) && duration > 0 ? duration / SOURCE_DURATION : 1;
  const position = t * (BEATS.length - 1);
  const index = Math.min(Math.floor(position), BEATS.length - 2);
  const fraction = position - index;
  const time = (BEATS[index] + (BEATS[index + 1] - BEATS[index]) * fraction) * scale;
  return Math.min(Math.max(time, 0), duration);
}
