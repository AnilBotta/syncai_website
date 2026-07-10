import OpenAI, { toFile } from "openai";

/**
 * Transcribes a remote audio file (e.g. a Telegram voice note, OGG/Opus) to text
 * via OpenAI. Returns null on any failure so callers can fall back gracefully.
 */
export async function transcribeRemoteAudio(url: string, filename = "voice.ogg"): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) return null;
  try {
    const audioResponse = await fetch(url);
    if (!audioResponse.ok) return null;
    const buffer = Buffer.from(await audioResponse.arrayBuffer());

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const result = await openai.audio.transcriptions.create({
      file: await toFile(buffer, filename),
      model: process.env.OPENAI_TRANSCRIBE_MODEL || "whisper-1",
    });
    const text = result.text?.trim();
    return text || null;
  } catch {
    return null;
  }
}
