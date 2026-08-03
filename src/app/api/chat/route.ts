import { NextResponse } from "next/server";
import OpenAI from "openai";
import { buildSystemPrompt } from "@/lib/assistant/system-prompt";
import { chatCompletionTools } from "@/lib/assistant/tools";
import { executeAssistantTool } from "@/lib/assistant/actions";
import { streamChat } from "@/lib/assistant/stream-chat";
import { chatRequestSchema } from "@/lib/validators";
import { contact } from "@/lib/site-data";

export async function POST(request: Request) {
  const parsed = chatRequestSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Send at least one message." }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    const lastMessage = parsed.data.messages[parsed.data.messages.length - 1];
    return NextResponse.json({ reply: demoReply(lastMessage.content), demoMode: true });
  }

  return streamChat({
    client: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    systemPrompt: buildSystemPrompt("chat"),
    history: parsed.data.messages,
    tools: chatCompletionTools,
    execute: (name, args) => executeAssistantTool(name, args, "chatbot"),
  });
}

function demoReply(message: string) {
  const text = message.toLowerCase();

  if (/book|call|appointment|schedule|meet/.test(text)) {
    return "I'd love to set that up! Live booking through chat needs an OpenAI API key, but you can pick a time right now on our booking page at /book — it takes under a minute.";
  }
  if (/price|pricing|cost|charge|fee/.test(text)) {
    return "We don't publish pricing because every build is scoped to your workflow after a free discovery call. Book a strategy call and we'll give you a clear, honest recommendation.";
  }
  if (/voice|phone|call agent/.test(text)) {
    return "We build AI voice agents that answer calls, recover missed calls, handle FAQs, and book appointments for businesses like clinics and real estate teams. Want to book a strategy call to see one in action?";
  }
  if (/chat|bot|website|automat|workflow/.test(text)) {
    return "SyncAI builds AI websites, chatbots, voice agents, and workflow automations for small and mid-sized businesses. Tell me about your business challenge, or book a free strategy call at /book.";
  }
  return `Thanks for reaching out! I'm the SyncAI assistant (running in demo mode right now). We build AI systems — websites, chatbots, voice agents, and automations — for growing businesses. You can book a free strategy call at /book or email ${contact.email}.`;
}
