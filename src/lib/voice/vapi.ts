import type { InitiateCallInput, InitiateCallResult, NormalizedCallEvent, VoiceProvider } from "@/lib/voice/types";

/**
 * Vapi adapter. Places an outbound call with a pre-built Vapi assistant and
 * normalizes its webhook (end-of-call-report / status-update). Docs: https://docs.vapi.ai.
 */
export const vapiProvider: VoiceProvider = {
  name: "vapi",

  isConfigured() {
    return Boolean(process.env.VAPI_API_KEY && process.env.VAPI_ASSISTANT_ID && process.env.VAPI_PHONE_NUMBER_ID);
  },

  async initiateCall(input: InitiateCallInput): Promise<InitiateCallResult> {
    const apiKey = process.env.VAPI_API_KEY;
    const assistantId = process.env.VAPI_ASSISTANT_ID;
    const phoneNumberId = process.env.VAPI_PHONE_NUMBER_ID;
    if (!apiKey || !assistantId || !phoneNumberId) {
      return { ok: false, error: "Vapi isn't configured (missing API key, assistant, or phone number id)." };
    }

    try {
      const response = await fetch("https://api.vapi.ai/call", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          assistantId,
          phoneNumberId,
          customer: { number: input.toNumber, name: input.leadName },
          metadata: { lead_id: input.leadId },
          assistantOverrides: { variableValues: { lead_name: input.leadName, context: input.context || "" } },
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        return { ok: false, error: data?.message || `Vapi error (${response.status}).` };
      }
      return { ok: true, providerCallId: data.id, fromNumber: null };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "Vapi request failed." };
    }
  },

  parseWebhook(payload: unknown): NormalizedCallEvent {
    const message = (payload as { message?: Record<string, unknown> })?.message;
    if (!message) return null;
    const type = message.type as string | undefined;
    const call = message.call as { id?: string } | undefined;
    const callId = call?.id || (message.callId as string | undefined);
    if (!callId) return null;

    if (type === "end-of-call-report") {
      const duration = message.durationSeconds as number | undefined;
      const endedReason = message.endedReason as string | undefined;
      return {
        providerCallId: callId,
        status: endedReason && endedReason.includes("no-answer") ? "no_answer" : "completed",
        transcript: (message.transcript as string) ?? null,
        summary: (message.summary as string) ?? null,
        recordingUrl: (message.recordingUrl as string) ?? null,
        durationSeconds: duration ? Math.round(duration) : null,
        endedAt: new Date().toISOString(),
      };
    }
    if (type === "status-update") {
      const status = message.status as string | undefined;
      const mapped =
        status === "in-progress" ? "in_progress" : status === "ringing" ? "ringing" : status === "queued" ? "queued" : undefined;
      return { providerCallId: callId, status: mapped };
    }
    return null;
  },
};
