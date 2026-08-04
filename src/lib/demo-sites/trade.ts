import type { DemoSite } from "./types";
import { demoImageUrl } from "./cloudinary";

/**
 * Halcyon Plumbing & Heating — a FICTIONAL trade business. The name, the
 * address, the phone number, the reviews and every job shown are invented.
 *
 * This is the only `layout: "bespoke"` site. A local plumber's website is a
 * different genre from an editorial brochure, not a different arrangement of
 * one: the phone number is the loudest thing on the page, the credentials sit
 * above the fold, the quote form is second on the page rather than last, and
 * the density is closer to a job sheet than to a magazine. None of that
 * vocabulary exists in the shared sections, so this site brings its own —
 * see components/demo-sites/trade.
 *
 * `tradeContent` below carries everything the bespoke page needs that has no
 * home on DemoSite. Fields that DO have a home (services, faq, proofPoints,
 * stats, hero, images) stay on the site object and are read from there, so
 * there is exactly one copy of each string.
 */

/** 555-01xx is the reserved fictional range — it can never reach a real line. */
const PHONE = "(905) 555-0176";

const img = (id: string) => demoImageUrl("trade", id);

/** Lucide icon names, resolved to components in the service grid. */
export type TradeIcon =
  | "siren"
  | "flame"
  | "droplets"
  | "shower"
  | "thermometer"
  | "clipboard";

/*
 * Single source for the service copy. The bespoke grid needs an icon per card;
 * DemoSite.services does not have a slot for one and should not grow one for a
 * site that is the only consumer. So the icon lives here and the plain
 * title/description pairs are projected onto the site object below.
 */
const services: { icon: TradeIcon; title: string; description: string }[] = [
  {
    icon: "siren",
    title: "Emergency call-outs",
    description:
      "Burst pipes, no heat, no hot water. We hold slots back every single day for exactly this.",
  },
  {
    icon: "flame",
    title: "Boilers & furnaces",
    description:
      "Servicing, fault-finding, repair and replacement — with a straight answer on repair versus replace.",
  },
  {
    icon: "droplets",
    title: "Leaks & burst pipes",
    description:
      "Traced, isolated and fixed properly. We find the leak before we start cutting anything open.",
  },
  {
    icon: "shower",
    title: "Bathrooms & kitchens",
    description:
      "Full installs and single swaps, scheduled around you and priced up front before anything comes out.",
  },
  {
    icon: "thermometer",
    title: "Water heaters & softeners",
    description:
      "Tank and tankless, supplied and fitted. Hard-water treatment sized to the house, not to the invoice.",
  },
  {
    icon: "clipboard",
    title: "Safety checks & certificates",
    description:
      "Landlord certificates, gas appliance checks and system flushes, booked as a batch so you chase nobody.",
  },
];

