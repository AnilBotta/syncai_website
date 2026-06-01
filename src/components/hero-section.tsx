import Link from "next/link";
import Image from "next/image";
import { ArrowRight, PlayCircle, CheckCircle2 } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#0f0f1a] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(75,0,130,0.32),transparent_34%),linear-gradient(115deg,#0f0f1a_0%,#1a0033_46%,#0f0f1a_100%)]" />
      <div className="relative mx-auto grid min-h-screen max-w-7xl gap-10 px-4 pt-28 pb-14 sm:px-6 lg:grid-cols-[.98fr_1.02fr] lg:items-center lg:px-8 xl:py-32">
        <div className="relative z-10">
          <p className="inline-flex rounded-full border border-[#9400D3]/25 bg-white/5 px-4 py-2 text-sm font-bold text-[#D9A0FF] shadow-[0_0_40px_rgba(148,0,211,.16)] backdrop-blur">
            Canada-based AI strategy and implementation from Brampton, Ontario
          </p>
          <h1 className="mt-7 max-w-3xl text-4xl font-black leading-[1.04] tracking-tight text-white sm:text-5xl lg:text-[3.45rem] xl:text-[3.75rem]">
            AI Solutions That{" "}
            <span className="bg-gradient-to-r from-[#9400D3] via-[#6F00AA] to-[#4B0082] bg-clip-text text-transparent">
              Actually Deliver ROI
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            SyncAI builds custom AI systems — smart websites, voice agents, and workflow automation — that cut costs, capture leads, and grow revenue.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex h-[52px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#4B0082] to-[#9400D3] px-6 text-sm font-black text-white shadow-[0_18px_60px_rgba(75,0,130,0.32)] transition hover:opacity-90"
            >
              Book a Strategy Call
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="#demo"
              className="inline-flex h-[52px] items-center justify-center gap-2 rounded-full border border-white/15 px-6 text-sm font-bold text-white transition hover:bg-white/10"
            >
              <PlayCircle className="size-4" />
              Try the AI Demo
            </Link>
          </div>
          <div className="mt-9 grid gap-3 sm:grid-cols-3">
            {["AI roadmaps", "Lead agents", "Workflow automation"].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-3 py-2 text-sm font-semibold text-slate-200 backdrop-blur">
                <CheckCircle2 className="size-4 text-[#9400D3]" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-[420px] lg:min-h-[500px]">
          <div className="absolute inset-0 rounded-[3rem] bg-[#4B0082]/20 blur-3xl" />
          <Image
            src="/brand/syncai-hero-ai-workflow.png"
            alt="AI workflow connecting website, voice, CRM, calendar, and lead systems"
            width={1792}
            height={1024}
            priority
            className="absolute inset-0 h-full w-full rounded-[2.5rem] object-cover object-center opacity-95 shadow-2xl shadow-[#0f0f1a]/40"
          />
          <div className="absolute inset-0 rounded-[2.5rem] bg-[linear-gradient(90deg,rgba(0,0,0,.18),transparent_42%),linear-gradient(0deg,rgba(0,0,0,.45),transparent_52%)]" />
          <div className="absolute left-4 right-4 top-4 rounded-[1.5rem] border border-white/14 bg-black/35 px-5 py-4 shadow-2xl backdrop-blur-md sm:left-6 sm:right-auto sm:max-w-sm">
            <p className="text-xs font-black uppercase tracking-[.24em] text-[#D9A0FF]">AI growth system</p>
            <p className="mt-2 text-lg font-black">Website, agents, automation, and leads connected.</p>
          </div>
          <div className="absolute bottom-4 left-4 right-4 grid gap-3 rounded-[1.5rem] border border-white/14 bg-black/42 p-4 backdrop-blur-md sm:left-6 sm:right-6 sm:grid-cols-3">
            {[
              ["24/7", "lead capture"],
              ["1", "admin dashboard"],
              ["3", "launch demos"],
            ].map(([value, label]) => (
              <div key={label} className="border-white/10 px-4 py-3 sm:border-r sm:last:border-r-0">
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="text-xs font-semibold text-[#D9A0FF]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
