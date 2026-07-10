import { NextResponse } from "next/server";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase";
import { getVoiceProvider } from "@/lib/voice";
import { recordCallEvent } from "@/lib/calls";

/**
 * Public webhook the voice provider (Retell / Vapi) posts call events to.
 * Authenticated with a shared secret in the URL (?secret=) since providers let
 * you set an arbitrary webhook URL. Set VOICE_WEBHOOK_SECRET and append it to
 * the webhook URL you register with the provider.
 */
export async function POST(request: Request) {
  const secret = process.env.VOICE_WEBHOOK_SECRET;
  if (secret) {
    const url = new URL(request.url);
    const provided = url.searchParams.get("secret") || request.headers.get("x-voice-secret");
    if (provided !== secret) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ ok: true, demoMode: true });
  }

  const event = getVoiceProvider().parseWebhook(payload);
  if (!event) return NextResponse.json({ ok: true, ignored: true });

  const supabase = createSupabaseAdminClient();
  await recordCallEvent(supabase, event);
  return NextResponse.json({ ok: true });
}
