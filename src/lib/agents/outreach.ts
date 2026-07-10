import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Lead, Prospect } from "@/lib/supabase";
import { runOneShotAgent } from "@/lib/agents/run-agent";
import { createApproval } from "@/lib/approvals";

const emailSchema = z.object({
  subject: z.string(),
  body: z.string(),
});

const SYSTEM = `You write first-touch B2B outreach emails for Anil at SyncAI Technologies, an AI-solutions agency (AI websites, chatbots, voice agents, workflow automation) in Ontario, Canada.

Write a short, human, non-salesy intro email:
- 90-140 words. Warm, specific, and about THEM, not us.
- Reference something concrete about their business or likely pain point.
- One clear, low-friction call to action (a quick 15-min call).
- No hype, no fake urgency, no "I hope this email finds you well". Sign off as "Anil".
- Do NOT include an unsubscribe line or signature block — those are added automatically.
Return strict JSON: { "subject": "...", "body": "..." }.`;

/**
 * Drafts a personalized outreach email into the Approval Inbox. Works for an
 * existing lead, or a prospect — a prospect is promoted into the pipeline (a new
 * lead, source 'outbound') so the email, approval, and unsubscribe all attach to
 * a real lead. Never sends; the CEO approves from the inbox.
 */
export async function runOutreach(
  supabase: SupabaseClient,
  args: {
    leadId?: string | null;
    prospectId?: string | null;
    instruction?: string;
    source?: "agent" | "sequence";
    sequenceEnrollmentId?: string | null;
  },
) {
  let lead: Lead | null = null;
  let researchContext = "";

  if (args.prospectId) {
    const { data: prospect } = await supabase
      .from("prospects")
      .select("*")
      .eq("id", args.prospectId)
      .single<Prospect>();
    if (!prospect) return { ok: false as const, error: "Prospect not found." };
    if (!prospect.email) {
      return { ok: false as const, error: "This prospect has no email address to reach out to." };
    }

    // Promote the prospect into the pipeline so the whole email flow attaches to a lead.
    if (prospect.lead_id) {
      const { data } = await supabase.from("leads").select("*").eq("id", prospect.lead_id).single<Lead>();
      lead = data;
    }
    if (!lead) {
      const { data: created } = await supabase
        .from("leads")
        .insert({
          name: prospect.contact_name || prospect.company,
          email: prospect.email,
          company: prospect.company,
          pain_point: "Outbound prospect — see research brief for context.",
          source: "outbound",
          status: "new",
        })
        .select()
        .single<Lead>();
      lead = created;
      if (lead) {
        await supabase
          .from("prospects")
          .update({ status: "promoted", lead_id: lead.id })
          .eq("id", prospect.id);
      }
    }
    researchContext = JSON.stringify(prospect.enrichment || {});
  } else if (args.leadId) {
    const { data } = await supabase.from("leads").select("*").eq("id", args.leadId).single<Lead>();
    lead = data;
    // Pull the most recent research brief for this lead, if any.
    const { data: lastResearch } = await supabase
      .from("agent_runs")
      .select("output")
      .eq("lead_id", args.leadId)
      .eq("agent", "research")
      .order("created_at", { ascending: false })
      .limit(1);
    if (lastResearch?.[0]?.output) researchContext = JSON.stringify(lastResearch[0].output);
  }

  if (!lead) return { ok: false as const, error: "No lead or prospect to reach out to." };
  if (lead.unsubscribed_at) return { ok: false as const, error: `${lead.name} has unsubscribed.` };

  const userPrompt = [
    `Recipient: ${lead.name}`,
    `Company: ${lead.company || "—"}`,
    `Industry: ${lead.industry || "—"}`,
    `Their pain point: ${lead.pain_point}`,
    researchContext ? `Research brief: ${researchContext}` : "",
    args.instruction ? `Special instruction: ${args.instruction}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const result = await runOneShotAgent(supabase, {
    agent: "email_draft",
    leadId: lead.id,
    systemPrompt: SYSTEM,
    userPrompt,
    schema: emailSchema,
    input: { leadId: lead.id, prospectId: args.prospectId ?? null },
  });

  if (!result.ok) return result;

  const source = args.source ?? "agent";
  const { data: email, error } = await supabase
    .from("emails")
    .insert({
      lead_id: lead.id,
      to_email: lead.email,
      subject: result.data.subject,
      body_text: result.data.body,
      source,
      status: "draft",
      sequence_enrollment_id: args.sequenceEnrollmentId ?? null,
    })
    .select()
    .single();
  if (error || !email) return { ok: false as const, error: `Could not save draft: ${error?.message}` };

  await createApproval(supabase, {
    type: "email",
    entityId: email.id,
    leadId: lead.id,
    title: `Outreach: ${result.data.subject}`,
    summary: `To ${lead.name} at ${lead.company || lead.email} (drafted by ${source === "sequence" ? "nurture sequence" : "Outreach agent"})`,
    meta: { source, agent: "outreach" },
  });

  await supabase.from("lead_activities").insert({
    lead_id: lead.id,
    type: "agent_run",
    title: `Outreach drafted: ${result.data.subject}`,
    meta: { agent: "outreach", run_id: result.runId, email_id: email.id, source },
    actor: "agent:outreach",
  });

  return {
    ok: true as const,
    data: { subject: result.data.subject, leadId: lead.id, emailId: email.id },
    runId: result.runId,
  };
}
