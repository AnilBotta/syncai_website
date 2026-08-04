/**
 * Shape of a demo site. One file per fictional business in this folder; adding
 * an industry should mean adding a content file and an entry in `index.ts`,
 * not writing new page code.
 *
 * Anything a visitor can read lives here rather than in the page — a clinic's
 * "Inside the practice" is nonsense on a brokerage, and hardcoding it was what
 * stopped the first version of this template being reusable at all.
 */

export type DemoHours = {
  /** 0 = Sunday, matching Date#getDay. */
  days: number[];
  startHour: number;
  endHour: number;
};

/**
 * An image slot. `src` undefined renders a styled gradient block, so a site can
 * ship before its photography exists. `alt` is always required — it is the copy
 * a screen reader gets, and it is industry-specific.
 */
export type DemoImageRef = {
  src?: string;
  alt: string;
};

/** A listing on an estate-agency demo. */
export type DemoProperty = {
  price: string;
  address: string;
  area: string;
  beds: number;
  baths: number;
  /** Free text so it can be "1,840 sq ft" or "2 parking". */
  size: string;
  /** Pill copy — "For sale", "New", "Sold". */
  status: string;
  image: DemoImageRef;
};

export type DemoSite = {
  /** URL segment: /demos/live/<slug>. */
  slug: string;
  /** Fictional business name. */
  business: string;
  tagline: string;
  location: string;
  phone: string;
  email: string;
  /** Scoped palette class defined in globals.css, e.g. "demo-dental". */
  themeClass: string;

  /**
   * Structural variant, not just a skin.
   *
   * "editorial"  — copy-led asymmetric hero, all-light bands (the clinic).
   * "cinematic"  — full-bleed hero with copy over the photograph, a dark stats
   *                band, listings promoted above the fold-and-a-half, and a
   *                half-bleed story split.
   * "split"      — 50/50 hero, copy on a solid brand panel beside a full-height
   *                photograph. Physio is appointment-led like the clinic, so it
   *                needed a skeleton that is neither of the other two.
   * "bespoke"    — opts out of the shared system entirely. The page short-
   *                circuits before any shared section and the site brings its
   *                own components. Used by the trade demo, because a local
   *                plumber's website is a different genre from an editorial
   *                brochure, not a different arrangement of one.
   *
   * Two demos sharing a palette is fine; two demos sharing a skeleton is what
   * makes a prospect think they are looking at one template twice.
   */
  layout: "editorial" | "cinematic" | "split" | "bespoke";

  /** In-page anchors for the sticky header. */
  nav: { href: string; label: string }[];
  /** Primary call to action, long and short (the short one is the mobile header). */
  ctaLabel: string;
  ctaLabelShort: string;

  /** The numbered micro-labels that anchor each section. */
  sectionLabels: {
    services: string;
    gallery: string;
    story: string;
    faq: string;
    booking: string;
  };
  /** Booking detail row, e.g. "Call the practice" / "Call the office". */
  phoneLabel: string;

  /**
   * The gallery shows a large plate, a small offset plate, and optionally a
   * full-width band beneath. `wide` and `exterior` are both optional so a site
   * with only one wide shot to spare renders a clean two-up rather than
   * repeating a photograph it already used elsewhere.
   */
  images: {
    hero: DemoImageRef;
    /** Gallery, large plate. Falls back to `exterior` when absent. */
    wide?: DemoImageRef;
    /** Gallery, small offset plate. */
    detail: DemoImageRef;
    team: DemoImageRef;
    /** Full-width band under the gallery when `wide` is present. */
    exterior?: DemoImageRef;
  };

  hero: {
    eyebrow: string;
    heading: string;
    body: string;
    cta: string;
  };
  /** Display heading above the services list, e.g. "Care, without the upsell." */
  servicesHeading: string;
  /**
   * Optional heading for the gallery. Without one the section is a bare label
   * over photographs, which looks unfinished next to every other section.
   */
  galleryHeading?: string;
  services: { title: string; description: string }[];
  proofPoints: { title: string; description: string }[];
  story: { heading: string; body: string[] };
  /** Pull-quote in the story section. Must not repeat a line from `story.body`. */
  pullQuote: string;

  /** Credibility figures for the stats band. `value` may carry a suffix ("4.9", "12"). */
  stats: { value: string; label: string }[];
  /** Quiet text marks — insurers, associations, boards. Never real company logos. */
  trustMarks: string[];
  faq: { question: string; answer: string }[];
  /** Left-hand column of the FAQ section. */
  faqIntro: { heading: string; body: string };

  /** Industry-specific sections. Rendered only when present. */
  properties?: {
    /** Numbered micro-label, e.g. "Available now". */
    label: string;
    /** Display heading. Without this the section renders headless. */
    heading: string;
    body: string;
    items: DemoProperty[];
  };
  neighbourhoods?: {
    label: string;
    heading: string;
    items: { name: string; description: string }[];
  };
  /** Chip grid of what the clinic actually treats. */
  conditions?: {
    label: string;
    heading: string;
    body: string;
    items: string[];
  };
  /** Horizontal rail of named practitioners. */
  practitioners?: {
    label: string;
    heading: string;
    items: {
      name: string;
      role: string;
      focus: string;
      image: DemoImageRef;
    }[];
  };

  booking: {
    heading: string;
    body: string;
    /** Opening line from the AI assistant. */
    welcome: string;
    /** Clickable starters that show off what the agent can do. */
    starters: string[];
    /** Who the assistant is, shown in the chat header. "Reception", "Sales team". */
    assistantLabel: string;
  };

  /**
   * Live voice via the OpenAI Realtime API. Absent means the site shows chat
   * only — voice bills per minute of audio on a public endpoint, so it is
   * opt-in per site rather than on by default.
   */
  voice?: {
    /** Spoken opening line, sent as the first response once connected. */
    greeting: string;
    /** Short prompt shown under the orb before the visitor starts. */
    invitation: string;
  };
  hoursLabel: string;
  hours: DemoHours;
  /** What the agent calls a booking, e.g. "appointment", "viewing". */
  appointmentNoun: string;
  /** Persona and rules for the AI assistant. */
  persona: string;
};