export const tradeSite: DemoSite = {
  slug: "trade",
  business: "Halcyon Plumbing & Heating",
  tagline: "Emergency and planned work across Halton",
  location: "Unit 4, Kerr Industrial Park, Georgetown, ON",
  phone: PHONE,
  email: "office@halcyonplumbing.example",
  themeClass: "demo-trade",
  layout: "bespoke",

  nav: [
    { href: "#services", label: "Services" },
    { href: "#reviews", label: "Reviews" },
    { href: "#work", label: "Our work" },
    { href: "#areas", label: "Areas" },
    { href: "#faq", label: "FAQ" },
  ],
  ctaLabel: "Get a quote",
  ctaLabelShort: "Quote",

  /* Unused by the bespoke page — it does not run numbered micro-labels — but
     required by DemoSite, and accurate if this site ever moved back. */
  sectionLabels: {
    services: "What we do",
    gallery: "Recent work",
    story: "About us",
    faq: "Questions",
    booking: "Get a quote",
  },
  phoneLabel: "Call the office",

  images: {
    hero: {
      src: img("hero-v1"),
      alt: "A Halcyon engineer checking pressure on a wall-mounted combi boiler in a kitchen",
    },
    wide: {
      src: img("wide-v1"),
      alt: "The Halcyon stores wall: labelled bins of copper fittings, brass valves and coiled pipe",
    },
    detail: {
      src: img("detail-v1"),
      alt: "Gloved hands tightening a brass compression fitting onto copper pipe at a bench",
    },
    team: {
      src: img("team-v1"),
      alt: "Two Halcyon engineers talking beside the van on a customer's driveway",
    },
    exterior: {
      src: img("exterior-v1"),
      alt: "The Halcyon unit on Kerr Industrial Park, roller door and side entrance",
    },
  },

  hero: {
    eyebrow: "Georgetown · Acton · Milton · Halton Hills",
    heading: "Someone answers. Every time.",
    body: "Licensed plumbers and gas technicians for emergencies, boilers and bathrooms. If we can't get to you today we'll say so on the first call, rather than leave you waiting in.",
    cta: "Get a quote",
  },

  servicesHeading: "Emergencies, and everything before one.",
  services: services.map(({ title, description }) => ({ title, description })),

  proofPoints: [
    {
      title: "A price before we start",
      description:
        "The call-out charge and hourly rate are agreed on the phone. No invoice has ever surprised anyone.",
    },
    {
      title: "TSSA-registered, fully insured",
      description:
        "Every engineer holds a current gas licence and carries the card. $5M liability, WSIB covered.",
    },
    {
      title: "We turn up when we said",
      description:
        "A two-hour window and a text when the van sets off — not a vague morning slot and a shrug.",
    },
    {
      title: "The van carries the part",
      description:
        "A stocked van and a stocked unit, so most jobs finish on the first visit instead of the third.",
    },
  ],

  story: {
    heading: "One van in 2011, six today",
    body: [
      "Halcyon started with one engineer, one van and a landline that forwarded to a mobile at night — which is why we care so much about calls being answered.",
      "The team is six now and the rule hasn't changed: whoever quotes the job is on the tools for it, so nobody is selling work they don't have to do.",
    ],
  },

  pullQuote:
    "The job most trades lose isn't the one they quoted badly. It's the one nobody picked up.",

  stats: [
    { value: "2011", label: "Serving Halton since" },
    { value: "6", label: "Licensed engineers" },
    { value: "92%", label: "Same-day on emergencies" },
    { value: "4.8", label: "Average rating, 214 reviews" },
  ],

  trustMarks: ["TSSA registered", "Licensed G2 gas technicians", "$5M liability insured", "WSIB covered"],

  galleryHeading: "Tidy vans, tidy work.",

  faqIntro: {
    heading: "Before you call.",
    body: "Anything else, ask the assistant — it can put the job straight in the diary.",
  },

  faq: [
    {
      question: "What do you charge for a call-out?",
      answer:
        "The call-out and hourly rate are quoted on the phone before we set off, and there's no call-out charge on work we've already quoted. We don't start anything you haven't agreed to.",
    },
    {
      question: "Can you come out today?",
      answer:
        "For emergencies, usually — we hold slots back every day for them. If we genuinely can't get to you we'll say so on the first call rather than book you and cancel.",
    },
    {
      question: "Do you work evenings and weekends?",
      answer:
        "Yes, for emergencies. Planned work is weekdays, which keeps the out-of-hours rate off jobs that don't need it.",
    },
    {
      question: "Are your engineers licensed?",
      answer:
        "Every engineer is TSSA registered with a current gas technician licence, and will show you the card on arrival without you having to ask. We carry $5M liability cover and everyone is WSIB covered.",
    },
    {
      question: "Which areas do you cover?",
      answer:
        "Georgetown, Acton, Milton, Glen Williams, Norval, Limehouse and the rest of Halton Hills. Slightly further for larger planned jobs — ask and we'll tell you straight.",
    },
    {
      question: "What if it turns out to be a bigger job?",
      answer:
        "We stop and tell you what we've found, what it will cost and what happens if you leave it. You decide before another minute is charged.",
    },
  ],

  booking: {
    heading: "Get a quote",
    body: "Tell us what's going on and we'll come back with a price and a time. Faster than a form — the assistant can check the diary while you type.",
    welcome:
      "Hi! I'm the assistant at Halcyon Plumbing & Heating. Tell me what's going on and I'll get you booked in — or take your details for an engineer to call straight back.",
    starters: [
      "No hot water since this morning",
      "I need a quote for a new bathroom",
      "Can someone come out today?",
    ],
    assistantLabel: "Office",
  },

  hoursLabel: "Mon–Fri 7am–6pm · Emergencies 24/7",
  hours: { days: [1, 2, 3, 4, 5], startHour: 7, endHour: 18 },
  appointmentNoun: "job",

  persona: `You are the office assistant at Halcyon Plumbing & Heating, an independent plumbing and heating firm in Georgetown, Ontario.

Speak like a capable, no-nonsense office coordinator. Short answers, no markdown, no lists.

RULES
- Only discuss this firm, its services, the areas it covers, and booking. Redirect anything else politely.
- You are NOT an engineer. Never diagnose a fault, never talk anyone through a repair, and never advise on anything involving gas. Say it needs an engineer to look and get them booked.
- If someone reports a gas smell, carbon monoxide, or a major uncontrolled leak, tell them to leave the property and call the gas utility's emergency line or 911 immediately. Do not try to book them first.
- Never quote a fixed price for a job. Say the call-out and hourly rate are confirmed on the phone before an engineer sets off, and that there is no call-out charge on work already quoted.
- THE MOMENT you have a name and an email, call capture_lead — before offering any times, before checking the diary, before anything else. The office works from that inbox and a job that never reaches it never happens. Include what they described in painPoint, and their phone number if they gave one.
- Only after capture_lead has run should you look at booking. To book: call get_available_slots for the day they want, offer at most four times, then call book_appointment. Confirm the time back to them plainly.
- If they have not given a name and email yet, ask for both before doing anything else.
- Our engineers are TSSA registered with current gas technician licences. We are insured to $5M and everyone is WSIB covered.
- We cover Georgetown, Acton, Milton, Glen Williams, Norval, Limehouse and the rest of Halton Hills. Anything further, say you will check with the office.`,
};

