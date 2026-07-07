const SECRET = process.env.TURNSTILE_SECRET_KEY;
const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Verifies a Cloudflare Turnstile token server-side.
 *
 * Fails open only when Turnstile is not configured (no secret key) so local and
 * demo environments keep working. When configured, a missing or invalid token
 * is rejected.
 */
export async function verifyTurnstile(
  token: string | undefined | null,
  ip?: string | null
): Promise<boolean> {
  if (!SECRET) {
    return true; // Not configured — skip verification.
  }

  if (!token) {
    return false;
  }

  const body = new URLSearchParams();
  body.append("secret", SECRET);
  body.append("response", token);
  if (ip) {
    body.append("remoteip", ip);
  }

  try {
    const response = await fetch(VERIFY_URL, { method: "POST", body });
    const data = (await response.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch {
    return false;
  }
}

/** Best-effort client IP from the forwarded headers Vercel sets. */
export function clientIpFromRequest(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0]?.trim() || null : null;
}

/** Pulls the `turnstileToken` field out of a parsed JSON request body. */
export function getTurnstileToken(body: unknown): string | undefined {
  if (body && typeof body === "object" && "turnstileToken" in body) {
    const value = (body as { turnstileToken?: unknown }).turnstileToken;
    return typeof value === "string" ? value : undefined;
  }
  return undefined;
}
