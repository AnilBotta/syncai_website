import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { GlowButton } from "@/components/ui/glow-button";
import { Reveal } from "@/components/motion/reveal";
import { getService, services } from "@/lib/services-data";
import { ArrowRight, Check, PlayCircle } from "lucide-react";

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) {
    return { title: "Service not found" };
  }
  return { title: service.title, description: service.description };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getService(slug);

  if (!service) {
    notFound();
  }

  return (
    <PageShell eyebrow={`Service ${service.number}`} title={service.title} description={service.description}>
      <section className="bg-bg-base py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.2fr_.8fr] lg:px-8">
          <Reveal>
            <GlassCard className="p-8">
              <h2 className="text-2xl font-black text-foreground">What&apos;s included</h2>
              <ul className="mt-6 grid gap-4">
                {service.includes.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-brand/30 bg-brand/10 text-brand-glow-text">
                      <Check className="size-3.5" />
                    </span>
                    <span className="leading-7 text-foreground/90">{item}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </Reveal>

          <div className="grid content-start gap-6">
            <Reveal delay={0.08}>
              <GlassCard glow className="p-7">
                <p className="text-sm font-black uppercase tracking-[.2em] text-brand">Outcomes</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {service.outcomes.map((outcome) => (
                    <span
                      key={outcome}
                      className="rounded-full border border-border-subtle bg-surface px-3 py-1.5 text-xs font-bold text-brand-glow-text"
                    >
                      {outcome}
                    </span>
                  ))}
                </div>
                <p className="mt-5 text-sm leading-6 text-muted">{service.tagline}.</p>
              </GlassCard>
            </Reveal>

            {service.demoHref ? (
              <Reveal delay={0.14}>
                <Link href={service.demoHref} className="group block">
                  <GlassCard className="flex items-center gap-4 p-6">
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-brand/25 bg-brand/10 text-brand-glow-text">
                      <PlayCircle className="size-6" />
                    </span>
                    <div>
                      <p className="font-black text-foreground transition group-hover:text-brand-glow-text">
                        See the live demo
                      </p>
                      <p className="mt-1 text-sm text-muted">Experience this service in action.</p>
                    </div>
                    <ArrowRight className="ml-auto size-4 text-brand-glow-text transition group-hover:translate-x-1" />
                  </GlassCard>
                </Link>
              </Reveal>
            ) : null}

            <Reveal delay={0.2}>
              <GlassCard className="p-7 text-center">
                <p className="text-lg font-black text-foreground">Sound like your bottleneck?</p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  A free 30-minute strategy call maps the exact system for your business.
                </p>
                <div className="mt-5 flex justify-center">
                  <GlowButton href="/book">
                    Book a free call <ArrowRight className="size-4" />
                  </GlowButton>
                </div>
              </GlassCard>
            </Reveal>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
