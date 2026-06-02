import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
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
      <section className="bg-[#f8f9fc] py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
          {demoPages.map((demo) => (
            <Link
              key={demo.title}
              href={demo.href}
              className="group rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#4B0082]/20 hover:shadow-md"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-[#4B0082]/10 text-[#4B0082]">
                <demo.icon className="size-6" />
              </span>
              <h2 className="mt-5 text-xl font-black text-[#161616] group-hover:text-[#4B0082]">{demo.title}</h2>
              <p className="mt-3 leading-7 text-slate-600">{demo.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#4B0082]">
                View Demo <ArrowRight className="size-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
