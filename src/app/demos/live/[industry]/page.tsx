import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Clock, MapPin, Phone, Sparkle } from "lucide-react";
import { demoSiteSlugs, getDemoSite } from "@/lib/demo-sites";
import type { DemoSite } from "@/lib/demo-sites";
import { DemoSiteBar } from "@/components/demo-sites/demo-site-bar";
import { DemoAssistant } from "@/components/demo-sites/demo-assistant";
import { DemoImage } from "@/components/demo-sites/demo-image";
import { DemoHeader } from "@/components/demo-sites/demo-header";
import { SectionLabel } from "@/components/demo-sites/section-label";
import { StatCounter } from "@/components/demo-sites/stat-counter";
import { FaqAccordion } from "@/components/demo-sites/faq-accordion";
import { PropertyCard } from "@/components/demo-sites/property-card";
import { ConditionChips } from "@/components/demo-sites/condition-chips";
import { PractitionerRail } from "@/components/demo-sites/practitioner-rail";
import { Reveal } from "@/components/motion/reveal";
import { Parallax } from "@/components/motion/parallax";
import { businessInitials } from "@/lib/demo-sites/initials";

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

  const monogram = businessInitials(site.business);
  const cinematic = site.layout === "cinematic";
  const split = site.layout === "split";

  /*
   * The two-column sections put a short heading beside a long list, which on the
   * clinic left a tall empty column once the heading scrolled past. Pinning the
   * heading so it travels alongside its list fixes that and reads as considered
   * rather than sparse. Scoped to the split layout: the editorial demos were
   * approved as they are.
   */
  const asideClass = split
    ? "lg:col-span-4 lg:sticky lg:top-28 lg:self-start"
    : "lg:col-span-4";

  // Section numbers have to stay contiguous even though the running order differs
  // per layout — a site that jumps 02, 04, 05 looks broken. Derived from what is
  // actually rendered rather than counted up as we go, so nothing mutates
  // mid-render. Offset by 2 because the hero is 01 and carries no label.
  const order: string[] = cinematic
    ? [
        // Listings first: a brokerage that buries its stock under an About
        // section is not behaving like a brokerage.
        ...(site.properties ? ["properties"] : []),
        "services",
        "gallery",
        ...(site.neighbourhoods ? ["areas"] : []),
        "story",
        "faq",
        "booking",
      ]
    : split
      ? [
          // Physio leads with what it fixes, then who does the fixing.
          ...(site.conditions ? ["conditions"] : []),
          "services",
          ...(site.practitioners ? ["team"] : []),
          "gallery",
          "story",
          "faq",
          "booking",
        ]
      : [
          "services",
          ...(site.properties ? ["properties"] : []),
          "gallery",
          ...(site.neighbourhoods ? ["areas"] : []),
          "story",
          "faq",
          "booking",
        ];
  const num = (key: string) => order.indexOf(key) + 2;

  // Gallery: large plate, small offset plate, and a full-width band beneath.
  // A site with only one wide shot to spare (realty spends its photography on
  // listing cards) promotes `exterior` into the large plate and drops the band,
  // which is better than showing the same photograph twice on one page.
  const galleryPrimary = site.images.wide ?? site.images.exterior;
  const galleryBand = site.images.wide ? site.images.exterior : undefined;

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
        nav={site.nav}
        ctaLabel={site.ctaLabel}
        ctaLabelShort={site.ctaLabelShort}
        overHero={cinematic}
      />

      {cinematic ? (
        <CinematicHero site={site} />
      ) : split ? (
        <SplitHero site={site} />
      ) : (
      /* 01 — Hero. Asymmetric: copy holds the left seven columns, the photograph
         runs off the right edge of the viewport. */
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
                  src={site.images.hero.src}
                  alt={site.images.hero.alt}
                  // 5/4, not portrait: this column is ~460px wide plus a 22vw
                  // bleed, so anything taller than landscape runs to ~950px and
                  // strands the copy in the middle of an empty screen.
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
      )}

      {/* Trust marks. Centred with dot separators rather than justify-between:
          four marks of wildly different lengths left an orphan on a second row
          that read as a layout bug. */}
      <section className="border-y border-border-subtle">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center">
            {site.trustMarks.map((mark, i) => (
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

      {/* Stats. On the cinematic layout this is a dark band — the one place the
          page inverts, and the clearest signal it is not the all-light clinic. */}
      <section
        className={
          cinematic
            ? "bg-[var(--brand-deep)] py-16 text-white lg:py-20"
            : "mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
        }
      >
        <div className={cinematic ? "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8" : ""}>
          <Reveal>
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {site.stats.map((stat) => (
                <StatCounter
                  key={stat.label}
                  value={stat.value}
                  label={stat.label}
                  inverted={cinematic}
                />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Listings lead on the cinematic layout. */}
      {cinematic ? <ListingsSection site={site} index={num("properties")} /> : null}

      {/* What the clinic treats — physio only. */}
      {site.conditions ? (
        <ConditionChips
          index={num("conditions")}
          label={site.conditions.label}
          heading={site.conditions.heading}
          body={site.conditions.body}
          items={site.conditions.items}
        />
      ) : null}

      {/* Services, as an editorial list rather than a grid of boxes. */}
      <section id="services" className="bg-bg-deep py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className={asideClass}>
              <Reveal>
                <SectionLabel index={num("services")}>{site.sectionLabels.services}</SectionLabel>
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

      {/* Listings sit here on the editorial layout. */}
      {!cinematic ? <ListingsSection site={site} index={num("properties")} /> : null}

      {/* The clinicians — physio only. */}
      {site.practitioners ? (
        <PractitionerRail index={num("team")} practitioners={site.practitioners} />
      ) : null}

      {/* Gallery. Deliberately uneven: a tall plate, a short one offset down,
          then the wide view running the full width. */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <Reveal>
          <SectionLabel index={num("gallery")}>{site.sectionLabels.gallery}</SectionLabel>
          {site.galleryHeading ? (
            <h2 className="mt-6 max-w-lg">{site.galleryHeading}</h2>
          ) : null}
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-5">
          <Reveal className="sm:col-span-3">
            <Parallax amount={22}>
              <DemoImage
                src={galleryPrimary?.src}
                alt={galleryPrimary?.alt ?? ""}
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
                // Square rather than portrait — the sources are 16:9 and a 4/5
                // crop cuts the edges off the composition.
                aspect="aspect-square"
                sizes="(min-width: 640px) 40vw, 100vw"
                className="rounded-[1.75rem] shadow-[0_16px_44px_var(--accent-glow)]"
              />
            </Parallax>
          </Reveal>
        </div>
        {galleryBand ? (
          <Reveal delay={0.05}>
            <DemoImage
              src={galleryBand.src}
              alt={galleryBand.alt}
              aspect="aspect-[21/9]"
              sizes="(min-width: 1152px) 1088px, 100vw"
              className="mt-6 rounded-[1.75rem] shadow-[0_16px_44px_var(--accent-glow)]"
            />
          </Reveal>
        ) : null}
      </section>

      {/* Neighbourhoods — estate agency only. */}
      {site.neighbourhoods ? (
        <section id="areas" className="border-y border-border-subtle bg-bg-deep py-20 lg:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <Reveal>
                  <SectionLabel index={num("areas")}>{site.neighbourhoods.label}</SectionLabel>
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
      ) : null}

      {cinematic ? (
        /* Story, half-bleed: the photograph runs off the left edge of the
           viewport and the copy sits in the right half. No overlapping card —
           that is the clinic's signature move, and repeating it here is exactly
           what made the two sites read as one template. */
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
              <div className="max-w-xl">
                <SectionLabel index={num("story")}>{site.sectionLabels.story}</SectionLabel>
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
      ) : (
      /* Story, with the copy block overlapping the photograph. */
      <section
        id="story"
        className="border-y border-border-subtle bg-bg-deep py-20 lg:py-28"
      >
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
              <SectionLabel index={num("story")}>{site.sectionLabels.story}</SectionLabel>
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
      )}

      {/* Proof points. Cards on the split layout: a clinic reads as more
          substantial in bordered panels than as three runs of bare text. */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-6 sm:grid-cols-3 lg:gap-8">
          {site.proofPoints.map((point, i) => (
            <Reveal key={point.title} delay={i * 0.08}>
              <div
                className={
                  split
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

      {/* FAQ */}
      <section id="faq" className="bg-bg-deep py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className={asideClass}>
              <Reveal>
                <SectionLabel index={num("faq")}>{site.sectionLabels.faq}</SectionLabel>
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

      {/* Booking. The payload. */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28" id="book">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <Reveal>
              <SectionLabel index={num("booking")}>{site.sectionLabels.booking}</SectionLabel>
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
          real, and no {site.appointmentNoun} made here is a real booking.{" "}
          <Link href="/demos/ai-websites-and-apps" className="font-bold underline">
            Back to SyncAI demos
          </Link>
        </p>
      </div>
    </footer>
  );
}

/**
 * Full-bleed hero: the photograph fills the viewport and the copy sits over it
 * on a dark scrim. Estate agencies lead with property, not with a paragraph.
 *
 * The scrim is not decoration — the source images are bright interiors, and
 * white type over them fails contrast badly without it. Left-weighted so the
 * gradient is heaviest exactly where the copy sits.
 */
function CinematicHero({ site }: { site: DemoSite }) {
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
              <a
                href={`tel:${site.phone.replace(/[^\d+]/g, "")}`}
                className="inline-flex items-center gap-2 text-sm font-bold text-white transition hover:text-white/80"
              >
                <Phone className="size-4" />
                {site.phone}
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.32}>
            <p className="mt-8 flex items-center gap-2.5 text-sm text-white/75">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-success" />
              </span>
              {site.hoursLabel}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/**
 * Split hero: a solid brand-tinted panel of copy beside a full-height
 * photograph, 50/50 on desktop and stacked below `lg`.
 *
 * Neither the clinic's asymmetric bleed nor the brokerage's overlay — physio is
 * appointment-led like the clinic, so it needed a skeleton that could not be
 * mistaken for either. The copy sits on a solid panel rather than over the
 * image, which means no scrim to tune and no contrast risk from the photograph.
 */
function SplitHero({ site }: { site: DemoSite }) {
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
      </div>

      <div className="relative order-1 min-h-[20rem] lg:order-2 lg:min-h-full">
        <DemoImage src={site.images.hero.src} alt={site.images.hero.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" priority />
      </div>
    </section>
  );
}

/** Listings grid. Position in the running order differs by layout. */
function ListingsSection({ site, index }: { site: DemoSite; index: number }) {
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
