import type { SupabaseClient } from "@supabase/supabase-js";
import type { Invoice, Lead } from "@/lib/supabase";
import { sendEmail } from "@/lib/email/resend";
import { renderEmailHtml, renderEmailText } from "@/lib/email/render";
import { createAndSendStripeInvoice, hasStripeConfig } from "@/lib/stripe";
import { createApproval } from "@/lib/approvals";
import { invoiceTotal, nextInvoiceNumber } from "@/lib/finance";
import { renderInvoicePdf } from "@/lib/pdf";
import { notifyCeo } from "@/lib/telegram";
import type { InvoiceLineItem } from "@/lib/supabase";

const cad = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 2 });
const COMPANY = process.env.COMPANY_LEGAL_NAME || "SyncAI Technologies";
const ETRANSFER_EMAIL = process.env.EMAIL_REPLY_TO || process.env.ADMIN_EMAIL || "";

/**
 * Creates a draft invoice for a lead and queues it in the Approval Inbox. Never
 * sends — approving the invoice is what sends it (Stripe or e-transfer email).
 */
export async function createInvoiceDraft(
  supabase: SupabaseClient,
  args: {
    leadId: string;
    lineItems: InvoiceLineItem[];
    method: "stripe" | "etransfer";
    dueOn?: string | null;
    notes?: string;
  },
): Promise<{ ok: true; invoiceId: string; number: string; amount: number } | { ok: false; error: string }> {
  const { data: lead } = await supabase.from("leads").select("*").eq("id", args.leadId).single<Lead>();
  if (!lead) return { ok: false, error: "Lead not found." };

  const amount = invoiceTotal(args.lineItems);
  const number = await nextInvoiceNumber(supabase);

  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert({
      lead_id: lead.id,
      number,
      line_items: args.lineItems,
      amount,
      method: args.method,
      status: "draft",
      due_on: args.dueOn ?? null,
      notes: args.notes ?? null,
    })
    .select()
    .single();
  if (error || !invoice) return { ok: false, error: `Could not create invoice: ${error?.message}` };

  await createApproval(supabase, {
    type: "invoice",
    entityId: invoice.id,
    leadId: lead.id,
    title: `Invoice ${number}: ${cad.format(amount)}`,
    summary: `To ${lead.name}${lead.company ? ` at ${lead.company}` : ""} via ${
      args.method === "stripe" ? "Stripe" : "e-transfer"
    } — approve to send`,
    meta: { invoice_id: invoice.id, method: args.method, amount },
  });

  await supabase.from("lead_activities").insert({
    lead_id: lead.id,
    type: "system",
    title: `Invoice ${number} drafted: ${cad.format(amount)}`,
    meta: { invoice_id: invoice.id },
    actor: "ceo",
  });

  return { ok: true, invoiceId: invoice.id, number, amount };
}

export type SendInvoiceResult =
  | { ok: true; demoMode?: boolean; method: "stripe" | "etransfer" }
  | { ok: false; status: number; error: string };

/**
 * Sends an approved invoice. Stripe invoices go out as a hosted pay-online link;
 * e-transfer invoices are emailed with payment instructions and marked paid
 * manually (or by the Stripe webhook for Stripe). One place decides how an
 * invoice reaches the client.
 */
