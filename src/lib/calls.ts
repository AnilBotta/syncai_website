import type { SupabaseClient } from "@supabase/supabase-js";
import type { Call, Lead } from "@/lib/supabase";
import { getVoiceProvider, hasVoiceConfig } from "@/lib/voice";
import type { NormalizedCallEvent } from "@/lib/voice/types";
import { normalizePhoneE164 } from "@/lib/phone";
import { notifyCeo } from "@/lib/telegram";

export type InitiateCallResult =
  | { ok: true; callId: string; provider: string }
  | { ok: false; error: string };

/**
 * Places an outbound call to a lead through the configured voice-agent provider.
 * CEO-initiated (a person triggers each call — no auto-dialing), and only to
 * leads that actually have a phone number. Records a `calls` row + timeline
 * entry; the provider reports the transcript/outcome back via the webhook.
 */
export async function initiateCallForLead(
  supabase: SupabaseClient,
  leadId: string,
  context?: string,
): Promise<InitiateCallResult> {
  if (!hasVoiceConfig()) {
    return { ok: false, error: "No voice provider is configured yet. Add your Retell or Vapi keys to enable calling." };
  }

  const { data: lead } = await supabase.from("leads").select("*").eq("id", leadId).single<Lead>();
  if (!lead) return { ok: false, error: "Lead not found." };
  if (!lead.phone) return { ok: false, error: `${lead.name} has no phone number on file.` };

  // Normalize to E.164 (e.g. "13657777336" -> "+13657777336") so providers accept it.
  const toNumber = normalizePhoneE164(lead.phone);
  if (!toNumber) {
    return {
      ok: false,
      error: `${lead.name}'s phone number ("${lead.phone}") isn't a valid number I can dial. Please use a 10-digit North American number, or the full international format with a country code (e.g. +1 416 555 1234).`,
    };
  }

  const provider = getVoiceProvider();
  const result = await provider.initiateCall({
    leadId: lead.id,
    leadName: lead.name,
    toNumber,
    context: context || lead.pain_point,
  });
  if (!result.ok) return { ok: false, error: result.error };

  const { data: call, error } = await supabase
    .from("calls")
    .insert({
      lead_id: lead.id,
      provider: provider.name,
      provider_call_id: result.providerCallId,
      direction: "outbound",
      to_number: toNumber,
      from_number: result.fromNumber ?? null,
      status: "queued",
      meta: { context: context || null, original_number: lead.phone },
    })
    .select()
    .single<Call>();
  if (error || !call) return { ok: false, error: `Call placed but not recorded: ${error?.message}` };

  await supabase.from("lead_activities").insert({
    lead_id: lead.id,
    type: "call",
    title: `Outbound call started to ${lead.name}`,
    meta: { call_id: call.id, provider: provider.name, provider_call_id: result.providerCallId },
    actor: "ceo",
  });

  return { ok: true, callId: call.id, provider: provider.name };
}

/**
 * Applies a normalized provider webhook event to the matching call: updates
 * status/transcript/summary, and on completion logs a timeline entry + pings the
 * CEO. Idempotent enough for at-least-once webhook delivery.
 */
export async function recordCallEvent(supabase: SupabaseClient, event: NormalizedCallEvent): Promise<boolean> {
  if (!event) return false;

  const { data: call } = await supabase
    .from("calls")
    .select("*")
    .eq("provider_call_id", event.providerCallId)
    .single<Call>();
  if (!call) return false;

  const update: Record<string, unknown> = {};
  if (event.status) update.status = event.status;
  if (event.transcript != null) update.transcript = event.transcript;
  if (event.summary != null) update.summary = event.summary;
  if (event.recordingUrl != null) update.recording_url = event.recordingUrl;
  if (event.durationSeconds != null) update.duration_seconds = event.durationSeconds;
  if (event.startedAt) update.started_at = event.startedAt;
  if (event.endedAt) update.ended_at = event.endedAt;

  if (Object.keys(update).length) {
    await supabase.from("calls").update(update).eq("id", call.id);
  }

  // Log + notify once, when the call finishes.
  const status = event.status;
  const finished = status === "completed" || status === "no_answer" || status === "failed";
  const wasFinished = call.status === "completed" || call.status === "no_answer" || call.status === "failed";
  if (finished && !wasFinished && call.lead_id) {
    const { data: lead } = await supabase.from("leads").select("name").eq("id", call.lead_id).single<{ name: string }>();
    const name = lead?.name || "lead";
    const outcomeLabel = status === "completed" ? "completed" : status === "no_answer" ? "no answer" : "failed";
    const summary = event.summary || (status === "no_answer" ? "No answer." : "Call ended.");
    await supabase.from("lead_activities").insert({
      lead_id: call.lead_id,
      type: "call",
      title: `Call ${outcomeLabel}: ${name}`,
      body: event.summary || null,
      meta: { call_id: call.id, duration_seconds: event.durationSeconds ?? null },
      actor: "agent:voice",
    });
    await notifyCeo(`📞 Call with ${name} ${outcomeLabel}. ${summary}`);
  }

  return true;
}
