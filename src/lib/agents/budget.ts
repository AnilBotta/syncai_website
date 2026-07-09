import type { SupabaseClient } from "@supabase/supabase-js";

const DAILY_BUDGET_USD = Number(process.env.OPENAI_DAILY_BUDGET_USD || "5");

export type BudgetStatus = {
  spentToday: number;
  budget: number;
  remaining: number;
  exceeded: boolean;
};

/** Sums today's agent_runs cost (UTC day) and compares to the daily budget. */
export async function getBudgetStatus(supabase: SupabaseClient): Promise<BudgetStatus> {
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const { data } = await supabase
    .from("agent_runs")
    .select("cost_usd")
    .gte("created_at", startOfDay.toISOString());

  const spentToday = (data || []).reduce(
    (sum: number, row: { cost_usd: number | null }) => sum + (Number(row.cost_usd) || 0),
    0,
  );
  const spent = Math.round(spentToday * 10_000) / 10_000;

  return {
    spentToday: spent,
    budget: DAILY_BUDGET_USD,
    remaining: Math.max(0, Math.round((DAILY_BUDGET_USD - spent) * 10_000) / 10_000),
    exceeded: spent >= DAILY_BUDGET_USD,
  };
}
