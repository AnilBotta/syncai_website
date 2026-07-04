import {
  Bot,
  GraduationCap,
  Megaphone,
  MonitorSmartphone,
  Sparkles,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export type Service = {
  slug: string;
  number: string;
  title: string;
  tagline: string;
  description: string;
  includes: string[];
  outcomes: string[];
  icon: LucideIcon;
  /** Matching live demo page, when one exists. */
  demoHref: string | null;
};

export const services: Service[] = [
  {
    slug: "ai-voice-bots-and-chatbots",
    number: "01",
    title: "AI Voice Bots & Chatbots",
    tagline: "A front desk that never sleeps",
    description:
      "Website chat, missed-call recovery, appointment support, FAQs, intake, and follow-up agents that answer every customer instantly — by text or by voice, 24/7.",
    includes: [
      "Website chat agent trained on your business",
      "AI voice agent for inbound and after-hours calls",
      "Missed-call recovery with instant text-back",
      "Appointment booking inside the conversation",
      "Lead qualification and CRM handoff",
      "Human escalation rules and guardrails",
    ],
    outcomes: ["Every inquiry answered", "After-hours leads captured", "Hands-free bookings"],
    icon: Bot,
    demoHref: "/demos/ai-voice-and-chat-agents",
  },
  {
    slug: "ai-automation-and-workflows",
    number: "02",
    title: "AI Automation & Workflows",
    tagline: "Your team stops doing robot work",
    description:
      "Automations across forms, calendars, email, CRMs, spreadsheets, and internal handoffs — so repetitive admin work runs itself and nothing falls through the cracks.",
    includes: [
      "Workflow mapping of your current process",
      "CRM, calendar, and email integrations",
      "Automated follow-up sequences",
      "Internal handoffs and notifications",
      "Document and data-entry automation",
      "Monitoring and failure alerts",
    ],
    outcomes: ["Hours back every week", "Consistent follow-up", "Fewer manual errors"],
    icon: Workflow,
    demoHref: "/demos/workflow-automation",
  },
  {
    slug: "ai-marketing-and-growth",
    number: "03",
    title: "AI Marketing & Growth",
    tagline: "Content and campaigns on autopilot",
    description:
      "AI-assisted content pipelines, lead nurture sequences, review management, and campaign analytics that keep your pipeline warm without a full-time marketing team.",
    includes: [
      "AI content pipeline for blog and social",
      "Email and SMS nurture sequences",
      "Review request and reputation automation",
      "Lead scoring and segmentation",
      "Campaign performance dashboards",
      "Brand-voice guardrails for every asset",
    ],
    outcomes: ["Consistent publishing", "Warmer pipeline", "Compounding organic reach"],
    icon: Megaphone,
    demoHref: null,
  },
  {
    slug: "ai-strategy-consulting",
    number: "04",
    title: "AI Strategy Consulting",
    tagline: "Strategy before technology",
    description:
      "We map your business challenges, score AI opportunities by ROI, and turn the best ones into a practical implementation roadmap — so you invest in the right system first.",
    includes: [
      "Discovery interviews and process audit",
      "AI opportunity scoring by ROI",
      "Prioritized implementation roadmap",
      "Vendor and build-vs-buy guidance",
      "Data-readiness assessment",
      "Executive summary you can act on",
    ],
    outcomes: ["Clear roadmap", "No wasted pilots", "Fast first win"],
    icon: Sparkles,
    demoHref: "/demos/ai-strategy-and-consulting",
  },
  {
    slug: "ai-training-and-enablement",
    number: "05",
    title: "AI Training & Enablement",
    tagline: "Make your team dangerous with AI",
    description:
      "Hands-on workshops and playbooks that teach your staff to use AI tools safely and productively — prompt skills, approved workflows, and governance your team actually follows.",
    includes: [
      "Role-specific AI workshops",
      "Prompt libraries for daily tasks",
      "Approved-tool policy and governance",
      "Data-safety and privacy training",
      "Internal champions program",
      "Quarterly capability refreshers",
    ],
    outcomes: ["Confident staff", "Safe AI usage", "Productivity lift across roles"],
    icon: GraduationCap,
    demoHref: null,
  },
  {
    slug: "premium-website-development",
    number: "06",
    title: "Premium Website Development",
    tagline: "A website that sells while you sleep",
    description:
      "Modern, immersive websites with AI-assisted lead capture, qualification, booking flows, and customer education built in — your site becomes your best salesperson.",
    includes: [
      "Custom design in your brand language",
      "AI lead capture and qualification built in",
      "Appointment booking flows",
      "Speed, SEO, and analytics foundations",
      "CMS and easy content updates",
      "Chat and voice assistant integration",
    ],
    outcomes: ["More qualified leads", "24/7 self-serve booking", "A brand that stands out"],
    icon: MonitorSmartphone,
    demoHref: "/demos/ai-websites-and-apps",
  },
];

export function getService(slug: string) {
  return services.find((service) => service.slug === slug);
}
