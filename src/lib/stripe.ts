import Stripe from "stripe";
import type { Invoice, Lead } from "@/lib/supabase";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

export function hasStripeConfig(): boolean {
  return Boolean(STRIPE_SECRET_KEY);
}

let client: Stripe | null = null;
function stripe(): Stripe {
  if (!STRIPE_SECRET_KEY) throw new Error("Stripe is not configured.");
  if (!client) client = new Stripe(STRIPE_SECRET_KEY);
  return client;
}

/**
 * Creates a Stripe customer + hosted invoice for a deal and finalizes it so the
 * client gets an emailed, pay-online invoice. Returns the Stripe id + hosted pay
 * URL. Amounts are in CAD; Stripe wants integer cents.
 */
export async function createAndSendStripeInvoice(
  invoice: Invoice,
  lead: Lead,
): Promise<{ ok: true; stripeInvoiceId: string; hostedInvoiceUrl: string | null } | { ok: false; error: string }> {
  if (!hasStripeConfig()) return { ok: false, error: "Stripe is not configured." };

  try {
    const s = stripe();
    const customer = await s.customers.create({
      email: lead.email,
      name: lead.company || lead.name,
      metadata: { lead_id: lead.id },
    });

    for (const li of invoice.line_items) {
      const qty = Number(li.quantity) || 1;
      const lineTotalCents = Math.round(qty * (Number(li.unit_amount) || 0) * 100);
      await s.invoiceItems.create({
        customer: customer.id,
        currency: (invoice.currency || "CAD").toLowerCase(),
        amount: lineTotalCents, // total for this line, in cents
        description: qty > 1 ? `${li.description} (×${qty})` : li.description,
      });
    }

    const created = await s.invoices.create({
      customer: customer.id,
      collection_method: "send_invoice",
      days_until_due: 14,
      currency: (invoice.currency || "CAD").toLowerCase(),
      metadata: { invoice_id: invoice.id, invoice_number: invoice.number, lead_id: lead.id },
    });

    await s.invoices.finalizeInvoice(created.id);
    const sent = await s.invoices.sendInvoice(created.id);

    return {
      ok: true,
      stripeInvoiceId: created.id,
      hostedInvoiceUrl: sent.hosted_invoice_url ?? null,
    };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Stripe request failed." };
  }
}

/** Verifies + parses a Stripe webhook event from the raw request body. */
export function constructWebhookEvent(payload: string, signature: string | null): Stripe.Event | null {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !signature) return null;
  try {
    return stripe().webhooks.constructEvent(payload, signature, secret);
  } catch {
    return null;
  }
}
