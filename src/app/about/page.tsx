import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { GlowButton } from "@/components/ui/glow-button";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { contact, process, proofPoints } from "@/lib/site-data";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "SyncAI Technologies is a Brampton, Ontario AI agency building practical AI systems — websites, voice agents, chatbots, and automations — for growing businesses.",
};

export default function AboutPage() {
  return (
    <PageShell
      eyebrow="About"
      title="Practical AI, built from Brampton for growing businesses across Canada and beyond"
      titleClassName="text-3xl sm:text-[2.625rem]"
      description="SyncAI Technologies designs and implements custom AI systems — websites, voice agents, chatbots, and workflow automations — that solve real business bottlenecks, not technology trends."
    >
      <section className="bg-bg-base py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="What we stand for"
            title="Strategy first, technology second"
            description={`Based in ${contact.location}, we start every engagement with the business challenge — where leads, time, or revenue are leaking — and only then choose the AI system that fixes it.`}
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {proofPoints.map((point, index) => (
              <Reveal key={point.value} delay={index * 0.08}>
                <TiltCard className="h-full rounded-[16px]">
                  <GlassCard className="h-full p-6">
                    <span className="grid size-12 place-items-center rounded-2xl border border-brand/25 bg-brand/10 text-brand">
                      <point.icon className="size-6" />
                    </span>
                    <h3 className="mt-5 text-lg font-black text-foreground">{point.value}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted">{point.label}</p>
                  </GlassCard>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-bg-elevated py-20 sm:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_25%,rgba(148,0,211,0.12),transparent_45%)]"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="How we work" title="From bottleneck to working system" />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {process.map((step, index) => (
              <Reveal key={step.step} delay={index * 0.08}>
                <GlassCard className="h-full p-6">
                  <p className="text-sm font-black text-brand">{step.step}</p>
                  <h3 className="mt-3 text-lg font-black text-foreground">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted">{step.description}</p>
                </GlassCard>
              </Reveal>
            ))}
          </div>
          <div className="mt-12 text-center">
            <GlowButton href="/book" size="lg">
              Book a Strategy Call <ArrowRight className="size-4" />
            </GlowButton>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
