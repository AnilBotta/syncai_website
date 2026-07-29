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
 *   0.0-3.5s   brain / AI hub                    hero  (pinned to frame 0 so
 *                                                      the page opens on the
 *                                                      very start of the clip)
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
export const BEATS = [0, 5.0, 11.0, 15.5, 20.5, 26.0, 31.0];

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
  // on the left, duplicating our own CTA. It is too wide to crop out and the
  // whole beat carries it, so the flat layer sinks it to near-black instead.
  [0.15, 0.85, 0.62], // cta     copy right
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
