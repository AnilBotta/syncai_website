import { PageShell } from "@/components/page-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Reveal } from "@/components/motion/reveal";
import { industries } from "@/lib/site-data";

export default function IndustriesPage() {
  return (
    <PageShell
      eyebrow="Industries"
      title="AI systems for clinics, real estate, and small businesses."
      description="SyncAI Technologies can serve many business types, while the first version focuses on industries where lead speed, intake quality, and follow-up matter immediately."
    >
      <section className="bg-bg-base py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:px-8">
          {industries.map((industry, index) => (
            <Reveal key={industry.title} delay={index * 0.08}>
              <GlassCard className="p-7">
                <div className="flex flex-col gap-5 md:flex-row md:items-start">
                  <span className="grid size-14 shrink-0 place-items-center rounded-2xl border border-brand/25 bg-brand-deep/20 text-brand-glow-text">
                    <industry.icon className="size-7" />
                  </span>
                  <div>
                    <h2 className="text-2xl font-black text-foreground">{industry.title}</h2>
                    <p className="mt-3 max-w-3xl leading-7 text-muted">{industry.description}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {industry.outcomes.map((outcome) => (
                        <span
                          key={outcome}
                          className="rounded-full border border-border-subtle bg-surface px-3 py-1 text-xs font-bold text-brand-glow-text"
                        >
                          {outcome}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
