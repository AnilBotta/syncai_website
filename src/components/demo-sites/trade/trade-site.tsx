import type { DemoSite } from "@/lib/demo-sites";
import { DemoSiteBar } from "@/components/demo-sites/demo-site-bar";
import { CallBand, TradeFooter, TradeHeader, UtilityStrip } from "./chrome";
import {
  AreaList,
  FaqList,
  QuoteWidget,
  RecentWork,
  ReviewWall,
  ServiceGrid,
  TradeHero,
  WhyUs,
  WorkshopStrip,
} from "./sections";

/**
 * The whole trade demo. Rendered by the `layout: "bespoke"` branch in
 * demos/live/[industry]/page.tsx, which short-circuits before any shared
 * header, hero, section or footer.
 *
 * The running order is the argument. A local plumber's site puts the price
 * request second and the story last, because a visitor with water coming
 * through a ceiling is not going to scroll past an About section to find out
 * whether you can come today:
 *
 *   phone → hero + credentials → quote → what we do → why us → proof →
 *   reviews → work → areas → FAQ → call → footer
 *
 * The three editorial demos run almost the exact inverse of that, which is the
 * point: this is a different genre, not a recoloured template.
 *
 * The two things that must NOT diverge, whatever the layout does, are the
 * fictional-business disclosure (footer, plus the demo bar) and the noindex
 * set in generateMetadata.
 */
export function TradeSite({ site }: { site: DemoSite }) {
  return (
    /*
     * overflow-x-clip rather than hidden: clip does not create a scroll
     * container, so the sticky header still sticks. pb-24 clears the fixed
     * SyncAI bar so the footer is never trapped behind it.
     */
    <div
      id="top"
      className={`${site.themeClass} min-h-screen overflow-x-clip bg-bg-base pb-24 text-foreground`}
    >
      <UtilityStrip phone={site.phone} />
      <TradeHeader site={site} />

      <TradeHero site={site} />
      <QuoteWidget site={site} />
      <ServiceGrid site={site} />
      <WhyUs site={site} />
      <WorkshopStrip site={site} />
      <ReviewWall />
      <RecentWork />
      <AreaList />
      <FaqList site={site} />
      <CallBand phone={site.phone} />

      <TradeFooter site={site} />
      <DemoSiteBar business={site.business} />
    </div>
  );
}
