import { addDays, addMinutes, isBefore } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import type { DemoSite } from "./types";

/**
 * Tool executor for the demo sites' AI receptionists.
 *
 * NOTHING HERE TOUCHES A DATABASE, and nothing may be added that does.
 *
 * The real assistant's tools (src/lib/assistant/actions.ts) write to the shared
 * `appointments` and `leads` tables, and `getAvailableSlots` in src/lib/booking.ts
 * filters real availability against that same table with no filter on source. So a
 * demo booking routed through the real path would take a genuine strategy-call slot
 * off Anil's calendar, and /api/appointments would additionally create a Zoom
 * meeting, email the visitor, and fire a Telegram alert. These demo sites are public
 * and unauthenticated, so all of that has to be unreachable from here.
 *
 * The slot maths is deliberately duplicated rather than imported from booking.ts:
 * each fictional business keeps its own opening hours, and a shared helper would be
 * one refactor away from being pointed back at the real calendar.
 */

const TIMEZONE = "America/Toronto";
const SLOT_MINUTES = 30;
const HORIZON_DAYS = 21;

export type DemoToolResult = Record<string, unknown>;

export function createDemoToolExecutor(site: DemoSite) {
  return async function executeDemoTool(
    name: string,
    args: Record<string, unknown>
  ): Promise<DemoToolResult> {
    switch (name) {
      case "get_available_slots":
        return demoSlots(site, String(args.date || ""));
      case "book_appointment":
        return demoBooking(site, args);
      case "capture_lead":
        return demoLead(args);
      default:
        return { error: `Unknown tool: ${name}` };
    }
  };
}

/**
 * Plausible-looking availability, generated from the business's own hours.
 * Deterministic per day so a visitor who asks twice gets a consistent answer,
 * and thinned out so the clinic doesn't look suspiciously empty.
 */
function demoSlots(site: DemoSite, date: string): DemoToolResult {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { error: "Provide the date as YYYY-MM-DD." };
  }

  const now = new Date();
  const noon = fromZonedTime(`${date}T12:00:00`, TIMEZONE);
  const weekday = Number(formatInTimeZone(noon, TIMEZONE, "i")) % 7;

  if (!site.hours.days.includes(weekday)) {
    return { date, timezone: TIMEZONE, slots: [], closed: true, demo: true };
  }
  if (isBefore(noon, addDays(now, -1)) || isBefore(addDays(now, HORIZON_DAYS), noon)) {
    return { date, timezone: TIMEZONE, slots: [], outOfRange: true, demo: true };
  }

  const start = String(site.hours.startHour).padStart(2, "0");
  const end = String(site.hours.endHour).padStart(2, "0");
  let cursor = fromZonedTime(`${date}T${start}:00:00`, TIMEZONE);
  const dayEnd = fromZonedTime(`${date}T${end}:00:00`, TIMEZONE);

  // Two hours' notice, so "this afternoon" stays believable.
  const earliest = addMinutes(now, 120);
  const seed = date.split("-").reduce((total, part) => total + Number(part), 0);

  const slots: { startsAt: string; label: string }[] = [];
  let index = 0;

  while (isBefore(cursor, dayEnd)) {
    const taken = (index + seed) % 3 === 0 || (index + seed) % 7 === 0;
    if (!taken && !isBefore(cursor, earliest)) {
      slots.push({
        startsAt: cursor.toISOString(),
        label: formatInTimeZone(cursor, TIMEZONE, "h:mm a"),
      });
    }
    cursor = addMinutes(cursor, SLOT_MINUTES);
    index += 1;
  }

  return { date, timezone: TIMEZONE, slots, demo: true };
}

/** Confirms on screen. Persists nothing. */
function demoBooking(site: DemoSite, args: Record<string, unknown>): DemoToolResult {
  const name = String(args.name || "").trim();
  const email = String(args.email || "").trim();
  const startsAt = String(args.startsAt || "");

  if (!name || !email) {
    return { error: `Booking needs the patient's name and email.` };
  }

  const when = new Date(startsAt);
  if (Number.isNaN(when.getTime())) {
    return { error: "Use the exact startsAt value returned by get_available_slots." };
  }

  return {
    booked: true,
    demo: true,
    startsAt: when.toISOString(),
    humanTime: formatInTimeZone(when, TIMEZONE, "EEEE, MMMM d 'at' h:mm a"),
    note: `Demo only — no ${site.appointmentNoun} was actually scheduled.`,
  };
}

/** Acknowledges. Persists nothing. */
function demoLead(args: Record<string, unknown>): DemoToolResult {
  const name = String(args.name || "").trim();
  const email = String(args.email || "").trim();

  if (!name || !email) {
    return { error: "Taking details needs a name and an email." };
  }

  return { saved: true, demo: true, note: "Demo only — nothing was stored." };
}
