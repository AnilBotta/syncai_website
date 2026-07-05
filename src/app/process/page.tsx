import { PageShell } from "@/components/page-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { process } from "@/lib/site-data";

export default function ProcessPage() {
  return (
    <PageShell
      eyebrow="Process"
      title="A consulting process built around business outcomes."
      description="The goal is to avoid random AI experiments. Every engagement starts by understanding the business, then ships a focused AI solution."
    >
      <section className="bg-bg-base py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {process.map((item, index) => (
            <Reveal key={item.step} delay={index * 0.08}>
              <TiltCard className="h-full rounded-[16px]">
                <GlassCard className="h-full p-6">
                  <p className="text-sm font-black text-brand">{item.step}</p>
                  <h2 className="mt-4 text-xl font-black text-foreground">{item.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-muted">{item.description}</p>
                </GlassCard>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
