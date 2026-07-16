import type { SupabaseClient } from "@supabase/supabase-js";
import type { Lead } from "@/lib/supabase";
import { normalizePhoneE164 } from "@/lib/phone";
import { notifyCeo } from "@/lib/telegram";

export type VoiceContactArgs = {
  callId?: string | null;
  /** Book/save directly against this lead (e.g. an email-reply booking) — skips the call lookup. */
  leadId?: string | null;
  name?: string;
  email?: string;
  phone?: string;
  service?: string;
};

/**
 * Finds (or creates) the CRM lead behind an in-progress voice call, so every
 * caller who gives a name + email is captured in the CRM regardless of
 * whether they end up booking — and every tool call in the same conversation
 * (save_contact, book_appointment) lands on the same lead instead of
 * creating duplicates.
 *
 * `leads.email` is a required column, so a bare name or phone alone isn't
 * enough to create a row — that's also the anti-junk gate: a caller has to
 * give a real, spellable email before this creates anything.
 */
export async function resolveOrCreateVoiceLead(
  supabase: SupabaseClient,
  args: VoiceContactArgs,
): Promise<{ lead: Lead | null; isNewLead: boolean }> {
  const name = args.name?.trim();
  const email = args.email?.trim();
  const phone = args.phone?.trim();
  const normalizedPhone = normalizePhoneE164(phone);

  if (args.leadId) {
    const { data } = await supabase.from("leads").select("*").eq("id", args.leadId).maybeSingle<Lead>();
    if (data) {
      await fillMissingFields(supabase, data, { name, phone, service: args.service });
      return { lead: data, isNewLead: false };
    }
  }

  // Already resolved earlier this call (by save_contact or a prior tool call)?
  let callRow: { id: string; lead_id: string | null } | null = null;
  if (args.callId) {
    const { data } = await supabase
      .from("calls")
      .select("id, lead_id")
      .eq("provider_call_id", args.callId)
      .maybeSingle<{ id: string; lead_id: string | null }>();
    callRow = data ?? null;
    if (callRow?.lead_id) {
      const { data: lead } = await supabase.from("leads").select("*").eq("id", callRow.lead_id).maybeSingle<Lead>();
      if (lead) {
        await fillMissingFields(supabase, lead, { name, phone, service: args.service });
        return { lead, isNewLead: false };
      }
    }
  }

  // A repeat caller — match an existing lead by email or phone so separate
  // calls don't duplicate them.
  let lead: Lead | null = null;
  if (email) {
    const { data } = await supabase.from("leads").select("*").eq("email", email).maybeSingle<Lead>();
    lead = data ?? null;
  }
  if (!lead && normalizedPhone) {
    const { data } = await supabase.from("leads").select("*").eq("phone", normalizedPhone).maybeSingle<Lead>();
    lead = data ?? null;
  }

  let isNewLead = false;
  if (lead) {
    await fillMissingFields(supabase, lead, { name, phone, service: args.service });
  } else if (name && email) {
    const { data, error } = await supabase
      .from("leads")
      .insert({
        name,
        email,
        phone: normalizedPhone || phone || null,
        interest: args.service || null,
        pain_point: "Inbound voice caller — see the call transcript for context.",
        source: "voice",
        status: "new",
      })
      .select("*")
      .single<Lead>();
    if (!error && data) {
      lead = data;
      isNewLead = true;
    }
  }

  // Link the call row to this lead so later tool calls in the same
  // conversation resolve to it instead of re-matching or duplicating.
  if (lead && args.callId) {
    if (callRow) {
      if (!callRow.lead_id) await supabase.from("calls").update({ lead_id: lead.id }).eq("id", callRow.id);
    } else {
      await supabase.from("calls").insert({
        lead_id: lead.id,
        provider: "retell",
        provider_call_id: args.callId,
        direction: "inbound",
        status: "in_progress",
      });
    }
  }

  if (lead && isNewLead) {
    await supabase.from("lead_activities").insert({
      lead_id: lead.id,
      type: "call",
      title: `New lead captured from an inbound voice call: ${lead.name}`,
      meta: { source: "voice" },
      actor: "agent:voice",
    });
    await notifyCeo(`📞 New lead from a voice call: ${lead.name}${lead.phone ? ` (${lead.phone})` : ""} — ${lead.email}`);
  }

  return { lead, isNewLead };
}

/**
 * Backfills details on an existing lead as the call reveals them. Only ever
 * fills blanks, with one deliberate exception: a name the agent later corrects
 * to a fuller version of the same name (see `isFullerName`).
 */
async function fillMissingFields(
  supabase: SupabaseClient,
  lead: Lead,
  fill: { name?: string; phone?: string; service?: string },
): Promise<void> {
  const patch: Record<string, unknown> = {};
  if (!lead.phone && fill.phone) patch.phone = normalizePhoneE164(fill.phone) || fill.phone;
  if (!lead.interest && fill.service) patch.interest = fill.service;
  if (fill.name && isFullerName(lead.name, fill.name)) patch.name = fill.name.trim();
  if (Object.keys(patch).length) {
    await supabase.from("leads").update(patch).eq("id", lead.id);
    Object.assign(lead, patch);
  }
}

/**
 * True when `next` is the same name as `current` but more complete — "Anil Babu"
 * -> "Anil Babu Botta". Speech recognition regularly clips a surname, and the
 * agent corrects itself a turn later (often once it hears the email), so we let
 * that correction land.
 *
 * Deliberately strict: `next` must extend `current` on a whole-word boundary.
 * A different name ("Bob Smith"), a shortening, or a garbled retry is left
 * alone — a wrong overwrite is worse than a missing surname, and a shared
 * mailbox can legitimately reach a different person.
 */
function isFullerName(current: string, next: string): boolean {
  const a = normalizeName(current);
  const b = normalizeName(next);
  return b.length > a.length && b.startsWith(`${a} `);
}

function normalizeName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}
