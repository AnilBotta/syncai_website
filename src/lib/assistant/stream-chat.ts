import OpenAI from "openai";

/**
 * The tool-calling stream loop shared by the SyncAI assistant (/api/chat) and the
 * industry demo sites (/api/demos/[industry]/chat).
 *
 * Everything that differs between them is passed in — crucially the tool
 * EXECUTOR. The demo sites hand in one that touches no database, which is what
 * keeps a stranger playing with a fake clinic from writing to the real
 * appointments table and blocking genuine strategy-call slots.
 *
 * Emits newline-delimited JSON events:
 *   {type:"text",  delta}                  streamed assistant text
 *   {type:"tool",  name, status, result?}  tool started / finished
 *   {type:"done"}                          end of turn
 *   {type:"error", message}                unrecoverable failure
 */

const MAX_TOOL_ROUNDS = 3;

export type ChatTurn = { role: "user" | "assistant"; content: string };

export type ToolExecutor = (
  name: string,
  args: Record<string, unknown>
) => Promise<Record<string, unknown>>;

type StreamChatOptions = {
  client: OpenAI;
  model: string;
  systemPrompt: string;
  history: ChatTurn[];
  tools: OpenAI.Chat.ChatCompletionTool[];
  execute: ToolExecutor;
  temperature?: number;
};

export function streamChat({
  client,
  model,
  systemPrompt,
  history,
  tools,
  execute,
  temperature = 0.4,
}: StreamChatOptions) {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...history,
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
            temperature,
            stream: true,
            // Withhold tools on the final round so the model must answer in text.
            tools: round < MAX_TOOL_ROUNDS ? tools : undefined,
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

            const result = await execute(call.name, args);
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
