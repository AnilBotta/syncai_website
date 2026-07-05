"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, Lock } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { CategoryBars } from "./category-bars";
import { ToolCta } from "./tool-cta";

// Flip to false to show the full breakdown without an email.
const EMAIL_GATE_ENABLED = true;

const CATEGORIES = [
  {
    id: "data",
    label: "Data & Systems",
    questions: [
      {
        text: "Are your core business processes documented anywhere?",
        options: [
          "Nothing is written down",
          "A few things live in people's heads and old docs",
          "Most processes have some documentation",
          "Everything is documented and kept current",
        ],
      },
      {
        text: "Where does your customer data live?",
        options: [
          "Paper, memory, or scattered inboxes",
          "Spreadsheets in different places",
          "Mostly in one CRM or system, some stragglers",
          "One central system everyone actually uses",
        ],
      },
      {
        text: "How easily could you export a clean list of all customers and their history?",
        options: [
          "Practically impossible",
          "Days of manual work",
          "A few hours of cleanup",
          "A couple of clicks",
        ],
      },
    ],
  },
  {
    id: "team",
    label: "Team & Process",
    questions: [
      {
        text: "How much of your team's week goes to repetitive manual tasks (data entry, scheduling, follow-ups)?",
        options: [
          "It IS the job — most of every day",
          "A big chunk — 10+ hours a week each",
          "A few hours a week each",
          "Very little — most busywork is already automated",
        ],
      },
      {
        text: "How does your team feel about adopting new tools?",
        options: [
          "Strong resistance to any change",
          "Skeptical but will follow a mandate",
          "Open when the benefit is clear",
          "Actively asks for better tools",
        ],
      },
      {
        text: "How standardized is the way work gets done across your team?",
        options: [
          "Everyone does it their own way",
          "Loose habits, no real standard",
          "Standard steps for the important stuff",
          "Clear playbooks for almost everything",
        ],
      },
    ],
  },
  {
    id: "leadership",
    label: "Leadership & Budget",
    questions: [
      {
        text: "How does ownership/leadership feel about investing in AI?",
        options: [
          "Sees it as hype to avoid",
          "Curious but hasn't committed to anything",
          "Supportive and ready to fund a first project",
          "Championing it as a priority this year",
        ],
      },
      {
        text: "Is there a real budget allocated for automation or AI?",
        options: [
          "No budget at all",
          "Could find some money if the case is strong",
          "A defined pilot budget exists",
          "An ongoing technology budget covers this",
        ],
      },
      {
        text: "Who would own an AI project internally?",
        options: [
          "Nobody has the time or mandate",
          "It would land on someone's side desk",
          "A capable person could take it on",
          "A clear owner with authority is ready",
        ],
      },
    ],
  },
  {
    id: "usage",
    label: "Current AI Usage",
    questions: [
      {
        text: "Is anyone in the business already using AI tools (ChatGPT, Copilot, etc.)?",
        options: [
          "No one, ever",
          "One or two people experiment privately",
          "Several people use them weekly",
          "It's part of how the team works daily",
        ],
      },
      {
        text: "Have you tried automating anything before (Zapier, macros, workflows)?",
        options: [
          "Never tried",
          "Tried once, it fizzled out",
          "A few automations are running",
          "Automation is core to our operations",
        ],
      },
      {
        text: "How comfortable are you evaluating whether an AI answer/output is good?",
        options: [
          "Wouldn't know where to start",
          "Could spot obvious errors",
          "Fairly confident in my judgment",
          "Very confident — we already review AI output",
        ],
      },
    ],
  },
];

const TIERS = [
  {
    min: 0,
    max: 25,
    label: "Not Ready Yet",
    recommendations: [
      "Start by documenting your 3 most important processes — AI can't automate what isn't defined.",
      "Centralize customer data into one system (even a well-kept spreadsheet beats scattered inboxes).",
      "Have one team member trial an AI assistant for a low-risk weekly task to build familiarity.",
    ],
  },
  {
    min: 26,
    max: 50,
    label: "Getting Started",
    recommendations: [
      "Pick ONE pilot automation with obvious ROI — missed-call text-back or intake forms are ideal first wins.",
      "Assign a clear internal owner for the pilot so it doesn't die on someone's side desk.",
      "Set a simple success metric (hours saved or leads captured) before you build anything.",
    ],
  },
  {
    min: 51,
    max: 75,
    label: "Ready to Scale",
    recommendations: [
      "You're past pilots — a full AI strategy engagement will sequence the highest-ROI systems first.",
      "Connect your existing automations to your CRM so data compounds instead of fragmenting.",
      "Formalize an AI usage policy now, before adoption outruns your guardrails.",
    ],
  },
  {
    min: 76,
    max: 100,
    label: "AI-Native",
    recommendations: [
      "You're ready for advanced agentic workflows — AI agents that plan and execute multi-step work.",
      "Audit your current stack for consolidation; mature teams often run redundant AI tools.",
      "Consider proprietary data advantages: fine-tuned assistants trained on your own playbooks.",
    ],
  },
];

const QUESTIONS_PER_CATEGORY = 3;
const MAX_RAW_PER_CATEGORY = QUESTIONS_PER_CATEGORY * 4;

