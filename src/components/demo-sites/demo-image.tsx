import Image from "next/image";

/**
 * Image slot that degrades to a styled gradient block.
 *
 * The demo sites can ship before their photography exists, so every slot renders
 * something deliberate rather than a broken frame. Drop the file into Cloudinary
 * and pass `src` to swap it in — no layout change.
 */
type DemoImageProps = {
  src?: string;
  alt: string;
  className?: string;
  /** Rough shape, so the placeholder reserves the right space. Ignored when `fill`. */
  aspect?: string;
  priority?: boolean;
  sizes?: string;
  /**
   * Stretch to the nearest positioned ancestor instead of holding an aspect
   * ratio. Used by the cinematic hero and the half-bleed story panel, where the
   * *container* owns the height. Kept as a flag rather than letting callers pass
   * `absolute inset-0` through `aspect`, which would collide with the `relative`
   * this component otherwise sets on the same element.
   */
  fill?: boolean;
};

export function DemoImage({
  src,
  alt,
  className = "",
  aspect = "aspect-[4/3]",
  priority = false,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  fill = false,
}: DemoImageProps) {
  const frame = fill
    ? `absolute inset-0 overflow-hidden ${className}`
    : `relative overflow-hidden ${aspect} ${className}`;

  if (src) {
    return (
      <div className={frame}>
        <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" priority={priority} />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={`bg-[linear-gradient(135deg,var(--brand-soft)_0%,var(--bg-deep)_55%,var(--surface-strong)_100%)] ${frame}`}
    >
      <span
        aria-hidden
        className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_28%_30%,rgba(255,255,255,0.55),transparent_45%),radial-gradient(circle_at_75%_78%,rgba(255,255,255,0.35),transparent_50%)]"
      />
    </div>
  );
}
