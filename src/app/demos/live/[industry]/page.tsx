import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { demoSiteSlugs, getDemoSite } from "@/lib/demo-sites";
import { DemoSiteBar } from "@/components/demo-sites/demo-site-bar";
import { DemoHeader } from "@/components/demo-sites/demo-header";
import { ConditionChips } from "@/components/demo-sites/condition-chips";
import { PractitionerRail } from "@/components/demo-sites/practitioner-rail";
import { TradeSite } from "@/components/demo-sites/trade/trade-site";
import { businessInitials } from "@/lib/demo-sites/initials";
import { CinematicHero, EditorialHero, SplitHero } from "./heroes";
import {
  BookingSection,
  FaqSection,
  GallerySection,
  ListingsSection,
  NeighbourhoodsSection,
  ProofPoints,
  ServicesSection,
  SiteFooter,
  StatsBand,
  StorySection,
  TrustMarks,
} from "./sections";

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

  // Bespoke sites own their entire visual layer: no shared header, hero,
  // section or footer below this line runs for them. The registry, the chat
  // route, the sandboxed executor and the demo bar are still shared — only the
  // markup diverges.
  if (site.layout === "bespoke") {
    return <TradeSite site={site} />;
  }

  const monogram = businessInitials(site.business);
  const { layout } = site;
  const cinematic = layout === "cinematic";
  const split = layout === "split";

  /*
   * The two-column sections put a short heading beside a long list, which left a
   * tall empty column once the heading scrolled past. Pinning it so it travels
   * alongside its list fixes that. Not applied to the two editorial demos, which
   * were reviewed and approved without it.
   */
  const asideClass = split ? "lg:col-span-4 lg:sticky lg:top-28 lg:self-start" : "lg:col-span-4";

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

  return (
    // overflow-x-clip: the editorial hero image intentionally bleeds past the
    // right edge on large screens, and without this that becomes a horizontal
    // scrollbar. pb-24 clears the fixed SyncAI bar so the footer is never
    // trapped behind it.
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
        <EditorialHero site={site} />
      )}

      <TrustMarks marks={site.trustMarks} />
      <StatsBand stats={site.stats} inverted={cinematic} />

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

      <ServicesSection site={site} index={num("services")} asideClass={asideClass} />

      {/* Listings sit here on the editorial layout. */}
      {!cinematic ? <ListingsSection site={site} index={num("properties")} /> : null}

      {/* The clinicians — physio only. */}
      {site.practitioners ? (
        <PractitionerRail index={num("team")} practitioners={site.practitioners} />
      ) : null}

      <GallerySection site={site} index={num("gallery")} />
      <NeighbourhoodsSection site={site} index={num("areas")} />
      <StorySection site={site} index={num("story")} halfBleed={cinematic} />
      <ProofPoints points={site.proofPoints} carded={split} />
      <FaqSection site={site} index={num("faq")} asideClass={asideClass} />
      <BookingSection site={site} index={num("booking")} />

      <SiteFooter site={site} monogram={monogram} />
      <DemoSiteBar business={site.business} />
    </div>
  );
}
