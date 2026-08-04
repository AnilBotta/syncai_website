import Link from "next/link";
import { Clock, MapPin, Phone, Sparkle } from "lucide-react";
import type { DemoSite } from "@/lib/demo-sites";
import { DemoAssistant } from "@/components/demo-sites/demo-assistant";
import { DemoImage } from "@/components/demo-sites/demo-image";
import { SectionLabel } from "@/components/demo-sites/section-label";
import { StatCounter } from "@/components/demo-sites/stat-counter";
import { FaqAccordion } from "@/components/demo-sites/faq-accordion";
import { PropertyCard } from "@/components/demo-sites/property-card";
import { Reveal } from "@/components/motion/reveal";
import { Parallax } from "@/components/motion/parallax";

/**
 * Sections shared by every demo layout.
 *
 * Split out of page.tsx once a fourth layout arrived: the page had grown to ~700
 * lines with a branch per layout, and the sections were the bulk of it. Note the
 * split is by ROLE (sections here, heroes in heroes.tsx) rather than one whole
 * page per layout — the layouts differ in their hero, their running order and a
 * handful of treatments, but share these ten sections almost exactly. Four page
 * files would have duplicated all of this four times.
 *
 * Where a layout needs a different treatment it is passed in as a prop
 * (`inverted` stats, `carded` proof points) rather than branched on the layout
 * name, so these stay independent of which layouts exist.
 */