export function AiReadiness() {
  const [step, setStep] = useState(0); // one category per step
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [finished, setFinished] = useState(false);
  const [email, setEmail] = useState("");
  const [unlocked, setUnlocked] = useState(!EMAIL_GATE_ENABLED);
  const [submitting, setSubmitting] = useState(false);
  const [gateError, setGateError] = useState("");

  const category = CATEGORIES[step];
  const answeredInStep = category.questions.every(
    (_, index) => answers[`${category.id}-${index}`] !== undefined
  );

  const categoryScores = CATEGORIES.map((cat) => {
    const raw = cat.questions.reduce(
      (sum, _, index) => sum + (answers[`${cat.id}-${index}`] || 0),
      0
    );
    return { label: cat.label, score: (raw / MAX_RAW_PER_CATEGORY) * 25, max: 25 };
  });
  const totalScore = Math.round(categoryScores.reduce((sum, cat) => sum + cat.score, 0));
  const tier = TIERS.find((t) => totalScore >= t.min && totalScore <= t.max) || TIERS[0];

  async function unlock(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setGateError("");
    try {
      const response = await fetch("/api/tools/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "ai-readiness",
          email,
          summary: `AI Readiness score ${totalScore}/100 (${tier.label}) — requested full results and action plan.`,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Could not save your email. Try again.");
      }
      setUnlocked(true);
    } catch (error) {
      setGateError(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!finished) {
    return (
      <GlassCard className="mx-auto max-w-2xl p-6 sm:p-8">
        {/* Progress */}
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted">
          <span>
            Step {step + 1} of {CATEGORIES.length} — {category.label}
          </span>
          <span>
            {Object.keys(answers).length}/{CATEGORIES.length * QUESTIONS_PER_CATEGORY} answered
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e4e7ea]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-electric to-brand-soft transition-[width] duration-500"
            style={{ width: `${((step + (answeredInStep ? 1 : 0.35)) / CATEGORIES.length) * 100}%` }}
          />
        </div>

        <div className="mt-8 grid gap-8">
          {category.questions.map((question, questionIndex) => {
            const key = `${category.id}-${questionIndex}`;
            return (
              <div key={key}>
                <p className="font-bold text-foreground">{question.text}</p>
                <div className="mt-3 grid gap-2">
                  {question.options.map((option, optionIndex) => {
                    const selected = answers[key] === optionIndex + 1;
                    return (
                      <button
                        key={option}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setAnswers({ ...answers, [key]: optionIndex + 1 })}
                        className={`cursor-pointer rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                          selected
                            ? "border-brand-soft bg-brand/10 text-brand"
                            : "border-border-subtle bg-[#f5f5f5] text-foreground/90 hover:border-brand-soft/40"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep((value) => Math.max(0, value - 1))}
            disabled={step === 0}
            className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-bold text-muted transition hover:text-brand-glow-text disabled:invisible"
          >
            <ArrowLeft className="size-4" /> Back
          </button>
          <button
            type="button"
            disabled={!answeredInStep}
            onClick={() => {
              if (step === CATEGORIES.length - 1) {
                setFinished(true);
              } else {
                setStep(step + 1);
              }
            }}
            className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-brand-electric to-brand-soft px-6 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {step === CATEGORIES.length - 1 ? "See my score" : "Next"}
            <ArrowRight className="size-4" />
          </button>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <GlassCard glow className="p-8 text-center">
        <p className="text-sm font-black uppercase tracking-[.2em] text-brand">
          Your AI readiness score
        </p>
        <p className="mt-3 text-7xl font-black text-brand-glow-text">{totalScore}</p>
        <p className="text-sm text-muted">out of 100</p>
        <p className="mt-4 inline-block rounded-full border border-brand/30 bg-brand/10 px-5 py-2 text-lg font-black text-foreground">
          {tier.label}
        </p>
      </GlassCard>

      {unlocked ? (
        <>
          <GlassCard className="mt-6 p-6 sm:p-8">
            <p className="text-sm font-black uppercase tracking-[.2em] text-brand">
              Category breakdown
            </p>
            <div className="mt-5">
              <CategoryBars categories={categoryScores} />
            </div>
          </GlassCard>

          <GlassCard className="mt-6 p-6 sm:p-8">
            <p className="text-sm font-black uppercase tracking-[.2em] text-brand">
              Your next moves
            </p>
            <ul className="mt-4 grid gap-3">
              {tier.recommendations.map((recommendation) => (
                <li key={recommendation} className="flex items-start gap-3 text-sm leading-7 text-foreground/90">
                  <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand-soft shadow-[0_0_8px_rgba(160,120,255,0.9)]" />
                  {recommendation}
                </li>
              ))}
            </ul>
          </GlassCard>

          <ToolCta />
        </>
      ) : (
        <GlassCard className="mt-6 p-6 text-center sm:p-8">
          <span className="mx-auto grid size-12 place-items-center rounded-full border border-brand/25 bg-brand/10 text-brand">
            <Lock className="size-5" />
          </span>
          <p className="mt-4 font-black text-foreground">
            Enter your email to see your full results + a custom action plan
          </p>
          <p className="mt-2 text-sm text-muted">
            Category-by-category breakdown and the exact next moves for your tier.
          </p>
          <form onSubmit={unlock} className="mx-auto mt-5 flex max-w-md gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              className="h-12 flex-1 rounded-full border border-border-subtle bg-bg-elevated px-5 text-sm text-foreground outline-none transition focus:border-brand-soft focus:ring-4 focus:ring-brand/25"
            />
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-brand-electric to-brand-soft px-6 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
              Unlock
            </button>
          </form>
          {gateError ? <p className="mt-3 text-sm text-red-300">{gateError}</p> : null}
        </GlassCard>
      )}
    </div>
  );
}
