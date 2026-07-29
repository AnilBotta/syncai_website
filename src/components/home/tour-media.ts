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
 */
export const TOUR_VIDEO_1080 = `${BASE}/video/upload/syncai-scrub-hero-1080.mp4`;
export const TOUR_VIDEO_720 = `${BASE}/video/upload/syncai-scrub-hero-720.mp4`;

/** Viewport at or above which the 1080p rendition is worth its bytes. */
export const DESKTOP_RENDITION_QUERY = "(min-width: 1024px)";
