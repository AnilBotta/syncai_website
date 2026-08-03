/**
 * Minimal fixed-window rate limiter, in memory.
 *
 * Enough to stop one visitor turning a public demo endpoint into a free LLM.
 * It is per-instance and resets on deploy, so it is a cost guard rather than a
 * security control — move to Upstash/Redis if the demos ever get real traffic
 * across multiple serverless instances.
 */

type Window = { count: number; resetAt: number };

const windows = new Map<string, Window>();
const MAX_KEYS = 5000;

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  /** Seconds until the window resets. */
  retryAfter: number;
};

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = windows.get(key);

  if (!existing || existing.resetAt <= now) {
    // Cheap guard against unbounded growth from spoofed IPs.
    if (windows.size >= MAX_KEYS) {
      for (const [k, w] of windows) {
        if (w.resetAt <= now) windows.delete(k);
      }
      if (windows.size >= MAX_KEYS) windows.clear();
    }

    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  existing.count += 1;
  const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

  if (existing.count > limit) {
    return { ok: false, remaining: 0, retryAfter };
  }

  return { ok: true, remaining: limit - existing.count, retryAfter };
}

/** Best-effort client IP from proxy headers. */
export function clientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}
