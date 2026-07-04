"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlowButton } from "@/components/ui/glow-button";
import { OptionGrid } from "./option-grid";
import { ArrowRight, Check } from "lucide-react";

/* Price matrix — edit these tables to retune the estimator. */
const BASE_PRICE_BY_COMPLEXITY: Record<string, number> = {
  simple: 1500,
  multiStep: 4000,
  fullAgent: 9000,
};
const BASE_MONTHLY_BY_COMPLEXITY: Record<string, number> = {
  simple: 150,
  multiStep: 350,
  fullAgent: 700,
};
const PER_INTEGRATION_COST = 500; // one-time, per integration
const VOICE_ADD_ON = { oneTime: 2500, monthly: 300 };
const MULTILINGUAL_MULTIPLIER = 1.2;
const VOLUME_MULTIPLIER: Record<string, number> = {
  "lt500": 1,
  "500to2000": 1.15,
  "2000to10000": 1.4,
  "gt10000": 1.8,
};
const ESTIMATE_BAND = 0.15; // ±15% so results read as an estimate, not a quote

const COMPLEXITY_LABELS: Record<string, string> = {
  simple: "Simple FAQ bot",
  multiStep: "Multi-step logic & lead capture",
  fullAgent: "Full AI agent with system integrations",
};

const INTEGRATIONS = [
  "CRM",
  "Calendar/booking",
  "Payment processing",
  "WhatsApp",
  "Website widget only",
];

