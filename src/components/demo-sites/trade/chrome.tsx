import Link from "next/link";
import { Clock, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import type { DemoSite } from "@/lib/demo-sites";
import { tradeContent } from "@/lib/demo-sites/trade";
import { DemoImage } from "@/components/demo-sites/demo-image";
import { AmberButton, PhoneNumber } from "./bits";

/**
 * Header, utility strip, call band and footer for the bespoke trade site.
 *
 * Deliberately NOT the shared DemoHeader: that one is a quiet editorial bar
 * with a monogram and a text link. A trade header's job is to put the phone
 * number in front of someone who is standing in water, so the number is the
 * largest element in it and the nav is the thing that gets dropped first when
 * the viewport narrows.
 */

/** Charcoal hairline strip above the header — reassurance before the fold. */
export function UtilityStrip({ phone }: { phone: string }) {
  return (
    <div className="bg-[color:var(--trade-ink)] text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-2 text-[0.6875rem] font-bold uppercase tracking-[0.14em] sm:px-6 lg:px-8">
        <span className="flex items-center gap-2">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[color:var(--trade-amber)] opacity-70" />
            <span className="relative inline-flex size-1.5 rounded-full bg-[color:var(--trade-amber)]" />
          </span>
          {tradeContent.utility.emergency}
        </span>
        <span className="flex items-center gap-2 text-white/70">
          <ShieldCheck className="size-3.5 text-[color:var(--trade-amber)]" aria-hidden />
          {tradeContent.utility.credential}
        </span>
        <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="hidden items-center gap-2 hover:text-[color:var(--trade-amber)] md:flex">
          <Phone className="size-3.5 text-[color:var(--trade-amber)]" aria-hidden />
          {phone}
        </a>
      </div>
    </div>
  );
}

export function TradeHeader({ site }: { site: DemoSite }) {
  return (
    /*
     * Sticky rather than fixed: nothing here overlays the hero, so it can stay
     * in flow and the hero photograph starts below it. The heavy bottom rule is
     * doing the same job the shadow does on the editorial demos.
     */
    <header className="sticky top-0 z-40 border-b-4 border-[color:var(--trade-ink)] bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <a href="#top" className="flex shrink-0 items-center gap-3">
          <span className="grid size-11 place-items-center bg-[color:var(--trade-amber)] font-serif text-2xl leading-none text-[color:var(--trade-ink)]">
            H
          </span>
          <span className="leading-tight">
            <span className="block font-serif text-xl uppercase leading-none tracking-tight text-[color:var(--trade-ink)] sm:text-[1.375rem]">
              Halcyon
            </span>
            <span className="block text-[0.625rem] font-bold uppercase tracking-[0.18em] text-muted">
              Plumbing &amp; Heating
            </span>
          </span>
        </a>

        <nav className="ml-auto hidden items-center gap-7 lg:flex">
          {site.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-xs font-bold uppercase tracking-[0.12em] text-muted transition hover:text-[color:var(--trade-ink)]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4 lg:ml-8">
          <PhoneNumber
            phone={site.phone}
            label="Call 24/7"
            className="hidden text-[color:var(--trade-ink)] sm:block"
          />
          {/* Below sm the number collapses to an icon button — it must never
              disappear entirely, which is what the shared header does. */}
          <a
            href={`tel:${site.phone.replace(/[^\d+]/g, "")}`}
            aria-label={`Call ${site.business} on ${site.phone}`}
            className="grid size-12 place-items-center bg-[color:var(--trade-ink)] text-white sm:hidden"
          >
            <Phone className="size-5" aria-hidden />
          </a>
          <AmberButton href="#quote" className="hidden md:inline-flex">
            {site.ctaLabel}
          </AmberButton>
        </div>
      </div>
    </header>
  );
}

/** Full-width amber band. The last push before the footer. */
export function CallBand({ phone }: { phone: string }) {
  return (
    <section className="bg-[color:var(--trade-amber)] text-[color:var(--trade-ink)]">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 px-4 py-14 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-16">
        <div>
          <h2>{tradeContent.callBand.heading}</h2>
          <p className="mt-3 max-w-xl text-base font-medium leading-7 text-[color:var(--trade-ink)]/80">
            {tradeContent.callBand.body}
          </p>
        </div>
        <a
          href={`tel:${phone.replace(/[^\d+]/g, "")}`}
          className="flex shrink-0 items-center gap-4 bg-[color:var(--trade-ink)] px-7 py-5 text-white transition hover:bg-[color:var(--trade-ink-soft)]"
        >
          <Phone className="size-7 text-[color:var(--trade-amber)]" aria-hidden />
          <span className="font-serif text-3xl leading-none tracking-tight lg:text-4xl">{phone}</span>
        </a>
      </div>
    </section>
  );
}

export function TradeFooter({ site }: { site: DemoSite }) {
  return (
    <footer className="bg-[color:var(--trade-ink)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="font-serif text-2xl uppercase leading-none tracking-tight">
              Halcyon Plumbing &amp; Heating
            </p>
            <p className="mt-3 text-sm leading-6 text-white/60">{site.tagline}</p>
            <DemoImage
              src={site.images.exterior?.src}
              alt={site.images.exterior?.alt || ""}
              aspect="aspect-[16/9]"
              sizes="(min-width: 1024px) 30vw, 100vw"
              className="mt-6"
            />
          </div>

          <div className="text-sm lg:col-span-3">
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-[color:var(--trade-amber)]">
              What we do
            </p>
            <ul className="mt-4 space-y-2 text-white/70">
              {tradeContent.services.map((service) => (
                <li key={service.title}>{service.title}</li>
              ))}
            </ul>
          </div>

          <div className="text-sm lg:col-span-2">
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-[color:var(--trade-amber)]">
              Areas
            </p>
            <ul className="mt-4 space-y-2 text-white/70">
              {tradeContent.areas.items.slice(0, 7).map((area) => (
                <li key={area}>{area}</li>
              ))}
            </ul>
          </div>

          <div className="text-sm lg:col-span-3">
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-[color:var(--trade-amber)]">
              Get in touch
            </p>
            <ul className="mt-4 space-y-3 text-white/70">
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 size-4 shrink-0 text-[color:var(--trade-amber)]" aria-hidden />
                <a href={`tel:${site.phone.replace(/[^\d+]/g, "")}`} className="font-bold text-white hover:underline">
                  {site.phone}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 size-4 shrink-0 text-[color:var(--trade-amber)]" aria-hidden />
                {site.email}
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-[color:var(--trade-amber)]" aria-hidden />
                {site.location}
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="mt-0.5 size-4 shrink-0 text-[color:var(--trade-amber)]" aria-hidden />
                {site.hoursLabel}
              </li>
            </ul>
          </div>
        </div>

        {/*
         * The honesty line. The bespoke site inherits nothing from SiteFooter,
         * so this is written out here rather than assumed — see the demo bar for
         * the second, always-visible copy of the same disclosure.
         */}
        <p className="mt-14 border-t border-white/15 pt-6 text-xs leading-5 text-white/55">
          {site.business} is a fictional business created by SyncAI Technologies to demonstrate an
          AI-powered website. The address, phone number, and email are not real, and no{" "}
          {site.appointmentNoun} made here is a real booking.{" "}
          <Link href="/demos/ai-websites-and-apps" className="font-bold text-white underline">
            Back to SyncAI demos
          </Link>
        </p>
      </div>
    </footer>
  );
}
