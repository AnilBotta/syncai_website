import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Clock, MapPin, Phone, Sparkle } from "lucide-react";
import { demoSiteSlugs, getDemoSite } from "@/lib/demo-sites";
import type { DemoSite } from "@/lib/demo-sites";
import { DemoSiteBar } from "@/components/demo-sites/demo-site-bar";
import { DemoReceptionist } from "@/components/demo-sites/demo-receptionist";
import { DemoImage } from "@/components/demo-sites/demo-image";
import { DemoHeader } from "@/components/demo-sites/demo-header";
import { SectionLabel } from "@/components/demo-sites/section-label";
import { StatCounter } from "@/components/demo-sites/stat-counter";
import { FaqAccordion } from "@/components/demo-sites/faq-accordion";
import { Reveal } from "@/components/motion/reveal";
import { Parallax } from "@/components/motion/parallax";

export function generateStaticParams() {
  return demoSiteSlugs().map((industry) => ({ industry }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ industry: string }>;
}): Promise<Metadata> {
  const { industry } = await params;
  const site = getDemoSite(industry);
  // Streamed not-found responses come back as 200 in this Next version, so the
  // noindex has to be set here too or the miss page becomes indexable.
  if (!site) return { title: "Demo not found", robots: { index: false, follow: false } };

  return {
    title: `${site.business} — SyncAI demo`,
    description: `${site.tagline}. A fictional business built by SyncAI to demonstrate an AI-powered website.`,
    // A convincing fake business must never be indexed as a real one.
    robots: { index: false, follow: false },
  };
}

