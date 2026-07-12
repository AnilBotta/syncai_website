import type { SupabaseClient } from "@supabase/supabase-js";
import type { Document, Lead } from "@/lib/supabase";
import { documentTypes } from "@/lib/site-data";
import { sendEmailRecord } from "@/lib/email/send-core";
import { renderDocumentPdf } from "@/lib/pdf";
import { notifyCeo } from "@/lib/telegram";

/** Safe filename from a document title, e.g. "Proposal for Acme" -> "Proposal-for-Acme.pdf". */
function pdfFilename(title: string): string {
  const base = title.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "document";
  return `${base}.pdf`;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.syncai.tech";

export function documentTypeLabel(type: Document["type"]): string {
  return documentTypes.find((t) => t.value === type)?.label || type;
}

export function acceptUrlFor(token: string): string {
  return `${SITE_URL}/accept/${token}`;
}

/**
 * Called when the CEO approves a document. Emails the lead a link to the branded
 * accept page and flips the document to 'sent'. Reuses the one email send path
 * (send-core) so CASL footer + unsubscribe handling apply here too.
 */
export async function sendDocumentForSignature(
  supabase: SupabaseClient,
  documentId: string,
): Promise<{ ok: true; demoMode?: boolean } | { ok: false; status: number; error: string }> {
  const { data: doc, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .single<Document>();
  if (error || !doc) return { ok: false, status: 404, error: "Document not found." };
  if (doc.status === "sent" || doc.status === "viewed" || doc.status === "accepted") {
    return { ok: false, status: 409, error: "Document was already sent." };
  }
  if (!doc.lead_id) return { ok: false, status: 400, error: "Document has no lead to send to." };

  const { data: lead } = await supabase.from("leads").select("*").eq("id", doc.lead_id).single<Lead>();
  if (!lead) return { ok: false, status: 404, error: "Lead not found." };

  const label = documentTypeLabel(doc.type);
  const acceptUrl = acceptUrlFor(doc.accept_token);
  const body = [
    `Hi ${lead.name},`,
    "",
    `Please find your ${label.toLowerCase()} from SyncAI Technologies attached as a PDF. You can also review and accept it online here:`,
    "",
    acceptUrl,
    "",
    "If you have any questions or would like changes, just reply to this email.",
    "",
    "Thanks,",
    "Anil",
  ].join("\n");

  // Branded PDF of the document, attached to the email.
  let attachments;
  try {
    const pdf = await renderDocumentPdf({ title: doc.title, contentMd: doc.content_md });
    attachments = [{ filename: pdfFilename(doc.title), content: pdf }];
  } catch (error) {
    console.error("[documents] PDF render failed, sending without attachment", error);
  }

  const { data: email, error: emailError } = await supabase
    .from("emails")
    .insert({
      lead_id: lead.id,
      to_email: lead.email,
      subject: `Your ${label} from SyncAI Technologies`,
      body_text: body,
      source: "agent",
      status: "draft",
      meta: { document_id: doc.id },
    })
    .select()
    .single();
  if (emailError || !email) {
    return { ok: false, status: 500, error: `Could not create the accept-link email: ${emailError?.message}` };
  }

  const sendResult = await sendEmailRecord(supabase, email.id, { attachments });
  if (!sendResult.ok) return sendResult;

  const now = new Date().toISOString();
  await supabase.from("documents").update({ status: "sent", sent_at: now }).eq("id", doc.id);

  await supabase.from("lead_activities").insert({
    lead_id: lead.id,
    type: "document",
    title: `${label} sent for signature: ${doc.title}`,
    meta: { document_id: doc.id, email_id: email.id },
    actor: "ceo",
  });

  return { ok: true, demoMode: sendResult.demoMode };
}

/** Marks a document viewed the first time the lead opens the accept page. */
export async function markDocumentViewed(supabase: SupabaseClient, doc: Document): Promise<void> {
  if (doc.status !== "sent") return;
  await supabase
    .from("documents")
    .update({ status: "viewed", viewed_at: new Date().toISOString() })
    .eq("id", doc.id)
    .eq("status", "sent");
  if (doc.lead_id) {
    await supabase.from("lead_activities").insert({
      lead_id: doc.lead_id,
      type: "document",
      title: `${documentTypeLabel(doc.type)} viewed: ${doc.title}`,
      meta: { document_id: doc.id },
      actor: "lead",
    });
  }
}

/**
 * Records a click-to-accept e-signature: timestamp + IP, flips to 'accepted',
 * logs the activity and pings the CEO on Telegram. Idempotent — a second accept
 * is a no-op. Returns whether this call was the one that accepted it.
 */
export async function acceptDocument(
  supabase: SupabaseClient,
  token: string,
  ip: string | null,
): Promise<{ ok: true; alreadyAccepted: boolean; title: string } | { ok: false; error: string }> {
  const { data: doc } = await supabase
    .from("documents")
    .select("*")
    .eq("accept_token", token)
    .single<Document>();
  if (!doc) return { ok: false, error: "This link is invalid or has expired." };
  if (doc.status === "cancelled" || doc.status === "draft") {
    return { ok: false, error: "This document is not available for signature." };
  }
  if (doc.status === "accepted") {
    return { ok: true, alreadyAccepted: true, title: doc.title };
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("documents")
    .update({ status: "accepted", accepted_at: now, accepted_ip: ip })
    .eq("id", doc.id)
    .in("status", ["sent", "viewed"]);
  if (error) return { ok: false, error: "We couldn't record your acceptance. Please try again." };

  const label = documentTypeLabel(doc.type);
  if (doc.lead_id) {
    await supabase.from("lead_activities").insert({
      lead_id: doc.lead_id,
      type: "document",
      title: `${label} ACCEPTED: ${doc.title}`,
      body: ip ? `Accepted from IP ${ip}` : null,
      meta: { document_id: doc.id, accepted_ip: ip },
      actor: "lead",
    });
  }
  await notifyCeo(`✍️ ${label} accepted: "${doc.title}". Signed at ${now}.`);

  return { ok: true, alreadyAccepted: false, title: doc.title };
}
