const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CEO_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export function hasTelegramConfig() {
  return Boolean(BOT_TOKEN);
}

/** Is this chat id the allow-listed CEO? Anyone else is ignored. */
export function isCeoChat(chatId: string | number | undefined): boolean {
  return Boolean(CEO_CHAT_ID && chatId !== undefined && String(chatId) === String(CEO_CHAT_ID));
}

/** One tappable inline button. `data` is echoed back as a callback_query. */
export type TelegramButton = { text: string; data: string };

/** Sends a Telegram message, optionally with a row of inline buttons. No-op when unconfigured. */
export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  buttons?: TelegramButton[],
): Promise<boolean> {
  if (!BOT_TOKEN) {
    return false;
  }
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
        ...(buttons?.length
          ? { reply_markup: { inline_keyboard: [buttons.map((b) => ({ text: b.text, callback_data: b.data }))] } }
          : {}),
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/** Pushes a proactive notification to the CEO (e.g. urgent lead activity), optionally with buttons. */
export async function notifyCeo(text: string, buttons?: TelegramButton[]): Promise<boolean> {
  if (!CEO_CHAT_ID) {
    return false;
  }
  return sendTelegramMessage(CEO_CHAT_ID, text, buttons);
}

/** Acknowledges a tapped inline button (stops Telegram's loading spinner). */
export async function answerCallbackQuery(callbackQueryId: string, text?: string): Promise<void> {
  if (!BOT_TOKEN) return;
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callback_query_id: callbackQueryId, ...(text ? { text } : {}) }),
    });
  } catch {
    // Non-critical.
  }
}

/** Rewrites a message's text (used to stamp "✅ Approved" onto a decided prompt) and clears its buttons. */
export async function editMessageText(chatId: string | number, messageId: number, text: string): Promise<void> {
  if (!BOT_TOKEN) return;
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, message_id: messageId, text, reply_markup: { inline_keyboard: [] } }),
    });
  } catch {
    // Non-critical.
  }
}

/** Sends the "typing…" chat action so the CEO sees the bot is working. */
export async function sendChatAction(chatId: string | number, action = "typing"): Promise<void> {
  if (!BOT_TOKEN) return;
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendChatAction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, action }),
    });
  } catch {
    // Non-critical.
  }
}

/** Resolves a Telegram file_id to a temporary download URL (valid ~1h). */
export async function getTelegramFileUrl(fileId: string): Promise<string | null> {
  if (!BOT_TOKEN) return null;
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`);
    const data = await response.json();
    const filePath = data?.result?.file_path;
    if (!filePath) return null;
    return `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;
  } catch {
    return null;
  }
}
