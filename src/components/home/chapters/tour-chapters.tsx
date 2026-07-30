import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Chapter } from "./chapter";
import { GlowButton } from "@/components/ui/glow-button";

const serviceChapters = [
  {
    align: "left" as const,
    title: "AI Websites & Lead Systems",
    description:
      "Modern websites with AI-assisted lead capture, qualification, booking flows, and customer education built in — your site becomes your best salesperson.",
    bullets: ["AI lead capture & qualification", "Built-in booking flows", "Customer education on autopilot"],
    href: "/demos/ai-websites-and-apps",
  },
  {
    align: "right" as const,
    title: "AI Voice & Chat Agents",
    description:
      "Website chat, missed-call recovery, appointment support, FAQs, intake, and follow-up agents that work your front desk 24/7.",
    bullets: ["24/7 call & chat response", "Missed-call recovery", "Hands-free appointment booking"],
    href: "/demos/ai-voice-and-chat-agents",
  },
  {
    align: "left" as const,
    title: "Workflow Automation",
    description:
      "Automations across forms, calendars, email, CRMs, spreadsheets, and internal handoffs — so your team stops doing robot work.",
    bullets: ["CRM & calendar sync", "Automated follow-ups", "Zero-touch internal handoffs"],
    href: "/demos/workflow-automation",
  },
  {
    align: "right" as const,
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

/**
 * The 7 overlay chapters pinned over the scrubbed hero video (server-rendered).
 * One per segment of the footage — see BEATS in tour-config.
 */
export function TourChapters() {
  return (
    <>
      {/* Chapter 1 — Hero */}
      <Chapter align="left">
        {/* One quiet line rather than three pills — a row of chips in a hero
            reads as a feature badge, not a masthead. */}
        <p className="text-[11px] font-medium uppercase tracking-[.22em] text-label">
          Canada-based · Built for SMBs · Custom AI systems
        </p>
        <h1 className="mt-6 text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.08] text-foreground">
          Step Inside the AI Systems That Run Your Business
        </h1>
        <p className="mt-6 max-w-lg text-[1.0625rem] leading-[1.7] text-muted">
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
        <p className="mt-12 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[.22em] text-label">
          <span className="inline-block h-8 w-px animate-pulse bg-gradient-to-b from-label/60 to-transparent" />
          Scroll to explore
        </p>
      </Chapter>

      {/* Service chapters */}
      {serviceChapters.map((service) => (
        <Chapter key={service.title} align={service.align}>
          <h2 className="text-[clamp(1.75rem,3vw,2.75rem)] font-semibold leading-[1.1] text-foreground">
            {service.title}
          </h2>
          <p className="mt-5 text-[1.0625rem] leading-[1.7] text-muted">{service.description}</p>
          {/* Hairline rules rather than glowing dots: the list should read as
              supporting detail, not as a spec sheet. */}
          <ul className="mt-7 grid gap-3 border-l border-border-subtle pl-5">
            {service.bullets.map((bullet) => (
              <li key={bullet} className="text-[0.9375rem] leading-relaxed text-muted">
                {bullet}
              </li>
            ))}
          </ul>
          <Link
            href={service.href}
            className="mt-8 inline-flex items-center gap-2 text-[0.9375rem] font-medium text-brand-deep underline decoration-brand-deep/25 underline-offset-[6px] transition hover:gap-3 hover:decoration-brand-deep/60"
          >
            See the live demo <ArrowRight className="size-4" />
          </Link>
        </Chapter>
      ))}

      {/* Chapter 6 — Results, over the growth-chart footage */}
      <Chapter align="left">
        <p className="text-[11px] font-medium uppercase tracking-[.22em] text-label">The Payoff</p>
        <h2 className="mt-4 text-[clamp(1.75rem,3vw,2.75rem)] font-semibold leading-[1.1] text-foreground">
          Real ROI for real businesses
        </h2>
        <p className="mt-5 max-w-lg text-[1.0625rem] leading-[1.7] text-muted">
          Systems that answer every inquiry, follow up faster, and hand the busywork to machines.
        </p>
        {/* Numbers carry themselves — the glass cards were doing decorative work
            the figures did not need. */}
        <dl className="mt-9 flex flex-wrap gap-x-12 gap-y-6">
          {metrics.map((metric) => (
            <div key={metric.label}>
              <dt className="text-[clamp(1.75rem,2.4vw,2.25rem)] font-semibold tracking-tight text-foreground">
                {metric.value}
              </dt>
              <dd className="mt-1.5 text-[11px] font-medium uppercase tracking-[.18em] text-label">
                {metric.label}
              </dd>
            </div>
          ))}
        </dl>
      </Chapter>

      {/* Chapter 7 — CTA, over the closing "Ready to sync" frames */}
      <Chapter align="right">
        <h2 className="text-[clamp(2rem,3.6vw,3.25rem)] font-semibold leading-[1.08] text-foreground">
          Ready to sync your business with AI?
        </h2>
        <p className="mt-5 max-w-md text-[1.0625rem] leading-[1.7] text-muted">
          A free 30-minute strategy call. Real recommendations, plain language, no pressure.
        </p>
        {/* WhatsApp lives in the header now — a lone green circle floating next
            to a text link read as a stray element here. */}
        <div className="mt-9">
          <Link
            href="/book"
            className="inline-flex items-center gap-2 text-[1.0625rem] font-medium text-brand-deep underline decoration-brand-deep/25 underline-offset-[6px] transition hover:gap-3 hover:decoration-brand-deep/60"
          >
            Book Your Free Strategy Call <ArrowRight className="size-4" />
          </Link>
        </div>
      </Chapter>
    </>
  );
}
