import type { SupabaseClient } from "@supabase/supabase-js";
import type { Lead, Pipeline } from "@/lib/supabase";
import { advanceOnReply } from "@/lib/pipeline";

// Gmail reply detection with no googleapis dependency — plain fetch against the
// OAuth2 token endpoint + the Gmail REST API. We only ever READ the inbox
// (scope gmail.readonly) to detect replies from leads with an active pipeline.

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const GMAIL_BASE = "https://gmail.googleapis.com/gmail/v1/users/me";

export function hasGmailConfig(): boolean {
  return Boolean(process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && process.env.GMAIL_REFRESH_TOKEN);
}

/** Exchanges the long-lived refresh token for a short-lived access token. */
async function getAccessToken(): Promise<string | null> {
  const body = new URLSearchParams({
    client_id: process.env.GMAIL_CLIENT_ID || "",
    client_secret: process.env.GMAIL_CLIENT_SECRET || "",
    refresh_token: process.env.GMAIL_REFRESH_TOKEN || "",
    grant_type: "refresh_token",
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { access_token?: string };
  return json.access_token ?? null;
}

type GmailPart = {
  mimeType?: string;
  filename?: string;
  body?: { data?: string; size?: number };
  parts?: GmailPart[];
};

type GmailMessage = {
  id: string;
  threadId: string;
  payload?: GmailPart & { headers?: { name: string; value: string }[] };
};

function decodeB64Url(data: string): string {
  return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
}

/** Depth-first walk collecting the best text body (prefers text/plain over html). */
function extractBody(payload: GmailPart | undefined): string {
  if (!payload) return "";
  let plain = "";
  let html = "";
  const walk = (part: GmailPart) => {
    const mime = part.mimeType || "";
    if (mime === "text/plain" && part.body?.data && !plain) plain = decodeB64Url(part.body.data);
    else if (mime === "text/html" && part.body?.data && !html) html = decodeB64Url(part.body.data);
    for (const child of part.parts || []) walk(child);
  };
  walk(payload);
  const chosen = plain || stripHtml(html);
  return chosen;
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>(?=)/gi, "\n")
    .replace(/<\/(p|div|tr|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

/** Drops quoted history so the qualifier only sees the new message. */
function stripQuoted(text: string): string {
  const lines = text.split(/\r?\n/);
  const out: string[] = [];
  for (const line of lines) {
    // "On <date>, <name> wrote:" marks the start of the quoted original.
    if (/^\s*On .+ wrote:\s*$/.test(line)) break;
    if (/^\s*-{2,}\s*Original Message\s*-{2,}/i.test(line)) break;
    if (/^\s*>/.test(line)) continue; // quoted lines
    out.push(line);
  }
  return out.join("\n").trim();
}

/** Pulls a bare email address out of a From header like `Jane Doe <jane@x.com>`. */
function parseFromAddress(fromHeader: string): string {
  const angle = fromHeader.match(/<([^>]+)>/);
  const raw = (angle ? angle[1] : fromHeader).trim().toLowerCase();
  return raw;
}

async function listInboxMessageIds(accessToken: string, cap: number): Promise<string[]> {
  const url = `${GMAIL_BASE}/messages?q=${encodeURIComponent("in:inbox newer_than:3d")}&maxResults=${cap}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) return [];
  const json = (await res.json()) as { messages?: { id: string }[] };
  return (json.messages || []).map((m) => m.id);
}

async function fetchMessage(accessToken: string, id: string): Promise<{ from: string; subject: string; text: string; threadId: string } | null> {
  const res = await fetch(`${GMAIL_BASE}/messages/${id}?format=full`, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) return null;
  const msg = (await res.json()) as GmailMessage;
  const headers = msg.payload?.headers || [];
  const header = (name: string) => headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || "";
  const text = stripQuoted(extractBody(msg.payload));
  return { from: parseFromAddress(header("from")), subject: header("subject"), text, threadId: msg.threadId };
}

/**
 * Polls the inbox for replies from leads with an active pipeline and advances
 * them. Idempotent: a Gmail message id is stored on the inbound `emails` row and
 * skipped if already seen. Only senders that exactly match a pipeline lead's
 * email are acted on — everything else in the inbox is ignored.
 */
export async function pollReplies(
  supabase: SupabaseClient,
  opts: { cap?: number } = {},
): Promise<{ ok: boolean; processed: number; matched: number; advanced: number; reason?: string }> {
  if (!hasGmailConfig()) return { ok: false, processed: 0, matched: 0, advanced: 0, reason: "no_gmail_config" };
  const token = await getAccessToken();
  if (!token) return { ok: false, processed: 0, matched: 0, advanced: 0, reason: "token_refresh_failed" };

  const ids = await listInboxMessageIds(token, opts.cap ?? 20);
  let matched = 0;
  let advanced = 0;

  for (const id of ids) {
    // Dedupe: have we already ingested this Gmail message?
    const { data: seen } = await supabase.from("emails").select("id").eq("meta->>gmail_message_id", id).maybeSingle();
    if (seen) continue;

    const msg = await fetchMessage(token, id);
    if (!msg || !msg.from) continue;

    // Match sender to a lead with an active pipeline awaiting a reply/booking.
    const { data: lead } = await supabase
      .from("leads")
      .select("id, email")
      .ilike("email", msg.from)
      .maybeSingle<Pick<Lead, "id" | "email">>();
    if (!lead) continue;

    const { data: pipeline } = await supabase
      .from("pipelines")
      .select("*")
      .eq("lead_id", lead.id)
      .eq("status", "active")
      .in("stage", ["awaiting_reply", "awaiting_booking"])
      .maybeSingle<Pipeline>();
    if (!pipeline) continue;

    matched += 1;

    // Record the inbound message (also serves as the dedupe marker).
    await supabase.from("emails").insert({
      lead_id: lead.id,
      direction: "inbound",
      to_email: lead.email || msg.from,
      subject: msg.subject || "(reply)",
      body_text: msg.text || "(no text content)",
      status: "sent",
      source: "agent",
      meta: { gmail_message_id: id, thread_id: msg.threadId, from: msg.from, kind: "reply" },
    });

    await advanceOnReply(supabase, pipeline, msg.text || msg.subject || "");
    advanced += 1;
  }

  return { ok: true, processed: ids.length, matched, advanced };
}
