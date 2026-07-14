import { NextResponse, after } from "next/server";
import { formatSlotForHumans, isValidSlot, isValidTimezone, slotEndsAt } from "@/lib/booking";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase";
import { appointmentSchema } from "@/lib/validators";
import { serverErrorResponse } from "@/lib/api-errors";
import { finalizeBooking } from "@/lib/appointments";
import { clientIpFromRequest, getTurnstileToken, verifyTurnstile } from "@/lib/turnstile";

export async function POST(request: Request) {
  const raw = await request.json().catch(() => null);
  const parsed = appointmentSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please provide your name, email, and a valid appointment time." },
      { status: 400 }
    );
  }

  const token = getTurnstileToken(raw);
  if (!(await verifyTurnstile(token, clientIpFromRequest(request)))) {
    return NextResponse.json({ error: "Human verification failed. Please try again." }, { status: 403 });
  }

  const appointment = parsed.data;
  const startsAt = new Date(appointment.startsAt).toISOString();

  if (!isValidSlot(startsAt)) {
    return NextResponse.json(
      { error: "That time is outside our booking window. Please pick another slot." },
      { status: 400 }
    );
  }

  const humanTime = formatSlotForHumans(startsAt);

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({
      ok: true,
      demoMode: true,
      appointment: { id: "demo-appointment", startsAt, humanTime },
      message: "Appointment accepted in demo mode. Add Supabase environment variables to persist bookings.",
    });
  }

  const supabase = createSupabaseAdminClient();
  const endsAt = slotEndsAt(startsAt);
  const { data, error } = await supabase
    .from("appointments")
    .insert({
      name: appointment.name,
      email: appointment.email,
      phone: appointment.phone || null,
      company: appointment.company || null,
      service: appointment.service || null,
      notes: appointment.notes || null,
      starts_at: startsAt,
      ends_at: endsAt,
      timezone: appointment.timezone,
      attendee_timezone: isValidTimezone(appointment.attendeeTimezone) ? appointment.attendeeTimezone : null,
      source: appointment.source,
      status: "pending",
    })
    .select("id, starts_at")
    .single();

  if (error) {
    // 23505 = unique violation on the active-slot index (someone just took it).
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "That time was just taken. Please pick another slot." },
        { status: 409 }
      );
    }
    return serverErrorResponse("appointments:POST", error);
  }

  // Create the Zoom meeting + send the confirmation + ping the CEO after responding.
  after(async () => {
    await finalizeBooking(supabase, {
      id: data.id,
      name: appointment.name,
      email: appointment.email,
      phone: appointment.phone || null,
      company: appointment.company || null,
      service: appointment.service || null,
      starts_at: startsAt,
      ends_at: endsAt,
      timezone: appointment.timezone,
      attendee_timezone: isValidTimezone(appointment.attendeeTimezone) ? appointment.attendeeTimezone : null,
      source: appointment.source,
      lead_id: null,
    });
  });

  return NextResponse.json({
    ok: true,
    appointment: { id: data.id, startsAt: data.starts_at, humanTime },
  });
}
