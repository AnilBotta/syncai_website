import { NextResponse } from "next/server";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase";
import { checkAvailabilityForVoice } from "@/lib/voice/appointment-tools";
import { parseToolPayload, str, voiceToolAuthorized } from "@/lib/voice/tool-auth";

/**
 * Retell/Vapi custom function: "check_availability". The agent calls this during
 * a call to read the CEO's real calendar. Returns a spoken-friendly message.
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
    return NextResponse.json({ message: "Our booking system is offline right now — I'll have the team follow up to schedule." });
  }

  const { args } = parseToolPayload(body);
  const supabase = createSupabaseAdminClient();
  const result = await checkAvailabilityForVoice(supabase, str(args.date) ?? null);
  return NextResponse.json(result);
}
