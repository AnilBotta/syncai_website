import Link from "next/link";
import { ArrowRight, TrendingUp, Users, Target } from "lucide-react";

const metrics = [
  {
    value: "$50K+",
    label: "Revenue Generated",
    description: "Average revenue recovered through AI lead capture and follow-up automation.",
    icon: TrendingUp,
  },
  {
    value: "300+",
    label: "Leads / Month",
    description: "Average qualified leads captured through AI-powered website and agent systems.",
    icon: Users,
  },
  {
    value: "10x",
    label: "Average ROI",
    description: "Return on investment reported by businesses using SyncAI systems.",
    icon: Target,
  },
];

export function ResultsMetrics() {
  return (
    <section id="results" className="relative overflow-hidden bg-[#0f0f1a] py-20 text-white sm:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(75,0,130,.15),transparent_50%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-black uppercase tracking-[.25em] text-[#9400D3]">Results</p>
          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
            Real ROI for real businesses
          </h2>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-[2rem] border border-white/10 bg-white/[.06] p-8 text-center backdrop-blur-sm transition hover:border-[#9400D3]/30">
              <metric.icon className="mx-auto size-8 text-[#9400D3]" />
              <p className="mt-5 text-5xl font-black text-white">{metric.value}</p>
              <p className="mt-2 text-sm font-bold uppercase tracking-[.15em] text-[#D9A0FF]">{metric.label}</p>
              <p className="mt-4 text-sm leading-6 text-slate-400">{metric.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/case-studies"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-white/15 px-6 text-sm font-bold text-white transition hover:bg-white/10"
          >
            View Case Studies <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
