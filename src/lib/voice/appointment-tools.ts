import { addDays } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  BOOKING_CONFIG,
  formatDayLabel,
  formatSlotForHumans,
  getAvailableSlots,
  getBookableDays,
  isValidSlot,
  isValidTimezone,
  slotEndsAt,
} from "@/lib/booking";
import { finalizeBooking } from "@/lib/appointments";
import { resolveOrCreateVoiceLead } from "@/lib/voice/lead-capture";

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
export function resolveSpokenDate(
  input: string | undefined | null,
  now = new Date(),
  tz: string = BOOKING_CONFIG.timezone,
): string | null {
  if (!input) return null;
  const s = input.trim().toLowerCase();

  // Resolve relative words ("today", "thursday") in the SPEAKER's timezone —
  // "tomorrow" means tomorrow where they are, not where the business is.
  const TZ = isValidTimezone(tz) ? tz : BOOKING_CONFIG.timezone;
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

const NUM_WORDS: Record<string, number> = {
  oh: 0, zero: 0,
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
  twenty: 20, thirty: 30, forty: 40, fifty: 50,
};

const COMPOUND_RE = /\b(twenty|thirty|forty|fifty)[\s-](one|two|three|four|five|six|seven|eight|nine)\b/g;
const NUM_WORD_RE = new RegExp(`\\b(${Object.keys(NUM_WORDS).join("|")})\\b`, "g");

/** "nine thirty" -> "9 30"; "ten forty five" -> "10 45". */
function spokenNumbersToDigits(input: string): string {
  return input
    .replace(COMPOUND_RE, (_full, tens: string, units: string) => String(NUM_WORDS[tens] + NUM_WORDS[units]))
    .replace(NUM_WORD_RE, (word) => String(NUM_WORDS[word]));
}

/**
 * Parses a spoken clock time to 24-hour hour/minute, or null.
 *
 * Callers say times as words far more often than digits, and the tool-calling
 * model passes them straight through — "nine thirty", "ten o'clock", "half
 * past nine". Anything this can't read makes the agent re-ask a caller who
 * already answered clearly, so it's deliberately generous.
 */
function parseSpokenClock(raw: string): { hour: number; minute: number } | null {
  const s = raw.trim().toLowerCase().replace(/[.,]/g, "");
  if (/\b(noon|midday)\b/.test(s)) return { hour: 12, minute: 0 };
  if (/\bmidnight\b/.test(s)) return { hour: 0, minute: 0 };

  // Read the meridiem before stripping it out of the digits.
  const pm = /(\bp\s?m\b|afternoon|evening|tonight)/.test(s);
  const am = /(\ba\s?m\b|morning)/.test(s);

  let body = s
    .replace(/\b[ap]\s?m\b/g, " ")
    .replace(/\bin the (morning|afternoon|evening)\b/g, " ")
    .replace(/\bo'?clock\b/g, " ")
    .replace(/^\s*at\b/, " ");

  // "half past nine" -> "nine 30"; "quarter past nine" -> "nine 15".
  body = body.replace(/\bhalf past\s+(\S+)/, "$1 30").replace(/\bquarter past\s+(\S+)/, "$1 15");
  const quarterTo = body.match(/\bquarter to\s+(\S+)/);
  body = spokenNumbersToDigits(body);

  if (quarterTo) {
    const target = parseInt(spokenNumbersToDigits(quarterTo[1]), 10);
    if (!Number.isInteger(target) || target < 1 || target > 12) return null;
    return applyMeridiem(target === 1 ? 12 : target - 1, 45, am, pm);
  }

  // Anchored at the start so junk can't be read as a time, but trailing words
  // ("9 30 eastern") are tolerated.
  const m = body.trim().match(/^(\d{1,2})\s*(?::\s*)?(\d{1,2})?\b/);
  if (!m) return null;
  const hour = parseInt(m[1], 10);
  const minute = m[2] ? parseInt(m[2], 10) : 0;
  if (hour > 24 || minute > 59) return null;
  return applyMeridiem(hour, minute, am, pm);
}

function applyMeridiem(
  hour: number,
  minute: number,
  am: boolean,
  pm: boolean,
): { hour: number; minute: number } | null {
  let h = hour;
  if (pm && h < 12) h += 12;
  else if (am && h === 12) h = 0;
  else if (!am && !pm && h >= 1 && h <= 8) h += 12; // bare "2" -> 2 PM (within 9-5)
  if (h < 0 || h > 23) return null;
  return { hour: h, minute };
}

/**
 * Turns a spoken date + time ("2026-07-15", "2 PM" / "nine thirty" / "14:00")
 * into a UTC slot ISO in the business timezone. Snaps to the 30-minute grid the
 * booker offers. Returns null if it can't be parsed.
 */
export function parseSpokenTimeToIso(
  date: string,
  time: string,
  tz: string = BOOKING_CONFIG.timezone,
): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !time) return null;
  const clock = parseSpokenClock(time);
  if (!clock) return null;

  let { hour } = clock;
  let minute = clock.minute;

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
  // "11am" means 11am where the SPEAKER is — interpret in their zone, not ours.
  const zone = isValidTimezone(tz) ? tz : BOOKING_CONFIG.timezone;
  const iso = fromZonedTime(`${date}T${hh}:${mm}:00`, zone).toISOString();
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
    phone?: string;
    service?: string;
    notes?: string;
    source?: string;
    /** The attendee's IANA timezone; their day/time is interpreted in it. */
    attendeeTimezone?: string | null;
  },
): Promise<{ success: boolean; message: string }> {
  if (!args.date || !args.time) {
    return { success: false, message: "What day and time would you like to book?" };
  }
  // Interpret the spoken day/time in the attendee's zone when we know it, so
  // "11am" from a lead in India books 11am IST — not 11am Toronto.
  const speakerTz = isValidTimezone(args.attendeeTimezone) ? args.attendeeTimezone : BOOKING_CONFIG.timezone;
  const resolvedDate = resolveSpokenDate(args.date, new Date(), speakerTz);
  if (!resolvedDate) {
    return { success: false, message: "Which day would you like — for example 'tomorrow', 'next Tuesday', or a specific date?" };
  }
  const iso = parseSpokenTimeToIso(resolvedDate, args.time, speakerTz);
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

  // Resolve (or create) the lead this booking belongs to — same helper
  // save_contact uses, so a caller who books ends up in the CRM even if
  // save_contact was never triggered earlier in the call.
  const { lead } = await resolveOrCreateVoiceLead(supabase, {
    callId: args.callId,
    leadId: args.leadId,
    name: args.name,
    email: args.email,
    phone: args.phone,
    service: args.service,
  });

  const name = args.name?.trim() || lead?.name;
  const email = args.email?.trim() || lead?.email;
  const phone = args.phone?.trim() || lead?.phone || null;
  if (!name) return { success: false, message: "Can I get your name for the booking?" };
  if (!email) return { success: false, message: "What's the best email to send your confirmation to?" };

  const service = args.service || lead?.interest || "Discovery call";
  const endsAt = slotEndsAt(iso);
  const { data, error } = await supabase
    .from("appointments")
    .insert({
      name,
      email,
      phone,
      company: lead?.company || null,
      service,
      notes: args.notes || "Booked by the SyncAI voice agent during a call.",
      starts_at: iso,
      ends_at: endsAt,
      timezone: BOOKING_CONFIG.timezone,
      attendee_timezone: isValidTimezone(args.attendeeTimezone) ? args.attendeeTimezone : null,
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
    phone,
    company: lead?.company || null,
    service,
    starts_at: iso,
    ends_at: endsAt,
    timezone: BOOKING_CONFIG.timezone,
    attendee_timezone: isValidTimezone(args.attendeeTimezone) ? args.attendeeTimezone : null,
    source: args.source || "voice",
    lead_id: lead?.id || null,
  });

  return {
    success: true,
    message: `You're all set for ${humanTime}. You'll receive a confirmation email shortly. Is there anything else I can help you with?`,
  };
}
