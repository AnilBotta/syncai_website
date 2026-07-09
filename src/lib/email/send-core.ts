import type { SupabaseClient } from "@supabase/supabase-js";
import type { Email } from "@/lib/supabase";
import { sendEmail } from "@/lib/email/resend";
import { renderEmailHtml, renderEmailText } from "@/lib/email/render";

export type SendRecordResult =
  | { ok: true; demoMode?: boolean }
  | { ok: false; status: number; error: string };

/**
 * Sends one email row through Resend and records the outcome. This is the single
 * place email actually leaves the building — both the manual send route and the
 * approval-decide route call it, so send policy lives in exactly one function.
 */
export async function sendEmailRecord(
  supabase: SupabaseClient,
  emailId: string,
): Promise<SendRecordResult> {
  const { data: email, error: fetchError } = await supabase
    .from("emails")
    .select("*")
    .eq("id", emailId)
    .single<Email>();

  if (fetchError || !email) {
    return { ok: false, status: 404, error: "Email not found." };
  }

  if (email.status === "sent") {
    return { ok: false, status: 409, error: "Email was already sent." };
  }
  if (email.status === "cancelled") {
    return { ok: false, status: 409, error: "Email was cancelled." };
  }

  // Refuse to email a lead who unsubscribed (CASL: honor opt-outs immediately).
  if (email.lead_id) {
    const { data: lead } = await supabase
      .from("leads")
      .select("unsubscribed_at")
      .eq("id", email.lead_id)
      .single<{ unsubscribed_at: string | null }>();

    if (lead?.unsubscribed_at) {
      await supabase
        .from("emails")
        .update({ status: "failed", error: "Recipient has unsubscribed." })
        .eq("id", emailId);
      return { ok: false, status: 409, error: "This lead has unsubscribed." };
    }
  }

  const html = renderEmailHtml(email.body_text, email.lead_id);
  const text = renderEmailText(email.body_text, email.lead_id);

  const result = await sendEmail({
    to: email.to_email,
    subject: email.subject,
    html,
    text,
  });

  if (!result.ok) {
    await supabase
      .from("emails")
      .update({ status: "failed", error: result.error })
      .eq("id", emailId);
    return { ok: false, status: 502, error: result.error };
  }

  const now = new Date().toISOString();
  await supabase
    .from("emails")
    .update({
      status: "sent",
      sent_at: now,
      approved_at: email.approved_at ?? now,
      resend_id: result.id,
      error: null,
    })
    .eq("id", emailId);

  if (email.lead_id) {
    await supabase.from("lead_activities").insert({
      lead_id: email.lead_id,
      type: "email",
      title: `Email sent: ${email.subject}`,
      body: email.body_text.slice(0, 500),
      meta: { email_id: emailId, demo_mode: Boolean(result.demoMode) },
      actor: email.source === "manual" ? "ceo" : `agent:${email.source}`,
    });
    await supabase.from("leads").update({ last_contacted_at: now }).eq("id", email.lead_id);
  }

  return { ok: true, demoMode: result.demoMode };
}
