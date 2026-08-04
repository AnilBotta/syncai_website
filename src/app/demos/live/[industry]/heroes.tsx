import { ArrowRight, Phone } from "lucide-react";
import type { DemoSite } from "@/lib/demo-sites";
import { DemoImage } from "@/components/demo-sites/demo-image";
import { Reveal } from "@/components/motion/reveal";

/**
 * One hero per layout. This is where the demos actually diverge — sharing a
 * palette between two sites is fine, sharing a skeleton is what makes a prospect
 * think they are looking at one template twice.
 *
 * The trade demo has no hero here: it opts out of the shared system entirely
 * (`layout: "bespoke"`) and brings its own components.
 */

/** Live-status dot, shared by every hero. */
function HoursPulse({ label, light = false }: { label: string; light?: boolean }) {
  return (
    <p className={`mt-8 flex items-center gap-2.5 text-sm ${light ? "text-white/75" : "text-muted"}`}>
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-success" />
      </span>
      {label}
    </p>
  );
}

function PhoneLink({ phone, light = false }: { phone: string; light?: boolean }) {
  return (
    <a
      href={`tel:${phone.replace(/[^\d+]/g, "")}`}
      className={`inline-flex items-center gap-2 text-sm font-bold transition ${
        light ? "text-white hover:text-white/80" : "hover:text-brand-glow-text"
      }`}
    >
      <Phone className={`size-4 ${light ? "" : "text-brand"}`} />
      {phone}
    </a>
  );
}

/**
 * Editorial — the clinic. Copy holds the left seven columns and the photograph
 * runs off the right edge of the viewport.
 */
export function EditorialHero({ site }: { site: DemoSite }) {
  return (
    <section className="relative mx-auto max-w-6xl px-4 pt-10 pb-20 sm:px-6 lg:px-8 lg:pt-16 lg:pb-28">
      <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <Reveal>
            <p className="demo-label text-brand-glow-text">{site.hero.eyebrow}</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-6">{site.hero.heading}</h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-7 max-w-lg text-lg leading-8 text-muted">{site.hero.body}</p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <a
                href="#book"
                className="group inline-flex h-14 items-center gap-3 rounded-full bg-brand px-8 text-sm font-bold text-white shadow-[0_12px_32px_var(--accent-glow)] transition hover:bg-brand-deep"
              >
                {site.hero.cta}
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <PhoneLink phone={site.phone} />
            </div>
          </Reveal>
          <Reveal delay={0.32}>
            <HoursPulse label={site.hoursLabel} />
          </Reveal>
        </div>

        {/* Bleeds right on lg+, contained below it. */}
        <div className="lg:col-span-5">
          <Reveal delay={0.12}>
            <div className="lg:-mr-[22vw]">
              <DemoImage
                src={site.images.hero.src}
                alt={site.images.hero.alt}
                // 5/4, not portrait: this column is ~460px wide plus a 22vw bleed,
                // so anything taller than landscape runs to ~950px and strands the
                // copy in the middle of an empty screen.
                aspect="aspect-[5/4]"
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="rounded-[2rem] shadow-[0_30px_80px_var(--accent-glow)]"
                priority
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/**
 * Cinematic — the brokerage. The photograph fills the viewport and the copy sits
 * over it on a dark scrim.
 *
 * The scrim is not decoration: the source images are bright interiors and white
 * type over them fails contrast badly without it. Left-weighted so the gradient
 * is heaviest exactly where the copy sits.
 */
export function CinematicHero({ site }: { site: DemoSite }) {
  return (
    <section className="relative isolate min-h-[38rem] overflow-hidden lg:min-h-[46rem]">
      <DemoImage src={site.images.hero.src} alt={site.images.hero.alt} fill sizes="100vw" priority />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(100deg,rgba(12,18,28,0.86)_0%,rgba(12,18,28,0.72)_38%,rgba(12,18,28,0.30)_68%,rgba(12,18,28,0.12)_100%)]"
      />
      <div className="relative mx-auto flex min-h-[38rem] max-w-6xl items-end px-4 pb-16 pt-32 sm:px-6 lg:min-h-[46rem] lg:px-8 lg:pb-24">
        <div className="max-w-2xl text-white">
          <Reveal>
            <p className="demo-label text-white/75">{site.hero.eyebrow}</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-6 text-white">{site.hero.heading}</h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-7 max-w-xl text-lg leading-8 text-white/85">{site.hero.body}</p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <a
                href="#listings"
                className="group inline-flex h-14 items-center gap-3 rounded-full bg-white px-8 text-sm font-bold text-[color:var(--brand-deep)] transition hover:bg-white/90"
              >
                {site.hero.cta}
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <PhoneLink phone={site.phone} light />
            </div>
          </Reveal>
          <Reveal delay={0.32}>
            <HoursPulse label={site.hoursLabel} light />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/**
 * Split — the physio clinic. A solid panel of copy beside a full-height
 * photograph, 50/50 on desktop and stacked below `lg`.
 *
 * The copy sits on a solid panel rather than over the image, which means no
 * scrim to tune and no contrast risk from the photograph.
 */
export function SplitHero({ site }: { site: DemoSite }) {
  return (
    <section className="grid items-stretch lg:min-h-[42rem] lg:grid-cols-2">
      <div className="order-2 flex items-center bg-bg-deep px-4 py-16 sm:px-6 lg:order-1 lg:px-16 lg:py-24">
        <div className="max-w-lg">
          <Reveal>
            <p className="demo-label text-brand-glow-text">{site.hero.eyebrow}</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-6">{site.hero.heading}</h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-7 text-lg leading-8 text-muted">{site.hero.body}</p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <a
                href="#book"
                className="group inline-flex h-14 items-center gap-3 rounded-full bg-brand px-8 text-sm font-bold text-white shadow-[0_12px_32px_var(--accent-glow)] transition hover:bg-brand-deep"
              >
                {site.hero.cta}
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <PhoneLink phone={site.phone} />
            </div>
          </Reveal>
          <Reveal delay={0.32}>
            <HoursPulse label={site.hoursLabel} />
          </Reveal>
        </div>
      </div>

      <div className="relative order-1 min-h-[20rem] lg:order-2 lg:min-h-full">
        <DemoImage
          src={site.images.hero.src}
          alt={site.images.hero.alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          priority
        />
      </div>
    </section>
  );
}
