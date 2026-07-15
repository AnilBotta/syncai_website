"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, Wrench } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { CategoryBars } from "./category-bars";
import { ToolCta } from "./tool-cta";

/*
 * v1 = self-assessment checklist. v2 enhancement: crawl the live site via the
 * Google PageSpeed Insights API and score Speed/Mobile automatically.
 */

const SCALE = ["Not at all", "Somewhat", "Mostly", "Absolutely"];

const CATEGORIES = [
  {
    id: "speed",
    label: "Page Speed & Performance",
    questions: [
      "Does your site load in under 3 seconds on a phone?",
      "Do images and sections appear without jumping around while loading?",
      "Does the site stay fast on slow connections (hotel wifi, cellular)?",
    ],
  },
  {
    id: "mobile",
    label: "Mobile Experience",
    questions: [
      "Is every page fully usable on a phone without pinching or zooming?",
      "Are buttons and links easy to tap (no tiny targets)?",
      "Do forms work smoothly on mobile (right keyboards, no horizontal scroll)?",
    ],
  },
  {
    id: "cta",
    label: "CTA Clarity",
    questions: [
      "Does every page have ONE clear primary action (book, call, buy)?",
      "Can a visitor tell within 5 seconds what you do and who it's for?",
      "Is your main CTA visible without scrolling on the homepage?",
    ],
  },
  {
    id: "trust",
    label: "Trust Signals",
    questions: [
      "Are testimonials or reviews visible on key pages?",
      "Do you show real results, case studies, or credentials?",
      "Is it obvious you're a real business (address, phone, faces, guarantees)?",
    ],
  },
  {
    id: "friction",
    label: "Form & Checkout Friction",
    questions: [
      "Can someone convert (book/buy/inquire) in under 2 minutes?",
      "Do your forms ask only for what you truly need (5 fields or fewer)?",
      "Can visitors convert without creating an account or waiting for a callback?",
    ],
  },
];

const FIXES: Record<string, { title: string; advice: string }> = {
  speed: {
    title: "Speed up your site",
    advice:
      "Compress images to WebP, lazy-load below-the-fold media, and cut unused scripts. Every extra second of load time drops conversions measurably — this is usually the fastest win available.",
  },
  mobile: {
    title: "Fix the mobile experience",
    advice:
      "Most of your traffic is on a phone. Enlarge tap targets, simplify navigation to one thumb-reachable menu, and test every form on a real device — not just a resized browser window.",
  },
  cta: {
    title: "Sharpen your calls-to-action",
    advice:
      "Pick ONE primary action per page and make it visually unmissable. Rewrite button copy from 'Submit' to outcome language ('Get my quote'), and repeat the CTA after every major section.",
  },
  trust: {
    title: "Add visible trust signals",
    advice:
      "Put testimonials next to your CTAs, not on a separate page. Add real numbers (clients served, results achieved), team faces, and any credentials — strangers need proof before they act.",
  },
  friction: {
    title: "Remove conversion friction",
    advice:
      "Cut form fields to the minimum, show progress in multi-step flows, and offer instant self-serve booking instead of 'we'll call you back'. Every extra field or step loses real buyers.",
  },
};

const QUESTIONS_PER_CATEGORY = 3;
const MAX_RAW = QUESTIONS_PER_CATEGORY * 4;

function grade(total: number) {
  if (total < 50) return "Needs Work";
  if (total <= 75) return "Solid Foundation";
  return "Conversion-Ready";
}

