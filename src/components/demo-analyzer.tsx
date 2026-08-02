"use client";

import { useState } from "react";
import { ArrowRight, Bot, ClipboardList, Loader2, Sparkles } from "lucide-react";
import { LeadForm } from "@/components/lead-form";
import { TestimonialCarousel } from "@/components/testimonial-carousel";

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
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,var(--accent-glow),transparent_40%),radial-gradient(circle_at_85%_80%,var(--accent-glow),transparent_45%)]"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[.95fr_1.05fr] lg:items-start">
          <div>
            <p className="inline-flex rounded-full border border-brand/25 bg-surface px-4 py-2 text-sm font-bold text-brand-glow-text backdrop-blur">
              Live AI demo
            </p>
            <h2 className="mt-5 max-w-2xl text-3xl font-black tracking-tight text-foreground sm:text-5xl">
              See what AI could do for your business — in seconds.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
              Tell us about your business and your biggest bottleneck. Our AI instantly maps your
              highest-impact opportunities, quick wins, and the admin hours you could win back — no
              call required.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {["Instant analysis", "Tailored to your business", "Free to try"].map((item) => (
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
              className="mt-8 grid gap-4 rounded-[16px] border border-border-subtle bg-surface p-5 shadow-[0_8px_24px_rgba(0,0,0,0.06)] backdrop-blur-xl"
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
                  Leads you get per month
                  <input name="monthlyLeads" type="number" min="0" defaultValue="50" className={inputClass} />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-brand-glow-text">
                  Hours a week lost to admin
                  <input name="hoursLostWeekly" type="number" min="0" defaultValue="8" className={inputClass} />
                </label>
              </div>
              <p className="-mt-1 text-xs leading-5 text-muted">
                Rough estimates about your business today — they just help tailor your results.
              </p>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-[52px] cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-electric to-brand-soft px-6 text-sm font-black text-white shadow-[0_6px_20px_var(--accent-glow)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_26px_var(--accent-glow)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                Generate AI Opportunity Map
              </button>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
            </form>

            {/* Fills the space this column leaves under the form — the grid is
                items-start, so the taller results panel opposite used to sit
                beside dead space. Social proof next to the ask. */}
            <div className="mt-8">
              <TestimonialCarousel compact />
            </div>
          </div>

          <div className="rounded-[16px] border border-border-subtle bg-bg-elevated/95 p-4 text-foreground shadow-[0_8px_24px_rgba(0,0,0,0.07)]">
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

              <div className="mt-6 rounded-[12px] border border-border-subtle bg-bg-elevated p-5 text-foreground shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
                <div className="flex items-start gap-3">
                  <ClipboardList className="mt-1 size-5 text-brand-glow-text" />
                  <div>
                    <p className="text-sm font-black uppercase tracking-[.18em] text-brand-glow-text">Summary</p>
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

              <div className="mt-5 rounded-[12px] border border-border-subtle bg-bg-elevated p-5 shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
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
