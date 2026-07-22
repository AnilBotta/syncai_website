import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "SyncAI <onboarding@resend.dev>";
const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO;

export function hasResendConfig() {
  return Boolean(RESEND_API_KEY);
}

export type EmailAttachment = { filename: string; content: Buffer };

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments?: EmailAttachment[];
  /** Extra SMTP headers, e.g. List-Unsubscribe for one-click opt-out. */
  headers?: Record<string, string>;
};

export type SendEmailResult =
  | { ok: true; id: string | null; demoMode?: boolean }
  | { ok: false; error: string };

/**
 * Thin Resend wrapper. When no API key is configured it is a no-op that reports
 * demoMode, mirroring the Supabase demo-mode pattern so local/preview builds work.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  if (!RESEND_API_KEY) {
    return { ok: true, id: null, demoMode: true };
  }

  try {
    const resend = new Resend(RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      ...(input.headers && Object.keys(input.headers).length ? { headers: input.headers } : {}),
      ...(EMAIL_REPLY_TO ? { replyTo: EMAIL_REPLY_TO } : {}),
      ...(input.attachments?.length
        ? { attachments: input.attachments.map((a) => ({ filename: a.filename, content: a.content })) }
        : {}),
    });

    if (error) {
      return { ok: false, error: error.message || "Resend rejected the message." };
    }

    return { ok: true, id: data?.id ?? null };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Email send failed.",
    };
  }
}
