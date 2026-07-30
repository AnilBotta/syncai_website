const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "tpwmgjsk";
const BASE = `https://res.cloudinary.com/${CLOUD_NAME}`;

/**
 * Poster painted before any video bytes arrive — it is the hero's LCP element,
 * and frame 0 of the video so the cross-fade has nothing to pop between.
 * Transformations are right here: Cloudinary picks the format and quality.
 */
export const TOUR_POSTER = `${BASE}/image/upload/f_auto,q_auto,w_1920,c_limit/syncai-tour-bright-poster-v1`;

/**
 * The bright-studio tour: seven clips joined with 0.7s crossfades, 1600x900 at
 * 24fps, 45.9s. Delivered with NO transformation segment on purpose.
 *
 * `q_auto` re-encodes at Cloudinary's own ~2s GOP and `f_auto` can serve VP9 —
 * either one throws away the 3-frame keyframe spacing the whole scrub design
 * depends on. These must be the exact bytes ffmpeg produced. A Content-Length
 * that differs from the local master means Cloudinary re-encoded it.
 *
 * One rendition for both breakpoints: at 16.7MB it is close enough to the old
 * mobile file that a separate cut was not worth the second encode.
 */
export const TOUR_VIDEO_DESKTOP = `${BASE}/video/upload/syncai-tour-bright-v1.mp4`;
export const TOUR_VIDEO_MOBILE = TOUR_VIDEO_DESKTOP;

/** Viewport at or above which the larger rendition is worth its bytes. */
export const DESKTOP_RENDITION_QUERY = "(min-width: 1024px)";
