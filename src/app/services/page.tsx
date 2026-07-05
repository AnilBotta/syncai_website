import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { services } from "@/lib/services-data";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Services",
  description:
    "SyncAI's services: AI voice bots and chatbots, automation and workflows, AI marketing, strategy consulting, team training, and premium website development.",
};

export default function ServicesPage() {
  return (
    <PageShell
      eyebrow="Services"
      title="Six ways we put AI to work for you"
      description="Every service starts with your business challenge and ends with a working system — not a slide deck."
    >
      <section className="bg-bg-base py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-8">
          {services.map((service, index) => (
            <Reveal key={service.slug} delay={(index % 3) * 0.08}>
              <TiltCard className="h-full rounded-[16px]">
                <Link href={`/services/${service.slug}`} className="group block h-full">
                  <GlassCard className="flex h-full flex-col p-6">
                    <div className="flex items-center justify-between">
                      <span className="flex size-12 items-center justify-center rounded-2xl border border-brand/25 bg-brand/10 text-brand">
                        <service.icon className="size-6" />
                      </span>
                      <span className="text-4xl font-black text-white/[.06]">{service.number}</span>
                    </div>
                    <h2 className="mt-5 text-xl font-black text-foreground transition group-hover:text-brand-glow-text">
                      {service.title}
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-brand">{service.tagline}</p>
                    <p className="mt-3 flex-1 text-sm leading-7 text-muted">{service.description}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-glow-text">
                      Learn more <ArrowRight className="size-3" />
                    </span>
                  </GlassCard>
                </Link>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
