const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "tpwmgjsk";
const BASE = `https://res.cloudinary.com/${CLOUD_NAME}`;

/**
 * Poster painted before any video bytes arrive — it is the hero's LCP element.
 * Transformations are right here: Cloudinary picks the format and quality.
 */
export const TOUR_POSTER = `${BASE}/image/upload/f_auto,q_auto,w_1920,c_limit/poster1_dpa4de`;

/**
 * Scrub renditions, deliberately delivered with NO transformation segment.
 *
 * `q_auto` re-encodes at Cloudinary's own ~2s GOP and `f_auto` can serve VP9 —
 * either one throws away the dense keyframe spacing the whole scrub design
 * depends on. These must be the exact bytes ffmpeg produced. A Content-Length
 * that differs from the local file means Cloudinary re-encoded it.
 *
 * Both carry a keyframe every 3 frames. Scrub smoothness is bound by how far
 * the decoder has to walk from the nearest keyframe, so this matters far more
 * than resolution: the previous desktop file was 1920x1080 at a 10-frame GOP
 * and stepped visibly. 1600x900 at a 3-frame GOP is slightly smaller on disk
 * and seeks over three times more often.
 */
export const TOUR_VIDEO_DESKTOP = `${BASE}/video/upload/syncai-scrub-hero-1600g3.mp4`;
export const TOUR_VIDEO_MOBILE = `${BASE}/video/upload/syncai-scrub-hero-720.mp4`;

/** Viewport at or above which the larger rendition is worth its bytes. */
export const DESKTOP_RENDITION_QUERY = "(min-width: 1024px)";