export function TrustMarks({ marks }: { marks: string[] }) {
  return (
    // Centred with dot separators rather than justify-between: four marks of
    // wildly different lengths left an orphan on a second row that read as a bug.
    <section className="border-y border-border-subtle">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center">
          {marks.map((mark, i) => (
            <li key={mark} className="flex items-center gap-4">
              {i > 0 ? (
                <span aria-hidden className="size-1 rounded-full bg-current opacity-30" />
              ) : null}
              <span className="demo-label text-label">{mark}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** `inverted` puts this on a dark band — the cinematic layout's one inversion. */
export function StatsBand({
  stats,
  inverted = false,
}: {
  stats: DemoSite["stats"];
  inverted?: boolean;
}) {
  return (
    <section
      className={
        inverted
          ? "bg-[var(--brand-deep)] py-16 text-white lg:py-20"
          : "mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
      }
    >
      <div className={inverted ? "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8" : ""}>
        <Reveal>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <StatCounter
                key={stat.label}
                value={stat.value}
                label={stat.label}
                inverted={inverted}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function ServicesSection({
  site,
  index,
  asideClass,
}: {
  site: DemoSite;
  index: number;
  asideClass: string;
}) {
  return (
    <section id="services" className="bg-bg-deep py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className={asideClass}>
            <Reveal>
              <SectionLabel index={index}>{site.sectionLabels.services}</SectionLabel>
              <h2 className="mt-6 max-w-sm">{site.servicesHeading}</h2>
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
                      <p className="mt-3 max-w-xl leading-8 text-muted">{service.description}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Listings grid. Position in the running order differs by layout. */
export function ListingsSection({ site, index }: { site: DemoSite; index: number }) {
  if (!site.properties) return null;

  return (
    <section id="listings" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <Reveal>
            <SectionLabel index={index}>{site.properties.label}</SectionLabel>
            <h2 className="mt-6">{site.properties.heading}</h2>
          </Reveal>
        </div>
        <div className="lg:col-span-5">
          <Reveal delay={0.08}>
            <p className="leading-8 text-muted">{site.properties.body}</p>
          </Reveal>
        </div>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {site.properties.items.map((property, i) => (
          <Reveal key={property.address} delay={i * 0.08}>
            <PropertyCard property={property} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function GallerySection({ site, index }: { site: DemoSite; index: number }) {
  // Large plate, small offset plate, and a full-width band beneath. A site with
  // only one wide shot to spare (realty spends its photography on listing cards)
  // promotes `exterior` into the large plate and drops the band, which is better
  // than showing the same photograph twice on one page.
  const primary = site.images.wide ?? site.images.exterior;
  const band = site.images.wide ? site.images.exterior : undefined;

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <Reveal>
        <SectionLabel index={index}>{site.sectionLabels.gallery}</SectionLabel>
        {site.galleryHeading ? <h2 className="mt-6 max-w-lg">{site.galleryHeading}</h2> : null}
      </Reveal>
      <div className="mt-10 grid gap-6 sm:grid-cols-5">
        <Reveal className="sm:col-span-3">
          <Parallax amount={22}>
            <DemoImage
              src={primary?.src}
              alt={primary?.alt ?? ""}
              aspect="aspect-[4/3]"
              sizes="(min-width: 640px) 60vw, 100vw"
              className="rounded-[1.75rem] shadow-[0_16px_44px_var(--accent-glow)]"
            />
          </Parallax>
        </Reveal>
        <Reveal className="sm:col-span-2 sm:pt-16" delay={0.1}>
          <Parallax amount={-18}>
            <DemoImage
              src={site.images.detail.src}
              alt={site.images.detail.alt}
              // Square rather than portrait — the sources are 16:9 and a 4/5 crop
              // cuts the edges off the composition.
              aspect="aspect-square"
              sizes="(min-width: 640px) 40vw, 100vw"
              className="rounded-[1.75rem] shadow-[0_16px_44px_var(--accent-glow)]"
            />
          </Parallax>
        </Reveal>
      </div>
      {band ? (
        <Reveal delay={0.05}>
          <DemoImage
            src={band.src}
            alt={band.alt}
            aspect="aspect-[21/9]"
            sizes="(min-width: 1152px) 1088px, 100vw"
            className="mt-6 rounded-[1.75rem] shadow-[0_16px_44px_var(--accent-glow)]"
          />
        </Reveal>
      ) : null}
    </section>
  );
}

export function NeighbourhoodsSection({ site, index }: { site: DemoSite; index: number }) {
  if (!site.neighbourhoods) return null;

  return (
    <section id="areas" className="border-y border-border-subtle bg-bg-deep py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Reveal>
              <SectionLabel index={index}>{site.neighbourhoods.label}</SectionLabel>
              <h2 className="mt-6 max-w-sm">{site.neighbourhoods.heading}</h2>
            </Reveal>
          </div>
          <div className="lg:col-span-8">
            <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {site.neighbourhoods.items.map((area, i) => (
                <Reveal key={area.name} delay={i * 0.06}>
                  <div className="border-t border-foreground/15 pt-5">
                    <h3 className="text-xl">{area.name}</h3>
                    <p className="mt-3 leading-8 text-muted">{area.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** `halfBleed` runs the photograph off the left edge instead of the copy card
    overlapping it — the cinematic layout's treatment. */
export function StorySection({
  site,
  index,
  halfBleed = false,
}: {
  site: DemoSite;
  index: number;
  halfBleed?: boolean;
}) {
  const body = (
    <>
      <SectionLabel index={index}>{site.sectionLabels.story}</SectionLabel>
      <h2 className="mt-6">{site.story.heading}</h2>
      {site.story.body.map((paragraph) => (
        <p key={paragraph} className="mt-5 leading-8 text-muted">
          {paragraph}
        </p>
      ))}
      <blockquote className="mt-8 border-l-2 border-brand pl-6 font-serif text-xl leading-9 text-foreground">
        {site.pullQuote}
      </blockquote>
    </>
  );

  if (halfBleed) {
    return (
      <section id="story" className="border-y border-border-subtle bg-bg-deep">
        <div className="grid items-stretch lg:grid-cols-2">
          <div className="relative min-h-[22rem] lg:min-h-[34rem]">
            <DemoImage
              src={site.images.team.src}
              alt={site.images.team.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
          <div className="flex items-center px-4 py-16 sm:px-6 lg:px-16 lg:py-24">
            <div className="max-w-xl">{body}</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="story" className="border-y border-border-subtle bg-bg-deep py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-0">
          <div className="lg:col-span-6">
            <DemoImage
              src={site.images.team.src}
              alt={site.images.team.alt}
              aspect="aspect-[4/3]"
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="rounded-[2rem] shadow-[0_24px_60px_var(--accent-glow)]"
            />
          </div>
          {/* Overlaps the image on lg+ — the single most "designed" moment here.
              `relative z-10` is load-bearing: DemoImage's root is positioned, so
              without it the photo paints over this card and clips the copy. */}
          <div className="relative z-10 lg:col-span-6 lg:-ml-16 lg:rounded-[2rem] lg:bg-bg-base lg:p-12 lg:shadow-[0_20px_60px_var(--accent-glow)]">
            {body}
          </div>
        </div>
      </div>
    </section>
  );
}

/** `carded` puts each point in a bordered panel — reads more substantial for a
    clinic or a trade than three runs of bare text. */
export function ProofPoints({
  points,
  carded = false,
}: {
  points: DemoSite["proofPoints"];
  carded?: boolean;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="grid gap-6 sm:grid-cols-3 lg:gap-8">
        {points.map((point, i) => (
          <Reveal key={point.title} delay={i * 0.08}>
            <div
              className={
                carded
                  ? "h-full rounded-2xl border border-border-subtle bg-surface p-7 shadow-[0_2px_12px_var(--accent-glow)]"
                  : "border-t border-foreground/15 pt-6"
              }
            >
              <span className="demo-label text-brand">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-4 text-xl">{point.title}</h3>
              <p className="mt-3 leading-8 text-muted">{point.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function FaqSection({
  site,
  index,
  asideClass,
}: {
  site: DemoSite;
  index: number;
  asideClass: string;
}) {
  return (
    <section id="faq" className="bg-bg-deep py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className={asideClass}>
            <Reveal>
              <SectionLabel index={index}>{site.sectionLabels.faq}</SectionLabel>
              <h2 className="mt-6 max-w-sm">{site.faqIntro.heading}</h2>
              <p className="mt-5 max-w-sm leading-8 text-muted">{site.faqIntro.body}</p>
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
  );
}

export function BookingSection({ site, index }: { site: DemoSite; index: number }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28" id="book">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <Reveal>
            <SectionLabel index={index}>{site.sectionLabels.booking}</SectionLabel>
            <h2 className="mt-6">{site.booking.heading}</h2>
            <p className="mt-5 text-lg leading-8 text-muted">{site.booking.body}</p>

            <dl className="mt-10 divide-y divide-border-subtle border-y border-border-subtle text-sm">
              <Detail icon={Clock} term="Opening hours" detail={site.hoursLabel} />
              <Detail icon={MapPin} term="Find us" detail={site.location} />
              <Detail icon={Phone} term={site.phoneLabel} detail={site.phone} />
            </dl>

            <p className="mt-8 flex items-start gap-2.5 text-sm leading-6 text-muted">
              <Sparkle className="mt-0.5 size-4 shrink-0 text-brand" />
              Answers come from a live AI assistant. It can check real availability and
              confirm a time without anyone picking up the phone.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <DemoAssistant
            slug={site.slug}
            business={site.business}
            welcome={site.booking.welcome}
            starters={site.booking.starters}
            assistantLabel={site.booking.assistantLabel}
            voice={site.voice ? { invitation: site.voice.invitation } : undefined}
          />
        </Reveal>
      </div>
    </section>
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

export function SiteFooter({ site, monogram }: { site: DemoSite; monogram: string }) {
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
          real, and no {site.appointmentNoun} made here is a real booking.{" "}
          <Link href="/demos/ai-websites-and-apps" className="font-bold underline">
            Back to SyncAI demos
          </Link>
        </p>
      </div>
    </footer>
  );
}