export default async function DemoSitePage({
  params,
}: {
  params: Promise<{ industry: string }>;
}) {
  const { industry } = await params;
  const site = getDemoSite(industry);

  if (!site) {
    notFound();
  }

  const monogram = initials(site.business);

  return (
    // overflow-x-clip: the hero image intentionally bleeds past the right edge on
    // large screens, and without this that becomes a horizontal scrollbar.
    // pb-24 clears the fixed SyncAI bar so the footer is never trapped behind it.
    <div
      id="top"
      className={`${site.themeClass} min-h-screen overflow-x-clip bg-bg-base pb-24 text-foreground`}
    >
      <DemoHeader
        business={site.business}
        tagline={site.tagline}
        phone={site.phone}
        monogram={monogram}
      />

      {/* 01 — Hero. Asymmetric: copy holds the left seven columns, the photograph
          runs off the right edge of the viewport. */}
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
                <a
                  href={`tel:${site.phone.replace(/[^\d+]/g, "")}`}
                  className="inline-flex items-center gap-2 text-sm font-bold transition hover:text-brand-glow-text"
                >
                  <Phone className="size-4 text-brand" />
                  {site.phone}
                </a>
              </div>
            </Reveal>
            <Reveal delay={0.32}>
              <p className="mt-8 flex items-center gap-2.5 text-sm text-muted">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-success" />
                </span>
                {site.hoursLabel}
              </p>
            </Reveal>
          </div>

          {/* Bleeds right on lg+, contained below it. */}
          <div className="lg:col-span-5">
            <Reveal delay={0.12}>
              <div className="lg:-mr-[22vw]">
                <DemoImage
                  src={site.images.hero}
                  alt={`Reception at ${site.business}`}
                  // 5/4, not portrait: this column is ~460px wide plus a 22vw
                  // bleed, so anything taller than landscape runs to ~950px and
                  // strands the copy in the middle of an empty screen.
                  aspect="aspect-[5/4]"
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="rounded-[2rem] shadow-[0_30px_80px_rgba(38,48,43,0.16)]"
                  priority
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Trust marks */}
      <section className="border-y border-border-subtle">
        <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 sm:justify-between">
            {site.trustMarks.map((mark) => (
              <span key={mark} className="demo-label text-label">
                {mark}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <Reveal>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {site.stats.map((stat) => (
              <StatCounter key={stat.label} value={stat.value} label={stat.label} />
            ))}
          </div>
        </Reveal>
      </section>

      {/* 02 — Services, as an editorial list rather than a grid of boxes. */}
      <section id="services" className="bg-bg-deep py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Reveal>
                <SectionLabel index={2}>What we do</SectionLabel>
                <h2 className="mt-6 max-w-xs">Care, without the upsell.</h2>
              </Reveal>
            </div>
            <div className="lg:col-span-8">
              <div className="border-t border-border-subtle">
                {site.services.map((service, i) => (
                  <Reveal key={service.title} delay={i * 0.06}>
                    <div className="rule-grow relative grid gap-3 border-b border-border-subtle py-8 sm:grid-cols-[3rem_1fr] sm:gap-6">
                      <span className="demo-label pt-1.5 text-brand">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="text-2xl">{service.title}</h3>
                        <p className="mt-3 max-w-xl leading-8 text-muted">
                          {service.description}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 03 — Gallery. Deliberately uneven: a tall plate, a short one offset down,
          then the street view running the full width. */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <Reveal>
          <SectionLabel index={3}>Inside the practice</SectionLabel>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-5">
          <Reveal className="sm:col-span-3">
            <Parallax amount={22}>
              <DemoImage
                src={site.images.treatment}
                alt="A treatment room"
                aspect="aspect-[4/3]"
                sizes="(min-width: 640px) 60vw, 100vw"
                className="rounded-[1.75rem] shadow-[0_16px_44px_rgba(38,48,43,0.10)]"
              />
            </Parallax>
          </Reveal>
          <Reveal className="sm:col-span-2 sm:pt-16" delay={0.1}>
            <Parallax amount={-18}>
              <DemoImage
                src={site.images.detail}
                alt="Sterilised instruments laid out before an appointment"
                // Square rather than portrait — the source is 16:9 and a 4/5 crop
                // cut the eucalyptus off the right of the composition.
                aspect="aspect-square"
                sizes="(min-width: 640px) 40vw, 100vw"
                className="rounded-[1.75rem] shadow-[0_16px_44px_rgba(38,48,43,0.10)]"
              />
            </Parallax>
          </Reveal>
        </div>
        <Reveal delay={0.05}>
          <DemoImage
            src={site.images.exterior}
            alt={`${site.business} from the street`}
            aspect="aspect-[21/9]"
            sizes="(min-width: 1152px) 1088px, 100vw"
            className="mt-6 rounded-[1.75rem] shadow-[0_16px_44px_rgba(38,48,43,0.10)]"
          />
        </Reveal>
      </section>

      {/* 04 — Story, with the photograph overlapping the copy block. */}
      <section id="practice" className="border-y border-border-subtle bg-bg-deep py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-0">
            <div className="lg:col-span-6">
              <DemoImage
                src={site.images.team}
                alt={`The team at ${site.business}`}
                aspect="aspect-[4/3]"
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="rounded-[2rem] shadow-[0_24px_60px_rgba(38,48,43,0.14)]"
              />
            </div>
            {/* Overlaps the image on lg+ — the single most "designed" moment here.
                `relative z-10` is load-bearing: DemoImage's root is positioned, so
                without it the photo paints over this card and clips the copy. */}
            <div className="relative z-10 lg:col-span-6 lg:-ml-16 lg:rounded-[2rem] lg:bg-bg-base lg:p-12 lg:shadow-[0_20px_60px_rgba(38,48,43,0.10)]">
              <SectionLabel index={4}>The practice</SectionLabel>
              <h2 className="mt-6">{site.story.heading}</h2>
              {site.story.body.map((paragraph) => (
                <p key={paragraph} className="mt-5 leading-8 text-muted">
                  {paragraph}
                </p>
              ))}
              <blockquote className="mt-8 border-l-2 border-brand pl-6 font-serif text-xl leading-9 text-foreground">
                {site.pullQuote}
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* Proof points */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-10 sm:grid-cols-3">
          {site.proofPoints.map((point, i) => (
            <Reveal key={point.title} delay={i * 0.08}>
              <div className="border-t border-foreground/15 pt-6">
                <span className="demo-label text-brand">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 text-xl">{point.title}</h3>
                <p className="mt-3 leading-8 text-muted">{point.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 05 — FAQ */}
      <section id="faq" className="bg-bg-deep py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Reveal>
                <SectionLabel index={5}>Questions</SectionLabel>
                <h2 className="mt-6 max-w-xs">Before you book.</h2>
                <p className="mt-5 max-w-xs leading-8 text-muted">
                  Anything else, ask the receptionist below — she answers instantly.
                </p>
              </Reveal>
            </div>
            <div className="lg:col-span-8">
              <Reveal>
                <FaqAccordion items={site.faq} />
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* 06 — Booking. The payload. */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28" id="book">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <Reveal>
              <SectionLabel index={6}>Booking</SectionLabel>
              <h2 className="mt-6">{site.booking.heading}</h2>
              <p className="mt-5 text-lg leading-8 text-muted">{site.booking.body}</p>

              <dl className="mt-10 divide-y divide-border-subtle border-y border-border-subtle text-sm">
                <Detail icon={Clock} term="Opening hours" detail={site.hoursLabel} />
                <Detail icon={MapPin} term="Find us" detail={site.location} />
                <Detail icon={Phone} term="Call the practice" detail={site.phone} />
              </dl>

              <p className="mt-8 flex items-start gap-2.5 text-sm leading-6 text-muted">
                <Sparkle className="mt-0.5 size-4 shrink-0 text-brand" />
                Answers come from a live AI assistant. It can check real availability and
                confirm a time without anyone picking up the phone.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <DemoReceptionist
              slug={site.slug}
              business={site.business}
              welcome={site.booking.welcome}
              starters={site.booking.starters}
            />
          </Reveal>
        </div>
      </section>

      <SiteFooter site={site} monogram={monogram} />
      <DemoSiteBar business={site.business} />
    </div>
  );
}

function Detail({
  icon: Icon,
  term,
  detail,
}: {
  icon: typeof Clock;
  term: string;
  detail: string;
}) {
  return (
    <div className="flex items-start gap-4 py-4">
      <Icon className="mt-0.5 size-4 shrink-0 text-brand" />
      <dt className="w-36 shrink-0 font-bold">{term}</dt>
      <dd className="text-muted">{detail}</dd>
    </div>
  );
}

function SiteFooter({ site, monogram }: { site: DemoSite; monogram: string }) {
  return (
    <footer className="border-t border-border-subtle bg-bg-deep py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <span className="grid size-11 place-items-center rounded-full border border-brand/30 font-serif text-brand">
              {monogram}
            </span>
            <p className="mt-5 font-bold">{site.business}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{site.tagline}</p>
          </div>
          <div className="text-sm">
            <p className="demo-label text-label">Visit</p>
            <p className="mt-4 leading-7 text-muted">{site.location}</p>
            <p className="mt-3 leading-7 text-muted">
              {site.phone}
              <br />
              {site.email}
            </p>
          </div>
          <div className="text-sm">
            <p className="demo-label text-label">Hours</p>
            <p className="mt-4 leading-7 text-muted">{site.hoursLabel}</p>
          </div>
        </div>

        <p className="mt-14 border-t border-border-subtle pt-6 text-xs leading-5 text-muted">
          {site.business} is a fictional business created by SyncAI Technologies to
          demonstrate an AI-powered website. The address, phone number, and email are not
          real, and no appointment made here is a real booking.{" "}
          <Link href="/demos/ai-websites-and-apps" className="font-bold underline">
            Back to SyncAI demos
          </Link>
        </p>
      </div>
    </footer>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}
