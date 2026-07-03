import type { Metadata } from "next";
import { DemoPageShell } from "@/components/demo-page-shell";
import { Search, ClipboardList, Code2, TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Strategy & Consulting",
  description: "See how SyncAI analyzes your business, builds a strategy, and implements AI solutions that deliver measurable ROI.",
};

const workflowSteps = [
  {
    number: "01",
    title: "Audit & Discover",
    description: "We interview your team, review the customer journey, and identify where leads, time, and revenue are leaking. Every bottleneck gets documented and scored.",
    icon: Search,
    outcomes: ["Lead leakage points", "Manual task inventory", "Revenue opportunity score"],
  },
  {
    number: "02",
    title: "Score & Prioritize",
    description: "Each opportunity is ranked by effort, cost, and expected ROI. We surface the highest-impact projects first so you invest where it matters most.",
    icon: ClipboardList,
    outcomes: ["ROI-ranked project list", "Effort vs. impact matrix", "Priority roadmap"],
  },
  {
    number: "03",
    title: "Design & Build",
    description: "We design the AI system — website, agent, or automation — and build a working prototype. You see it early and refine it around real use cases.",
    icon: Code2,
    outcomes: ["Working prototype", "Integration plan", "Success metrics defined"],
  },
  {
    number: "04",
    title: "Deploy & Optimize",
    description: "We launch the system, connect it to your lead flow, and monitor performance. Prompts, automation steps, and conversion points are continuously improved.",
    icon: TrendingUp,
    outcomes: ["Live system deployed", "KPI dashboard", "Monthly optimization"],
  },
];

export default function AiStrategyPage() {
  return (
    <DemoPageShell
      title="AI Strategy & Consulting"
      tagline="Demo"
      description="We map business challenges, score AI opportunities, and turn the best ones into a practical roadmap that improves ROI and frees your team."
    >
      {/* Workflow section */}
      <section className="bg-bg-base py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-5xl">
              From discovery to deployment
            </h2>
            <p className="mt-5 text-lg leading-8 text-muted">
              Our proven 4-step process takes your business from identifying bottlenecks to running AI systems that deliver measurable results.
            </p>
          </div>

          <div className="mt-16 grid gap-8">
            {workflowSteps.map((step, index) => (
              <div key={step.number} className="relative grid gap-6 rounded-[2rem] border border-border-subtle bg-surface backdrop-blur-md p-8 shadow-sm md:grid-cols-[.4fr_1fr]">
                <div>
                  <div className="flex items-center gap-4">
                    <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-deep/20 text-brand-glow-text">
                      <step.icon className="size-7" />
                    </span>
                    <div>
                      <p className="text-sm font-black text-brand-soft">Step {step.number}</p>
                      <h3 className="text-2xl font-black text-foreground">{step.title}</h3>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-lg leading-8 text-muted">{step.description}</p>
                  <ul className="mt-5 flex flex-wrap gap-3">
                    {step.outcomes.map((o) => (
                      <li key={o} className="rounded-full bg-brand-deep/20 px-4 py-2 text-sm font-bold text-brand-glow-text">
                        {o}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact section */}
      <section className="bg-bg-elevated py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-5xl">
              What this delivers
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: TrendingUp,
                title: "Higher ROI",
                description: "AI investments tied directly to revenue recovery, cost reduction, and lead conversion — not technology for its own sake.",
              },
              {
                icon: Sparkles,
                title: "Freed-Up Staff Time",
                description: "Automate repetitive tasks like intake, follow-ups, and scheduling so your team focuses on high-value work only humans can do.",
              },
              {
                icon: ArrowRight,
                title: "Future-Ready Operations",
                description: "A practical AI roadmap that grows with your business. New systems integrate with existing workflows without disruption.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-[2rem] border border-border-subtle bg-surface backdrop-blur-md p-6 shadow-sm">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-deep/20 text-brand-glow-text">
                  <item.icon className="size-6" />
                </span>
                <h3 className="mt-5 text-xl font-black text-foreground">{item.title}</h3>
                <p className="mt-3 leading-7 text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-bg-deep py-20 text-center text-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black sm:text-5xl">Start with a strategy call</h2>
          <p className="mt-5 text-lg text-muted">
            The first conversation is about finding the right AI use case for your business — no pressure, no sales pitch.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-brand-electric to-brand-soft px-6 text-sm font-bold text-white shadow-[0_0_24px_rgba(160,120,255,0.3)]"
          >
            Book a Strategy Call <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </DemoPageShell>
  );
}
