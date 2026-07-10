import type { InitiateCallInput, InitiateCallResult, NormalizedCallEvent, VoiceProvider } from "@/lib/voice/types";

/**
 * Retell AI adapter. Places an outbound call with a pre-built Retell agent and
 * normalizes its webhook. Docs: https://docs.retellai.com (create-phone-call v2).
 */
export const retellProvider: VoiceProvider = {
  name: "retell",

  isConfigured() {
    return Boolean(process.env.RETELL_API_KEY && process.env.RETELL_FROM_NUMBER);
  },

  async initiateCall(input: InitiateCallInput): Promise<InitiateCallResult> {
    const apiKey = process.env.RETELL_API_KEY;
    const fromNumber = process.env.RETELL_FROM_NUMBER;
    if (!apiKey || !fromNumber) return { ok: false, error: "Retell isn't configured (missing API key or from-number)." };

    try {
      const response = await fetch("https://api.retellai.com/v2/create-phone-call", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from_number: fromNumber,
          to_number: input.toNumber,
          ...(process.env.RETELL_AGENT_ID ? { override_agent_id: process.env.RETELL_AGENT_ID } : {}),
          retell_llm_dynamic_variables: {
            lead_name: input.leadName,
            context: input.context || "",
          },
          metadata: { lead_id: input.leadId },
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        return { ok: false, error: data?.error_message || data?.message || `Retell error (${response.status}).` };
      }
      return { ok: true, providerCallId: data.call_id, fromNumber };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "Retell request failed." };
    }
  },

  parseWebhook(payload: unknown): NormalizedCallEvent {
    const body = payload as {
      event?: string;
      call?: {
        call_id?: string;
        transcript?: string;
        call_analysis?: { call_summary?: string; user_sentiment?: string };
        recording_url?: string;
        duration_ms?: number;
        start_timestamp?: number;
        end_timestamp?: number;
        disconnection_reason?: string;
      };
    };
    const call = body?.call;
    if (!call?.call_id) return null;

    const status =
      body.event === "call_started"
        ? "in_progress"
        : body.event === "call_ended" || body.event === "call_analyzed"
          ? call.disconnection_reason === "dial_no_answer"
            ? "no_answer"
            : "completed"
          : undefined;

    return {
      providerCallId: call.call_id,
      status,
      transcript: call.transcript ?? null,
      summary: call.call_analysis?.call_summary ?? null,
      recordingUrl: call.recording_url ?? null,
      durationSeconds: call.duration_ms ? Math.round(call.duration_ms / 1000) : null,
      startedAt: call.start_timestamp ? new Date(call.start_timestamp).toISOString() : null,
      endedAt: call.end_timestamp ? new Date(call.end_timestamp).toISOString() : null,
    };
  },
};
