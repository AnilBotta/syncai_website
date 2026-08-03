/**
 * Delivery URL for a demo-site photograph.
 *
 * No transformation segment: `next/image` already resizes and re-encodes on the
 * way out, so adding `f_auto,q_auto` here would mean two lossy passes over the
 * same pixels for no benefit. Public IDs are versioned (`-v1`) rather than
 * invalidated, because CDN invalidation is not atomic and a half-propagated
 * swap would serve old bytes against new layout.
 *
 * `next.config.ts` allowlists this host under `images.remotePatterns`; without
 * that entry next/image rejects every one of these URLs.
 */
export function demoImageUrl(slug: string, id: string) {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "tpwmgjsk";
  return `https://res.cloudinary.com/${cloud}/image/upload/demos/${slug}/${id}`;
}
