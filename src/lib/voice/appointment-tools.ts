import { fromZonedTime } from "date-fns-tz";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Lead } from "@/lib/supabase";
import {
  BOOKING_CONFIG,
  formatDayLabel,
  formatSlotForHumans,
  getAvailableSlots,
  getBookableDays,
  isValidSlot,
  slotEndsAt,
} from "@/lib/booking";
import { notifyCeo } from "@/lib/telegram";

/**
 * Turns a spoken date + time ("2026-07-15", "2 PM" / "2:30pm" / "14:00") into a
 * UTC slot ISO in the business timezone. Snaps to the 30-minute grid and, when a
 * bare hour like "2" is given with no am/pm, assumes afternoon since business
 * hours are 9-5. Returns null if it can't be parsed.
 */
export function parseSpokenTimeToIso(date: string, time: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !time) return null;
  const m = time.trim().toLowerCase().match(/^(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)?$/);
  if (!m) return null;

  let hour = parseInt(m[1], 10);
  let minute = m[2] ? parseInt(m[2], 10) : 0;
  const meridiem = m[3]?.replace(/\./g, "");

  if (meridiem === "pm" && hour < 12) hour += 12;
  else if (meridiem === "am" && hour === 12) hour = 0;
  else if (!meridiem && hour >= 1 && hour <= 8) hour += 12; // bare "2" -> 2 PM (within 9-5)

  // Snap to the nearest half hour the booker uses (:00 / :30).
  if (minute >= 45) {
    hour += 1;
    minute = 0;
  } else if (minute >= 15) {
    minute = 30;
  } else {
    minute = 0;
  }
  if (hour < 0 || hour > 23) return null;

  const hh = String(hour).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");
  const iso = fromZonedTime(`${date}T${hh}:${mm}:00`, BOOKING_CONFIG.timezone).toISOString();
  return Number.isNaN(new Date(iso).getTime()) ? null : iso;
}

/** Spoken-friendly availability, either for a specific day or the next few days. */
export async function checkAvailabilityForVoice(
  supabase: SupabaseClient,
  date?: string | null,
): Promise<{ message: string }> {
  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const { slots } = await getAvailableSlots(supabase, date);
    if (!slots.length) {
      return { message: `We don't have any openings on ${formatDayLabel(date)}. Would you like me to check another day?` };
    }
    const times = slots.slice(0, 6).map((s) => s.label).join(", ");
    return { message: `On ${formatDayLabel(date)} we have: ${times}. Which time works best for you?` };
  }

  const days = getBookableDays().slice(0, 3);
  if (!days.length) return { message: "We don't have any open slots in the next couple of weeks right now." };

  const parts: string[] = [];
  for (const d of days) {
    const { slots } = await getAvailableSlots(supabase, d.date);
    if (slots.length) parts.push(`${d.label}: ${slots.slice(0, 3).map((s) => s.label).join(", ")}`);
  }
  return { message: `Here are our next openings — ${parts.join("; ")}. What day and time would you like?` };
}

/**
 * Books an appointment mid-call. Resolves the lead from the call (so we don't
 * rely on the agent spelling out an email), validates the slot against the same
 * rules as the website booker, writes it to `appointments`, logs it on the lead,
 * and pings the CEO. Returns a message the agent reads back to the caller.
 */
export async function bookAppointmentFromCall(
  supabase: SupabaseClient,
  args: {
    callId?: string | null;
    date?: string;
    time?: string;
    name?: string;
    email?: string;
    service?: string;
    notes?: string;
  },
): Promise<{ success: boolean; message: string }> {
  if (!args.date || !args.time) {
    return { success: false, message: "What day and time would you like to book?" };
  }
  const iso = parseSpokenTimeToIso(args.date, args.time);
  if (!iso) {
    return { success: false, message: "I didn't quite catch that — could you say the day and time again, like 'July 15th at 2 PM'?" };
  }
  if (!isValidSlot(iso)) {
    return {
      success: false,
      message:
        "That time isn't in our booking window — we book weekdays, 9 to 5 Eastern, at least 12 hours out. Could you pick another time?",
    };
  }

  // Resolve the lead from the call so we can default their contact details.
  let lead: Lead | null = null;
  if (args.callId) {
    const { data: call } = await supabase
      .from("calls")
      .select("lead_id")
      .eq("provider_call_id", args.callId)
      .maybeSingle<{ lead_id: string | null }>();
    if (call?.lead_id) {
      const { data } = await supabase.from("leads").select("*").eq("id", call.lead_id).maybeSingle<Lead>();
      lead = data ?? null;
    }
  }

  const name = args.name?.trim() || lead?.name;
  const email = args.email?.trim() || lead?.email;
  if (!name) return { success: false, message: "Can I get your name for the booking?" };
  if (!email) return { success: false, message: "What's the best email to send your confirmation to?" };

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      name,
      email,
      phone: lead?.phone || null,
      company: lead?.company || null,
      service: args.service || lead?.interest || "Discovery call",
      notes: args.notes || "Booked by the SyncAI voice agent during a call.",
      starts_at: iso,
      ends_at: slotEndsAt(iso),
      timezone: BOOKING_CONFIG.timezone,
      source: "voice",
      status: "pending",
      lead_id: lead?.id || null,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { success: false, message: "It looks like that exact time was just taken. Could you pick another slot?" };
    }
    return { success: false, message: "I ran into a problem saving that — I'll have the team follow up to confirm your time." };
  }

  const humanTime = formatSlotForHumans(iso);
  if (lead?.id) {
    await supabase.from("lead_activities").insert({
      lead_id: lead.id,
      type: "system",
      title: `Appointment booked on a call: ${humanTime}`,
      meta: { appointment_id: data.id, source: "voice" },
      actor: "agent:voice",
    });
  }
  await notifyCeo(`📅 ${name} booked an appointment on a voice call: ${humanTime}.`);

  return {
    success: true,
    message: `You're all set for ${humanTime}. You'll receive a confirmation email shortly. Is there anything else I can help you with?`,
  };
}
