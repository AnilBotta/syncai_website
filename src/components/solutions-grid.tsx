import Link from "next/link";
import Image from "next/image";
import { MessageSquareText, PhoneCall, Workflow, Sparkles, ArrowRight } from "lucide-react";

const solutions = [
  {
    title: "AI Websites & Apps",
    description: "Modern sites with AI-assisted lead capture, qualification, booking flows, and customer education built in.",
    icon: MessageSquareText,
  },
  {
    title: "AI Voice & Chat Agents",
    description: "Website chat, missed-call recovery, appointment support, FAQs, and follow-up agents for daily operations.",
    icon: PhoneCall,
  },
  {
    title: "Workflow Automation",
    description: "Automations across forms, calendars, email, CRMs, and internal handoffs so teams spend less time on repetitive work.",
    icon: Workflow,
  },
  {
    title: "AI Strategy & Consulting",
    description: "We map business challenges, score AI opportunities, and turn the best ones into a practical roadmap.",
    icon: Sparkles,
  },
];

export function SolutionsGrid() {
  return (
    <section id="solutions" className="relative overflow-hidden bg-[#0f0f1a] py-20 text-white sm:py-28">
      <Image
        src="/brand/syncai-hero-ai-workflow.png"
        alt=""
        width={1792}
        height={1024}
        className="absolute right-0 top-0 h-full w-full object-cover object-center opacity-20 [mask-image:linear-gradient(to_left,black_34%,transparent_100%)] lg:w-[50%]"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(75,0,130,.24),transparent_32%),linear-gradient(180deg,rgba(15,15,26,.88),rgba(26,0,51,.82)_48%,rgba(15,15,26,.95))]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-black uppercase tracking-[.25em] text-[#9400D3]">Solutions</p>
          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
            Everything you need to operationalize AI
          </h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {solutions.map((solution, index) => (
            <div
              key={solution.title}
              className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[.07] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl transition hover:border-[#9400D3]/35 hover:bg-white/[.09]"
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
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/solutions"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-white/15 px-6 text-sm font-bold text-white transition hover:bg-white/10"
          >
            View All Solutions <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
