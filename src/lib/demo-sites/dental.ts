import type { DemoSite } from "./types";
import { demoImageUrl } from "./cloudinary";

/**
 * Northgate Dental Studio — a FICTIONAL clinic. Everything here is invented:
 * the name, the address, the phone number. Nothing in this file may reference a
 * real practice, and the site itself always renders the "SyncAI demo" bar so a
 * visitor is never misled into thinking they can actually book dental care.
 */
/** 555-01xx is the reserved fictional range — it can never reach a real line. */
const PHONE = "(905) 555-0142";

const img = (id: string) => demoImageUrl("dental", id);

export const dentalSite: DemoSite = {
  slug: "dental",
  business: "Northgate Dental Studio",
  tagline: "Calm, modern dentistry in Brampton",
  location: "24 Northgate Common, Brampton, ON",
  phone: PHONE,
  email: "hello@northgatedental.example",
  themeClass: "demo-dental",
  layout: "editorial",

  nav: [
    { href: "#services", label: "Services" },
    { href: "#practice", label: "The practice" },
    { href: "#faq", label: "FAQ" },
  ],
  ctaLabel: "Book a visit",
  ctaLabelShort: "Book",

  sectionLabels: {
    services: "What we do",
    gallery: "Inside the practice",
    story: "The practice",
    faq: "Questions",
    booking: "Booking",
  },
  phoneLabel: "Call the practice",

  images: {
    hero: { src: img("hero-v1"), alt: "The reception at Northgate Dental Studio" },
    wide: { src: img("treatment-v1"), alt: "A treatment room" },
    detail: {
      src: img("detail-v1"),
      alt: "Sterilised instruments laid out before an appointment",
    },
    team: { src: img("team-v1"), alt: "Two of the team at Northgate Dental Studio" },
    exterior: { src: img("exterior-v1"), alt: "Northgate Dental Studio from the street" },
  },

  stats: [
    { value: "2016", label: "Practising in Brampton since" },
    { value: "9", label: "Dentists, hygienists and staff" },
    { value: "4.9", label: "Average patient rating" },
    { value: "48h", label: "Typical wait for a checkup" },
  ],

  trustMarks: [
    "Ontario Dental Association",
    "Royal College of Dental Surgeons",
    "Direct insurance billing",
    "Sunlife · Manulife · Canada Life",
  ],

  pullQuote:
    "We book longer appointments than we strictly need to. It's the only way to do this work properly.",

  faqIntro: {
    heading: "Before you book.",
    body: "Anything else, ask the receptionist below — she answers instantly.",
  },

  faq: [
    {
      question: "What does a first visit cost?",
      answer:
        "A new-patient exam and cleaning is quoted in writing before we start, and we check your insurance coverage first so you know what you'll actually pay. Nothing gets booked until you've seen the number.",
    },
    {
      question: "Do you bill my insurance directly?",
      answer:
        "Yes, for most major Canadian providers. Bring your card to the first visit and we'll handle the claim so you only pay the difference.",
    },
    {
      question: "I'm nervous about the dentist. What can you do?",
      answer:
        "Tell us when you book and we'll allow extra time. Nothing happens without being explained first, and you can stop at any point. A lot of our patients came to us after years of avoiding it.",
    },
    {
      question: "How quickly can I be seen in an emergency?",
      answer:
        "We hold slots open every day for urgent problems and can usually see you the same day. Call the practice rather than booking online if you're in pain.",
    },
    {
      question: "Are you taking new patients?",
      answer:
        "Yes, including families. The AI receptionist below can find you a time right now, or you can call us during opening hours.",
    },
  ],

  hero: {
    eyebrow: "Brampton, Ontario",
    heading: "Dentistry that doesn't feel like the dentist.",
    body: "Unhurried appointments, honest treatment plans, and a team that explains everything before it happens. Same-day emergency slots most weeks.",
    cta: "Book your visit",
  },

  servicesHeading: "Care, without the upsell.",
  services: [
    {
      title: "Checkups & hygiene",
      description:
        "A thorough exam, professional cleaning, and a clear picture of where your teeth actually stand — no upselling.",
    },
    {
      title: "Cosmetic dentistry",
      description:
        "Whitening, veneers, and bonding done conservatively, so the result still looks like you on a good day.",
    },
    {
      title: "Emergency care",
      description:
        "Chipped, knocked out, or suddenly painful. We hold slots open every day for exactly this.",
    },
    {
      title: "Orthodontics",
      description:
        "Clear aligners and traditional braces for teens and adults, with a realistic timeline quoted up front.",
    },
  ],

  proofPoints: [
    {
      title: "You'll see the same dentist",
      description:
        "Continuity matters. You won't retell your history to someone new at every visit.",
    },
    {
      title: "Costs before treatment",
      description:
        "A written estimate and your insurance coverage explained before anything is booked.",
    },
    {
      title: "Evenings and Saturdays",
      description:
        "Open until 6pm on weekdays and all day Saturday, so appointments don't cost you a day's work.",
    },
  ],

  story: {
    heading: "A small practice, on purpose",
    body: [
      "Northgate opened in 2016 with one chair and a stubborn idea: that a dental visit should be calm, unrushed, and honest about what it costs.",
      "We've grown to four operatories and a team of nine, and none of that has changed how long we spend with you.",
    ],
  },

  booking: {
    heading: "Book with our AI receptionist",
    body: "She knows our hours, our services, and what's actually open. Ask her anything, or just tell her when you'd like to come in.",
    welcome:
      "Hi! I'm the receptionist at Northgate Dental Studio. I can answer questions about our treatments and hours, or find you an appointment. What can I help with?",
    starters: [
      "Do you have anything Saturday?",
      "I chipped a tooth — how soon can I be seen?",
      "Do you take new patients?",
    ],
    assistantLabel: "Reception",
  },

  hoursLabel: "Mon–Fri 8am–6pm · Sat 9am–4pm · Closed Sunday",
  hours: { days: [1, 2, 3, 4, 5, 6], startHour: 8, endHour: 18 },
  appointmentNoun: "appointment",

  persona: `You are the front-desk receptionist for Northgate Dental Studio, a small dental practice in Brampton, Ontario.

Speak like a warm, efficient human receptionist. Short answers, 2-4 sentences, no markdown, no bullet lists.

RULES
- Only discuss this practice, its treatments, hours, and appointments. If asked about anything unrelated, redirect politely.
- You are NOT a dentist. Never diagnose, never recommend a specific treatment, never give clinical or medication advice. For anything symptom-related, say it needs to be looked at and offer the soonest appointment.
- For a genuine emergency (severe pain, swelling, a knocked-out tooth, bleeding that won't stop), say to call the practice directly on ${PHONE} rather than waiting on a booking.
- Never quote a price. Say that costs are confirmed in writing after the dentist has looked, and that insurance is checked beforehand.
- To book: call get_available_slots for the day they want, offer at most four times, collect their name and email, then call book_appointment. Confirm the time back to them in plain language.
- If they describe what they need but won't book, offer to take their details with capture_lead so the practice can call them back.`,
};