export function ChatbotCostCalculator() {
  const [type, setType] = useState<string | null>(null);
  const [volume, setVolume] = useState<string | null>(null);
  const [complexity, setComplexity] = useState<string | null>(null);
  const [integrations, setIntegrations] = useState<string[]>([]);
  const [multilingual, setMultilingual] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  const ready = type && volume && complexity && multilingual;

  const money = (value: number) =>
    Math.round(value).toLocaleString("en-CA", {
      style: "currency",
      currency: "CAD",
      maximumFractionDigits: 0,
    });

  function toggleIntegration(name: string) {
    setIntegrations((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name]
    );
    setShowResults(false);
  }

  let results = null;
  if (ready && showResults) {
    const includesVoice = type === "voice" || type === "both";
    const isMultilingual = multilingual === "yes";
    const multiplier = isMultilingual ? MULTILINGUAL_MULTIPLIER : 1;

    const finalOneTime =
      (BASE_PRICE_BY_COMPLEXITY[complexity] +
        integrations.length * PER_INTEGRATION_COST +
        (includesVoice ? VOICE_ADD_ON.oneTime : 0)) *
      multiplier;
    const finalMonthly =
      (BASE_MONTHLY_BY_COMPLEXITY[complexity] + (includesVoice ? VOICE_ADD_ON.monthly : 0)) *
      VOLUME_MULTIPLIER[volume] *
      multiplier;

    results = {
      oneTimeLow: finalOneTime * (1 - ESTIMATE_BAND),
      oneTimeHigh: finalOneTime * (1 + ESTIMATE_BAND),
      monthlyLow: finalMonthly * (1 - ESTIMATE_BAND),
      monthlyHigh: finalMonthly * (1 + ESTIMATE_BAND),
      includesVoice,
      isMultilingual,
    };
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
      <GlassCard className="grid h-fit gap-7 p-6 sm:p-8">
        <div>
          <p className="mb-3 font-bold text-foreground">What do you need?</p>
          <OptionGrid
            columns={2}
            value={type}
            onChange={(value) => {
              setType(value);
              setShowResults(false);
            }}
            options={[
              { value: "chat", label: "Chatbot only" },
              { value: "voice", label: "Voice bot only" },
              { value: "both", label: "Both", hint: "Chat + voice, one brain" },
            ]}
          />
        </div>

        <div>
          <p className="mb-3 font-bold text-foreground">Expected monthly conversation volume</p>
          <OptionGrid
            columns={2}
            value={volume}
            onChange={(value) => {
              setVolume(value);
              setShowResults(false);
            }}
            options={[
              { value: "lt500", label: "Under 500" },
              { value: "500to2000", label: "500 – 2,000" },
              { value: "2000to10000", label: "2,000 – 10,000" },
              { value: "gt10000", label: "10,000+" },
            ]}
          />
        </div>

        <div>
          <p className="mb-3 font-bold text-foreground">Complexity</p>
          <OptionGrid
            value={complexity}
            onChange={(value) => {
              setComplexity(value);
              setShowResults(false);
            }}
            options={[
              { value: "simple", label: "Simple FAQ bot", hint: "Answers common questions" },
              { value: "multiStep", label: "Multi-step logic & lead capture", hint: "Qualifies and routes leads" },
              { value: "fullAgent", label: "Full AI agent with system integrations", hint: "Books, updates records, takes action" },
            ]}
          />
        </div>

        <div>
          <p className="mb-3 font-bold text-foreground">Integrations needed</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {INTEGRATIONS.map((integration) => {
              const checked = integrations.includes(integration);
              return (
                <button
                  key={integration}
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  onClick={() => toggleIntegration(integration)}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                    checked
                      ? "border-brand-soft bg-brand-deep/25 text-brand-glow-text"
                      : "border-border-subtle bg-surface text-foreground/90 hover:border-brand-soft/40"
                  }`}
                >
                  <span
                    className={`grid size-5 shrink-0 place-items-center rounded-md border ${
                      checked ? "border-brand-soft bg-brand text-white" : "border-border-subtle"
                    }`}
                  >
                    {checked ? <Check className="size-3.5" /> : null}
                  </span>
                  {integration}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-3 font-bold text-foreground">Multilingual support needed?</p>
          <OptionGrid
            columns={2}
            value={multilingual}
            onChange={(value) => {
              setMultilingual(value);
              setShowResults(false);
            }}
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
          />
        </div>

        <button
          type="button"
          disabled={!ready}
          onClick={() => setShowResults(true)}
          className="inline-flex h-[52px] cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-electric to-brand-soft px-6 text-sm font-bold text-white shadow-[0_0_24px_rgba(160,120,255,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_0_36px_rgba(160,120,255,0.45)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Estimate my cost <ArrowRight className="size-4" />
        </button>
      </GlassCard>

      <div>
        {results && complexity ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <GlassCard glow className="p-6 text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">One-time build</p>
                <p className="mt-2 text-2xl font-black text-brand-glow-text sm:text-3xl">
                  {money(results.oneTimeLow)} – {money(results.oneTimeHigh)}
                </p>
              </GlassCard>
              <GlassCard glow className="p-6 text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Ongoing / month</p>
                <p className="mt-2 text-2xl font-black text-brand-glow-text sm:text-3xl">
                  {money(results.monthlyLow)} – {money(results.monthlyHigh)}
                </p>
              </GlassCard>
            </div>

            <GlassCard className="mt-5 p-6">
              <p className="text-sm font-black uppercase tracking-[.2em] text-brand-soft">
                What&apos;s driving the cost
              </p>
              <ul className="mt-4 grid gap-2.5 text-sm text-foreground/90">
                <li className="flex justify-between gap-4">
                  <span>{COMPLEXITY_LABELS[complexity]}</span>
                  <span className="font-bold tabular-nums text-muted">
                    {money(BASE_PRICE_BY_COMPLEXITY[complexity])} + {money(BASE_MONTHLY_BY_COMPLEXITY[complexity])}/mo
                  </span>
                </li>
                {integrations.map((integration) => (
                  <li key={integration} className="flex justify-between gap-4">
                    <span>{integration} integration</span>
                    <span className="font-bold tabular-nums text-muted">{money(PER_INTEGRATION_COST)}</span>
                  </li>
                ))}
                {results.includesVoice ? (
                  <li className="flex justify-between gap-4">
                    <span>Voice bot add-on</span>
                    <span className="font-bold tabular-nums text-muted">
                      {money(VOICE_ADD_ON.oneTime)} + {money(VOICE_ADD_ON.monthly)}/mo
                    </span>
                  </li>
                ) : null}
                {results.isMultilingual ? (
                  <li className="flex justify-between gap-4">
                    <span>Multilingual support</span>
                    <span className="font-bold tabular-nums text-muted">×1.2 on everything</span>
                  </li>
                ) : null}
                <li className="flex justify-between gap-4 border-t border-border-subtle pt-2.5">
                  <span>Conversation volume</span>
                  <span className="font-bold tabular-nums text-muted">
                    ×{VOLUME_MULTIPLIER[volume!]} on monthly
                  </span>
                </li>
              </ul>
            </GlassCard>

            <div className="mt-6 rounded-[16px] border border-brand/25 bg-[radial-gradient(circle_at_50%_0%,rgba(148,0,211,0.14),transparent_70%)] p-6 text-center">
              <p className="font-black text-foreground">This is a ballpark — book a call for an exact quote.</p>
              <div className="mt-4 flex justify-center">
                <GlowButton href="/book">
                  Book a free call <ArrowRight className="size-4" />
                </GlowButton>
              </div>
            </div>
          </>
        ) : (
          <GlassCard className="grid h-full min-h-64 place-items-center p-8 text-center">
            <p className="max-w-xs text-sm leading-7 text-muted">
              Answer the questions and hit <span className="font-bold text-foreground">Estimate</span> —
              you&apos;ll get an honest price range with a full breakdown of what drives it.
            </p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
