import { NextResponse } from "next/server";
import OpenAI from "openai";
import { realtimeTools } from "@/lib/assistant/tools";
import { getDemoSite } from "@/lib/demo-sites";
import { buildDemoPrompt } from "@/lib/demo-sites/demo-prompt";
import { clientKey, rateLimit } from "@/lib/rate-limit";

/**
 * Mints a short-lived OpenAI Realtime client secret so a demo visitor can talk
 * to the site's assistant in the browser.
 *
 * The real OPENAI_API_KEY never leaves the server: the browser receives only an
 * ephemeral secret, already scoped to this persona and this tool set.
 *
 * Unlike the Retell path on the main site, Realtime surfaces tool calls in the
 * BROWSER over the WebRTC data channel. The browser hands them back to
 * /voice/tool, which runs the same sandboxed executor the chat uses. That
 * executor writes to nothing, so a tampered client still cannot book anything —
 * the guarantee comes from there being no write path, not from trusting the page.
 */

/*
 * Voice bills per minute of audio on a public, unauthenticated endpoint, so this
 * is tighter than the chat limit — but not as tight as it first was.
 *
 * Minting is not what costs money: a secret that never completes a WebRTC
 * handshake bills nothing, and a denied microphone prompt burns one. At four per
 * window an ordinary visitor who declined the mic once and then tried again was
 * locked out. Connected minutes are the real cost, and those are governed by the
 * 60-second cap and the token ceiling below.
 */
const LIMIT = 12;
const WINDOW_MS = 10 * 60 * 1000;

/** Seconds the minted secret stays usable. Short, so a scraped one is worthless. */
const SECRET_TTL_SECONDS = 60;

/** Ceiling on a single spoken reply — a runaway monologue is the expensive failure. */
const MAX_OUTPUT_TOKENS = 900;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ industry: string }> }
) {
  const { industry } = await params;
  const site = getDemoSite(industry);

  if (!site) {
    return NextResponse.json({ error: "No such demo." }, { status: 404 });
  }
  if (!site.voice) {
    return NextResponse.json({ error: "Voice is not enabled for this demo." }, { status: 404 });
  }

  const limit = rateLimit(`demo-voice:${industry}:${clientKey(request)}`, LIMIT, WINDOW_MS);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "You've reached the voice demo limit for now. Try the chat instead." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ demoMode: true });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_REALTIME_MODEL || "gpt-realtime-2";

  try {
    const secret = await client.realtime.clientSecrets.create({
      expires_after: { anchor: "created_at", seconds: SECRET_TTL_SECONDS },
      session: {
        type: "realtime",
        model,
        instructions: `${buildDemoPrompt(site)}

SPOKEN STYLE
- You are speaking out loud. Keep every reply to one or two short sentences.
- Never read out URLs, email addresses or JSON. Say times naturally ("ten thirty in the morning").
- Confirm the name, email and chosen time back to the caller before booking.
- This is a short demonstration call. If it is about to end, say so warmly rather than stopping mid-sentence.`,
        tools: realtimeTools,
        max_output_tokens: MAX_OUTPUT_TOKENS,
      },
    });

    return NextResponse.json({
      clientSecret: secret.value,
      model,
      greeting: site.voice.greeting,
    });
  } catch (error) {
    console.error("[demos/voice] could not mint a realtime secret", error);
    return NextResponse.json({ error: "Could not start a voice session." }, { status: 502 });
  }
}
