import { addDays, addMinutes, isBefore } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import type { SupabaseClient } from "@supabase/supabase-js";

export const BOOKING_CONFIG = {
  timezone: "America/Toronto",
  workingDays: [1, 2, 3, 4, 5], // Mon-Fri
  startHour: 9,
  endHour: 17,
  slotMinutes: 30,
  minLeadHours: 12,
  horizonDays: 14,
};

export type Slot = {
  startsAt: string; // UTC ISO
  endsAt: string; // UTC ISO
  label: string; // e.g. "9:00 AM"
};

export type BookableDay = {
  date: string; // YYYY-MM-DD in business timezone
  label: string; // e.g. "Mon, Jul 6"
};

function zonedDayOfWeek(date: string) {
  // Anchor at noon business time so DST shifts cannot move the weekday.
  const noon = fromZonedTime(`${date}T12:00:00`, BOOKING_CONFIG.timezone);
  return Number(formatInTimeZone(noon, BOOKING_CONFIG.timezone, "i")) % 7;
}

export function isWorkingDay(date: string) {
  return BOOKING_CONFIG.workingDays.includes(zonedDayOfWeek(date));
}

export function getBookableDays(now = new Date()): BookableDay[] {
  const days: BookableDay[] = [];
  const todayInTz = formatInTimeZone(now, BOOKING_CONFIG.timezone, "yyyy-MM-dd");
  let cursor = fromZonedTime(`${todayInTz}T12:00:00`, BOOKING_CONFIG.timezone);

  for (let i = 0; i <= BOOKING_CONFIG.horizonDays && days.length < BOOKING_CONFIG.horizonDays; i += 1) {
    const date = formatInTimeZone(cursor, BOOKING_CONFIG.timezone, "yyyy-MM-dd");
    if (isWorkingDay(date) && generateSlotsForDay(date, now).length > 0) {
      days.push({
        date,
        label: formatInTimeZone(cursor, BOOKING_CONFIG.timezone, "EEE, MMM d"),
      });
    }
    cursor = addDays(cursor, 1);
  }

  return days;
}

export function generateSlotsForDay(date: string, now = new Date()): Slot[] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !isWorkingDay(date)) {
    return [];
  }

  const earliest = addMinutes(now, BOOKING_CONFIG.minLeadHours * 60);
  const horizon = addDays(now, BOOKING_CONFIG.horizonDays + 1);
  const slots: Slot[] = [];

  const start = String(BOOKING_CONFIG.startHour).padStart(2, "0");
  let cursor = fromZonedTime(`${date}T${start}:00:00`, BOOKING_CONFIG.timezone);
  const dayEnd = fromZonedTime(
    `${date}T${String(BOOKING_CONFIG.endHour).padStart(2, "0")}:00:00`,
    BOOKING_CONFIG.timezone
  );

  while (isBefore(cursor, dayEnd)) {
    const ends = addMinutes(cursor, BOOKING_CONFIG.slotMinutes);
    if (!isBefore(cursor, earliest) && isBefore(cursor, horizon)) {
      slots.push({
        startsAt: cursor.toISOString(),
        endsAt: ends.toISOString(),
        label: formatInTimeZone(cursor, BOOKING_CONFIG.timezone, "h:mm a"),
      });
    }
    cursor = ends;
  }

  return slots;
}

export function isValidSlot(startsAtISO: string, now = new Date()) {
  const startsAt = new Date(startsAtISO);
  if (Number.isNaN(startsAt.getTime())) {
    return false;
  }

  const date = formatInTimeZone(startsAt, BOOKING_CONFIG.timezone, "yyyy-MM-dd");
  return generateSlotsForDay(date, now).some((slot) => slot.startsAt === startsAt.toISOString());
}

export function slotEndsAt(startsAtISO: string) {
  return addMinutes(new Date(startsAtISO), BOOKING_CONFIG.slotMinutes).toISOString();
}

/**
 * Human slot label. Defaults to the business timezone; pass an attendee's IANA
 * zone to render the same instant in THEIR local time (e.g. for a confirmation
 * email to a lead in India). Falls back to the business zone if `tz` is invalid.
 */
export function formatSlotForHumans(startsAtISO: string, tz: string = BOOKING_CONFIG.timezone) {
  const zone = isValidTimezone(tz) ? tz : BOOKING_CONFIG.timezone;
  return formatInTimeZone(new Date(startsAtISO), zone, "EEEE, MMMM d 'at' h:mm a zzz");
}

/**
 * True if `tz` is a real IANA zone (guards LLM- and browser-supplied values).
 *
 * Requires a region/city form ("Asia/Kolkata") or "UTC". Bare abbreviations are
 * deliberately rejected even though the runtime accepts them: they resolve to
 * FIXED-OFFSET zones that ignore daylight saving, so "EST" renders 10:00 AM for
 * an instant that is really 11:00 AM EDT in Toronto, and "GMT" ignores BST. A
 * wrong time in a client's confirmation is worse than falling back to ours.
 */
export function isValidTimezone(tz: string | null | undefined): tz is string {
  if (!tz) return false;
  if (tz !== "UTC" && !tz.includes("/")) return false;
  try {
    formatInTimeZone(new Date(), tz, "yyyy");
    return true;
  } catch {
    return false;
  }
}

/**
 * Available slots for a day. Uses Supabase when configured; in demo mode it
 * deterministically hides a few slots so the widget looks realistic.
 */
export async function getAvailableSlots(
  supabase: SupabaseClient | null,
  date: string,
  now = new Date()
): Promise<{ slots: Slot[]; demoMode: boolean }> {
  const raw = generateSlotsForDay(date, now);

  if (!supabase) {
    const seed = date.split("-").reduce((acc, part) => acc + Number(part), 0);
    const demoSlots = raw.filter((_, index) => (index + seed) % 5 !== 0 && (index + seed) % 7 !== 0);
    return { slots: demoSlots, demoMode: true };
  }

  if (raw.length === 0) {
    return { slots: [], demoMode: false };
  }

  const dayStart = raw[0].startsAt;
  const dayEnd = raw[raw.length - 1].endsAt;
  const { data, error } = await supabase
    .from("appointments")
    .select("starts_at")
    .gte("starts_at", dayStart)
    .lt("starts_at", dayEnd)
    .in("status", ["pending", "confirmed"]);

  if (error) {
    throw new Error(error.message);
  }

  const taken = new Set((data || []).map((row) => new Date(row.starts_at).toISOString()));
  return { slots: raw.filter((slot) => !taken.has(slot.startsAt)), demoMode: false };
}

export function formatDayLabel(date: string) {
  const noon = fromZonedTime(`${date}T12:00:00`, BOOKING_CONFIG.timezone);
  return formatInTimeZone(noon, BOOKING_CONFIG.timezone, "EEE, MMM d");
}
