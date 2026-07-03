import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Chapter } from "./chapter";
import { GlowButton } from "@/components/ui/glow-button";
import { GlassCard } from "@/components/ui/glass-card";

const serviceChapters = [
  {
    align: "left" as const,
    number: "01",
    title: "AI Websites & Lead Systems",
    description:
      "Modern websites with AI-assisted lead capture, qualification, booking flows, and customer education built in — your site becomes your best salesperson.",
    bullets: ["AI lead capture & qualification", "Built-in booking flows", "Customer education on autopilot"],
    href: "/demos/ai-websites-and-apps",
  },
  {
    align: "right" as const,
    number: "02",
    title: "AI Voice & Chat Agents",
    description:
      "Website chat, missed-call recovery, appointment support, FAQs, intake, and follow-up agents that work your front desk 24/7.",
    bullets: ["24/7 call & chat response", "Missed-call recovery", "Hands-free appointment booking"],
    href: "/demos/ai-voice-and-chat-agents",
  },
  {
    align: "left" as const,
    number: "03",
    title: "Workflow Automation",
    description:
      "Automations across forms, calendars, email, CRMs, spreadsheets, and internal handoffs — so your team stops doing robot work.",
    bullets: ["CRM & calendar sync", "Automated follow-ups", "Zero-touch internal handoffs"],
    href: "/demos/workflow-automation",
  },
  {
    align: "right" as const,
    number: "04",
    title: "AI Strategy & Consulting",
    description:
      "We map business challenges, score AI opportunities, and turn the best ones into a practical implementation roadmap.",
    bullets: ["Opportunity scoring", "Practical roadmaps", "Strategy before technology"],
    href: "/demos/ai-strategy-and-consulting",
  },
];

const metrics = [
  { value: "24/7", label: "Customer response" },
  { value: "3x", label: "Faster follow-ups" },
  { value: "-80%", label: "Manual work" },
];

/** The 7 overlay chapters of the homepage tour (server-rendered content). */
export function TourChapters() {
  return (
    <>
      {/* Chapter 1 — Hero */}
      <Chapter align="left">
        <div className="flex flex-wrap gap-2">
          {["Canada-Based", "Built for SMBs", "Custom AI Systems"].map((chip) => (
            <span
              key={chip}
              className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-bg-deep/60 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted backdrop-blur-md"
            >
              {chip}
            </span>
          ))}
        </div>
        <h1 className="mt-6 text-[clamp(2.2rem,5vw,4.5rem)] font-bold leading-[1.05] tracking-tighter text-foreground">
          Step Inside the <span className="text-gradient-brand">AI Systems</span> That Run Your Business
        </h1>
        <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">
          SyncAI builds custom AI websites, voice agents, chatbots, and automations. Scroll to tour
          the machine.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <GlowButton href="/book" size="lg">
            Book a Strategy Call <ArrowRight className="size-4" />
          </GlowButton>
          <GlowButton href="/demos" variant="ghost" size="lg">
            <Sparkles className="size-4" /> Explore Demos
          </GlowButton>
        </div>
        <p className="mt-10 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.2em] text-muted">
          <span className="inline-block h-8 w-px animate-pulse bg-gradient-to-b from-brand-soft to-transparent" />
          Scroll to explore
        </p>
      </Chapter>

      {/* Chapters 2-5 — Services */}
      {serviceChapters.map((service) => (
        <Chapter key={service.number} align={service.align}>
          <p className="text-sm font-black uppercase tracking-[.3em] text-brand-soft">
            Chapter {service.number}
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-5xl">
            {service.title}
          </h2>
          <p className="mt-4 text-lg leading-8 text-muted">{service.description}</p>
          <ul className="mt-6 grid gap-2.5">
            {service.bullets.map((bullet) => (
              <li key={bullet} className="flex items-center gap-3 text-sm font-semibold text-foreground/90">
                <span className="size-1.5 rounded-full bg-brand-soft shadow-[0_0_8px_rgba(160,120,255,0.9)]" />
                {bullet}
              </li>
            ))}
          </ul>
          <Link
            href={service.href}
            className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-brand-glow-text transition hover:gap-3"
          >
            See the live demo <ArrowRight className="size-4" />
          </Link>
        </Chapter>
      ))}

      {/* Chapter 6 — Results (copy left, bar columns right) */}
      <Chapter align="left">
        <p className="text-sm font-black uppercase tracking-[.3em] text-brand-soft">The Payoff</p>
        <h2 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-5xl">
          Real ROI for real businesses
        </h2>
        <p className="mt-4 text-lg leading-8 text-muted">
          Systems that answer every inquiry, follow up faster, and hand the busywork to machines.
        </p>
        <div className="mt-8 grid max-w-md grid-cols-3 gap-3">
          {metrics.map((metric) => (
            <GlassCard key={metric.label} className="px-3 py-5">
              <p className="text-2xl font-black text-brand-glow-text sm:text-3xl">{metric.value}</p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                {metric.label}
              </p>
            </GlassCard>
          ))}
        </div>
      </Chapter>

      {/* Chapter 7 — CTA (copy right, glowing core left) */}
      <Chapter align="right">
        <h2 className="text-4xl font-black tracking-tight text-foreground sm:text-6xl">
          Ready to <span className="text-gradient-brand">sync</span> your business with AI?
        </h2>
        <p className="mt-5 max-w-md text-lg leading-8 text-muted">
          A free 30-minute strategy call. Real recommendations, plain language, no pressure.
        </p>
        <div className="mt-9 flex flex-wrap gap-4">
          <GlowButton href="/book" size="lg" className="animate-pulse-glow">
            Book Your Free Strategy Call <ArrowRight className="size-4" />
          </GlowButton>
          <GlowButton href="/contact" variant="ghost" size="lg">
            Send a Message
          </GlowButton>
        </div>
      </Chapter>
    </>
  );
}