export async function sendInvoice(supabase: SupabaseClient, invoiceId: string): Promise<SendInvoiceResult> {
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", invoiceId)
    .single<Invoice>();
  if (error || !invoice) return { ok: false, status: 404, error: "Invoice not found." };
  if (invoice.status === "sent" || invoice.status === "paid") {
    return { ok: false, status: 409, error: "Invoice was already sent." };
  }
  if (!invoice.lead_id) return { ok: false, status: 400, error: "Invoice has no client to send to." };

  const { data: lead } = await supabase.from("leads").select("*").eq("id", invoice.lead_id).single<Lead>();
  if (!lead) return { ok: false, status: 404, error: "Client (lead) not found." };

  const now = new Date().toISOString();

  if (invoice.method === "stripe") {
    if (!hasStripeConfig()) {
      return { ok: false, status: 400, error: "Stripe isn't configured yet. Add STRIPE_SECRET_KEY or use e-transfer." };
    }
    const result = await createAndSendStripeInvoice(invoice, lead);
    if (!result.ok) return { ok: false, status: 502, error: result.error };

    await supabase
      .from("invoices")
      .update({
        status: "sent",
        sent_at: now,
        stripe_invoice_id: result.stripeInvoiceId,
        hosted_invoice_url: result.hostedInvoiceUrl,
      })
      .eq("id", invoice.id);

    await logInvoiceActivity(supabase, invoice, lead, "Invoice sent via Stripe");
    return { ok: true, method: "stripe" };
  }

  // e-transfer: email the client the invoice + how to pay.
  const lines = invoice.line_items
    .map((li) => `• ${li.description} — ${li.quantity} × ${cad.format(li.unit_amount)}`)
    .join("\n");
  const body = [
    `Hi ${lead.name},`,
    "",
    `Please find invoice ${invoice.number} from ${COMPANY} below.`,
    "",
    lines,
    "",
    `Total due: ${cad.format(Number(invoice.amount))}${invoice.due_on ? ` by ${invoice.due_on}` : ""}`,
    "",
    ETRANSFER_EMAIL
      ? `To pay by Interac e-Transfer, please send the total to ${ETRANSFER_EMAIL} and use the invoice number (${invoice.number}) as the message.`
      : `Please reply for payment instructions.`,
    invoice.notes ? `\n${invoice.notes}` : "",
    "",
    "Thank you,",
    "Anil",
  ].join("\n");

  const subject = `Invoice ${invoice.number} from ${COMPANY}`;
  const html = renderEmailHtml(body, lead.id);
  const text = renderEmailText(body, lead.id);

  // Attach a branded PDF of the invoice.
  let attachments;
  try {
    const pdf = await renderInvoicePdf(invoice, lead);
    attachments = [{ filename: `${invoice.number}.pdf`, content: pdf }];
  } catch (error) {
    console.error("[invoices] PDF render failed, sending without attachment", error);
  }

  const sendResult = await sendEmail({ to: lead.email, subject, html, text, attachments });
  if (!sendResult.ok) return { ok: false, status: 502, error: sendResult.error };

  await supabase.from("invoices").update({ status: "sent", sent_at: now }).eq("id", invoice.id);
  await logInvoiceActivity(supabase, invoice, lead, "Invoice emailed (e-transfer)");
  return { ok: true, method: "etransfer", demoMode: sendResult.demoMode };
}

/** Marks an invoice paid (from the Stripe webhook or a manual e-transfer confirm). */
export async function markInvoicePaid(
  supabase: SupabaseClient,
  invoiceId: string,
  source: "stripe" | "manual",
): Promise<boolean> {
  const { data: invoice } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", invoiceId)
    .single<Invoice>();
  if (!invoice || invoice.status === "paid" || invoice.status === "void") return false;

  const now = new Date().toISOString();
  await supabase.from("invoices").update({ status: "paid", paid_at: now }).eq("id", invoice.id);

  if (invoice.lead_id) {
    await supabase.from("lead_activities").insert({
      lead_id: invoice.lead_id,
      type: "system",
      title: `Invoice ${invoice.number} PAID (${cad.format(Number(invoice.amount))})`,
      meta: { invoice_id: invoice.id, source },
      actor: source === "stripe" ? "system:stripe" : "ceo",
    });
  }
  await notifyCeo(`💰 Invoice ${invoice.number} paid: ${cad.format(Number(invoice.amount))}.`);
  return true;
}

async function logInvoiceActivity(
  supabase: SupabaseClient,
  invoice: Invoice,
  lead: Lead,
  title: string,
): Promise<void> {
  await supabase.from("lead_activities").insert({
    lead_id: lead.id,
    type: "system",
    title: `${title}: ${invoice.number} (${cad.format(Number(invoice.amount))})`,
    meta: { invoice_id: invoice.id, method: invoice.method },
    actor: "ceo",
  });
}
