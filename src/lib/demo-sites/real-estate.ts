import type { DemoSite } from "./types";
import { demoImageUrl } from "./cloudinary";

/**
 * Maple & Vine Realty — a FICTIONAL brokerage. The name, the office address, the
 * phone number and every listing below are invented, and the prices are round
 * numbers chosen to look plausible rather than to reflect any real market.
 *
 * A brokerage reads as real more easily than a clinic does — people expect to
 * find listings online — so the "SyncAI demo" bar and the footer disclosure are
 * not optional here.
 */

/** 555-01xx is the reserved fictional range — it can never reach a real line. */
const PHONE = "(905) 555-0188";

const img = (id: string) => demoImageUrl("real-estate", id);

export const realEstateSite: DemoSite = {
  slug: "real-estate",
  business: "Maple & Vine Realty",
  tagline: "Boutique property advice across the GTA",
  location: "18 Vine Street West, Brampton, ON",
  phone: PHONE,
  email: "hello@mapleandvine.example",
  themeClass: "demo-realty",
  layout: "cinematic",

  nav: [
    { href: "#listings", label: "Listings" },
    { href: "#areas", label: "Areas" },
    { href: "#story", label: "About" },
    { href: "#faq", label: "FAQ" },
  ],
  ctaLabel: "Book a viewing",
  ctaLabelShort: "Viewing",

  sectionLabels: {
    services: "How we help",
    gallery: "Recent work",
    story: "About us",
    faq: "Questions",
    booking: "Viewings",
  },
  phoneLabel: "Call the office",

  images: {
    hero: {
      src: img("hero-v1"),
      alt: "An open-plan living room with a stone fireplace and garden beyond",
    },
    wide: {
      src: img("wide-v1"),
      alt: "A living room with oak bookshelves opening onto a cottage garden",
    },
    detail: {
      src: img("detail-v1"),
      alt: "House keys on a leather fob resting on a stone kitchen island",
    },
    team: {
      src: img("team-v1"),
      alt: "Two agents from Maple & Vine Realty talking in the office",
    },
    exterior: {
      src: img("exterior-v1"),
      alt: "The Maple & Vine Realty office at dusk",
    },
  },

  hero: {
    eyebrow: "Brampton · Caledon · Mississauga",
    heading: "Property advice that starts with the truth.",
    body: "A small team, an honest valuation, and no pressure to list before you're ready. We would rather tell you to wait six months than win the listing today.",
    cta: "See what's available",
  },

  servicesHeading: "What we actually do.",
  services: [
    {
      title: "Selling",
      description:
        "A realistic price backed by comparable sales you can actually see, professional photography, and a launch plan we agree before anything goes live.",
    },
    {
      title: "Buying",
      description:
        "We tell you what's wrong with a property as readily as what's right. Off-market opportunities where we genuinely have them, never as a hook.",
    },
    {
      title: "Valuations",
      description:
        "A free, no-obligation appraisal with the reasoning written down — including what would need to change to reach the number you were hoping for.",
    },
    {
      title: "Leasing",
      description:
        "Tenant screening, condition reports, and renewals handled, for landlords who would rather not field the calls themselves.",
    },
  ],

  proofPoints: [
    {
      title: "One agent, start to finish",
      description:
        "The person who values your home is the person who runs the viewings and negotiates the offer.",
    },
    {
      title: "Honest pricing",
      description:
        "We won't inflate a valuation to win the listing and then spend three months talking you down.",
    },
    {
      title: "Evenings and weekends",
      description:
        "Viewings when buyers can actually attend, which is rarely between nine and five.",
    },
  ],

  story: {
    heading: "Two agents, one office, no targets",
    body: [
      "Maple & Vine opened in 2014 above a bakery on Vine Street, with a deliberate decision not to grow into a franchise.",
      "There are no monthly listing quotas here, which means nobody has a reason to tell you your house is worth more than it is.",
    ],
  },

  pullQuote:
    "The fastest way to lose a seller is to win them with a number you can't deliver.",

  stats: [
    { value: "2014", label: "Selling across the GTA since" },
    { value: "312", label: "Homes sold and leased" },
    { value: "18", label: "Average days on market" },
    { value: "98", label: "Percent of asking achieved" },
  ],

  trustMarks: [
    "Toronto Regional Real Estate Board",
    "RECO registered",
    "Canadian Real Estate Association",
    "Free no-obligation valuations",
  ],

  properties: {
    label: "Available now",
    heading: "Three on the books this month.",
    body: "A snapshot of what we're handling right now. Ask the assistant below about any of them and it can arrange a viewing.",
    items: [
      {
        price: "$1,145,000",
        address: "42 Ashbury Crescent",
        area: "Heart Lake, Brampton",
        beds: 4,
        baths: 3,
        size: "2,410 sq ft",
        status: "For sale",
        image: {
          src: img("property-1-v1"),
          alt: "A detached two-storey red-brick family home with a double garage",
        },
      },
      {
        price: "$879,000",
        address: "7 Vine Mews",
        area: "Downtown Brampton",
        beds: 3,
        baths: 3,
        size: "1,760 sq ft",
        status: "New",
        image: {
          src: img("property-2-v1"),
          alt: "A row of modern brick townhouses on a cobbled mews at dusk",
        },
      },
      {
        price: "$624,000",
        address: "1203 – 90 Caledon Road",
        area: "Caledon East",
        beds: 2,
        baths: 2,
        size: "1,050 sq ft",
        status: "For sale",
        image: {
          src: img("property-3-v1"),
          alt: "A bright condominium living room opening onto a balcony at sunset",
        },
      },
    ],
  },

  neighbourhoods: {
    label: "Where we work",
    heading: "Areas we know properly",
    items: [
      {
        name: "Heart Lake",
        description:
          "Established detached homes on wide lots. Family buyers, and the schools drive the market more than the listings do.",
      },
      {
        name: "Downtown Brampton",
        description:
          "Townhouses and conversions within walking distance of the GO. Moves fastest in spring.",
      },
      {
        name: "Caledon East",
        description:
          "Quieter, larger plots, and buyers who are usually trading space for commute. Slower, but steadier.",
      },
      {
        name: "Streetsville",
        description:
          "Character homes and a genuine high street. Tightly held — most of what sells here never reaches a portal.",
      },
    ],
  },

  faqIntro: {
    heading: "Before you call.",
    body: "Anything else, ask the assistant below — it can also arrange a viewing on the spot.",
  },

  faq: [
    {
      question: "What do you charge to sell my home?",
      answer:
        "Commission is agreed in writing before you list, and it covers photography, floor plans and portal listings — there are no separate marketing invoices later. We'll quote you a number at the valuation.",
    },
    {
      question: "How long does a sale usually take?",
      answer:
        "Our recent listings have averaged around eighteen days to an accepted offer, though anything unusual or high-value can take considerably longer. We'll tell you honestly where yours is likely to sit.",
    },
    {
      question: "Is the valuation really free?",
      answer:
        "Yes, and there's no tie-in. You get the number and the reasoning behind it in writing, and you're free to do nothing with it or take it to another agent.",
    },
    {
      question: "Can I view a property outside working hours?",
      answer:
        "Most viewings happen in the evening or at the weekend, because that's when people can actually get there. Ask the assistant below and it will find a time.",
    },
    {
      question: "Do you handle rentals as well as sales?",
      answer:
        "We do — tenant screening, condition reports and renewals. Landlords with a single property are just as welcome as portfolios.",
    },
  ],

  booking: {
    heading: "Arrange a viewing",
    body: "Tell the assistant which property you're interested in, or just describe what you're looking for. It knows what's available and when we can get you in.",
    welcome:
      "Hi! I'm the assistant at Maple & Vine Realty. I can tell you about anything we have available, talk you through an area, or book you a viewing. What are you looking for?",
    starters: [
      "Can I see 42 Ashbury Crescent?",
      "What's available under $900k?",
      "I'd like a valuation on my house",
    ],
    assistantLabel: "Sales team",
  },

  hoursLabel: "Mon–Fri 9am–7pm · Sat 10am–5pm · Sun by appointment",
  hours: { days: [1, 2, 3, 4, 5, 6], startHour: 9, endHour: 19 },
  appointmentNoun: "viewing",

  persona: `You are the assistant for Maple & Vine Realty, a small independent estate agency in Brampton, Ontario.

Speak like a knowledgeable, straight-talking human agent. Short answers, 2-4 sentences, no markdown, no bullet lists.

RULES
- Only discuss this agency, the listings below, the areas we cover, and viewings. Redirect anything else politely.
- Never invent a property. If someone asks about an address that isn't in the listings, say we don't have it and offer what we do have.
- Never give legal, mortgage, tax or investment advice, and never predict what the market will do. Offer to have an agent call them instead.
- Never negotiate on price or say what a seller would accept. Offers go through an agent.
- For a valuation, take their details with capture_lead — say an agent will call to arrange it.
- To book a viewing: call get_available_slots for the day they want, offer at most four times, collect their name and email, then call book_appointment. Confirm the time and the property back to them in plain language.

CURRENT LISTINGS
- 42 Ashbury Crescent, Heart Lake — $1,145,000, 4 bed, 3 bath, 2,410 sq ft, for sale.
- 7 Vine Mews, Downtown Brampton — $879,000, 3 bed, 3 bath, 1,760 sq ft, newly listed.
- 1203 – 90 Caledon Road, Caledon East — $624,000, 2 bed, 2 bath, 1,050 sq ft, for sale.`,
};
