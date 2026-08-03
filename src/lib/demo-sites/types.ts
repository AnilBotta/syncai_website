/**
 * Shape of a demo site. One file per fictional business in this folder; adding
 * an industry should mean adding a content file and an entry in `index.ts`,
 * not writing new page code.
 */

export type DemoHours = {
  /** 0 = Sunday, matching Date#getDay. */
  days: number[];
  startHour: number;
  endHour: number;
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
   * Photography. Any slot left undefined renders a styled gradient block, so a
   * site can ship before its imagery exists.
   */
  images: {
    hero?: string;
    treatment?: string;
    detail?: string;
    team?: string;
    exterior?: string;
  };
  /** Credibility figures for the stats band. `value` may carry a suffix ("4.9", "12"). */
  stats: { value: string; label: string }[];
  /** Quiet text marks — insurers, associations. Never real company logos. */
  trustMarks: string[];
  faq: { question: string; answer: string }[];
  /** Pull-quote in the story section. */
  pullQuote: string;
  hero: {
    eyebrow: string;
    heading: string;
    body: string;
    cta: string;
  };
  services: { title: string; description: string }[];
  proofPoints: { title: string; description: string }[];
  story: { heading: string; body: string[] };
  booking: {
    heading: string;
    body: string;
    /** Opening line from the AI receptionist. */
    welcome: string;
    /** Clickable starters that show off what the agent can do. */
    starters: string[];
  };
  hoursLabel: string;
  hours: DemoHours;
  /** What the agent calls an appointment, e.g. "visit". Used in tool copy. */
  appointmentNoun: string;
  /** Persona and rules for the AI receptionist. */
  persona: string;
};
