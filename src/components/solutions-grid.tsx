import Link from "next/link";
import Image from "next/image";
import { MessageSquareText, PhoneCall, Workflow, Sparkles, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { Parallax } from "@/components/motion/parallax";

const solutions = [
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

export function SolutionsGrid() {
  return (
    <section id="solutions" className="relative overflow-hidden bg-[#0f0f1a] py-20 text-white sm:py-28">
      <Parallax amount={40} className="absolute right-0 top-0 h-full w-full lg:w-[50%]">
        <Image
          src="/brand/syncai-hero-ai-workflow.png"
          alt=""
          width={1792}
          height={1024}
          className="h-full w-full object-cover object-center opacity-20 [mask-image:linear-gradient(to_left,black_34%,transparent_100%)]"
        />
      </Parallax>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(75,0,130,.24),transparent_32%),linear-gradient(180deg,rgba(15,15,26,.88),rgba(26,0,51,.82)_48%,rgba(15,15,26,.95))]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-black uppercase tracking-[.25em] text-[#9400D3]">Solutions</p>
          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
            Everything you need to operationalize AI
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {solutions.map((solution, index) => (
            <Reveal key={solution.title} delay={index * 0.08}>
              <TiltCard className="h-full rounded-[2rem]">
                <Link
                  href={solution.href}
                  className="group relative block h-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[.07] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl transition hover:border-[#9400D3]/35 hover:bg-white/[.09]"
                >
                  <div className="absolute right-5 top-4 text-6xl font-black text-white/[.035]">
                    0{index + 1}
                  </div>
                  <div className="relative">
                    <span className="grid size-12 place-items-center rounded-2xl border border-[#9400D3]/20 bg-[#4B0082]/15 text-[#D9A0FF] shadow-[0_0_32px_rgba(148,0,211,.22)]">
                      <solution.icon className="size-6" />
                    </span>
                    <h3 className="mt-6 text-xl font-black">{solution.title}</h3>
                    <p className="mt-3 leading-7 text-slate-300">{solution.description}</p>
                  </div>
                </Link>
              </TiltCard>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/demos"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-white/15 px-6 text-sm font-bold text-white transition hover:bg-white/10"
          >
            View All Demos <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
