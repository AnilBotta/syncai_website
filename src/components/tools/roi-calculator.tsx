"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { StatCard } from "./stat-card";
import { ToolCta } from "./tool-cta";

// Share of manual time eliminated by automation. Tune here as real project
// data accumulates (0.85 = 85% of the task is removed).
const AUTOMATION_EFFICIENCY = 0.85;

const WEEKS_PER_MONTH = 4.33;

const inputClass =
  "h-12 w-full rounded-2xl border border-border-subtle bg-bg-elevated px-4 text-foreground outline-none transition focus:border-brand-soft focus:ring-4 focus:ring-brand/25";

type Results = {
  monthlyHoursSaved: number;
  monthlyDollarsSaved: number;
  netMonthlySavings: number;
  paybackMonths: number | null;
  annualROIPercent: number;
};

export function RoiCalculator() {
  const [taskName, setTaskName] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("10");
  const [employees, setEmployees] = useState("2");
  const [hourlyCost, setHourlyCost] = useState("30");
  const [monthlyCost, setMonthlyCost] = useState("500");
  const [setupCost, setSetupCost] = useState("0");
  const [results, setResults] = useState<Results | null>(null);

  function calculate(event: React.FormEvent) {
    event.preventDefault();

    const hours = Math.max(0, Number(hoursPerWeek) || 0);
    const staff = Math.max(0, Number(employees) || 0);
    const rate = Math.max(0, Number(hourlyCost) || 0);
    const automationMonthly = Math.max(0, Number(monthlyCost) || 0);
    const setup = Math.max(0, Number(setupCost) || 0);

    const weeklyHoursSaved = hours * AUTOMATION_EFFICIENCY * staff;
    const monthlyHoursSaved = weeklyHoursSaved * WEEKS_PER_MONTH;
    const monthlyDollarsSaved = monthlyHoursSaved * rate;
    const netMonthlySavings = monthlyDollarsSaved - automationMonthly;
    const paybackMonths =
      setup > 0 && netMonthlySavings > 0 ? setup / netMonthlySavings : null;
    const annualDenominator = automationMonthly * 12 + setup;
    const annualROIPercent =
      annualDenominator > 0 ? ((netMonthlySavings * 12) / annualDenominator) * 100 : 0;

    setResults({
      monthlyHoursSaved,
      monthlyDollarsSaved,
      netMonthlySavings,
      paybackMonths,
      annualROIPercent,
    });
  }

  const money = (value: number) =>
    value.toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
      <GlassCard className="h-fit p-6 sm:p-8">
        <form onSubmit={calculate} className="grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-muted">
            Task being automated <span className="text-xs font-normal">(optional)</span>
            <input
              value={taskName}
              onChange={(event) => setTaskName(event.target.value)}
              className={inputClass}
              placeholder="e.g. Patient intake paperwork"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-muted">
              Hours spent per week
              <input
                type="number"
                min="0"
                required
                value={hoursPerWeek}
                onChange={(event) => setHoursPerWeek(event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-muted">
              Employees doing this task
              <input
                type="number"
                min="0"
                required
                value={employees}
                onChange={(event) => setEmployees(event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-muted">
              Average hourly cost ($)
              <input
                type="number"
                min="0"
                required
                value={hourlyCost}
                onChange={(event) => setHourlyCost(event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-muted">
              Automation cost / month ($)
              <input
                type="number"
                min="0"
                required
                value={monthlyCost}
                onChange={(event) => setMonthlyCost(event.target.value)}
                className={inputClass}
              />
            </label>
          </div>
          <label className="grid gap-2 text-sm font-semibold text-muted">
            One-time setup cost ($) <span className="text-xs font-normal">(optional)</span>
            <input
              type="number"
              min="0"
              value={setupCost}
              onChange={(event) => setSetupCost(event.target.value)}
              className={inputClass}
            />
          </label>
          <button
            type="submit"
            className="mt-2 inline-flex h-[52px] cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-electric to-brand-soft px-6 text-sm font-bold text-white shadow-[0_6px_20px_rgba(125,60,152,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_26px_rgba(125,60,152,0.4)]"
          >
            <Calculator className="size-4" />
            Calculate my savings
          </button>
        </form>
      </GlassCard>

      <div>
        {results ? (
          <>
            {taskName ? (
              <p className="mb-4 text-sm text-muted">
                Automating: <span className="font-bold text-foreground">{taskName}</span>
              </p>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard
                value={Math.round(results.monthlyHoursSaved).toLocaleString("en-CA")}
                label="Hours saved / month"
              />
              <StatCard
                value={money(results.monthlyDollarsSaved)}
                label="$ saved / month"
                sublabel="in labour time"
              />
              <StatCard
                value={
                  results.netMonthlySavings > 0 && results.paybackMonths !== null
                    ? `${results.paybackMonths.toFixed(1)} mo`
                    : results.netMonthlySavings > 0
                      ? "Immediate"
                      : "N/A"
                }
                label="Payback period"
                negative={results.netMonthlySavings <= 0}
              />
            </div>

            {results.netMonthlySavings > 0 ? (
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-sm font-bold text-brand-glow-text">
                  {Math.round(results.annualROIPercent).toLocaleString("en-CA")}% annual ROI
                </span>
                <span className="text-sm text-muted">
                  Net savings: <span className="font-bold text-foreground">{money(results.netMonthlySavings)}/month</span>
                </span>
              </div>
            ) : (
              // Honest negative case — no fake positives.
              <GlassCard className="mt-5 border-red-400/30 p-5">
                <p className="font-bold text-red-300">
                  This setup costs {money(Math.abs(results.netMonthlySavings))}/month more than it saves
                  at your current volume.
                </p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  This setup costs more than it saves at your current volume — let&apos;s talk about the
                  right-sized solution instead.
                </p>
              </GlassCard>
            )}

            <ToolCta />
          </>
        ) : (
          <GlassCard className="grid h-full min-h-64 place-items-center p-8 text-center">
            <p className="max-w-xs text-sm leading-7 text-muted">
              Fill in your numbers and hit <span className="font-bold text-foreground">Calculate</span> —
              results appear here instantly, including the honest answer if automation isn&apos;t worth it yet.
            </p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
