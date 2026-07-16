import { NextResponse } from "next/server";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase";
import { bookAppointmentFromCall } from "@/lib/voice/appointment-tools";
import { parseToolPayload, str, voiceToolAuthorized } from "@/lib/voice/tool-auth";

/**
 * Retell/Vapi custom function: "book_appointment". The agent calls this to book
 * an appointment straight into the dashboard, linked to the lead on the call.
 */
export async function POST(request: Request) {
  if (!voiceToolAuthorized(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ success: false, message: "Our booking system is offline right now — I'll have the team follow up to schedule." });
  }

  const { args, callId } = parseToolPayload(body);
  const supabase = createSupabaseAdminClient();
  const result = await bookAppointmentFromCall(supabase, {
    callId,
    date: str(args.date),
    time: str(args.time),
    name: str(args.name),
    email: str(args.email),
    phone: str(args.phone),
    service: str(args.service),
    notes: str(args.notes),
  });
  return NextResponse.json(result);
}
