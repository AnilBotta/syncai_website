import { complianceFooterHtml, complianceFooterText } from "@/lib/email/compliance";

/** Escapes user/agent text so it is safe to embed in the HTML email body. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Turns a plain-text body into simple branded HTML paragraphs. */
export function renderEmailHtml(bodyText: string, leadId: string | null | undefined): string {
  const paragraphs = bodyText
    .trim()
    .split(/\n{2,}/)
    .map(
      (block) =>
        `<p style="margin:0 0 16px;">${escapeHtml(block).replace(/\n/g, "<br />")}</p>`,
    )
    .join("");

  return `<!doctype html>
<html>
  <body style="margin:0;background:#f6f7f9;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#1a1a1f;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;">
      <div style="font-size:15px;line-height:1.7;">
        ${paragraphs}
      </div>
      ${complianceFooterHtml(leadId)}
    </div>
  </body>
</html>`;
}

/** Full plain-text version, body + compliance footer. */
export function renderEmailText(bodyText: string, leadId: string | null | undefined): string {
  return `${bodyText.trim()}${complianceFooterText(leadId)}`;
}
