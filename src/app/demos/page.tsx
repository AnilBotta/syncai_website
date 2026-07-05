import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { MessageSquareText, PhoneCall, Workflow, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Demos",
  description: "Explore live demos of SyncAI's AI websites, voice agents, workflow automation, and strategy consulting.",
};

const demoPages = [
  {
    title: "AI Websites & Apps",
    description: "Modern sites with AI-assisted lead capture, qualification, booking flows, and customer education built in.",
    icon: MessageSquareText,
    href: "/demos/ai-websites-and-apps",
  },
  {
    title: "AI Voice & Chat Agents",
    description: "Website chat, missed-call recovery, appointment support, FAQs, and follow-up agents for daily operations.",
    icon: PhoneCall,
    href: "/demos/ai-voice-and-chat-agents",
  },
  {
    title: "Workflow Automation",
    description: "Automations across forms, calendars, email, CRMs, and internal handoffs so teams spend less time on repetitive work.",
    icon: Workflow,
    href: "/demos/workflow-automation",
  },
  {
    title: "AI Strategy & Consulting",
    description: "We map business challenges, score AI opportunities, and turn the best ones into a practical roadmap.",
    icon: Sparkles,
    href: "/demos/ai-strategy-and-consulting",
  },
];

export default function DemosPage() {
  return (
    <PageShell
      eyebrow="Demos"
      title="See SyncAI in action"
      description="Explore live demos of our AI solutions — websites, agents, automations, and strategy in action."
    >
      <section className="bg-bg-base py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
          {demoPages.map((demo, index) => (
            <Reveal key={demo.title} delay={(index % 2) * 0.08}>
              <TiltCard className="h-full rounded-[16px]">
                <Link href={demo.href} className="group block h-full">
                  <GlassCard className="h-full p-6">
                    <span className="flex size-12 items-center justify-center rounded-2xl border border-brand/25 bg-brand/10 text-brand shadow-[0_0_32px_rgba(148,0,211,.22)]">
                      <demo.icon className="size-6" />
                    </span>
                    <h2 className="mt-5 text-xl font-black text-foreground transition group-hover:text-brand-glow-text">
                      {demo.title}
                    </h2>
                    <p className="mt-3 leading-7 text-muted">{demo.description}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-glow-text">
                      View Demo <ArrowRight className="size-3" />
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
