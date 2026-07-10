import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createSupabaseAdminClient, hasSupabaseAdminConfig, type Invoice } from "@/lib/supabase";
import { constructWebhookEvent } from "@/lib/stripe";
import { markInvoicePaid } from "@/lib/invoices";

// Stripe posts raw JSON; we must verify the signature against the exact bytes.
export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  const event = constructWebhookEvent(payload, signature);
  if (!event) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ received: true, demoMode: true });
  }

  const supabase = createSupabaseAdminClient();

  if (event.type === "invoice.paid" || event.type === "invoice.payment_succeeded") {
    const stripeInvoice = event.data.object as Stripe.Invoice;
    const { data: invoice } = await supabase
      .from("invoices")
      .select("id")
      .eq("stripe_invoice_id", stripeInvoice.id)
      .single<Pick<Invoice, "id">>();
    if (invoice) {
      await markInvoicePaid(supabase, invoice.id, "stripe");
    }
  }

  return NextResponse.json({ received: true });
}
