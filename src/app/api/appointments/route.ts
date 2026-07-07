import { NextResponse } from "next/server";
import { formatSlotForHumans, isValidSlot, slotEndsAt } from "@/lib/booking";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase";
import { appointmentSchema } from "@/lib/validators";
import { serverErrorResponse } from "@/lib/api-errors";

export async function POST(request: Request) {
  const parsed = appointmentSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please provide your name, email, and a valid appointment time." },
      { status: 400 }
    );
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
      ends_at: slotEndsAt(startsAt),
      timezone: appointment.timezone,
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

  return NextResponse.json({
    ok: true,
    appointment: { id: data.id, startsAt: data.starts_at, humanTime },
  });
}
