import { NextResponse, after } from "next/server";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase";
import {
  answerCallbackQuery,
  editMessageText,
  getTelegramFileUrl,
  isCeoChat,
  sendChatAction,
  sendTelegramMessage,
} from "@/lib/telegram";
import { transcribeRemoteAudio } from "@/lib/voice-transcribe";
import { runManager, type ManagerMessage } from "@/lib/agents/manager";
import { decidePipelineApproval } from "@/lib/pipeline";

export const maxDuration = 120;

const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

type TelegramVoice = { file_id?: string };

export async function POST(request: Request) {
  // Telegram echoes this header when the webhook is registered with a secret_token.
  if (WEBHOOK_SECRET) {
    const provided = request.headers.get("x-telegram-bot-api-secret-token");
    if (provided !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  let update: {
    message?: {
      chat?: { id?: number | string };
      text?: string;
      caption?: string;
      voice?: TelegramVoice;
      audio?: TelegramVoice;
      video_note?: TelegramVoice;
    };
    callback_query?: {
      id: string;
      data?: string;
      from?: { id?: number | string };
      message?: { message_id?: number; chat?: { id?: number | string } };
    };
  };
  try {
    update = await request.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  // Inline-button tap: decide a pipeline approval.
  if (update.callback_query) {
    const cq = update.callback_query;
    const fromId = cq.from?.id;
    const cbChatId = cq.message?.chat?.id;
    const messageId = cq.message?.message_id;
    if (!isCeoChat(fromId) || !hasSupabaseAdminConfig()) {
      await answerCallbackQuery(cq.id);
      return NextResponse.json({ ok: true });
    }
    const parts = (cq.data || "").split("|"); // ap|<approvalId>|y|n
    if (parts[0] !== "ap" || !parts[1]) {
      await answerCallbackQuery(cq.id);
      return NextResponse.json({ ok: true });
    }
    const approvalId = parts[1];
    const decision = parts[2] === "y" ? "approved" : "rejected";
    const label = decision === "approved" ? "✅ Approved" : "❌ Skipped";
    await answerCallbackQuery(cq.id, label);
    if (cbChatId && messageId) {
      const original = cq.message && "text" in (cq.message as Record<string, unknown>) ? String((cq.message as { text?: string }).text || "") : "";
      await editMessageText(cbChatId, messageId, `${original}\n\n${label}`);
    }
    // Heavy follow-up (drafts/calls) after we ack, within the function window.
    after(async () => {
      const supabase = createSupabaseAdminClient();
      await decidePipelineApproval(supabase, approvalId, decision);
    });
    return NextResponse.json({ ok: true });
  }

  const chatId = update.message?.chat?.id;

  // Only the allow-listed CEO is served; everyone else is silently ignored.
  if (!chatId || !isCeoChat(chatId)) {
    return NextResponse.json({ ok: true });
  }

  // Accept a typed message OR a voice/audio note (transcribed to text).
  let text = update.message?.text?.trim() || update.message?.caption?.trim() || "";
  const voice = update.message?.voice || update.message?.audio || update.message?.video_note;
  if (!text && voice?.file_id) {
    await sendChatAction(chatId, "typing");
    const fileUrl = await getTelegramFileUrl(voice.file_id);
    const transcript = fileUrl ? await transcribeRemoteAudio(fileUrl) : null;
    if (!transcript) {
      await sendTelegramMessage(chatId, "I couldn't understand that voice message — could you try again or type it?");
      return NextResponse.json({ ok: true });
    }
    text = transcript;
  }

  if (!text) {
    return NextResponse.json({ ok: true });
  }

  if (!hasSupabaseAdminConfig()) {
    await sendTelegramMessage(chatId, "I'm not fully configured yet (database offline).");
    return NextResponse.json({ ok: true });
  }

  await sendChatAction(chatId, "typing");

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
