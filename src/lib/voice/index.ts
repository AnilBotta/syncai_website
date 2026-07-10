import type { VoiceProvider } from "@/lib/voice/types";
import { retellProvider } from "@/lib/voice/retell";
import { vapiProvider } from "@/lib/voice/vapi";

const providers: Record<string, VoiceProvider> = {
  retell: retellProvider,
  vapi: vapiProvider,
};

/** The active voice provider, chosen by VOICE_PROVIDER (default: retell). */
export function getVoiceProvider(): VoiceProvider {
  const name = (process.env.VOICE_PROVIDER || "retell").toLowerCase();
  return providers[name] || retellProvider;
}

/** Any provider configured with usable credentials? */
export function hasVoiceConfig(): boolean {
  return getVoiceProvider().isConfigured();
}

export type { VoiceProvider } from "@/lib/voice/types";
