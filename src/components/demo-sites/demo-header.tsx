"use client";

import { useEffect, useState } from "react";
import { Phone } from "lucide-react";

/**
 * Sticky practice header that condenses once the visitor leaves the hero.
 *
 * Only height, background and shadow change — all cheap to paint. The scroll
 * listener is passive and flips a single boolean, so it can't thrash layout on
 * every frame the way a scroll-linked style would.
 */
export function DemoHeader({
  business,
  tagline,
  phone,
  monogram,
  nav,
  ctaLabel,
  ctaLabelShort,
  overHero = false,
}: {
  business: string;
  tagline: string;
  phone: string;
  monogram: string;
  nav: { href: string; label: string }[];
  ctaLabel: string;
  ctaLabelShort: string;
  /**
   * True when the page opens with a full-bleed dark hero behind this header.
   * The theme's ink tokens are near-black, so at the top of a cinematic page
   * they would be invisible over the photograph — until the header condenses
   * onto its own opaque background, everything has to render light.
   */
  overHero?: boolean;
}) {
  const [condensed, setCondensed] = useState(false);

  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Light-on-photograph only while sitting over the hero. Once condensed the
  // header owns an opaque background and reverts to the theme's ink.
  const onPhoto = overHero && !condensed;

  return (
    <header
      className={`inset-x-0 top-0 z-40 border-b transition-all duration-300 ${
        // `sticky` keeps the header in normal flow, so on a cinematic page it
        // would occupy a band ABOVE the full-bleed hero instead of sitting on
        // it — and the light-on-photo type would land on the cream page
        // background, invisible. `fixed` lifts it out of flow so it genuinely
        // overlays; the hero's top padding reserves the space.
        overHero ? "fixed" : "sticky"
      } ${
        condensed
          ? "border-border-subtle bg-bg-base/92 shadow-[0_1px_20px_var(--accent-glow)] backdrop-blur-md"
          : "border-transparent bg-transparent"
      } ${onPhoto ? "text-white" : ""}`}
    >
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 transition-all duration-300 sm:px-6 lg:px-8 ${
          condensed ? "py-3" : "py-6"
        }`}
      >
        <a href="#top" className="flex items-center gap-3">
          <span
            className={`grid place-items-center rounded-full border font-serif transition-all duration-300 ${
              condensed ? "size-9 text-sm" : "size-11 text-base"
            } ${onPhoto ? "border-white/40 text-white" : "border-brand/30 text-brand"}`}
          >
            {monogram}
          </span>
          <span className="leading-tight">
            <span className="block font-bold">{business}</span>
            <span
              className={`block overflow-hidden text-xs transition-all duration-300 ${
                condensed ? "max-h-0 opacity-0" : "max-h-5 opacity-100"
              } ${onPhoto ? "text-white/75" : "text-muted"}`}
            >
              {tagline}
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 text-sm md:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`relative transition after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:transition-all after:duration-300 hover:after:w-full ${
                onPhoto
                  ? "text-white/80 after:bg-white hover:text-white"
                  : "text-muted after:bg-brand hover:text-foreground"
              }`}
            >
              {item.label}
            </a>
          ))}
          <a
            href={`tel:${phone.replace(/[^\d+]/g, "")}`}
            className={`flex items-center gap-2 transition ${
              onPhoto ? "text-white/80 hover:text-white" : "text-muted hover:text-foreground"
            }`}
          >
            <Phone className="size-4" />
            {phone}
          </a>
          <a
            href="#book"
            className={`inline-flex h-10 items-center rounded-full px-5 font-bold transition ${
              onPhoto
                ? "bg-white text-[color:var(--brand-deep)] hover:bg-white/90"
                : "bg-brand text-white hover:bg-brand-deep"
            }`}
          >
            {ctaLabel}
          </a>
        </nav>

        <a
          href="#book"
          className={`inline-flex h-10 items-center rounded-full px-5 text-sm font-bold md:hidden ${
            onPhoto ? "bg-white text-[color:var(--brand-deep)]" : "bg-brand text-white"
          }`}
        >
          {ctaLabelShort}
        </a>
      </div>
    </header>
  );
}
