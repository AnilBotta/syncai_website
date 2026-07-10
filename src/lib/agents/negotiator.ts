import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Lead } from "@/lib/supabase";
import { runOneShotAgent } from "@/lib/agents/run-agent";
import { createApproval } from "@/lib/approvals";

const negotiationSchema = z.object({
  their_ask: z.string(),
  their_leverage: z.string(),
  our_leverage: z.string(),
  proposed_price: z.number().nullable(),
  discount_pct: z.number().min(0).max(100).nullable(),
  decision: z.enum(["draft", "escalate"]),
  rationale: z.string(),
  draft_subject: z.string().nullable(),
  draft_body: z.string().nullable(),
});

export type NegotiationOutput = z.infer<typeof negotiationSchema>;

const SYSTEM = `You are a negotiation analyst and drafter for Anil, the CEO of SyncAI Technologies, an AI-solutions agency in Ontario, Canada.

Given a lead's deal guardrails (floor price, max discount %, allowed concessions) and the prospect's latest message or context, analyze the negotiation and decide whether to draft a counter-offer reply or escalate to the CEO.

Rules:
- NEVER propose a price below the floor price, or a discount above the max discount %, when those are set. If the prospect's ask would require that, set decision to "escalate", leave draft_subject/draft_body null, and explain why in rationale.
- If the ask is within the rules (or no rules are set — use conservative judgement), set decision to "draft" and write a complete, ready-to-send reply as Anil: confident and warm, holds the line, offers only concessions allowed on file. No hype, no fake urgency.
- proposed_price and discount_pct should reflect what you are recommending (numbers only, no currency symbols). Use null if you can't derive a clear number.
Return strict JSON matching the schema.`;

/**
 * Analyzes a negotiation and either drafts a guardrail-compliant counter-offer
 * into the Approval Inbox, or escalates to the CEO as a task. The floor/discount
 * check is re-verified in code — the model's own "escalate" call is never the
 * only thing standing between a bad offer and a sent email.
 */
export async function runNegotiator(
  supabase: SupabaseClient,
  args: { leadId: string; threadContext: string },
) {
  const { data: lead } = await supabase.from("leads").select("*").eq("id", args.leadId).single<Lead>();
  if (!lead) return { ok: false as const, error: "Lead not found." };
  if (lead.unsubscribed_at) return { ok: false as const, error: `${lead.name} has unsubscribed.` };

  const guardrails = [
    `Deal value on record: ${lead.value ? `$${lead.value}` : "not set"}`,
    lead.floor_price != null
      ? `Floor price: $${lead.floor_price} — never go below this.`
      : "Floor price: not set — use conservative judgement.",
    lead.max_discount_pct != null
      ? `Max discount: ${lead.max_discount_pct}% — never exceed this.`
      : "Max discount: not set — use conservative judgement.",
    lead.concession_notes ? `Allowed concessions: ${lead.concession_notes}` : "No specific allowed concessions on file.",
  ].join("\n");

  const userPrompt = [
    `Lead: ${lead.name}${lead.company ? ` (${lead.company})` : ""}`,
    `Deal guardrails:\n${guardrails}`,
    `Prospect's latest message / context:\n${args.threadContext}`,
  ].join("\n\n");

  const result = await runOneShotAgent(supabase, {
    agent: "negotiate",
    leadId: lead.id,
    systemPrompt: SYSTEM,
    userPrompt,
    schema: negotiationSchema,
    input: { leadId: lead.id, threadContext: args.threadContext },
  });

  if (!result.ok) return result;

  const n = result.data;
  const floorViolated = lead.floor_price != null && n.proposed_price != null && n.proposed_price < lead.floor_price;
  const discountViolated =
    lead.max_discount_pct != null && n.discount_pct != null && n.discount_pct > lead.max_discount_pct;
  const mustEscalate = n.decision === "escalate" || floorViolated || discountViolated || !n.draft_body;

  if (mustEscalate) {
    const reason = floorViolated
      ? `Proposed price $${n.proposed_price} is below the floor of $${lead.floor_price}.`
      : discountViolated
        ? `Proposed discount ${n.discount_pct}% exceeds the max of ${lead.max_discount_pct}%.`
        : n.rationale;

    await supabase.from("tasks").insert({
      lead_id: lead.id,
      title: `Escalation: negotiate with ${lead.name} — needs your call`,
      due_at: new Date(Date.now() + 86400000).toISOString(),
    });

    await supabase.from("lead_activities").insert({
      lead_id: lead.id,
      type: "agent_run",
      title: "Negotiator escalated to you",
      body: reason,
      meta: { agent: "negotiate", run_id: result.runId, their_ask: n.their_ask },
      actor: "agent:negotiate",
    });

    return {
      ok: true as const,
      data: { ...n, escalated: true as const, reason },
      runId: result.runId,
    };
  }

  const { data: email, error } = await supabase
    .from("emails")
    .insert({
      lead_id: lead.id,
      to_email: lead.email,
      subject: n.draft_subject || `Re: ${lead.name}`,
      body_text: n.draft_body,
      source: "agent",
      status: "draft",
    })
    .select()
    .single();
  if (error || !email) return { ok: false as const, error: `Could not save draft: ${error?.message}` };

  await createApproval(supabase, {
    type: "negotiation_reply",
    entityId: email.id,
    leadId: lead.id,
    title: `Negotiation reply: ${lead.name}`,
    summary:
      n.proposed_price != null
        ? `Offer $${n.proposed_price}${n.discount_pct != null ? ` (${n.discount_pct}% off)` : ""}${
            lead.floor_price != null ? ` — floor $${lead.floor_price} ✓` : ""
          }`
        : n.rationale,
    meta: {
      agent: "negotiate",
      their_ask: n.their_ask,
      their_leverage: n.their_leverage,
      our_leverage: n.our_leverage,
      proposed_price: n.proposed_price,
      discount_pct: n.discount_pct,
      floor_price: lead.floor_price,
      max_discount_pct: lead.max_discount_pct,
      rationale: n.rationale,
    },
  });

  await supabase.from("lead_activities").insert({
    lead_id: lead.id,
    type: "agent_run",
    title: `Negotiation counter drafted: ${n.draft_subject}`,
    body: n.rationale,
    meta: { agent: "negotiate", run_id: result.runId, email_id: email.id },
    actor: "agent:negotiate",
  });

  return {
    ok: true as const,
    data: { ...n, escalated: false as const, emailId: email.id },
    runId: result.runId,
  };
}
