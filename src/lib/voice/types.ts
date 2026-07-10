export type InitiateCallInput = {
  leadId: string;
  leadName: string;
  toNumber: string;
  context?: string; // extra context passed to the agent as a dynamic variable
};

export type InitiateCallResult =
  | { ok: true; providerCallId: string; fromNumber?: string | null }
  | { ok: false; error: string };

export type NormalizedCallStatus =
  | "queued"
  | "ringing"
  | "in_progress"
  | "completed"
  | "failed"
  | "no_answer";

/** A provider webhook payload mapped to our shape. Null = ignore this event. */
export type NormalizedCallEvent = {
  providerCallId: string;
  status?: NormalizedCallStatus;
  transcript?: string | null;
  summary?: string | null;
  recordingUrl?: string | null;
  durationSeconds?: number | null;
  startedAt?: string | null;
  endedAt?: string | null;
} | null;

/**
 * A voice-agent provider (Retell, Vapi, Millis, …). We only ever ask it to place
 * an outbound call using a pre-configured agent, and normalize the webhook it
 * sends back. We never touch the audio ourselves.
 */
export interface VoiceProvider {
  readonly name: string;
  isConfigured(): boolean;
  initiateCall(input: InitiateCallInput): Promise<InitiateCallResult>;
  parseWebhook(payload: unknown): NormalizedCallEvent;
}
