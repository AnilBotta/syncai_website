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
}: {
  business: string;
  tagline: string;
  phone: string;
  monogram: string;
}) {
  const [condensed, setCondensed] = useState(false);

  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-all duration-300 ${
        condensed
          ? "border-border-subtle bg-bg-base/92 shadow-[0_1px_20px_rgba(38,48,43,0.06)] backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 transition-all duration-300 sm:px-6 lg:px-8 ${
          condensed ? "py-3" : "py-6"
        }`}
      >
        <a href="#top" className="flex items-center gap-3">
          <span
            className={`grid place-items-center rounded-full border border-brand/30 font-serif text-brand transition-all duration-300 ${
              condensed ? "size-9 text-sm" : "size-11 text-base"
            }`}
          >
            {monogram}
          </span>
          <span className="leading-tight">
            <span className="block font-bold">{business}</span>
            <span
              className={`block overflow-hidden text-xs text-muted transition-all duration-300 ${
                condensed ? "max-h-0 opacity-0" : "max-h-5 opacity-100"
              }`}
            >
              {tagline}
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 text-sm md:flex">
          {[
            { href: "#services", label: "Services" },
            { href: "#practice", label: "The practice" },
            { href: "#faq", label: "FAQ" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="relative text-muted transition hover:text-foreground after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-brand after:transition-all after:duration-300 hover:after:w-full"
            >
              {item.label}
            </a>
          ))}
          <a
            href={`tel:${phone.replace(/[^\d+]/g, "")}`}
            className="flex items-center gap-2 text-muted transition hover:text-foreground"
          >
            <Phone className="size-4" />
            {phone}
          </a>
          <a
            href="#book"
            className="inline-flex h-10 items-center rounded-full bg-brand px-5 font-bold text-white transition hover:bg-brand-deep"
          >
            Book a visit
          </a>
        </nav>

        <a
          href="#book"
          className="inline-flex h-10 items-center rounded-full bg-brand px-5 text-sm font-bold text-white md:hidden"
        >
          Book
        </a>
      </div>
    </header>
  );
}
