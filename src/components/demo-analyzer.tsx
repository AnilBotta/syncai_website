"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowRight, Bot, ClipboardList, Loader2, Sparkles } from "lucide-react";
import { LeadForm } from "@/components/lead-form";

type Analysis = {
  summary: string;
  opportunities: string[];
  quickWins: string[];
  recommendedSystem: string;
  estimatedImpact: string;
};

const starter: Analysis = {
  summary:
    "Describe your business and current bottleneck to generate a practical AI opportunity map.",
  opportunities: [
    "Lead qualification",
    "Appointment and follow-up automation",
    "Internal task reduction",
  ],
  quickWins: ["Capture missed inquiries", "Standardize intake questions", "Send faster follow-ups"],
  recommendedSystem: "AI strategy sprint plus a lead-focused website agent.",
  estimatedImpact: "A focused AI system should target hours saved and more qualified conversations.",
};

export function DemoAnalyzer() {
  const [analysis, setAnalysis] = useState<Analysis>(starter);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runDemo(formData: FormData) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/demo/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessType: String(formData.get("businessType") || ""),
          currentProblem: String(formData.get("currentProblem") || ""),
          monthlyLeads: Number(formData.get("monthlyLeads") || 50),
          hoursLostWeekly: Number(formData.get("hoursLostWeekly") || 8),
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not run analysis.");
      }

      setAnalysis(result.analysis);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const demoSummary = [
    analysis.summary,
    `Recommended system: ${analysis.recommendedSystem}`,
    `Impact: ${analysis.estimatedImpact}`,
  ].join("\n");

  return (
    <section id="demo" className="relative overflow-hidden bg-black py-20 text-white sm:py-28">
      <Image
        src="/brand/syncai-hero-ai-workflow.png"
        alt=""
        width={1792}
        height={1024}
        className="absolute inset-0 h-full w-full object-cover object-center opacity-20 [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_72%,transparent)]"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(147,51,234,.3),transparent_34%),linear-gradient(135deg,rgba(0,0,0,.93),rgba(18,0,31,.9)_46%,rgba(0,0,0,.94))]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[.95fr_1.05fr] lg:items-start">
          <div>
            <p className="inline-flex rounded-full border border-purple-300/20 bg-white/[.06] px-4 py-2 text-sm font-bold text-purple-100 backdrop-blur">
              Live AI demo
            </p>
            <h2 className="mt-5 max-w-2xl text-3xl font-black tracking-tight text-white sm:text-5xl">
              Let prospects experience your AI strategy before the call.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              This demo shows the kind of AI experience your site can use to educate a prospect,
              reveal their business challenge, and convert them into a qualified lead.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {["Instant audit", "Qualified context", "Lead handoff"].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/[.055] px-4 py-3 text-sm font-bold text-purple-100 backdrop-blur">
                  {item}
                </div>
              ))}
            </div>

            <form action={runDemo} className="mt-8 grid gap-4 rounded-[2rem] border border-white/10 bg-white/[.075] p-5 shadow-2xl shadow-black/25 backdrop-blur-xl">
              <label className="grid gap-2 text-sm font-semibold text-purple-100">
                Business type
                <input
                  name="businessType"
                  required
                  className="h-12 rounded-2xl border border-white/10 bg-white px-4 text-slate-950 outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/20"
                  placeholder="Dental clinic, real estate team, service business"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-purple-100">
                Current challenge
                <textarea
                  name="currentProblem"
                  required
                  rows={4}
                  className="resize-none rounded-2xl border border-white/10 bg-white px-4 py-3 text-slate-950 outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/20"
                  placeholder="Tell us what slows the business down or where leads are being lost."
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-purple-100">
                  Monthly leads
                  <input
                    name="monthlyLeads"
                    type="number"
                    min="0"
                    defaultValue="50"
                    className="h-12 rounded-2xl border border-white/10 bg-white px-4 text-slate-950 outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/20"
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-purple-100">
                  Admin hours lost weekly
                  <input
                    name="hoursLostWeekly"
                    type="number"
                    min="0"
                    defaultValue="8"
                    className="h-12 rounded-2xl border border-white/10 bg-white px-4 text-slate-950 outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/20"
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-[52px] items-center justify-center gap-2 rounded-full bg-purple-600 px-6 text-sm font-black text-white shadow-[0_18px_50px_rgba(147,51,234,.28)] transition hover:bg-white hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                Generate AI Opportunity Map
              </button>
              {error ? <p className="text-sm text-red-200">{error}</p> : null}
            </form>
          </div>

          <div className="rounded-[2.25rem] border border-white/10 bg-[#050719]/95 p-4 text-white shadow-2xl shadow-purple-950/30">
            <div className="rounded-[1.65rem] border border-white/10 bg-white/[.045] p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-2xl bg-purple-600 text-white">
                    <Bot className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-purple-100">SyncAi Advisor</p>
                    <p className="text-xs text-slate-400">AI opportunity map</p>
                  </div>
                </div>
                <span className="rounded-full border border-purple-300/30 bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-100">
                  Live preview
                </span>
              </div>

              <div className="mt-6 rounded-3xl bg-white p-5 text-slate-950 shadow-xl shadow-black/20">
                <div className="flex items-start gap-3">
                  <ClipboardList className="mt-1 size-5 text-purple-700" />
                  <div>
                    <p className="text-sm font-black uppercase tracking-[.18em] text-purple-700">Summary</p>
                    <p className="mt-2 text-lg font-bold leading-7">{analysis.summary}</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <ResultList title="AI opportunities" items={analysis.opportunities} />
                  <ResultList title="Quick wins" items={analysis.quickWins} />
                </div>

                <div className="mt-6 rounded-3xl bg-slate-100 p-5">
                  <p className="text-sm font-black text-slate-950">Recommended system</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{analysis.recommendedSystem}</p>
                  <p className="mt-4 text-sm font-black text-slate-950">Estimated impact</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{analysis.estimatedImpact}</p>
                </div>
              </div>

              <div className="mt-5 rounded-3xl bg-white p-5 shadow-xl shadow-black/20">
                <div className="mb-4 flex items-center gap-2 text-sm font-black text-slate-950">
                  <ArrowRight className="size-4 text-purple-700" />
                  Send this opportunity to SyncAi
                </div>
                <LeadForm source="ai-demo" compact demoSummary={demoSummary} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ResultList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-3xl border border-slate-200 p-4">
      <p className="text-sm font-black text-slate-950">{title}</p>
      <ul className="mt-3 grid gap-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-6 text-slate-700">
            <span className="mt-2 size-1.5 rounded-full bg-purple-600" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
