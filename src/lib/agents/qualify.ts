import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Lead } from "@/lib/supabase";
import { runOneShotAgent } from "@/lib/agents/run-agent";

const STATUSES = ["new", "contacted", "qualified", "proposal", "won", "lost"] as const;

// The model sometimes returns fit/urgency/budget_signal as numbers (mini sub-
// scores) instead of text, and suggested_status as free text ("Contacted -
// Awaiting info"). Coerce those to strings and map the status to a valid enum
// so a stylistic variance never fails the whole run.
const qualifySchema = z.object({
  score: z.coerce.number().min(0).max(100),
  fit: z.coerce.string(),
  urgency: z.coerce.string(),
  budget_signal: z.coerce.string(),
  rationale: z.coerce.string(),
  suggested_next_action: z.coerce.string(),
  suggested_status: z
    .preprocess((v) => {
      if (typeof v !== "string") return undefined;
      const low = v.toLowerCase();
      return STATUSES.find((s) => low.includes(s));
    }, z.enum(STATUSES).optional())
    .optional(),
});

export type QualifyOutput = z.infer<typeof qualifySchema>;

const SYSTEM = `You are a sales qualification analyst for SyncAI Technologies, an AI-solutions agency (AI websites, chatbots, voice agents, workflow automation) serving small and mid-sized businesses in Canada.

Assess how good a fit each lead is based ONLY on the information provided.

Return strict JSON with exactly these keys:
- "score": an integer 0-100 (this is the ONLY number).
- "fit": a SHORT TEXT phrase (not a number) on whether their pain point maps to something SyncAI builds, e.g. "Strong — needs automation".
- "urgency": a SHORT TEXT phrase (not a number) on how soon they need it, e.g. "Low" or "High — actively searching".
- "budget_signal": a SHORT TEXT phrase (not a number) on whether they can afford a project, e.g. "Unknown" or "Likely — established clinic".
- "rationale": 2-3 sentences.
- "suggested_next_action": one concrete step.
- "suggested_status" (optional): exactly one of new, contacted, qualified, proposal, won, lost.

Important: fit, urgency, and budget_signal must be text descriptions, NOT numeric scores. Be realistic and specific.`;

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
