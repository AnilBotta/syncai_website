import { addDays } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
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
import { finalizeBooking } from "@/lib/appointments";

const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

/**
 * Resolves a spoken date to YYYY-MM-DD in the business timezone. Handles exact
 * ISO dates AND relative language ("today", "tomorrow", "next tuesday",
 * "july 15", "next week") — computed server-side, where we always know the real
 * current date, so it never depends on the voice model knowing today's date.
 * Returns null if it can't be resolved.
 */
export function resolveSpokenDate(input: string | undefined | null, now = new Date()): string | null {
  if (!input) return null;
  const s = input.trim().toLowerCase();

  const TZ = BOOKING_CONFIG.timezone;
  const todayStr = formatInTimeZone(now, TZ, "yyyy-MM-dd");
  const todayNoon = fromZonedTime(`${todayStr}T12:00:00`, TZ);
  const fmt = (d: Date) => formatInTimeZone(d, TZ, "yyyy-MM-dd");
  // ISO weekday 1..7 (Mon..Sun) -> 0..6 (Sun..Sat) to match WEEKDAYS.
  const todayDow = Number(formatInTimeZone(todayNoon, TZ, "i")) % 7;

  // Exact ISO date. Never trust the YEAR the model sends — LLMs routinely emit a
  // stale year (e.g. 2024). Since we only book into the near future, a past ISO
  // date is a wrong-year hallucination: keep the month/day, roll to the current
  // year (or next if that's already past).
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    if (s >= todayStr) return s;
    const curYear = Number(formatInTimeZone(now, TZ, "yyyy"));
    let candidate = `${curYear}-${iso[2]}-${iso[3]}`;
    if (candidate < todayStr) candidate = `${curYear + 1}-${iso[2]}-${iso[3]}`;
    return candidate;
  }

  if (s === "today" || s === "tonight") return todayStr;
  if (s.includes("day after tomorrow")) return fmt(addDays(todayNoon, 2));
  if (s === "tomorrow" || s === "tomorow" || s === "tmrw") return fmt(addDays(todayNoon, 1));

  // "next week" -> next Monday.
  if (s.includes("next week")) {
    const delta = ((1 - todayDow + 7) % 7) || 7;
    return fmt(addDays(todayNoon, delta));
  }

  // Weekday names, optionally prefixed with "next".
  const wd = s.match(/(next\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/);
  if (wd) {
    const target = WEEKDAYS.indexOf(wd[2]);
    let delta = (target - todayDow + 7) % 7;
    if (delta === 0) delta = 7; // "monday" said on a Monday means the next one
    return fmt(addDays(todayNoon, delta));
  }

  // Month + day, in either order ("july 15", "15 july", "jul 15th").
  const md = s.match(/(?:(\d{1,2})\s+)?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*(\d{1,2})?/);
  if (md) {
    const monIdx = MONTHS.findIndex((m) => m.startsWith(md[2]));
    const day = md[3] ? parseInt(md[3], 10) : md[1] ? parseInt(md[1], 10) : NaN;
    if (monIdx >= 0 && day >= 1 && day <= 31) {
      const year = Number(formatInTimeZone(now, TZ, "yyyy"));
      const mm = String(monIdx + 1).padStart(2, "0");
      const dd = String(day).padStart(2, "0");
      let candidate = `${year}-${mm}-${dd}`;
      if (candidate < todayStr) candidate = `${year + 1}-${mm}-${dd}`; // already passed -> next year
      return candidate;
    }
  }

  return null;
}

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
  const resolved = resolveSpokenDate(date);
  if (resolved) {
    const { slots } = await getAvailableSlots(supabase, resolved);
    if (!slots.length) {
      // No slots that day (weekend, too soon, or fully booked) — offer the real next openings.
      const next = await nextOpenDaysMessage(supabase);
      return { message: `We don't have any openings on ${formatDayLabel(resolved)}. ${next}` };
    }
    const times = slots.slice(0, 6).map((s) => s.label).join(", ");
    return { message: `On ${formatDayLabel(resolved)} we have: ${times}. Which time works best for you?` };
  }

  return { message: await nextOpenDaysMessage(supabase) };
}

/** Spoken summary of the next few days that actually have open slots. */
async function nextOpenDaysMessage(supabase: SupabaseClient): Promise<string> {
  const days = getBookableDays().slice(0, 4);
  const parts: string[] = [];
  for (const d of days) {
    const { slots } = await getAvailableSlots(supabase, d.date);
    if (slots.length) parts.push(`${d.label}: ${slots.slice(0, 3).map((s) => s.label).join(", ")}`);
    if (parts.length >= 3) break;
  }
  if (!parts.length) return "We don't have any open slots in the next couple of weeks right now.";
  return `Here are our next openings — ${parts.join("; ")}. What day and time would you like?`;
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
    /** Book directly for this lead (e.g. from an email reply) — skips the call lookup. */
    leadId?: string | null;
    date?: string;
    time?: string;
    name?: string;
    email?: string;
    service?: string;
    notes?: string;
    source?: string;
  },
): Promise<{ success: boolean; message: string }> {
  if (!args.date || !args.time) {
    return { success: false, message: "What day and time would you like to book?" };
  }
  const resolvedDate = resolveSpokenDate(args.date);
  if (!resolvedDate) {
    return { success: false, message: "Which day would you like — for example 'tomorrow', 'next Tuesday', or a specific date?" };
  }
  const iso = parseSpokenTimeToIso(resolvedDate, args.time);
  if (!iso) {
    return { success: false, message: "I didn't quite catch the time — could you say it again, like '2 PM' or '10:30 in the morning'?" };
  }
  if (!isValidSlot(iso)) {
    const next = await nextOpenDaysMessage(supabase);
    return {
      success: false,
      message: `That time isn't available — we book weekdays, 9 to 5 Eastern, at least 12 hours out. ${next}`,
    };
  }

  // Resolve the lead: an explicit leadId (email-reply booking) wins, else from the call.
  let lead: Lead | null = null;
  if (args.leadId) {
    const { data } = await supabase.from("leads").select("*").eq("id", args.leadId).maybeSingle<Lead>();
    lead = data ?? null;
  } else if (args.callId) {
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

  const service = args.service || lead?.interest || "Discovery call";
  const endsAt = slotEndsAt(iso);
  const { data, error } = await supabase
    .from("appointments")
    .insert({
      name,
      email,
      phone: lead?.phone || null,
      company: lead?.company || null,
      service,
      notes: args.notes || "Booked by the SyncAI voice agent during a call.",
      starts_at: iso,
      ends_at: endsAt,
      timezone: BOOKING_CONFIG.timezone,
      source: args.source || "voice",
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
  // Create the Zoom meeting, email the client, and ping the CEO with the link.
  await finalizeBooking(supabase, {
    id: data.id,
    name,
    email,
    phone: lead?.phone || null,
    company: lead?.company || null,
    service,
    starts_at: iso,
    ends_at: endsAt,
    timezone: BOOKING_CONFIG.timezone,
    source: args.source || "voice",
    lead_id: lead?.id || null,
  });

  return {
    success: true,
    message: `You're all set for ${humanTime}. You'll receive a confirmation email shortly. Is there anything else I can help you with?`,
  };
}
