import { NextResponse } from "next/server";
import { createSupabaseAdminClient, hasSupabaseAdminConfig, verifyAdminToken } from "@/lib/supabase";
import { invoiceCreateSchema, invoiceUpdateSchema } from "@/lib/validators";
import { createInvoiceDraft, markInvoicePaid } from "@/lib/invoices";
import { serverErrorResponse } from "@/lib/api-errors";

export const maxDuration = 60;

export async function GET(request: Request) {
  const user = await verifyAdminToken(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!hasSupabaseAdminConfig()) return NextResponse.json({ invoices: [], demoMode: true });

  const url = new URL(request.url);
  const leadId = url.searchParams.get("leadId");

  const supabase = createSupabaseAdminClient();
  let query = supabase.from("invoices").select("*").order("created_at", { ascending: false }).limit(100);
  if (leadId) query = query.eq("lead_id", leadId);
  const { data, error } = await query;
  if (error) return serverErrorResponse("admin/invoices:GET", error);
  return NextResponse.json({ invoices: data });
}

export async function POST(request: Request) {
  const user = await verifyAdminToken(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = invoiceCreateSchema.safeParse(await request.json());
  if (!parsed.success || !parsed.data.leadId) {
    return NextResponse.json({ error: "Invalid invoice — a client (lead) and at least one line item are required." }, { status: 400 });
  }

  if (!hasSupabaseAdminConfig()) return NextResponse.json({ ok: true, demoMode: true });

  const supabase = createSupabaseAdminClient();
  try {
    const result = await createInvoiceDraft(supabase, {
      leadId: parsed.data.leadId,
      lineItems: parsed.data.lineItems.map((li) => ({
        description: li.description,
        quantity: li.quantity,
        unit_amount: li.unitAmount,
      })),
      method: parsed.data.method,
      dueOn: parsed.data.dueOn ?? null,
      notes: parsed.data.notes || undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    return serverErrorResponse("admin/invoices:POST", error);
  }
}

export async function PATCH(request: Request) {
  const user = await verifyAdminToken(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = invoiceUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid invoice update." }, { status: 400 });

  if (!hasSupabaseAdminConfig()) return NextResponse.json({ ok: true, demoMode: true });

  const supabase = createSupabaseAdminClient();
  try {
    if (parsed.data.action === "mark_paid") {
      const ok = await markInvoicePaid(supabase, parsed.data.id, "manual");
      if (!ok) return NextResponse.json({ error: "Invoice can't be marked paid." }, { status: 409 });
      return NextResponse.json({ ok: true });
    }
    // void
    const { error } = await supabase
      .from("invoices")
      .update({ status: "void" })
      .eq("id", parsed.data.id)
      .neq("status", "paid");
    if (error) return serverErrorResponse("admin/invoices:PATCH", error);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverErrorResponse("admin/invoices:PATCH", error);
  }
}
