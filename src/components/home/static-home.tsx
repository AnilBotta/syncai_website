import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { GlowButton } from "@/components/ui/glow-button";
import { GlassCard } from "@/components/ui/glass-card";
import { SectionShell } from "@/components/ui/section-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { services } from "@/lib/site-data";
import Link from "next/link";

const serviceHrefs: Record<string, string> = {
  "AI Strategy and Consulting": "/demos/ai-strategy-and-consulting",
  "AI Websites and Lead Systems": "/demos/ai-websites-and-apps",
  "AI Voice and Chat Agents": "/demos/ai-voice-and-chat-agents",
  "Workflow Automation": "/demos/workflow-automation",
};

const metrics = [
  { value: "24/7", label: "Customer response" },
  { value: "3x", label: "Faster follow-ups" },
  { value: "-80%", label: "Manual work" },
];

/**
 * Static homepage for mobile, reduced-motion, and no-WebGL visitors — same
 * dark cinematic language, no canvas. This is also the server-rendered output.
 */
export function StaticHome() {
  return (
    <>
      {/* Hero */}
      <SectionShell tier="deep" glow="left" dotGrid className="pt-32 sm:pt-40">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
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
            <h1 className="mt-6 text-[clamp(2.2rem,5vw,4rem)] font-bold leading-[1.05] tracking-tighter text-foreground">
              Step Inside the <span className="text-gradient-brand">AI Systems</span> That Run Your
              Business
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">
              SyncAI builds custom AI websites, voice agents, chatbots, and workflow automations that
              help businesses save time, respond faster, and generate more revenue.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <GlowButton href="/book" size="lg">
                Book a Strategy Call <ArrowRight className="size-4" />
              </GlowButton>
              <GlowButton href="/demos" variant="ghost" size="lg">
                <Sparkles className="size-4" /> Explore Demos
              </GlowButton>
            </div>
          </div>

          <GlassCard glow className="overflow-hidden p-2">
            <div className="relative overflow-hidden rounded-[12px]">
              <Image
                src="/brand/stunning_3d_ai_operations_hub_visualization_for_a_premium_saas_website._central.png"
                alt="AI operations hub visualization"
                width={1792}
                height={1024}
                priority
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-deep via-transparent to-transparent opacity-80" />
            </div>
          </GlassCard>
        </div>
      </SectionShell>

      {/* Services */}
      <SectionShell tier="base" glow="right">
        <SectionHeading
          eyebrow="What we build"
          title="Everything you need to operationalize AI"
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {services.map((service, index) => (
            <Reveal key={service.title} delay={index * 0.08}>
              <TiltCard className="h-full rounded-[16px]">
                <Link href={serviceHrefs[service.title] || "/demos"} className="block h-full">
                  <GlassCard className="h-full p-6">
                    <span className="grid size-12 place-items-center rounded-2xl border border-brand/30 bg-brand-deep/20 text-brand-glow-text shadow-[0_0_32px_rgba(148,0,211,.22)]">
                      <service.icon className="size-6" />
                    </span>
                    <h3 className="mt-6 text-xl font-black text-foreground">{service.title}</h3>
                    <p className="mt-3 leading-7 text-muted">{service.description}</p>
                  </GlassCard>
                </Link>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </SectionShell>

      {/* Results */}
      <SectionShell tier="elevated" glow="center">
        <SectionHeading eyebrow="The payoff" title="Real ROI for real businesses" />
        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-3 gap-4">
          {metrics.map((metric) => (
            <GlassCard key={metric.label} className="px-4 py-6 text-center">
              <p className="text-3xl font-black text-brand-glow-text sm:text-4xl">{metric.value}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted">
                {metric.label}
              </p>
            </GlassCard>
          ))}
        </div>
        <div className="mt-10 text-center">
          <GlowButton href="/book" size="lg">
            Book Your Free Strategy Call <ArrowRight className="size-4" />
          </GlowButton>
        </div>
      </SectionShell>
    </>
  );
}
