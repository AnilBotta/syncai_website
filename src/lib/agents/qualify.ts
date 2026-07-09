import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Lead } from "@/lib/supabase";
import { runOneShotAgent } from "@/lib/agents/run-agent";

const qualifySchema = z.object({
  score: z.number().min(0).max(100),
  fit: z.string(),
  urgency: z.string(),
  budget_signal: z.string(),
  rationale: z.string(),
  suggested_next_action: z.string(),
  suggested_status: z.enum(["new", "contacted", "qualified", "proposal", "won", "lost"]).optional(),
});

export type QualifyOutput = z.infer<typeof qualifySchema>;

const SYSTEM = `You are a sales qualification analyst for SyncAI Technologies, an AI-solutions agency (AI websites, chatbots, voice agents, workflow automation) serving small and mid-sized businesses in Canada.

Score how good a fit each lead is, 0-100, based ONLY on the information provided:
- fit: does their pain point map to something SyncAI builds?
- urgency: signs they need this soon.
- budget_signal: any hint they can afford a project (company size, industry, scope).
Be realistic and specific. Return strict JSON with keys: score (0-100 integer), fit, urgency, budget_signal, rationale (2-3 sentences), suggested_next_action (one concrete step), and optionally suggested_status.`;

/** Scores a lead and writes the score + rationale + next action back onto it. */
export async function runQualify(supabase: SupabaseClient, leadId: string) {
  const { data: lead } = await supabase.from("leads").select("*").eq("id", leadId).single<Lead>();
  if (!lead) {
    return { ok: false as const, error: "Lead not found." };
  }

  const userPrompt = [
    `Name: ${lead.name}`,
    `Company: ${lead.company || "—"}`,
    `Industry: ${lead.industry || "—"}`,
    `Interest: ${lead.interest || "—"}`,
    `Source: ${lead.source}`,
    `Pain point: ${lead.pain_point}`,
    `Notes: ${lead.notes || "—"}`,
  ].join("\n");

  const result = await runOneShotAgent(supabase, {
    agent: "qualify",
    leadId,
    systemPrompt: SYSTEM,
    userPrompt,
    schema: qualifySchema,
    input: { leadId },
  });

  if (!result.ok) {
    return result;
  }

  const q = result.data;
  await supabase
    .from("leads")
    .update({
      score: Math.round(q.score),
      score_rationale: q.rationale,
      next_action: q.suggested_next_action,
    })
    .eq("id", leadId);

  await supabase.from("lead_activities").insert({
    lead_id: leadId,
    type: "agent_run",
    title: `Qualified: score ${Math.round(q.score)}/100`,
    body: q.rationale,
    meta: { agent: "qualify", run_id: result.runId },
    actor: "agent:qualify",
  });

  return { ok: true as const, data: q, runId: result.runId };
}
