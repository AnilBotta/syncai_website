import OpenAI from "openai";

const MODEL = process.env.OPENAI_AGENT_MODEL || process.env.OPENAI_MODEL || "gpt-4.1-mini";

export type FetchUrlResult =
  | { ok: true; url: string; title: string | null; emails: string[]; phones: string[]; text: string }
  | { ok: false; error: string };

/** Blocks localhost / private-network hosts so a URL can't reach internal services. */
function isBlockedHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h.endsWith(".local") || h.endsWith(".internal")) return true;
  if (/^127\./.test(h) || /^10\./.test(h) || /^192\.168\./.test(h) || /^169\.254\./.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(h)) return true;
  if (h === "0.0.0.0" || h === "::1" || h === "metadata.google.internal") return true;
  return false;
}

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const JUNK_EMAIL = /(\.png|\.jpg|\.jpeg|\.gif|\.svg|\.webp|\.css|\.js)$/i;
// Common placeholder/example addresses seen in form fields and demos.
const PLACEHOLDER_EMAIL =
  /^(you|your\.?name|name|email|firstname|user|example|test|someone|john\.?doe|jane\.?doe)@|@(example|domain|company|yourdomain|email|test)\.(com|org|net)$/i;

/** A phone string is real-ish if it has 10-15 digits and isn't all one repeated digit. */
function looksLikePhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) return false;
  if (/^(\d)\1+$/.test(digits)) return false; // 6666666666, 0000000000, etc.
  return true;
}

/**
 * Fetches a web page the CEO points us at and pulls out contact details (emails,
 * phones) plus readable text. Deliberately simple + dependency-free: regex over
 * the raw HTML (so mailto:/tel: links are caught) and a tag-strip for context.
 */
export async function fetchUrlInfo(rawUrl: string): Promise<FetchUrlResult> {
  let target = (rawUrl || "").trim();
  if (!target) return { ok: false, error: "No URL provided." };
  if (!/^https?:\/\//i.test(target)) target = `https://${target}`;

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return { ok: false, error: `"${rawUrl}" doesn't look like a valid URL.` };
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, error: "Only http/https URLs are supported." };
  }
  if (isBlockedHost(parsed.hostname)) {
    return { ok: false, error: "That address is a private/internal host and can't be fetched." };
  }

  try {
    const resp = await fetch(target, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SyncAI-Assistant/1.0)" },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });
    if (!resp.ok) return { ok: false, error: `The page returned HTTP ${resp.status}.` };

    const html = (await resp.text()).slice(0, 500_000); // cap huge pages

    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() || null;

    const mailtos = [...html.matchAll(/mailto:([^"'?>\s]+)/gi)].map((m) => decodeURIComponent(m[1]));
    const textEmails = [...html.matchAll(EMAIL_RE)].map((m) => m[0]);
    const emails = [
      ...new Set(
        [...mailtos, ...textEmails]
          // strip anything after a stray escape/quote char, lower-case, trim trailing dots.
          .map((e) => e.split(/[\\"'<>\s]/)[0].toLowerCase().replace(/\.+$/, "")),
      ),
    ]
      .filter((e) => /^[^@]+@[^@]+\.[a-z]{2,}$/.test(e) && !JUNK_EMAIL.test(e) && !PLACEHOLDER_EMAIL.test(e) && !e.includes("@sentry"))
      .slice(0, 10);

    const tels = [...html.matchAll(/tel:([+0-9()\-.\s]{7,})/gi)].map((m) => m[1].trim());
    const textPhones = [...html.matchAll(/(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g)].map((m) => m[0].trim());
    const phones = [...new Set([...tels, ...textPhones])].filter(looksLikePhone).slice(0, 10);

    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 4000);

    return { ok: true, url: target, title, emails, phones, text };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Fetch failed.";
    return { ok: false, error: msg.includes("timeout") || msg.includes("aborted") ? "The page took too long to respond." : `Couldn't fetch the page: ${msg}` };
  }
}

/** Live web search via the OpenAI Responses API web_search tool. */
export async function webSearch(query: string): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  if (!process.env.OPENAI_API_KEY) return { ok: false, error: "OpenAI is not configured." };
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const resp = await openai.responses.create({
      model: MODEL,
      tools: [{ type: "web_search" }],
      input: query,
    });
    return { ok: true, text: resp.output_text?.trim() || "No results found." };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Web search failed." };
  }
}