export function ConversionAudit() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [finished, setFinished] = useState(false);
  const [siteUrl, setSiteUrl] = useState("");
  const [email, setEmail] = useState("");
  const [captureState, setCaptureState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [captureMessage, setCaptureMessage] = useState("");

  const totalQuestions = CATEGORIES.length * QUESTIONS_PER_CATEGORY;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === totalQuestions;

  const categoryScores = CATEGORIES.map((category) => {
    const raw = category.questions.reduce(
      (sum, _, index) => sum + (answers[`${category.id}-${index}`] || 0),
      0
    );
    return { id: category.id, label: category.label, score: (raw / MAX_RAW) * 20, max: 20 };
  });
  const totalScore = Math.round(categoryScores.reduce((sum, category) => sum + category.score, 0));
  const priorityFixes = [...categoryScores].sort((a, b) => a.score - b.score).slice(0, 2);

  async function submitCapture(event: React.FormEvent) {
    event.preventDefault();
    setCaptureState("sending");
    setCaptureMessage("");
    try {
      const response = await fetch("/api/tools/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "conversion-audit",
          email,
          url: siteUrl,
          summary: `Live conversion audit requested for ${siteUrl} — self-assessment scored ${totalScore}/100 (${grade(totalScore)}). Weakest areas: ${priorityFixes.map((fix) => fix.label).join(", ")}.`,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Could not send your request. Try again.");
      }
      setCaptureState("sent");
      setCaptureMessage(
        result.demoMode
          ? "Request received (demo mode — connect Supabase to store live submissions)."
          : "Request received! We'll audit your live site and email you the findings."
      );
    } catch (error) {
      setCaptureState("error");
      setCaptureMessage(error instanceof Error ? error.message : "Something went wrong.");
    }
  }

  if (!finished) {
    return (
      <GlassCard className="mx-auto max-w-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted">
          <span>Self-assessment</span>
          <span>
            {answeredCount}/{totalQuestions} answered
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-border-subtle">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-electric to-brand-soft transition-[width] duration-500"
            style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
          />
        </div>

        <div className="mt-8 grid gap-10">
          {CATEGORIES.map((category) => (
            <div key={category.id}>
              <p className="text-sm font-black uppercase tracking-[.2em] text-brand">
                {category.label}
              </p>
              <div className="mt-4 grid gap-6">
                {category.questions.map((question, questionIndex) => {
                  const key = `${category.id}-${questionIndex}`;
                  return (
                    <div key={key}>
                      <p className="text-sm font-bold leading-6 text-foreground">{question}</p>
                      <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {SCALE.map((label, optionIndex) => {
                          const selected = answers[key] === optionIndex + 1;
                          return (
                            <button
                              key={label}
                              type="button"
                              role="radio"
                              aria-checked={selected}
                              onClick={() => setAnswers({ ...answers, [key]: optionIndex + 1 })}
                              className={`cursor-pointer rounded-xl border px-2 py-2.5 text-xs font-semibold transition ${
                                selected
                                  ? "border-brand-soft bg-brand/10 text-brand"
                                  : "border-border-subtle bg-[var(--nav-hover-bg)] text-muted hover:border-brand-soft/40 hover:text-foreground/90"
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          disabled={!allAnswered}
          onClick={() => setFinished(true)}
          className="mt-8 inline-flex h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-electric to-brand-soft px-6 text-sm font-bold text-white shadow-[0_6px_20px_var(--accent-glow)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Get my conversion score <ArrowRight className="size-4" />
        </button>
      </GlassCard>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <GlassCard glow className="p-8 text-center">
        <p className="text-sm font-black uppercase tracking-[.2em] text-brand">
          Your conversion score
        </p>
        <p className="mt-3 text-7xl font-black text-brand-glow-text">{totalScore}</p>
        <p className="text-sm text-muted">out of 100</p>
        <p className="mt-4 inline-block rounded-full border border-brand/30 bg-brand/10 px-5 py-2 text-lg font-black text-foreground">
          {grade(totalScore)}
        </p>
      </GlassCard>

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
          Your top 2 priority fixes
        </p>
        <div className="mt-5 grid gap-5">
          {priorityFixes.map((fix) => (
            <div key={fix.id} className="flex gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-brand/25 bg-brand/10 text-brand">
                <Wrench className="size-5" />
              </span>
              <div>
                <p className="font-black text-foreground">{FIXES[fix.id].title}</p>
                <p className="mt-1.5 text-sm leading-7 text-muted">{FIXES[fix.id].advice}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Live-audit capture */}
      <GlassCard className="mt-6 p-6 sm:p-8">
        <p className="font-black text-foreground">Want us to actually audit your live site?</p>
        <p className="mt-1.5 text-sm text-muted">
          Drop your URL and email — we&apos;ll review the real thing and send you specific findings.
        </p>
        {captureState === "sent" ? (
          <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-brand-glow-text">
            <CheckCircle2 className="size-4" /> {captureMessage}
          </p>
        ) : (
          <form onSubmit={submitCapture} className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <input
              type="url"
              required
              value={siteUrl}
              onChange={(event) => setSiteUrl(event.target.value)}
              placeholder="https://yoursite.com"
              className="h-12 rounded-full border border-border-subtle bg-bg-elevated px-5 text-sm text-foreground outline-none transition focus:border-brand-soft focus:ring-4 focus:ring-brand/25"
            />
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              className="h-12 rounded-full border border-border-subtle bg-bg-elevated px-5 text-sm text-foreground outline-none transition focus:border-brand-soft focus:ring-4 focus:ring-brand/25"
            />
            <button
              type="submit"
              disabled={captureState === "sending"}
              className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-electric to-brand-soft px-6 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              {captureState === "sending" ? <Loader2 className="size-4 animate-spin" /> : null}
              Send
            </button>
          </form>
        )}
        {captureState === "error" ? <p className="mt-3 text-sm text-danger">{captureMessage}</p> : null}
      </GlassCard>

      <ToolCta />
    </div>
  );
}
