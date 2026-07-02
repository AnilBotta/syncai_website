import { NextResponse } from "next/server";
import { buildSystemPrompt } from "@/lib/assistant/system-prompt";
import { realtimeTools } from "@/lib/assistant/tools";

/**
 * Mints a short-lived Realtime API client secret. The instructions and tools
 * are baked in server-side so the browser cannot override the prompt.
 */
export async function POST() {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      demoMode: true,
      message: "Voice needs an OpenAI API key. Add OPENAI_API_KEY to enable live voice sessions.",
    });
  }

  const model = process.env.OPENAI_REALTIME_MODEL || "gpt-realtime-2";

  try {
    const response = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session: {
          type: "realtime",
          model,
          instructions: buildSystemPrompt("voice"),
          tools: realtimeTools,
          audio: {
            output: { voice: "marin" },
          },
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error?.message || "Could not start a voice session." },
        { status: 502 }
      );
    }

    return NextResponse.json({ clientSecret: data.value, model });
  } catch {
    return NextResponse.json({ error: "Could not reach the voice service." }, { status: 502 });
  }
}
