import { NextResponse } from "next/server";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase";
import { resolveOrCreateVoiceLead } from "@/lib/voice/lead-capture";
import { parseToolPayload, str, voiceToolAuthorized } from "@/lib/voice/tool-auth";

/**
 * Retell/Vapi custom function: "save_contact". The agent calls this as soon as
 * it has a caller's name and email (phone is a bonus), so the lead is captured
 * in the CRM even if the call never reaches booking. Safe to call more than
 * once per conversation — it resolves to the same lead every time.
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
    return NextResponse.json({ success: true, message: "Got it, thanks." });
  }

  const { args, callId } = parseToolPayload(body);
  const supabase = createSupabaseAdminClient();

  const name = str(args.name);
  const email = str(args.email);
  if (!name || !email) {
    // Not enough to be worth a CRM row yet — ack quietly, no error.
    return NextResponse.json({ success: true, message: "Got it." });
  }

  const { lead } = await resolveOrCreateVoiceLead(supabase, {
    callId,
    name,
    email,
    phone: str(args.phone),
    service: str(args.service),
  });

  return NextResponse.json({
    success: !!lead,
    message: lead ? "Got it, thanks." : "Got it.",
  });
}
