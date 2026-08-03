import { NextResponse } from "next/server";
import OpenAI from "openai";
import { chatCompletionTools } from "@/lib/assistant/tools";
import { streamChat } from "@/lib/assistant/stream-chat";
import { getDemoSite } from "@/lib/demo-sites";
import { createDemoToolExecutor } from "@/lib/demo-sites/demo-tools";
import { buildDemoPrompt } from "@/lib/demo-sites/demo-prompt";
import { chatRequestSchema } from "@/lib/validators";
import { clientKey, rateLimit } from "@/lib/rate-limit";

/**
 * The AI receptionist behind each live demo site.
 *
 * Deliberately a separate route from /api/chat rather than a persona flag on it:
 * the two must never share a tool executor. This one runs createDemoToolExecutor,
 * which writes to nothing. See src/lib/demo-sites/demo-tools.ts.
 */

// Public and unauthenticated, so it needs a cost guard.
const LIMIT = 20;
const WINDOW_MS = 10 * 60 * 1000;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ industry: string }> }
) {
  const { industry } = await params;
  const site = getDemoSite(industry);

  // Unknown industry gets nothing — otherwise this is an open LLM proxy.
  if (!site) {
    return NextResponse.json({ error: "No such demo." }, { status: 404 });
  }

  const limit = rateLimit(`demo-chat:${industry}:${clientKey(request)}`, LIMIT, WINDOW_MS);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "You've reached the demo limit for now. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const parsed = chatRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Send at least one message." }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      reply: `I'm the ${site.business} demo receptionist, but I'm not connected to an AI model right now. Add an OpenAI API key to see this working.`,
      demoMode: true,
    });
  }

  return streamChat({
    client: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    systemPrompt: buildDemoPrompt(site),
    history: parsed.data.messages,
    tools: chatCompletionTools,
    execute: createDemoToolExecutor(site),
  });
}
