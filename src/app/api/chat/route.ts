import { NextResponse } from "next/server";
import OpenAI from "openai";
import { buildSystemPrompt } from "@/lib/assistant/system-prompt";
import { chatCompletionTools } from "@/lib/assistant/tools";
import { executeAssistantTool } from "@/lib/assistant/actions";
import { chatRequestSchema } from "@/lib/validators";
import { contact } from "@/lib/site-data";

const MAX_TOOL_ROUNDS = 3;

export async function POST(request: Request) {
  const parsed = chatRequestSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Send at least one message." }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    const lastMessage = parsed.data.messages[parsed.data.messages.length - 1];
    return NextResponse.json({ reply: demoReply(lastMessage.content), demoMode: true });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: buildSystemPrompt("chat") },
    ...parsed.data.messages,
  ];

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (event: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };

      try {
        for (let round = 0; round <= MAX_TOOL_ROUNDS; round += 1) {
          const completion = await client.chat.completions.create({
            model,
            temperature: 0.4,
            stream: true,
            // Withhold tools on the final round so the model must answer in text.
            tools: round < MAX_TOOL_ROUNDS ? chatCompletionTools : undefined,
            messages,
          });

          let content = "";
          let finishReason: string | null = null;
          const toolCalls = new Map<number, { id: string; name: string; args: string }>();

          for await (const chunk of completion) {
            const choice = chunk.choices[0];
            if (!choice) {
              continue;
            }

            if (choice.delta?.content) {
              content += choice.delta.content;
              emit({ type: "text", delta: choice.delta.content });
            }

            for (const toolDelta of choice.delta?.tool_calls || []) {
              const existing = toolCalls.get(toolDelta.index) || { id: "", name: "", args: "" };
              if (toolDelta.id) {
                existing.id = toolDelta.id;
              }
              if (toolDelta.function?.name) {
                existing.name += toolDelta.function.name;
              }
              if (toolDelta.function?.arguments) {
                existing.args += toolDelta.function.arguments;
              }
              toolCalls.set(toolDelta.index, existing);
            }

            if (choice.finish_reason) {
              finishReason = choice.finish_reason;
            }
          }

          if (finishReason !== "tool_calls" || toolCalls.size === 0) {
            break;
          }

          const calls = [...toolCalls.values()];
          messages.push({
            role: "assistant",
            content: content || null,
            tool_calls: calls.map((call) => ({
              id: call.id,
              type: "function" as const,
              function: { name: call.name, arguments: call.args },
            })),
          });

          for (const call of calls) {
            emit({ type: "tool", name: call.name, status: "running" });

            let args: Record<string, unknown> = {};
            try {
              args = JSON.parse(call.args || "{}");
            } catch {
              // Leave args empty; the executor reports the validation error.
            }

            const result = await executeAssistantTool(call.name, args, "chatbot");
            emit({ type: "tool", name: call.name, status: "done", result });

            messages.push({
              role: "tool",
              tool_call_id: call.id,
              content: JSON.stringify(result),
            });
          }
        }

        emit({ type: "done" });
      } catch (error) {
        emit({
          type: "error",
          message: error instanceof Error ? error.message : "The assistant hit a problem. Try again.",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache",
    },
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
