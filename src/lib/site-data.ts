import {
  Bot,
  Building2,
  CalendarCheck,
  ChartNoAxesCombined,
  ClipboardCheck,
  Headphones,
  HeartPulse,
  Home,
  MessageSquareText,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Store,
  Workflow,
} from "lucide-react";

export const navItems = [
  { label: "Solutions", href: "/demos" },
  { label: "Demos", href: "/demos" },
  { label: "Industries", href: "/industries" },
  { label: "Process", href: "/process" },
  { label: "Contact", href: "/contact" },
];

export const contact = {
  email: "support@syncai.tech",
  phonePrimary: "+1 437-925-2349",
  phoneSecondary: "+1 365-536-6441",
  location: "Brampton, Ontario",
};

export const services = [
  {
    title: "AI Strategy and Consulting",
    description:
      "We map business challenges, score AI opportunities, and turn the best ones into a practical implementation roadmap.",
    icon: Sparkles,
  },
  {
    title: "AI Websites and Lead Systems",
    description:
      "Modern websites with AI-assisted lead capture, qualification, booking flows, and customer education built in.",
    icon: MessageSquareText,
  },
  {
    title: "AI Voice and Chat Agents",
    description:
      "Website chat, missed-call recovery, appointment support, FAQs, intake, and follow-up agents for daily operations.",
    icon: PhoneCall,
  },
  {
    title: "Workflow Automation",
    description:
      "Automations across forms, calendars, email, CRMs, spreadsheets, and internal handoffs so teams spend less time on repetitive work.",
    icon: Workflow,
  },
];

export const industries = [
  {
    title: "Dental and Physiotherapy Clinics",
    description:
      "Automate patient intake, appointment requests, missed-call follow-up, treatment FAQs, and reactivation campaigns.",
    icon: HeartPulse,
    outcomes: ["Fewer missed inquiries", "Cleaner intake", "More booked consultations"],
  },
  {
    title: "Real Estate Teams",
    description:
      "Qualify buyers and sellers, route hot leads, answer property questions, and follow up with prospects faster.",
    icon: Home,
    outcomes: ["Faster lead response", "Better qualification", "More showing requests"],
  },
  {
    title: "Small Businesses",
    description:
      "Create lean AI systems for service businesses, local operators, consultants, and growing teams with manual admin work.",
    icon: Store,
    outcomes: ["Less admin load", "Consistent follow-up", "Better customer experience"],
  },
];

export const proofPoints = [
  {
    value: "Canada-based",
    label: "Built from Brampton, Ontario for growing businesses across Canada.",
    icon: ShieldCheck,
  },
  {
    value: "Strategy first",
    label: "Every build starts with the business challenge, not the technology trend.",
    icon: ClipboardCheck,
  },
  {
    value: "Lead focused",
    label: "The site, demos, and forms are designed to capture qualified demand.",
    icon: ChartNoAxesCombined,
  },
  {
    value: "Operations ready",
    label: "AI agents connect to the workflows businesses already depend on.",
    icon: Building2,
  },
];

export const process = [
  {
    step: "01",
    title: "Discover the bottleneck",
    description:
      "We interview the business, review the customer journey, and identify where leads, time, or revenue are leaking.",
  },
  {
    step: "02",
    title: "Design the AI system",
    description:
      "We define the workflow, data needed, guardrails, handoff rules, and success metrics before writing code.",
  },
  {
    step: "03",
    title: "Build the working demo",
    description:
      "You see the agent, automation, or AI website in action early so the solution can be refined around real use cases.",
  },
  {
    step: "04",
    title: "Launch and optimize",
    description:
      "We connect the system to your lead flow, monitor performance, and improve prompts, automation steps, and conversion points.",
  },
];

export const demoCards = [
  {
    title: "AI Pain Point Analyzer",
    description:
      "A visitor explains their business and gets a practical AI opportunity map in seconds.",
    icon: Bot,
  },
  {
    title: "Lead Qualification Agent",
    description:
      "The site captures contact details, business context, urgency, budget fit, and next best action.",
    icon: Headphones,
  },
  {
    title: "Workflow ROI Preview",
    description:
      "A guided calculator estimates time saved and shows what automation could remove from the team's week.",
    icon: CalendarCheck,
  },
];

export const faqs = [
  {
    question: "Do you only build websites?",
    answer:
      "No. The website is often the front door, but SyncAi Technologies focuses on AI strategy, automation, AI agents, and business workflows.",
  },
  {
    question: "Can you work with businesses that are new to AI?",
    answer:
      "Yes. The process is designed for business owners who know the challenge but do not yet know the best technical solution.",
  },
  {
    question: "Will pricing be public?",
    answer:
      "No. Projects are scoped after the discovery call because the best solution depends on workflow complexity, integrations, and support needs.",
  },
  {
    question: "Can leads be managed inside the website?",
    answer:
      "Yes. This build includes a private admin dashboard where leads can be reviewed, updated, and moved through a pipeline.",
  },
];

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled" | "no_show";

export const appointmentStatuses: { value: AppointmentStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No Show" },
];

export type LeadStatus = "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";

export const leadStatuses: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal", label: "Proposal Sent" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];