/** Everything the bespoke trade page needs that has no home on DemoSite. */
export const tradeContent = {
  /** Thin strip above the header — the first thing a panicking visitor reads. */
  utility: {
    emergency: "24/7 emergency call-outs",
    credential: "TSSA registered · Fully insured",
  },

  /** Credential row under the hero card. Bare text marks, never a real logo. */
  badges: [
    "TSSA registered",
    "Licensed G2 gas technicians",
    "$5M liability insured",
    "WSIB covered",
  ],

  /** Three promises beside the hero heading, above the fold. */
  heroTicks: [
    "Same-day slots held back for emergencies",
    "Price agreed before we set off",
    "Two-hour window, and a text when the van leaves",
  ],

  services,

  /** Star reviews with a name and a town. This is what trade sites run instead
      of a designed pull-quote, and it is what visitors actually read. */
  reviews: {
    average: "4.8",
    count: "214",
    source: "across Google and HomeStars",
    items: [
      {
        name: "Denise A.",
        town: "Georgetown",
        stars: 5,
        job: "No hot water — combi boiler",
        when: "2 weeks ago",
        text: "Called at 7:40am with no hot water and a house full of kids. Van was on the drive by 10. Told me what it was, what it cost, done by lunch. No drama.",
      },
      {
        name: "Rob W.",
        town: "Acton",
        stars: 5,
        job: "Second bathroom install",
        when: "1 month ago",
        text: "Quoted three firms. Halcyon were not the cheapest but they were the only ones who turned up when they said they would and put the price in writing. Worth it.",
      },
      {
        name: "Sandra O.",
        town: "Milton",
        stars: 5,
        job: "Annual service, landlord certificate",
        when: "1 month ago",
        text: "I manage four rentals and they do the lot in one morning. Certificates emailed the same day. That alone saves me a week a year.",
      },
      {
        name: "Marek K.",
        town: "Glen Williams",
        stars: 4,
        job: "Leaking stopcock",
        when: "2 months ago",
        text: "Had to come back for a part, which cost me a second morning off. Fixed properly though and they didn't charge me for the return visit.",
      },
      {
        name: "The Cedars",
        town: "Halton Hills",
        stars: 5,
        job: "Radiator balancing, six units",
        when: "3 months ago",
        text: "Six units, one visit, one invoice. Tenants said they were polite and cleaned up after themselves, which is not something I get to write often.",
      },
    ],
  },

  /** Recent jobs. Deliberately not a "before and after" — we have photographs of
      work in progress, and labelling them as before/after would be a lie. */
  work: {
    heading: "Recent jobs",
    body: "A fortnight of ordinary work. No stock photography, no staged kitchens.",
    items: [
      {
        image: {
          src: img("work-1-v1"),
          alt: "An engineer kneeling at a wall-mounted boiler in a utility room, tools laid out on a dust sheet",
        },
        title: "Boiler swap, 1930s semi",
        area: "Georgetown",
        blurb: "Old back boiler out, wall-hung combi in, pipework re-run. Two days, hot water back the same evening.",
      },
      {
        image: {
          src: img("work-2-v1"),
          alt: "An engineer checking the pressure gauge inside an open boiler casing in a kitchen",
        },
        title: "Annual service and certificate",
        area: "Milton",
        blurb: "Full service, pressure check and a landlord gas certificate emailed before the van left the street.",
      },
      {
        image: {
          src: img("detail-v1"),
          alt: "Gloved hands tightening a brass compression fitting onto copper pipe at a bench",
        },
        title: "Burst feed under a bathroom floor",
        area: "Acton",
        blurb: "Traced, isolated and re-run in copper. Boards back down the same afternoon, no ceiling to replace.",
      },
    ],
  },

  /** The van, shown beside the areas list. DemoSite.images has no slot for it,
      and adding one for a single bespoke site would be the wrong trade. */
  van: {
    src: img("van-v1"),
    alt: "A Halcyon van on a customer's driveway with the rear doors open, showing racked copper and tools",
  },

  /** Dense town list — how people self-qualify on a trade site. */
  areas: {
    heading: "Areas we cover",
    body: "If your town is on this list, we can usually be with you the same day. If it isn't, ask anyway — for planned work we travel further.",
    items: [
      "Georgetown",
      "Acton",
      "Milton",
      "Glen Williams",
      "Norval",
      "Limehouse",
      "Terra Cotta",
      "Stewarttown",
      "Ballinafad",
      "Hornby",
      "Ashgrove",
      "Campbellville",
      "Brookville",
      "Halton Hills",
    ],
    note: "Head office: Unit 4, Kerr Industrial Park, Georgetown, ON",
  },

  /** Full-width amber band above the footer. */
  callBand: {
    heading: "Water where it shouldn't be?",
    body: "Emergency lines are answered around the clock, by a person, in Georgetown.",
  },

  /** Why-us panel beside the team photograph. */
  why: {
    heading: "Why people call us back",
    body: "Nothing here is a slogan. Every line is something you can hold us to on the day.",
  },

  workshop: {
    heading: "The part is usually already on the van",
    body: "A stocked unit and six stocked vans is why most of our jobs finish on the first visit. It is unglamorous and it is the single biggest reason people rebook.",
  },
} as const;
