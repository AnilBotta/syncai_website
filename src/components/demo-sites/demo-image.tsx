import Image from "next/image";

/**
 * Image slot that degrades to a styled gradient block.
 *
 * The demo sites ship before their photography exists, so every slot renders
 * something deliberate rather than a broken frame. Drop the file into
 * public/demos/<slug>/ and pass `src` to swap it in — no layout change.
 */
type DemoImageProps = {
  src?: string;
  alt: string;
  className?: string;
  /** Rough shape, so the placeholder reserves the right space. */
  aspect?: string;
  priority?: boolean;
  /** Responsive hint for next/image. Full-bleed slots should pass "100vw". */
  sizes?: string;
};

export function DemoImage({
  src,
  alt,
  className = "",
  aspect = "aspect-[4/3]",
  priority = false,
  sizes = "(min-width: 1024px) 50vw, 100vw",
}: DemoImageProps) {
  if (src) {
    return (
      <div className={`relative overflow-hidden ${aspect} ${className}`}>
        <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" priority={priority} />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={`relative overflow-hidden bg-[linear-gradient(135deg,var(--brand-soft)_0%,var(--bg-deep)_55%,var(--surface-strong)_100%)] ${aspect} ${className}`}
    >
      <span
        aria-hidden
        className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_28%_30%,rgba(255,255,255,0.55),transparent_45%),radial-gradient(circle_at_75%_78%,rgba(255,255,255,0.35),transparent_50%)]"
      />
    </div>
  );
}
