const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CEO_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export function hasTelegramConfig() {
  return Boolean(BOT_TOKEN);
}

/** Is this chat id the allow-listed CEO? Anyone else is ignored. */
export function isCeoChat(chatId: string | number | undefined): boolean {
  return Boolean(CEO_CHAT_ID && chatId !== undefined && String(chatId) === String(CEO_CHAT_ID));
}

/** Sends a Telegram message. No-op (returns false) when unconfigured. */
export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
): Promise<boolean> {
  if (!BOT_TOKEN) {
    return false;
  }
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/** Pushes a proactive notification to the CEO (e.g. urgent lead activity). */
export async function notifyCeo(text: string): Promise<boolean> {
  if (!CEO_CHAT_ID) {
    return false;
  }
  return sendTelegramMessage(CEO_CHAT_ID, text);
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
