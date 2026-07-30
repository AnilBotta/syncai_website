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

/** Measured source duration (ffprobe). Only used to normalise BEATS. */
export const SOURCE_DURATION = 45.875;

/**
 * Video time each chapter should be centered on, one entry per chapter.
 *
 * The master is seven bright-studio clips joined with 0.7s crossfades, so each
 * beat owns a window and the joins are dissolves rather than cuts — a hard cut
 * scrubbed back and forth reads as a glitch. Windows in the joined timeline:
 *
 *   clip                  spans         clean      centred on
 *   sphere + ribbons      0.00-8.00     0.0-7.3    hero      0.0 (opens on frame 0)
 *   glass panels          7.30-15.30    8.0-14.6   websites  11.3
 *   sound wave            14.60-22.60   15.3-21.9  voice     18.6
 *   glass tiles           21.90-29.90   22.6-29.2  workflow  25.9
 *   glass planes          29.20-37.20   29.9-36.5  strategy  33.2
 *   ROI columns           36.50-41.54   37.2-40.8  results   39.0
 *   liquid sphere         40.84-45.88   41.5-45.9  cta       45.0
 *
 * Hero is pinned to 0 rather than its window centre so the page opens on the
 * very first frame. A chapter is centered on screen at progress i/(count-1),
 * and progressToTime maps that exactly onto BEATS[i], so each block of copy
 * lands on its own footage. Nudge one number to shift one chapter.
 *
 * The last two clips are 5.0s where the rest are 8.0s, so those chapters scrub
 * through less footage per viewport. Not perceptible, but it is why the later
 * gaps are shorter.
 */
export const BEATS = [0, 11.3, 18.6, 25.9, 33.2, 39.0, 45.0];

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

/** Opacity of the [left, right, flat] scrim layers, one entry per chapter. */
type ScrimMix = readonly [number, number, number];

/**
 * How much of each scrim layer a chapter needs, keyed to which side its copy
 * sits on — keep this index-aligned with SCRUB_CHAPTERS, BEATS, and the `align`
 * props in chapters/tour-chapters.tsx (left, left, right, left, right, left,
 * right). The tuple type makes a length mismatch a compile error.
 *
 * Weights come from measuring the footage behind each copy column: peak
 * luminance there runs 117-121 on the first four chapters against a 74 target,
 * which is why most of them sit at full strength. `results` is already dark
 * (48) and `cta` carries a flat component instead — see below.
 */
/** Exactly one mix per chapter; the fixed arity makes a mismatch a type error. */
type ScrimMixes = readonly [
  ScrimMix,
  ScrimMix,
  ScrimMix,
  ScrimMix,
  ScrimMix,
  ScrimMix,
  ScrimMix,
];

export const SCRIM_MIX: ScrimMixes = [
  [1.0, 0.0, 0.05], // hero      copy left
  [1.0, 0.0, 0.15], // websites  copy left  — busiest frame in the clip
  [0.0, 1.0, 0.05], // voice     copy right
  [1.0, 0.0, 0.25], // workflow  copy left  — n8n labels need the field pushed down
  [0.0, 0.9, 0.05], // strategy  copy right
  [0.9, 0.0, 0.0], //  results   copy left  — footage is already dark here
  // The closing frame has "Ready to sync your business with AI?" burned into it
  // on the left, duplicating our own CTA. A heavy flat layer sank it, but the
  // flat and side layers compound and the whole frame went black. The left
  // gradient does the job on its own: it covers the bubble without touching
  // the lit subject on the right.
  [0.3, 0.85, 0.1], // cta       copy right
];

/**
 * Blend the scrim mix for a given scroll progress.
 *
 * Holds each chapter's mix while its copy is at full opacity and swings only in
 * between: a chapter's copy is fully opaque across roughly the middle quarter
 * of its own scroll range, so the crossfade is confined to u 0.3-0.7 within a
 * segment. Mirrors progressToTime's piecewise walk so the two stay in step.
 */
export function scrimMix(progress: number): ScrimMix {
  const t = Math.min(Math.max(progress, 0), 1);
  const last = SCRIM_MIX.length - 1;
  const position = t * last;
  const index = Math.min(Math.floor(position), last - 1);
  const u = position - index;
  const s = Math.min(Math.max((u - 0.3) / 0.4, 0), 1);
  const eased = s * s * (3 - 2 * s);
  const from = SCRIM_MIX[index];
  const to = SCRIM_MIX[index + 1];
  return [
    from[0] + (to[0] - from[0]) * eased,
    from[1] + (to[1] - from[1]) * eased,
    from[2] + (to[2] - from[2]) * eased,
  ];
}
