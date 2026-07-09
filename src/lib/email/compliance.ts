import { createHmac, timingSafeEqual } from "crypto";

/**
 * CASL (Canada's Anti-Spam Legislation) compliance helpers.
 *
 * Every commercial email we send must identify the sender and carry a working,
 * one-click unsubscribe. These helpers build that footer and the HMAC-signed
 * unsubscribe link so the public /api/unsubscribe route can verify it without a
 * database token lookup (and without exposing guessable IDs).
 */

const UNSUBSCRIBE_SECRET = process.env.UNSUBSCRIBE_SECRET;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://syncaitechnologies.com";
const COMPANY_LEGAL_NAME = process.env.COMPANY_LEGAL_NAME || "SyncAI Technologies";
const COMPANY_ADDRESS =
  process.env.COMPANY_ADDRESS || "Ontario, Canada"; // TODO: set a real mailing address before sending.

/** Deterministic HMAC signature for a lead's unsubscribe link. */
export function signUnsubscribe(leadId: string): string {
  if (!UNSUBSCRIBE_SECRET) {
    return "";
  }
  return createHmac("sha256", UNSUBSCRIBE_SECRET).update(leadId).digest("hex");
}

/** Constant-time verification of an unsubscribe signature. */
export function verifyUnsubscribe(leadId: string, signature: string): boolean {
  if (!UNSUBSCRIBE_SECRET || !signature) {
    return false;
  }
  const expected = signUnsubscribe(leadId);
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}

export function unsubscribeUrl(leadId: string): string {
  const sig = signUnsubscribe(leadId);
  return `${SITE_URL}/api/unsubscribe?lid=${encodeURIComponent(leadId)}&sig=${sig}`;
}

/** Plain-text CASL footer appended to every outbound email body. */
export function complianceFooterText(leadId: string | null | undefined): string {
  const lines = [
    "—",
    `${COMPANY_LEGAL_NAME} · ${COMPANY_ADDRESS}`,
  ];
  if (leadId) {
    lines.push(`Unsubscribe: ${unsubscribeUrl(leadId)}`);
  }
  return `\n\n${lines.join("\n")}`;
}

/** HTML CASL footer. */
export function complianceFooterHtml(leadId: string | null | undefined): string {
  const unsub = leadId
    ? `<br /><a href="${unsubscribeUrl(leadId)}" style="color:#6c3486;">Unsubscribe</a>`
    : "";
  return `
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
    <p style="color:#6b7280;font-size:12px;line-height:1.6;margin:0;">
      ${COMPANY_LEGAL_NAME} · ${COMPANY_ADDRESS}${unsub}
    </p>`;
}

export const complianceConfig = {
  companyLegalName: COMPANY_LEGAL_NAME,
  companyAddress: COMPANY_ADDRESS,
  siteUrl: SITE_URL,
  hasUnsubscribeSecret: Boolean(UNSUBSCRIBE_SECRET),
};
