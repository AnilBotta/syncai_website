import { NextResponse } from "next/server";
import { createSupabaseAdminClient, hasSupabaseAdminConfig, verifyAdminToken } from "@/lib/supabase";
import { getFinanceSummary } from "@/lib/finance";
import { hasStripeConfig } from "@/lib/stripe";
import { serverErrorResponse } from "@/lib/api-errors";

export async function GET(request: Request) {
  const user = await verifyAdminToken(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ demoMode: true, summary: null, invoices: [], expenses: [], stripeReady: false });
  }

  const supabase = createSupabaseAdminClient();
  try {
    const [summary, { data: invoices, error: invErr }, { data: expenses, error: expErr }] = await Promise.all([
      getFinanceSummary(supabase),
      supabase.from("invoices").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("expenses").select("*").order("incurred_on", { ascending: false }).limit(100),
    ]);
    if (invErr) return serverErrorResponse("admin/finance:GET", invErr);
    if (expErr) return serverErrorResponse("admin/finance:GET", expErr);

    return NextResponse.json({
      summary,
      invoices,
      expenses,
      stripeReady: hasStripeConfig(),
    });
  } catch (error) {
    return serverErrorResponse("admin/finance:GET", error);
  }
}
