import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { GlowButton } from "@/components/ui/glow-button";
import { Reveal } from "@/components/motion/reveal";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Case Studies",
  description: "See how Canadian businesses are using SyncAI to cut costs, capture leads, and grow revenue with custom AI systems.",
};

const caseStudies = [
  {
    industry: "Healthcare",
    title: "Dental Clinic Recovers $50K in Missed Revenue",
    metric: "40% more booked consultations",
    description: "A multi-provider dental clinic was losing after-hours inquiries and struggling with patient intake. SyncAI built an AI website with a lead qualification agent and automated follow-up system.",
    results: ["40% increase in booked consultations", "15 hours/week saved on admin", "24/7 lead capture active"],
  },
  {
    industry: "Real Estate",
    title: "Real Estate Team Captures 300+ Leads/Month",
    metric: "300+ qualified leads monthly",
    description: "A growing real estate team needed to qualify buyer and seller leads faster. SyncAI deployed an AI voice agent for after-hours calls and a lead routing system.",
    results: ["300+ leads captured monthly", "60% of after-hours calls converted", "2min average response time"],
  },
  {
    industry: "Small Business",
    title: "Physiotherapy Clinic Automates Intake",
    metric: "15 hours/week saved",
    description: "A physiotherapy practice was spending 15 hours weekly on manual intake paperwork. SyncAI automated the entire patient intake workflow with AI forms and calendar integration.",
    results: ["15 hours/week admin saved", "100% digital intake adoption", "Same-day booking rate increased"],
  },
];

export default function CaseStudiesPage() {
  return (
    <PageShell
      eyebrow="Case Studies"
      title="Real results from real businesses"
      description="See how Canadian businesses are using SyncAI systems to reduce costs, capture more leads, and grow revenue."
    >
      <section className="bg-bg-base py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:px-8">
          {caseStudies.map((cs, index) => (
            <Reveal key={cs.title} delay={index * 0.08}>
              <GlassCard className="p-8">
                <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
                  <div>
                    <span className="rounded-full border border-brand/25 bg-brand-deep/20 px-3 py-1 text-xs font-bold text-brand-glow-text">
                      {cs.industry}
                    </span>
                    <h2 className="mt-4 text-2xl font-black text-foreground">{cs.title}</h2>
                    <p className="mt-4 leading-7 text-muted">{cs.description}</p>
                    <ul className="mt-6 grid gap-3">
                      {cs.results.map((r) => (
                        <li key={r} className="flex items-center gap-3 text-sm font-semibold text-foreground/90">
                          <span className="size-1.5 rounded-full bg-brand-soft shadow-[0_0_8px_rgba(160,120,255,0.9)]" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-center justify-center rounded-[12px] border border-brand/20 bg-[radial-gradient(circle_at_50%_50%,rgba(148,0,211,0.14),transparent_70%)] p-8 text-center">
                    <div>
                      <p className="text-3xl font-black text-brand-glow-text">{cs.metric}</p>
                      <p className="mt-2 text-sm text-muted">Key result</p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="relative overflow-hidden bg-bg-deep py-20 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(148,0,211,0.16),transparent_55%)]"
        />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-foreground sm:text-5xl">
            Ready to be our next success story?
          </h2>
          <p className="mt-5 text-lg text-muted">
            Book a free strategy call and discover what AI can do for your business.
          </p>
          <div className="mt-8 flex justify-center">
            <GlowButton href="/book" size="lg">
              Book a Strategy Call <ArrowRight className="size-4" />
            </GlowButton>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
