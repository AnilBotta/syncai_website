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
      await fillMissingFields(supabase, data, { name, phone, service: args.service }, false);
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
        // Same call: the agent is correcting what it captured moments ago
        // (a mis-heard name, a fixed spelling), so a full replacement is safe.
        await fillMissingFields(supabase, lead, { name, phone, service: args.service }, true);
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
    // Cross-call match: this could be a different person on a shared mailbox,
    // so only extend a name, never replace it.
    await fillMissingFields(supabase, lead, { name, phone, service: args.service }, false);
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
 * Backfills details on an existing lead as the call reveals them. Phone and
 * interest only ever fill blanks. Name follows `shouldReplaceName`, whose rules
 * depend on whether this is the same call (`sameCall`).
 */
async function fillMissingFields(
  supabase: SupabaseClient,
  lead: Lead,
  fill: { name?: string; phone?: string; service?: string },
  sameCall: boolean,
): Promise<void> {
  const patch: Record<string, unknown> = {};
  if (!lead.phone && fill.phone) patch.phone = normalizePhoneE164(fill.phone) || fill.phone;
  if (!lead.interest && fill.service) patch.interest = fill.service;
  if (fill.name && shouldReplaceName(lead.name, fill.name, sameCall)) patch.name = fill.name.trim();
  if (Object.keys(patch).length) {
    await supabase.from("leads").update(patch).eq("id", lead.id);
    Object.assign(lead, patch);
  }
}

/**
 * Decides whether a newly-heard name should overwrite the one on file.
 *
 * Speech recognition mangles names constantly — a clipped surname ("Anil Babu"
 * for "Anil Babu Botta"), or a wholesale mis-hear ("Anish Butter" for "Anil
 * Botta") that the agent fixes a turn later once it hears the spelling or the
 * email. We want those corrections to land, without ever letting one caller's
 * bad audio clobber a different real person.
 *
 * - Always accept a name that *extends* the current one on a word boundary
 *   ("Anil Babu" -> "Anil Babu Botta"), regardless of call.
 * - `sameCall` (the agent correcting itself within one live call) also accepts
 *   a genuine replacement — but never one that drops to fewer words, so a
 *   partial re-mention ("Anil") can't shrink a good full name.
 * - Cross-call matches stay strict (extend only): a match by shared email or
 *   phone might be a colleague on the same mailbox, and a stranger's ASR must
 *   not rename them.
 */
export function shouldReplaceName(current: string, next: string, sameCall: boolean): boolean {
  const a = normalizeName(current);
  const b = normalizeName(next);
  if (!b || b === a) return false;
  if (isFullerName(a, b)) return true;
  if (!sameCall) return false;
  // Same call: allow a real correction, but never lose information.
  if (wordCount(b) < wordCount(a)) return false;
  if (a.startsWith(`${b} `)) return false; // b is a truncation of a
  return true;
}

/** True when `next` extends `current` on a whole-word boundary. */
function isFullerName(current: string, next: string): boolean {
  const a = normalizeName(current);
  const b = normalizeName(next);
  return b.length > a.length && b.startsWith(`${a} `);
}

function normalizeName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function wordCount(value: string): number {
  return value ? value.split(" ").length : 0;
}
