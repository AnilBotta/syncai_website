// Zoom integration via Server-to-Server OAuth (account_credentials grant) — plain
// fetch, no SDK. Creates a scheduled meeting per booking. Degrades gracefully:
// with no ZOOM_* env the helpers return null and bookings still work (just no link).

const TOKEN_URL = "https://zoom.us/oauth/token";
const API_BASE = "https://api.zoom.us/v2";

export function hasZoomConfig(): boolean {
  return Boolean(process.env.ZOOM_ACCOUNT_ID && process.env.ZOOM_CLIENT_ID && process.env.ZOOM_CLIENT_SECRET);
}

/** Server-to-Server OAuth: exchange the account credentials for a short-lived token. */
async function getAccessToken(): Promise<string | null> {
  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const basic = Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString("base64");
  const res = await fetch(`${TOKEN_URL}?grant_type=account_credentials&account_id=${accountId}`, {
    method: "POST",
    headers: { Authorization: `Basic ${basic}` },
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { access_token?: string };
  return json.access_token ?? null;
}

export type ZoomMeeting = { joinUrl: string; meetingId: string; startUrl?: string };

/**
 * Creates a scheduled Zoom meeting. `startTimeIso` must be a UTC instant
 * ("2026-07-16T15:00:00Z"); passed with a trailing Z, Zoom treats it as GMT, so
 * the meeting lands at exactly that instant regardless of the timezone field.
 * Returns null on any failure — the caller treats a missing link as non-fatal.
 */
export async function createZoomMeeting(args: {
  topic: string;
  startTimeIso: string;
  durationMinutes?: number;
  timezone?: string;
}): Promise<ZoomMeeting | null> {
  if (!hasZoomConfig()) return null;
  try {
    const token = await getAccessToken();
    if (!token) return null;
    const res = await fetch(`${API_BASE}/users/me/meetings`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: args.topic,
        type: 2, // scheduled
        start_time: args.startTimeIso,
        duration: args.durationMinutes ?? 15,
        timezone: args.timezone ?? "America/Toronto",
        settings: { join_before_host: true, waiting_room: false, host_video: true, participant_video: true },
      }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { join_url?: string; id?: number | string; start_url?: string };
    if (!json.join_url) return null;
    return { joinUrl: json.join_url, meetingId: String(json.id ?? ""), startUrl: json.start_url };
  } catch {
    return null;
  }
}

/** Formats a stored timestamp into the "yyyy-MM-ddTHH:mm:ssZ" UTC form Zoom expects. */
export function toZoomStartTime(startsAt: string): string {
  return new Date(startsAt).toISOString().replace(/\.\d{3}Z$/, "Z");
}
