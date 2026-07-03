import {
  formatSlotForHumans,
  getAvailableSlots,
  isValidSlot,
  slotEndsAt,
} from "@/lib/booking";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase";
import { appointmentSchema, leadSchema } from "@/lib/validators";

/**
 * Server-side tool executors for the chat route. The voice bot runs the same
 * tools from the browser against the public API routes instead.
 */
export async function executeAssistantTool(
  name: string,
  args: Record<string, unknown>,
  source: string
): Promise<Record<string, unknown>> {
  try {
    switch (name) {
      case "get_available_slots":
        return await runGetAvailableSlots(args);
      case "book_appointment":
        return await runBookAppointment(args, source);
      case "capture_lead":
        return await runCaptureLead(args, source);
      default:
        return { error: `Unknown tool: ${name}` };
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Tool execution failed." };
  }
}

async function runGetAvailableSlots(args: Record<string, unknown>) {
  const date = String(args.date || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { error: "Provide the date as YYYY-MM-DD." };
  }

  const supabase = hasSupabaseAdminConfig() ? createSupabaseAdminClient() : null;
  const { slots, demoMode } = await getAvailableSlots(supabase, date);

  return {
    date,
    timezone: "America/Toronto",
    slots: slots.map((slot) => ({ startsAt: slot.startsAt, label: slot.label })),
    ...(demoMode ? { demoMode: true } : {}),
  };
}

async function runBookAppointment(args: Record<string, unknown>, source: string) {
  const parsed = appointmentSchema.safeParse({ ...args, source });

  if (!parsed.success) {
    return { error: "Booking needs a valid name, email, and slot time (ISO format)." };
  }

  const startsAt = new Date(parsed.data.startsAt).toISOString();

  if (!isValidSlot(startsAt)) {
    return { error: "That time is outside the booking window. Fetch available slots and pick one of them." };
  }

  const humanTime = formatSlotForHumans(startsAt);

  if (!hasSupabaseAdminConfig()) {
    return { booked: true, demoMode: true, startsAt, humanTime };
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("appointments")
    .insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      company: parsed.data.company || null,
      service: parsed.data.service || null,
      notes: parsed.data.notes || null,
      starts_at: startsAt,
      ends_at: slotEndsAt(startsAt),
      timezone: parsed.data.timezone,
      source,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "That slot was just taken. Fetch availability again and offer another time." };
    }
    return { error: error.message };
  }

  return { booked: true, id: data.id, startsAt, humanTime };
}

async function runCaptureLead(args: Record<string, unknown>, source: string) {
  const parsed = leadSchema.safeParse({ ...args, source });

  if (!parsed.success) {
    return { error: "Lead capture needs a name, email, and a described business challenge (a sentence or more)." };
  }

  if (!hasSupabaseAdminConfig()) {
    return { saved: true, demoMode: true };
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("leads").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    company: parsed.data.company || null,
    industry: parsed.data.industry || null,
    pain_point: parsed.data.painPoint,
    interest: parsed.data.interest || null,
    source,
    status: "new",
  });

  if (error) {
    return { error: error.message };
  }

  return { saved: true };
}
