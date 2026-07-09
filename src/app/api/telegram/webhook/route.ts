import { NextResponse } from "next/server";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase";
import { isCeoChat, sendTelegramMessage } from "@/lib/telegram";
import { runManager, type ManagerMessage } from "@/lib/agents/manager";

export const maxDuration = 120;

const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

export async function POST(request: Request) {
  // Telegram echoes this header when the webhook is registered with a secret_token.
  if (WEBHOOK_SECRET) {
    const provided = request.headers.get("x-telegram-bot-api-secret-token");
    if (provided !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  let update: {
    message?: { chat?: { id?: number | string }; text?: string };
  };
  try {
    update = await request.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const chatId = update.message?.chat?.id;
  const text = update.message?.text?.trim();

  // Silently ignore anything that isn't a text message from the allow-listed CEO.
  if (!chatId || !text || !isCeoChat(chatId)) {
    return NextResponse.json({ ok: true });
  }

  if (!hasSupabaseAdminConfig()) {
    await sendTelegramMessage(chatId, "I'm not fully configured yet (database offline).");
    return NextResponse.json({ ok: true });
  }

  const supabase = createSupabaseAdminClient();
  const key = String(chatId);

  // Load recent conversation memory for this chat (oldest first).
  const { data: history } = await supabase
    .from("manager_messages")
    .select("role, content")
    .eq("channel", "telegram")
    .eq("external_key", key)
    .order("created_at", { ascending: false })
    .limit(20);

  const priorMessages: ManagerMessage[] = (history || [])
    .reverse()
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  const messages: ManagerMessage[] = [...priorMessages, { role: "user", content: text }];

  const result = await runManager(messages, { threadKey: `telegram:${key}` });

  // Persist the exchange so the next message has context.
  await supabase.from("manager_messages").insert([
    { channel: "telegram", external_key: key, role: "user", content: text },
    { channel: "telegram", external_key: key, role: "assistant", content: result.reply },
  ]);

  await sendTelegramMessage(chatId, result.reply);
  return NextResponse.json({ ok: true });
}
