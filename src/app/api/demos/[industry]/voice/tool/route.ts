import { NextResponse } from "next/server";
import { getDemoSite } from "@/lib/demo-sites";
import { createDemoToolExecutor } from "@/lib/demo-sites/demo-tools";
import { clientKey, rateLimit } from "@/lib/rate-limit";

/**
 * Executes a tool call that the Realtime model raised in the browser.
 *
 * WebRTC hands function calls to the client, not to us, so the page posts them
 * here and sends the result back down the data channel. That means this endpoint
 * is callable with arbitrary arguments by anyone — which is fine, because it runs
 * `createDemoToolExecutor`, the same sandboxed executor the demo chat uses. It
 * imports only date-fns and writes to nothing: no Supabase, no appointments
 * table, no Zoom, no email, no Telegram.
 *
 * If a future change gives this executor a database, this route becomes a
 * public write endpoint. It must not.
 */

const LIMIT = 60;
const WINDOW_MS = 10 * 60 * 1000;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ industry: string }> }
) {
  const { industry } = await params;
  const site = getDemoSite(industry);

  if (!site || !site.voice) {
    return NextResponse.json({ error: "No such demo." }, { status: 404 });
  }

  const limit = rateLimit(`demo-voice-tool:${industry}:${clientKey(request)}`, LIMIT, WINDOW_MS);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many tool calls." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const body = (await request.json().catch(() => null)) as {
    name?: unknown;
    arguments?: unknown;
  } | null;

  const name = typeof body?.name === "string" ? body.name : "";
  if (!name) {
    return NextResponse.json({ error: "Tool name is required." }, { status: 400 });
  }

  const args =
    body?.arguments && typeof body.arguments === "object" && !Array.isArray(body.arguments)
      ? (body.arguments as Record<string, unknown>)
      : {};

  const result = await createDemoToolExecutor(site)(name, args);
  return NextResponse.json({ result });
}
