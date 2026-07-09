import OpenAI from "openai";
import type { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AgentName } from "@/lib/supabase";
import { getBudgetStatus } from "@/lib/agents/budget";
import { estimateCost } from "@/lib/agents/pricing";

const MODEL = process.env.OPENAI_AGENT_MODEL || process.env.OPENAI_MODEL || "gpt-4.1-mini";

export type OneShotResult<T> =
  | { ok: true; data: T; runId: string | null; cost: number }
  | { ok: false; error: string; refused?: boolean };

/**
 * Runs a single-shot JSON agent (qualify / research / outreach). Enforces the
 * daily budget, records an agent_runs row with token cost, and validates the
 * model's JSON output against a Zod schema. This is the counterpart to the
 * LangGraph Manager for simple, deterministic agents.
 */
export async function runOneShotAgent<T>(
  supabase: SupabaseClient,
  args: {
    agent: AgentName;
    leadId?: string | null;
    systemPrompt: string;
    userPrompt: string;
    schema: z.ZodType<T>;
    input?: Record<string, unknown>;
  },
): Promise<OneShotResult<T>> {
  if (!process.env.OPENAI_API_KEY) {
    return { ok: false, error: "OpenAI is not configured (no OPENAI_API_KEY)." };
  }

  const budget = await getBudgetStatus(supabase);
  if (budget.exceeded) {
    return {
      ok: false,
      refused: true,
      error: `Daily AI budget of $${budget.budget.toFixed(2)} reached (spent $${budget.spentToday.toFixed(2)}).`,
    };
  }

  const { data: run } = await supabase
    .from("agent_runs")
    .insert({
      agent: args.agent,
      status: "running",
      lead_id: args.leadId ?? null,
      input: args.input ?? {},
      model: MODEL,
    })
    .select("id")
    .single();
  const runId: string | null = run?.id ?? null;

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: args.systemPrompt },
        { role: "user", content: args.userPrompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const parsed = args.schema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      throw new Error("Agent returned malformed output.");
    }

    const tokensIn = completion.usage?.prompt_tokens || 0;
    const tokensOut = completion.usage?.completion_tokens || 0;
    const cost = estimateCost(MODEL, tokensIn, tokensOut);

    if (runId) {
      await supabase
        .from("agent_runs")
        .update({
          status: "succeeded",
          finished_at: new Date().toISOString(),
          output: parsed.data as Record<string, unknown>,
          tokens_in: tokensIn,
          tokens_out: tokensOut,
          cost_usd: cost,
        })
        .eq("id", runId);
    }

    return { ok: true, data: parsed.data, runId, cost };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Agent run failed.";
    if (runId) {
      await supabase
        .from("agent_runs")
        .update({ status: "failed", finished_at: new Date().toISOString(), error: message })
        .eq("id", runId);
    }
    return { ok: false, error: message };
  }
}
