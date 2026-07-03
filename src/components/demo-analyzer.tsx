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

const inputClass =
  "h-12 rounded-2xl border border-border-subtle bg-bg-elevated px-4 text-foreground outline-none transition focus:border-brand-soft focus:ring-4 focus:ring-brand/25";

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
    <section id="demo" className="relative overflow-hidden bg-bg-deep py-20 text-foreground sm:py-28">
      <Image
        src="/brand/syncai-hero-ai-workflow.png"
        alt=""
        width={1792}
        height={1024}
        className="absolute inset-0 h-full w-full object-cover object-center opacity-20 [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_72%,transparent)]"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(75,0,130,.3),transparent_34%),linear-gradient(135deg,rgba(2,2,3,.93),rgba(26,0,51,.9)_46%,rgba(2,2,3,.94))]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[.95fr_1.05fr] lg:items-start">
          <div>
            <p className="inline-flex rounded-full border border-brand/25 bg-surface px-4 py-2 text-sm font-bold text-brand-glow-text backdrop-blur">
              Live AI demo
            </p>
            <h2 className="mt-5 max-w-2xl text-3xl font-black tracking-tight text-foreground sm:text-5xl">
              Let prospects experience your AI strategy before the call.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
              This demo shows the kind of AI experience your site can use to educate a prospect,
              reveal their business challenge, and convert them into a qualified lead.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {["Instant audit", "Qualified context", "Lead handoff"].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-border-subtle bg-surface px-4 py-3 text-sm font-bold text-brand-glow-text backdrop-blur"
                >
                  {item}
                </div>
              ))}
            </div>

            <form
              action={runDemo}
              className="mt-8 grid gap-4 rounded-[16px] border border-border-subtle bg-surface p-5 shadow-2xl shadow-black/25 backdrop-blur-xl"
            >
              <label className="grid gap-2 text-sm font-semibold text-brand-glow-text">
                Business type
                <input
                  name="businessType"
                  required
                  className={inputClass}
                  placeholder="Dental clinic, real estate team, service business"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-brand-glow-text">
                Current challenge
                <textarea
                  name="currentProblem"
                  required
                  rows={4}
                  className="resize-none rounded-2xl border border-border-subtle bg-bg-elevated px-4 py-3 text-foreground outline-none transition focus:border-brand-soft focus:ring-4 focus:ring-brand/25"
                  placeholder="Tell us what slows the business down or where leads are being lost."
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-brand-glow-text">
                  Monthly leads
                  <input name="monthlyLeads" type="number" min="0" defaultValue="50" className={inputClass} />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-brand-glow-text">
                  Admin hours lost weekly
                  <input name="hoursLostWeekly" type="number" min="0" defaultValue="8" className={inputClass} />
                </label>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-[52px] cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-electric to-brand-soft px-6 text-sm font-black text-white shadow-[0_0_24px_rgba(160,120,255,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_0_36px_rgba(160,120,255,0.45)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                Generate AI Opportunity Map
              </button>
              {error ? <p className="text-sm text-red-300">{error}</p> : null}
            </form>

            <div className="mt-8 overflow-hidden rounded-[16px] border border-border-subtle bg-surface shadow-2xl shadow-black/20 backdrop-blur-xl">
              <div className="relative h-[420px]">
                <Image
                  src="/brand/syncai-lead-handoff-visual.png"
                  alt="AI lead handoff preview showing visitor inquiries becoming a qualified admin lead"
                  width={1792}
                  height={1024}
                  className="h-full w-full object-cover object-center opacity-95"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.74),rgba(0,0,0,.12)),linear-gradient(0deg,rgba(0,0,0,.66),transparent_58%)]" />
                <div className="absolute left-5 top-5 rounded-2xl border border-border-subtle bg-black/45 px-4 py-3 backdrop-blur-md">
                  <p className="text-xs font-black uppercase tracking-[.22em] text-brand-glow-text">Lead handoff</p>
                  <p className="mt-2 max-w-xs text-lg font-black leading-6 text-foreground">
                    Turn visitor intent into a verified opportunity record.
                  </p>
                </div>
                <div className="absolute bottom-5 left-5 right-5 grid gap-3 sm:grid-cols-3">
                  {["Website", "AI agent", "Admin lead"].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-border-subtle bg-white/[.09] px-4 py-3 text-sm font-bold text-foreground backdrop-blur-md"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[16px] border border-border-subtle bg-bg-elevated/95 p-4 text-foreground shadow-2xl shadow-black/30">
            <div className="rounded-[12px] border border-border-subtle bg-surface p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-r from-brand-deep to-brand text-white">
                    <Bot className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-brand-glow-text">SyncAI Advisor</p>
                    <p className="text-xs text-muted">AI opportunity map</p>
                  </div>
                </div>
                <span className="rounded-full border border-brand/30 bg-brand-deep/15 px-3 py-1 text-xs font-bold text-brand-glow-text">
                  Live preview
                </span>
              </div>

              <div className="mt-6 rounded-[12px] border border-border-subtle bg-bg-elevated p-5 text-foreground shadow-xl shadow-black/20">
                <div className="flex items-start gap-3">
                  <ClipboardList className="mt-1 size-5 text-brand-soft" />
                  <div>
                    <p className="text-sm font-black uppercase tracking-[.18em] text-brand-soft">Summary</p>
                    <p className="mt-2 text-lg font-bold leading-7">{analysis.summary}</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <ResultList title="AI opportunities" items={analysis.opportunities} />
                  <ResultList title="Quick wins" items={analysis.quickWins} />
                </div>

                <div className="mt-6 rounded-[12px] bg-surface p-5">
                  <p className="text-sm font-black text-foreground">Recommended system</p>
                  <p className="mt-2 text-sm leading-6 text-muted">{analysis.recommendedSystem}</p>
                  <p className="mt-4 text-sm font-black text-foreground">Estimated impact</p>
                  <p className="mt-2 text-sm leading-6 text-muted">{analysis.estimatedImpact}</p>
                </div>
              </div>

              <div className="mt-5 rounded-[12px] border border-border-subtle bg-bg-elevated p-5 shadow-xl shadow-black/20">
                <div className="mb-4 flex items-center gap-2 text-sm font-black text-foreground">
                  <ArrowRight className="size-4 text-brand-soft" />
                  Send this opportunity to SyncAI
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
    <div className="rounded-[12px] border border-border-subtle p-4">
      <p className="text-sm font-black text-foreground">{title}</p>
      <ul className="mt-3 grid gap-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-6 text-muted">
            <span className="mt-2 size-1.5 rounded-full bg-brand-soft" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
