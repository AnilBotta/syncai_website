import { NextResponse } from "next/server";
import {
  createSupabaseAdminClient,
  hasSupabaseAdminConfig,
  type Appointment,
  verifyAdminToken,
} from "@/lib/supabase";
import { appointmentUpdateSchema } from "@/lib/validators";
import { serverErrorResponse } from "@/lib/api-errors";

const demoAppointments: Appointment[] = [
  {
    id: "demo-1",
    created_at: new Date().toISOString(),
    name: "Demo Clinic Owner",
    email: "owner@example.com",
    phone: "+1 437-925-2349",
    company: "Demo Dental Studio",
    service: "AI voice agent",
    notes: "Booked via the website chatbot in demo mode.",
    starts_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    ends_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
    timezone: "America/Toronto",
    status: "pending",
    source: "chatbot",
    lead_id: null,
  },
];

export async function GET(request: Request) {
  const user = await verifyAdminToken(request.headers.get("authorization"));

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ appointments: demoAppointments, demoMode: true });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .order("starts_at", { ascending: true });

  if (error) {
    return serverErrorResponse("admin/appointments:GET", error);
  }

  return NextResponse.json({ appointments: data });
}

export async function PATCH(request: Request) {
  const user = await verifyAdminToken(request.headers.get("authorization"));

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = appointmentUpdateSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid appointment update." }, { status: 400 });
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ ok: true, demoMode: true });
  }

  const update: Record<string, string> = {};
  if (parsed.data.status) {
    update.status = parsed.data.status;
  }
  if (typeof parsed.data.notes === "string") {
    update.notes = parsed.data.notes;
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("appointments").update(update).eq("id", parsed.data.id);

  if (error) {
    return serverErrorResponse("admin/appointments:PATCH", error);
  }

  return NextResponse.json({ ok: true });
}
