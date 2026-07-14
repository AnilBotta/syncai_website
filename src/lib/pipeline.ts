import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Approval, Lead, Pipeline, PipelineStage, Prospect } from "@/lib/supabase";
import { runOutreach } from "@/lib/agents/outreach";
import { runResearch } from "@/lib/agents/research";
import { runQualify } from "@/lib/agents/qualify";
import { runOneShotAgent } from "@/lib/agents/run-agent";
import { initiateCallForLead } from "@/lib/calls";
import { bookAppointmentFromCall } from "@/lib/voice/appointment-tools";
import { sendEmailRecord } from "@/lib/email/send-core";
import { hasVoiceConfig } from "@/lib/voice";
import { notifyCeo, type TelegramButton } from "@/lib/telegram";

const BOOK_LINK = "https://www.syncai.tech/book";
const DRAIN_CHUNK = 3;
const CALL_CAP = 20;
const NO_REPLY_DAYS = 3;

/** Telegram [approve|skip] buttons that decide an approval by id. */
function decideButtons(approvalId: string): TelegramButton[] {
  return [
    { text: "✅ Approve", data: `ap|${approvalId}|y` },
    { text: "❌ Skip", data: `ap|${approvalId}|n` },
  ];
}

async function setStage(supabase: SupabaseClient, id: string, stage: PipelineStage, metaPatch?: Record<string, unknown>) {
  const patch: Record<string, unknown> = { stage, stage_changed_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  if (metaPatch) {
    const { data } = await supabase.from("pipelines").select("meta").eq("id", id).maybeSingle<{ meta: Record<string, unknown> }>();
    patch.meta = { ...(data?.meta || {}), ...metaPatch };
  }
  await supabase.from("pipelines").update(patch).eq("id", id);
}

async function complete(supabase: SupabaseClient, p: Pipeline, outcome: string) {
  await supabase
    .from("pipelines")
    .update({ status: "completed", stage: "done", stage_changed_at: new Date().toISOString(), updated_at: new Date().toISOString(), meta: { ...p.meta, outcome } })
    .eq("id", p.id);
  if (p.lead_id) await logPipeline(supabase, p.lead_id, `Automation finished: ${outcome.replace(/_/g, " ")}`);
}

async function logPipeline(supabase: SupabaseClient, leadId: string, title: string, body?: string) {
  await supabase.from("lead_activities").insert({ lead_id: leadId, type: "system", title, body: body ?? null, actor: "agent:pipeline" });
}

// ---------------------------------------------------------------------------
// Batch offer + activation
// ---------------------------------------------------------------------------

/**
 * After a scrape, ask the CEO on Telegram whether to automate outreach for the
 * new prospects. Creates a `pipeline_batch` approval (also visible in the inbox).
 */
export async function offerBatch(
  supabase: SupabaseClient,
  args: { icpName?: string; prospectIds: string[] },
): Promise<{ ok: boolean; approvalId?: string }> {
  const { data: prospects } = await supabase
    .from("prospects")
    .select("id, email")
    .in("id", args.prospectIds);
  const withEmail = (prospects || []).filter((p) => p.email);
  if (!withEmail.length) return { ok: false };

  const batchId = crypto.randomUUID();
  const { data: approval } = await supabase
    .from("approvals")
    .insert({
      type: "pipeline_batch",
      title: `Automate outreach — ${withEmail.length} new prospect${withEmail.length > 1 ? "s" : ""}`,
      summary: args.icpName ? `From target “${args.icpName}”` : "New prospects from the scraper",
      meta: { batch_id: batchId, prospect_ids: withEmail.map((p) => p.id), icp_name: args.icpName ?? null },
    })
    .select()
    .single<Approval>();
  if (!approval) return { ok: false };

  await notifyCeo(
    `🎯 ${withEmail.length} new prospect${withEmail.length > 1 ? "s" : ""} with email${args.icpName ? ` from “${args.icpName}”` : ""}.\n\nWant me to research them and draft outreach emails for your approval?`,
    decideButtons(approval.id),
  );
  return { ok: true, approvalId: approval.id };
}

/** Creates queued pipeline rows for a batch and drains the first chunk. */
async function activateBatch(supabase: SupabaseClient, approval: Approval): Promise<void> {
  const batchId = String(approval.meta?.batch_id || crypto.randomUUID());
  const prospectIds = (approval.meta?.prospect_ids as string[] | undefined) || [];
  for (const prospectId of prospectIds) {
    // Skip if this prospect already has an active pipeline.
    const { data: existing } = await supabase
      .from("pipelines")
      .select("id")
      .eq("prospect_id", prospectId)
      .eq("status", "active")
      .maybeSingle();
    if (existing) continue;
    await supabase.from("pipelines").insert({ batch_id: batchId, prospect_id: prospectId, stage: "queued", status: "active" });
  }
  await drainQueued(supabase, DRAIN_CHUNK);
}

/**
 * Starts automation for a set of prospects directly (dashboard "Automate" click
 * = the CEO already approved). Creates queued rows + drains the first chunk.
 */
export async function activateProspectBatch(
  supabase: SupabaseClient,
  prospectIds: string[],
): Promise<{ ok: boolean; message: string }> {
  const batchId = crypto.randomUUID();
  let created = 0;
  for (const prospectId of prospectIds) {
    const { data: prospect } = await supabase.from("prospects").select("id, email").eq("id", prospectId).maybeSingle<{ id: string; email: string | null }>();
    if (!prospect?.email) continue;
    const { data: existing } = await supabase.from("pipelines").select("id").eq("prospect_id", prospectId).eq("status", "active").maybeSingle();
    if (existing) continue;
    await supabase.from("pipelines").insert({ batch_id: batchId, prospect_id: prospectId, stage: "queued", status: "active" });
    created += 1;
  }
  await drainQueued(supabase, DRAIN_CHUNK);
  return {
    ok: created > 0,
    message: created
      ? `Automating ${created} prospect${created > 1 ? "s" : ""} — drafting outreach now. Approve each email in the inbox to send.`
      : "No prospects with an email to automate.",
  };
}

/**
 * Processes queued pipelines: research → draft outreach (into Approvals). Chunked
 * so a single serverless invocation never blows its time budget. Safe to call
 * from after(), the inbox cron, and the daily cron.
 */
export async function drainQueued(supabase: SupabaseClient, max = DRAIN_CHUNK): Promise<number> {
  const { data: rows } = await supabase
    .from("pipelines")
    .select("*")
    .eq("status", "active")
    .eq("stage", "queued")
    .order("created_at", { ascending: true })
    .limit(max);
  const queued = (rows || []) as Pipeline[];
  let done = 0;

  for (const p of queued) {
    if (!p.prospect_id) {
      await complete(supabase, p, "error_no_prospect");
      continue;
    }
    const { data: prospect } = await supabase.from("prospects").select("*").eq("id", p.prospect_id).maybeSingle<Prospect>();
    if (!prospect?.email) {
      await complete(supabase, p, "no_email");
      continue;
    }

    // Research (best-effort — outreach still runs without it).
    try {
      await runResearch(supabase, {
        company: prospect.company,
        painPoint: null,
        prospectId: prospect.id,
        leadId: prospect.lead_id ?? null,
      });
    } catch {
      // ignore research failures
    }

    const outreach = await runOutreach(supabase, { prospectId: prospect.id, instruction: "First-touch outreach.", source: "agent" });
    if (!outreach.ok) {
      await complete(supabase, p, "outreach_failed");
      continue;
    }

    await supabase
      .from("pipelines")
      .update({ lead_id: outreach.data.leadId, stage: "awaiting_email_approval", stage_changed_at: new Date().toISOString(), updated_at: new Date().toISOString(), meta: { ...p.meta, email_id: outreach.data.emailId } })
      .eq("id", p.id);
    await logPipeline(supabase, outreach.data.leadId, "Automation: outreach drafted, awaiting your approval");
    done += 1;
  }
  return done;
}

// ---------------------------------------------------------------------------
// Email decided → contacted + maybe offer calls
// ---------------------------------------------------------------------------

/** Called from the approvals PATCH after an email approval is decided. */
export async function onEmailDecided(supabase: SupabaseClient, leadId: string | null, decision: "approved" | "rejected"): Promise<void> {
  if (!leadId) return;
  const { data: p } = await supabase
    .from("pipelines")
    .select("*")
    .eq("lead_id", leadId)
    .eq("status", "active")
    .eq("stage", "awaiting_email_approval")
    .maybeSingle<Pipeline>();
  if (!p) return;

  if (decision === "rejected") {
    await complete(supabase, p, "outreach_rejected");
    return;
  }

  // Approved (email already sent by send-core). Advance + move lead to contacted.
  await setStage(supabase, p.id, "awaiting_reply");
  const { data: lead } = await supabase.from("leads").select("status").eq("id", leadId).maybeSingle<{ status: string }>();
  if (lead && (lead.status === "new" || lead.status === "contacted")) {
    await supabase.from("leads").update({ status: "contacted" }).eq("id", leadId);
    await supabase.from("lead_activities").insert({ lead_id: leadId, type: "status_change", title: "Status: → contacted (automation)", meta: { from: lead.status, to: "contacted" }, actor: "agent:pipeline" });
  }

  // If the whole batch is now decided, offer to call the batch.
  if (p.batch_id) await maybeOfferBatchCalls(supabase, p.batch_id);
}

async function maybeOfferBatchCalls(supabase: SupabaseClient, batchId: string): Promise<void> {
  const { count: stillDrafting } = await supabase
    .from("pipelines")
    .select("*", { count: "exact", head: true })
    .eq("batch_id", batchId)
    .eq("status", "active")
    .in("stage", ["queued", "awaiting_email_approval"]);
  if ((stillDrafting || 0) > 0) return; // batch not fully decided yet

  // Only offer once per batch.
  const { data: existing } = await supabase
    .from("approvals")
    .select("id")
    .eq("type", "pipeline_calls")
    .contains("meta", { batch_id: batchId })
    .maybeSingle();
  if (existing) return;

  // Leads awaiting a reply that have a phone.
  const { data: rows } = await supabase
    .from("pipelines")
    .select("lead_id")
    .eq("batch_id", batchId)
    .eq("status", "active")
    .eq("stage", "awaiting_reply");
  const leadIds = (rows || []).map((r) => r.lead_id).filter(Boolean) as string[];
  if (!leadIds.length) return;
  const { data: leads } = await supabase.from("leads").select("id, phone").in("id", leadIds);
  const callable = (leads || []).filter((l) => l.phone);
  if (!callable.length || !hasVoiceConfig()) return;

  const { data: approval } = await supabase
    .from("approvals")
    .insert({
      type: "pipeline_calls",
      title: `Call ${callable.length} lead${callable.length > 1 ? "s" : ""} to follow up`,
      summary: "Outreach emails sent — call them to follow up?",
      meta: { batch_id: batchId },
    })
    .select()
    .single<Approval>();
  if (!approval) return;
  await notifyCeo(
    `📞 ${callable.length} lead${callable.length > 1 ? "s" : ""} were emailed. Want the voice agent to call them to follow up?`,
    decideButtons(approval.id),
  );
}

/** Batch-initiates follow-up calls for a decided calls-approval (cap 20). */
async function activateCalls(supabase: SupabaseClient, approval: Approval): Promise<void> {
  const batchId = String(approval.meta?.batch_id || "");
  if (!batchId) return;
  const { data: rows } = await supabase
    .from("pipelines")
    .select("lead_id")
    .eq("batch_id", batchId)
    .eq("status", "active")
    .eq("stage", "awaiting_reply");
  const leadIds = (rows || []).map((r) => r.lead_id).filter(Boolean).slice(0, CALL_CAP) as string[];
  let started = 0;
  for (const leadId of leadIds) {
    const res = await initiateCallForLead(supabase, leadId, "Friendly follow-up on the intro email we sent.");
    if (res.ok) started += 1;
  }
  if (started) await notifyCeo(`📞 Started ${started} follow-up call${started > 1 ? "s" : ""}.`);
}

// ---------------------------------------------------------------------------
// Reply → qualify → discovery / booking
// ---------------------------------------------------------------------------

const intentSchema = z.object({
  intent: z.enum(["booked", "time_proposed", "positive_vague", "not_interested"]),
  // Split so the booker can parse them independently: the date resolver and the
  // time parser each expect their own fragment, not one combined phrase.
  date_text: z.string().optional().default(""),
  time_text: z.string().optional().default(""),
});

/** Advances an active pipeline based on a lead's email reply. Used by the Gmail poll AND the manual record_reply path. */
export async function advanceOnReply(supabase: SupabaseClient, pipeline: Pipeline, replyText: string): Promise<void> {
  const leadId = pipeline.lead_id;
  if (!leadId) return;
  const { data: lead } = await supabase.from("leads").select("*").eq("id", leadId).maybeSingle<Lead>();
  if (!lead) return;
  if (lead.unsubscribed_at) {
    await complete(supabase, pipeline, "unsubscribed");
    return;
  }

  if (pipeline.stage === "awaiting_reply") {
    // Qualify → tier.
    const q = await runQualify(supabase, leadId);
    const score = q.ok ? Number(q.data.score) || 0 : 0;
    const disqualified = q.ok && q.data.suggested_status === "lost";
    const tier = disqualified ? "disqualified" : score >= 70 ? "hot" : score >= 40 ? "warm" : "cold";
    await logPipeline(supabase, leadId, `Reply qualified: ${tier} (score ${score})`, replyText.slice(0, 500));

    if (tier === "disqualified") {
      await supabase.from("leads").update({ status: "lost" }).eq("id", leadId);
      await complete(supabase, pipeline, "disqualified");
      await notifyCeo(`🚫 ${lead.name} replied but doesn't qualify — moved to lost.`);
      return;
    }
    if (tier === "cold") {
      await supabase.from("tasks").insert({ lead_id: leadId, title: `Review cold reply from ${lead.name}` });
      await setStage(supabase, pipeline.id, "paused_cold");
      await supabase.from("pipelines").update({ status: "paused" }).eq("id", pipeline.id);
      await notifyCeo(`🥶 ${lead.name} replied but qualified cold. Paused — I made you a task to review.`);
      return;
    }
    // hot / warm → auto-send discovery email.
    await sendDiscoveryEmail(supabase, lead);
    await setStage(supabase, pipeline.id, "awaiting_booking", { discovery_sent_at: new Date().toISOString(), tier });
    await notifyCeo(`📨 Discovery-call email sent to ${lead.name} (${tier}). Awaiting a time.`);
    return;
  }

  if (pipeline.stage === "awaiting_booking") {
    const intent = await parseReplyIntent(supabase, leadId, replyText);
    if (!intent) return;
    if (intent.intent === "booked") {
      await notifyCeo(`✅ ${lead.name} says they booked a discovery call.`);
      await complete(supabase, pipeline, "booked_self");
      return;
    }
    if (intent.intent === "not_interested") {
      await notifyCeo(`🙅 ${lead.name} declined the discovery call.`);
      await complete(supabase, pipeline, "not_interested");
      return;
    }
    if (intent.intent === "time_proposed" && intent.date_text && intent.time_text) {
      const booked = await bookAppointmentFromCall(supabase, {
        leadId,
        date: intent.date_text,
        time: intent.time_text,
        service: "Discovery call",
        notes: "Booked automatically from an email reply.",
        source: "pipeline",
      });
      if (booked.success) {
        await notifyCeo(`📅 Booked ${lead.name}: ${booked.message}`);
        await complete(supabase, pipeline, "booked_reply");
      } else {
        // Couldn't parse/validate the time — fall back to offering a call.
        await offerBookCall(supabase, pipeline, lead.name);
      }
      return;
    }
    // positive_vague → offer to call and book.
    await offerBookCall(supabase, pipeline, lead.name);
  }
}

/**
 * Fixed "how to book" block appended to every discovery email. Kept in code (not
 * left to the LLM) so the booking link and the fill-in-the-blank lines are always
 * present and correctly formatted — the blanks nudge the lead to reply with a
 * clean "Day + Time" that the reply parser can turn straight into a booking.
 */
const BOOKING_BLOCK = [
  "Two easy ways to lock in a free 15-minute slot:",
  "",
  `1) Book instantly here: ${BOOK_LINK}`,
  "",
  "2) Or just reply to this email with your preferred day and time — copy the two lines below and fill them in:",
  "",
  "Day: ______________   (e.g. Thursday, or July 18)",
  "Time: _____________   (e.g. 11am or 2:30pm)",
  "",
  "— Anil",
].join("\n");

async function sendDiscoveryEmail(supabase: SupabaseClient, lead: Lead): Promise<void> {
  const draft = await runOneShotAgent(supabase, {
    agent: "email_draft",
    leadId: lead.id,
    systemPrompt: `You write ONLY the opening of a short, warm follow-up email from Anil at SyncAI Technologies inviting the recipient to a free 15-minute discovery call. 2-3 sentences, specific to them, no hype. Do NOT add a booking link, scheduling instructions, or a sign-off — those are appended automatically after your text. Return strict JSON { "subject": "...", "body": "..." } where body is just the greeting and those 2-3 sentences.`,
    userPrompt: [`Recipient: ${lead.name}`, `Company: ${lead.company || "—"}`, `Pain point: ${lead.pain_point}`].join("\n"),
    schema: z.object({ subject: z.string(), body: z.string() }),
    input: { leadId: lead.id, kind: "discovery" },
  });

  const subject = draft.ok ? draft.data.subject : `A quick 15-minute call, ${lead.name.split(" ")[0]}?`;
  const intro = draft.ok
    ? draft.data.body.trim()
    : `Hi ${lead.name.split(" ")[0]},\n\nWould you be open to a quick 15-minute call to explore how we could help ${lead.company || "your business"}?`;
  const body = `${intro}\n\n${BOOKING_BLOCK}`;

  const { data: email } = await supabase
    .from("emails")
    .insert({ lead_id: lead.id, to_email: lead.email, subject, body_text: body, source: "agent", status: "draft", meta: { kind: "discovery" } })
    .select("id")
    .single();
  if (email) await sendEmailRecord(supabase, email.id);
}

async function parseReplyIntent(supabase: SupabaseClient, leadId: string, replyText: string) {
  const res = await runOneShotAgent(supabase, {
    agent: "qualify",
    leadId,
    systemPrompt: `Classify the intent of a lead's email reply about scheduling a 15-minute discovery call. Return strict JSON:
{ "intent": "booked" | "time_proposed" | "positive_vague" | "not_interested", "date_text": "just the DAY, else empty", "time_text": "just the TIME, else empty" }
- booked: they say they already booked / picked a slot on the link.
- time_proposed: they suggest a specific day AND time. Split them: date_text is the day only ("Tuesday", "tomorrow", "July 18", "next Monday"); time_text is the clock time only ("2pm", "11am", "10:30"). If they gave a day but no clock time (or vice-versa), treat it as positive_vague instead.
- positive_vague: interested but no concrete day+time ("sure", "sounds good", "ok", "sometime next week").
- not_interested: declining.
The lead may reply using a filled-in template like "Day: Thursday / Time: 11am" — read the values after each label.
Examples: "Thursday at 11 works" -> {"intent":"time_proposed","date_text":"Thursday","time_text":"11"}. "tomorrow at 2pm" -> {"intent":"time_proposed","date_text":"tomorrow","time_text":"2pm"}. "Day: Friday  Time: 10:30am" -> {"intent":"time_proposed","date_text":"Friday","time_text":"10:30am"}. "sounds good" -> {"intent":"positive_vague","date_text":"","time_text":""}.`,
    userPrompt: `Reply:\n${replyText.slice(0, 1500)}`,
    schema: intentSchema,
    input: { leadId, kind: "reply_intent" },
  });
  return res.ok ? res.data : null;
}

// ---------------------------------------------------------------------------
// Book-by-call offer + no-reply timer
// ---------------------------------------------------------------------------

async function offerBookCall(supabase: SupabaseClient, pipeline: Pipeline, leadName: string): Promise<void> {
  if (!pipeline.lead_id) return;
  const { data: existing } = await supabase
    .from("approvals")
    .select("id")
    .eq("type", "pipeline_bookcall")
    .eq("lead_id", pipeline.lead_id)
    .eq("status", "pending")
    .maybeSingle();
  if (existing) return;
  if (!hasVoiceConfig()) return;

  const { data: approval } = await supabase
    .from("approvals")
    .insert({
      type: "pipeline_bookcall",
      lead_id: pipeline.lead_id,
      title: `Call ${leadName} to book the discovery call`,
      summary: "No time confirmed by email — have the voice agent call to book?",
      meta: { pipeline_id: pipeline.id },
    })
    .select()
    .single<Approval>();
  if (!approval) return;
  await notifyCeo(`📞 ${leadName} hasn't confirmed a time. Want the voice agent to call and book the discovery call?`, decideButtons(approval.id));
}

async function activateBookCall(supabase: SupabaseClient, approval: Approval): Promise<void> {
  if (!approval.lead_id) return;
  const { data: lead } = await supabase.from("leads").select("name").eq("id", approval.lead_id).maybeSingle<{ name: string }>();
  const res = await initiateCallForLead(supabase, approval.lead_id, "Call to book a 15-minute discovery call. Offer available times and book one.");
  if (res.ok) await notifyCeo(`📞 Calling ${lead?.name || "the lead"} to book the discovery call.`);
}

/** Cron duties: no-reply timer, appointment detection, unsubscribe cleanup, drain. */
export async function tickPipelines(supabase: SupabaseClient): Promise<void> {
  const cutoff = new Date(Date.now() - NO_REPLY_DAYS * 86400000).toISOString();

  // (a) awaiting_booking with a stale discovery email → offer a booking call.
  const { data: waiting } = await supabase
    .from("pipelines")
    .select("*")
    .eq("status", "active")
    .eq("stage", "awaiting_booking")
    .limit(25);
  for (const p of (waiting || []) as Pipeline[]) {
    if (!p.lead_id) continue;
    // (b) already has a future appointment? complete.
    const { data: appt } = await supabase
      .from("appointments")
      .select("id")
      .eq("lead_id", p.lead_id)
      .in("status", ["pending", "confirmed"])
      .gte("starts_at", new Date().toISOString())
      .limit(1);
    if (appt?.length) {
      await complete(supabase, p, "booked_detected");
      continue;
    }
    const sentAt = String(p.meta?.discovery_sent_at || p.stage_changed_at);
    if (sentAt < cutoff) {
      const { data: lead } = await supabase.from("leads").select("name, unsubscribed_at").eq("id", p.lead_id).maybeSingle<{ name: string; unsubscribed_at: string | null }>();
      if (lead?.unsubscribed_at) {
        await complete(supabase, p, "unsubscribed");
        continue;
      }
      await offerBookCall(supabase, p, lead?.name || "the lead");
    }
  }

  // (c) drain any queued research/drafts.
  await drainQueued(supabase, DRAIN_CHUNK);
}

// ---------------------------------------------------------------------------
// Approval decision router (shared by Telegram callback + approvals PATCH)
// ---------------------------------------------------------------------------

/**
 * Decides a pipeline approval. Idempotent: acts only on the pending→decided
 * transition. Heavy follow-up (research/drafts/calls) should be scheduled with
 * after() by the caller when possible; this function performs it inline so it
 * also works from the dashboard PATCH.
 */
export async function decidePipelineApproval(
  supabase: SupabaseClient,
  approvalId: string,
  decision: "approved" | "rejected",
): Promise<{ ok: boolean; already?: boolean; label: string }> {
  const { data: approval } = await supabase.from("approvals").select("*").eq("id", approvalId).maybeSingle<Approval>();
  if (!approval) return { ok: false, label: "not found" };
  if (approval.status !== "pending") return { ok: true, already: true, label: approval.type };

  await supabase.from("approvals").update({ status: decision, decided_at: new Date().toISOString() }).eq("id", approvalId);

  if (decision === "approved") {
    if (approval.type === "pipeline_batch") await activateBatch(supabase, approval);
    else if (approval.type === "pipeline_calls") await activateCalls(supabase, approval);
    else if (approval.type === "pipeline_bookcall") await activateBookCall(supabase, approval);
    else if (approval.type === "pipeline_start" && approval.lead_id) await startLeadPipeline(supabase, approval.lead_id);
  }
  return { ok: true, label: approval.type };
}

/**
 * Asks the CEO on Telegram whether to start the automated workflow for ONE
 * lead (the single-lead counterpart of offerBatch). Creates a `pipeline_start`
 * approval; on approval, decidePipelineApproval calls startLeadPipeline.
 */
export async function offerLeadAutomation(supabase: SupabaseClient, leadId: string): Promise<{ ok: boolean; message: string }> {
  const { data: lead } = await supabase
    .from("leads")
    .select("id, name, email, unsubscribed_at")
    .eq("id", leadId)
    .maybeSingle<Pick<Lead, "id" | "name" | "email" | "unsubscribed_at">>();
  if (!lead) return { ok: false, message: "Lead not found." };
  if (!lead.email) return { ok: false, message: `${lead.name} has no email to automate.` };
  if (lead.unsubscribed_at) return { ok: false, message: `${lead.name} has unsubscribed — can't automate.` };

  const { data: activePipe } = await supabase
    .from("pipelines")
    .select("id")
    .eq("lead_id", leadId)
    .eq("status", "active")
    .maybeSingle();
  if (activePipe) return { ok: false, message: `${lead.name} already has an active automation.` };

  const { data: pending } = await supabase
    .from("approvals")
    .select("id")
    .eq("type", "pipeline_start")
    .eq("lead_id", leadId)
    .eq("status", "pending")
    .maybeSingle();
  if (pending) return { ok: true, message: `Already asked you on Telegram to automate ${lead.name}.` };

  const { data: approval } = await supabase
    .from("approvals")
    .insert({
      type: "pipeline_start",
      lead_id: leadId,
      title: `Automate outreach to ${lead.name}?`,
      summary: "Start the automated workflow: I'll draft an outreach email for your approval, then move it to contacted and handle replies, qualifying and booking a discovery call.",
      meta: { lead_id: leadId },
    })
    .select()
    .single<Approval>();
  if (!approval) return { ok: false, message: "Could not create the approval." };

  await notifyCeo(
    `🤖 Start the automated workflow for ${lead.name}? I'll research them, draft an outreach email for your approval, and take it from there.`,
    decideButtons(approval.id),
  );
  return { ok: true, message: `Asked you on Telegram — approve there (or in the inbox) to start automating ${lead.name}.` };
}

/** Manual reply path (fallback before Gmail is wired, or from the Manager tool). */
export async function recordManualReply(
  supabase: SupabaseClient,
  leadId: string,
  replyText: string,
): Promise<{ ok: boolean; message: string }> {
  const { data: p } = await supabase
    .from("pipelines")
    .select("*")
    .eq("lead_id", leadId)
    .eq("status", "active")
    .in("stage", ["awaiting_reply", "awaiting_booking"])
    .maybeSingle<Pipeline>();
  if (!p) return { ok: false, message: "That lead has no active automation waiting on a reply." };
  await advanceOnReply(supabase, p, replyText);
  return { ok: true, message: "Reply recorded — the automation advanced." };
}

/** Starts an automation for a single lead (dashboard/Manager). Skips straight to outreach draft. */
export async function startLeadPipeline(supabase: SupabaseClient, leadId: string): Promise<{ ok: boolean; message: string }> {
  const { data: existing } = await supabase.from("pipelines").select("id").eq("lead_id", leadId).eq("status", "active").maybeSingle();
  if (existing) return { ok: false, message: "This lead already has an active automation." };
  const { data: lead } = await supabase.from("leads").select("id, name, email, unsubscribed_at").eq("id", leadId).maybeSingle<Pick<Lead, "id" | "name" | "email" | "unsubscribed_at">>();
  if (!lead) return { ok: false, message: "Lead not found." };
  if (lead.unsubscribed_at) return { ok: false, message: `${lead.name} has unsubscribed.` };

  const { data: p } = await supabase.from("pipelines").insert({ lead_id: leadId, stage: "queued", status: "active" }).select().single<Pipeline>();
  // Draft immediately (single lead — no prospect promotion needed).
  const outreach = await runOutreach(supabase, { leadId, instruction: "First-touch outreach.", source: "agent" });
  if (p && outreach.ok) {
    await setStage(supabase, p.id, "awaiting_email_approval", { email_id: outreach.data.emailId });
    await logPipeline(supabase, leadId, "Automation started: outreach drafted, awaiting your approval");
    return { ok: true, message: `Drafted outreach to ${lead.name} — approve it in the inbox to send.` };
  }
  if (p) await complete(supabase, p, "outreach_failed");
  return { ok: false, message: outreach.ok ? "Could not start." : outreach.error };
}

/** Pipeline counts per stage for status reporting. */
export async function pipelineStatus(supabase: SupabaseClient): Promise<Record<string, number>> {
  const { data } = await supabase.from("pipelines").select("stage").eq("status", "active");
  const counts: Record<string, number> = {};
  for (const row of data || []) counts[row.stage] = (counts[row.stage] || 0) + 1;
  return counts;
}
