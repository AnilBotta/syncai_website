import type { DemoSite } from "./types";
import { demoImageUrl } from "./cloudinary";

/**
 * Riverstone Physio — a FICTIONAL clinic. The name, the address, the phone
 * number and all three practitioners are invented.
 *
 * This is the only demo with a live voice agent, so the disclosure matters more
 * here than anywhere: a visitor can hold a spoken conversation with something
 * that sounds like a real clinic. The SyncAI bar and the footer text stay.
 */

/** 555-01xx is the reserved fictional range — it can never reach a real line. */
const PHONE = "(905) 555-0164";

const img = (id: string) => demoImageUrl("physio", id);

export const physioSite: DemoSite = {
  slug: "physio",
  business: "Riverstone Physio",
  tagline: "Movement and rehab in Milton",
  location: "9 Riverstone Way, Milton, ON",
  phone: PHONE,
  email: "hello@riverstonephysio.example",
  themeClass: "demo-physio",
  layout: "split",

  nav: [
    { href: "#conditions", label: "What we treat" },
    { href: "#team", label: "Our team" },
    { href: "#faq", label: "FAQ" },
  ],
  ctaLabel: "Book an assessment",
  ctaLabelShort: "Book",

  sectionLabels: {
    services: "How we treat",
    gallery: "The studio",
    story: "About us",
    faq: "Questions",
    booking: "Booking",
  },
  phoneLabel: "Call the clinic",

  images: {
    hero: { src: img("hero-v1"), alt: "The main studio at Riverstone Physio" },
    wide: { src: img("wide-v1"), alt: "The rehabilitation gym space" },
    detail: { src: img("detail-v1"), alt: "A rolled mat, foam roller and towel on a bench" },
    team: { src: img("team-v1"), alt: "Two of the team at Riverstone Physio" },
    exterior: { src: img("exterior-v1"), alt: "Riverstone Physio from the street" },
  },

  hero: {
    eyebrow: "Milton, Ontario",
    heading: "Get moving again, properly.",
    body: "Hands-on assessment, a plan you actually understand, and homework that takes ten minutes rather than an hour. We would rather discharge you than keep you coming back.",
    cta: "Book an assessment",
  },

  servicesHeading: "Treatment that ends.",
  galleryHeading: "A quiet room, not a busy gym.",
  services: [
    {
      title: "Assessment",
      description:
        "A full hour for a first visit. We work out what is actually causing it, explain it in plain language, and tell you honestly how long it should take.",
    },
    {
      title: "Manual therapy",
      description:
        "Hands-on work for joints and soft tissue, used where it helps and skipped where it does not. Never the whole plan on its own.",
    },
    {
      title: "Exercise rehab",
      description:
        "A short programme built around what you will realistically do, reviewed and progressed as you improve rather than handed over once and forgotten.",
    },
    {
      title: "Return to sport",
      description:
        "Objective testing before you go back, so the decision is based on what your leg can do rather than how many weeks have passed.",
    },
  ],

  conditions: {
    label: "What we treat",
    heading: "The things people actually come in with.",
    body: "If yours is not on the list, ask — we will tell you honestly whether we can help or whether you need someone else.",
    items: [
      "Lower back pain",
      "Neck and desk posture",
      "Shoulder impingement",
      "Rotator cuff tears",
      "Tennis and golfer's elbow",
      "Hip and groin pain",
      "Knee and ACL rehab",
      "Runner's knee",
      "Achilles tendinopathy",
      "Ankle sprains",
      "Plantar heel pain",
      "Post-surgical rehab",
      "Whiplash",
      "Sciatica",
      "Pre-natal and post-natal",
    ],
  },

  practitioners: {
    label: "Our team",
    heading: "Three clinicians, no rotating cast",
    items: [
      {
        name: "Nadia Osei",
        role: "Registered Physiotherapist",
        focus: "Shoulders, post-surgical rehab and return-to-sport testing.",
        image: { src: img("practitioner-1-v1"), alt: "Nadia Osei, registered physiotherapist" },
      },
      {
        name: "Tom Beckett",
        role: "Registered Physiotherapist",
        focus: "Lower back, hips and running injuries. Runs the gait clinic.",
        image: { src: img("practitioner-2-v1"), alt: "Tom Beckett, registered physiotherapist" },
      },
      {
        name: "Priya Raghavan",
        role: "Physiotherapist & Clinical Lead",
        focus: "Persistent pain, pre-natal and post-natal, and complex cases.",
        image: { src: img("practitioner-3-v1"), alt: "Priya Raghavan, clinical lead" },
      },
    ],
  },

  proofPoints: [
    {
      title: "A full hour, first visit",
      description:
        "Enough time to assess properly rather than hand you a sheet of exercises and move on.",
    },
    {
      title: "You'll know the plan",
      description:
        "How many visits, roughly what it costs, and what should change by when — before you commit.",
    },
    {
      title: "Discharge is the goal",
      description:
        "We measure ourselves on people leaving, not on how full the diary looks next month.",
    },
  ],

  story: {
    heading: "Started by two clinicians who left a busy chain",
    body: [
      "Riverstone opened in 2019 because fifteen-minute appointments were not long enough to do the job properly, and both founders were tired of pretending otherwise.",
      "Everyone here still books an hour for a first visit, which is slower and less profitable and completely non-negotiable.",
    ],
  },

  pullQuote: "If you still need us in six months, something has gone wrong.",

  stats: [
    { value: "2019", label: "Treating in Milton since" },
    { value: "60", label: "Minutes for a first assessment" },
    { value: "4.9", label: "Average patient rating" },
    { value: "5.4", label: "Average visits to discharge" },
  ],

  trustMarks: [
    "College of Physiotherapists of Ontario",
    "Canadian Physiotherapy Association",
    "Direct insurance billing",
    "No referral needed",
  ],

  faqIntro: {
    heading: "Before you book.",
    body: "Anything else, ask the assistant below — or press the voice tab and just talk to it.",
  },

  faq: [
    {
      question: "Do I need a doctor's referral?",
      answer:
        "No. You can book directly with us. Some insurance plans ask for a referral before they reimburse, so it is worth checking your own policy first.",
    },
    {
      question: "What does it cost?",
      answer:
        "A first assessment is an hour and is quoted before you book; follow-ups are shorter and cost less. We bill most major insurers directly, so you usually only pay the difference.",
    },
    {
      question: "How many appointments will I need?",
      answer:
        "Most people are discharged in around five or six visits, though that varies a lot with what is wrong. You will get an honest estimate at the first assessment rather than an open-ended plan.",
    },
    {
      question: "What should I wear?",
      answer:
        "Something you can move in, and that lets us see the area we are treating — shorts for a knee, a vest top for a shoulder. We have a private treatment room if you would rather change here.",
    },
    {
      question: "Do you treat sports injuries?",
      answer:
        "Yes, including return-to-sport testing before you go back. We would rather test your leg than count the weeks since the injury.",
    },
  ],

  booking: {
    heading: "Book an assessment",
    body: "Tell the assistant what is bothering you and it will find you an hour. You can type, or switch to the voice tab and speak to it.",
    welcome:
      "Hi! I'm the assistant at Riverstone Physio. I can answer questions about treatment or find you an assessment. What's been bothering you?",
    starters: [
      "My lower back has been sore for weeks",
      "Do I need a referral?",
      "What's your earliest assessment?",
    ],
    assistantLabel: "Reception",
  },

  voice: {
    greeting:
      "Hi, you're through to Riverstone Physio. What can I help you with today?",
    invitation:
      "Talk to the clinic's AI receptionist. Ask about treatment, or have it book you an assessment.",
  },

  hoursLabel: "Mon–Thu 7am–8pm · Fri 7am–5pm · Sat 8am–1pm",
  hours: { days: [1, 2, 3, 4, 5, 6], startHour: 7, endHour: 20 },
  appointmentNoun: "assessment",

  persona: `You are the receptionist at Riverstone Physio, an independent physiotherapy clinic in Milton, Ontario.

Speak like a warm, capable clinic receptionist. Short answers, no markdown, no lists.

RULES
- Only discuss this clinic, its treatments, the team, and booking. Redirect anything else politely.
- You are NOT a physiotherapist. Never diagnose, never suggest exercises, never advise on medication, imaging or whether something is serious. Say it needs to be assessed properly and offer the soonest appointment.
- If someone describes red-flag symptoms — chest pain, numbness in both legs, loss of bladder or bowel control, a fall with a suspected fracture, or sudden severe unexplained pain — tell them to seek urgent medical care or call 911 rather than booking with us.
- Never quote an exact price. Say a first assessment is a full hour and is quoted before booking, and that we bill most insurers directly.
- No referral is needed to see us, though some insurers ask for one before reimbursing.
- To book: call get_available_slots for the day they want, offer at most four times, collect their name and email, then call book_appointment. Confirm the time back to them in plain language.
- If they describe a problem but won't book, offer to take their details with capture_lead so a physiotherapist can call them back.

THE TEAM
- Nadia Osei, registered physiotherapist — shoulders, post-surgical rehab, return-to-sport testing.
- Tom Beckett, registered physiotherapist — lower back, hips, running injuries, gait clinic.
- Priya Raghavan, physiotherapist and clinical lead — persistent pain, pre-natal and post-natal, complex cases.`,
};
