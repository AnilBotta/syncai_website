/** Shared auth + payload parsing for Retell/Vapi custom-function endpoints. */

export function voiceToolAuthorized(request: Request): boolean {
  const secret = process.env.VOICE_WEBHOOK_SECRET;
  if (!secret) return true; // no secret configured = open (dev)
  const url = new URL(request.url);
  const provided = url.searchParams.get("secret") || request.headers.get("x-voice-secret");
  return provided === secret;
}

/**
 * Extracts the function arguments + call id from a provider's custom-function
 * request. Handles Retell ({ call: { call_id }, args }) and Vapi
 * ({ message: { toolCalls: [{ function: { arguments } }], call: { id } } }),
 * and falls back to top-level fields.
 */
export function parseToolPayload(body: unknown): { args: Record<string, unknown>; callId: string | null } {
  const b = (body || {}) as Record<string, unknown>;

  // Retell
  const retellCall = b.call as { call_id?: string } | undefined;
  if (b.args && typeof b.args === "object") {
    return { args: b.args as Record<string, unknown>, callId: retellCall?.call_id ?? null };
  }

  // Vapi
  const message = b.message as
    | { toolCalls?: Array<{ function?: { arguments?: unknown } }>; call?: { id?: string } }
    | undefined;
  const vapiCall = message?.toolCalls?.[0]?.function?.arguments;
  if (vapiCall) {
    const args = typeof vapiCall === "string" ? safeJson(vapiCall) : (vapiCall as Record<string, unknown>);
    return { args: args || {}, callId: message?.call?.id ?? null };
  }

  // Fallback: treat the whole body as the args.
  return { args: b, callId: retellCall?.call_id ?? (b.call_id as string) ?? null };
}

function safeJson(s: string): Record<string, unknown> | null {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

export function str(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
