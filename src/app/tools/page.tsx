import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { ArrowRight, Calculator, Gauge, MessageSquareText, SearchCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Free AI Tools",
  description:
    "Free interactive tools from SyncAI: ROI calculator, AI readiness assessment, chatbot cost calculator, and website conversion audit.",
};

const tools = [
  {
    number: "01",
    title: "ROI & Automation Savings Calculator",
    description: "See exactly how many hours and dollars automation would save your business every month.",
    href: "/tools/roi-calculator",
    icon: Calculator,
  },
  {
    number: "02",
    title: "AI Readiness Assessment",
    description: "A 12-question assessment that scores how ready your business is for AI — and what to do next.",
    href: "/tools/ai-readiness",
    icon: Gauge,
  },
  {
    number: "03",
    title: "Chatbot & Voice Bot Cost Calculator",
    description: "Get a realistic ballpark for what your chatbot or voice agent would cost to build and run.",
    href: "/tools/chatbot-cost-calculator",
    icon: MessageSquareText,
  },
  {
    number: "04",
    title: "Website Conversion Audit",
    description: "Score your website across 5 conversion factors and find your two highest-impact fixes.",
    href: "/tools/conversion-audit",
    icon: SearchCheck,
  },
];

export default function ToolsPage() {
  return (
    <PageShell
      eyebrow="Free tools"
      title="Run the numbers before you talk to anyone"
      description="Four free interactive tools — instant results, honest math, no signup required to start."
    >
      <section className="bg-bg-base py-20 sm:py-28">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
          {tools.map((tool, index) => (
            <Reveal key={tool.href} delay={(index % 2) * 0.08}>
              <TiltCard className="h-full rounded-[16px]">
                <Link href={tool.href} className="group block h-full">
                  <GlassCard className="flex h-full flex-col p-6">
                    <div className="flex items-center justify-between">
                      <span className="flex size-12 items-center justify-center rounded-2xl border border-brand/25 bg-brand-deep/20 text-brand-glow-text">
                        <tool.icon className="size-6" />
                      </span>
                      <span className="text-4xl font-black text-white/[.06]">{tool.number}</span>
                    </div>
                    <h2 className="mt-5 text-xl font-black text-foreground transition group-hover:text-brand-glow-text">
                      {tool.title}
                    </h2>
                    <p className="mt-3 flex-1 leading-7 text-muted">{tool.description}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-glow-text">
                      Open tool <ArrowRight className="size-3" />
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
