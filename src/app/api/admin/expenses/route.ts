import { NextResponse } from "next/server";
import { createSupabaseAdminClient, hasSupabaseAdminConfig, verifyAdminToken } from "@/lib/supabase";
import { expenseCreateSchema, expenseUpdateSchema } from "@/lib/validators";
import { serverErrorResponse } from "@/lib/api-errors";

export async function GET(request: Request) {
  const user = await verifyAdminToken(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!hasSupabaseAdminConfig()) return NextResponse.json({ expenses: [], demoMode: true });

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("incurred_on", { ascending: false })
    .limit(200);
  if (error) return serverErrorResponse("admin/expenses:GET", error);
  return NextResponse.json({ expenses: data });
}

export async function POST(request: Request) {
  const user = await verifyAdminToken(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = expenseCreateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid expense." }, { status: 400 });

  if (!hasSupabaseAdminConfig()) return NextResponse.json({ ok: true, demoMode: true });

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("expenses")
    .insert({
      incurred_on: parsed.data.incurredOn || new Date().toISOString().slice(0, 10),
      category: parsed.data.category,
      vendor: parsed.data.vendor || null,
      description: parsed.data.description || null,
      amount: parsed.data.amount,
      recurring: parsed.data.recurring,
    })
    .select()
    .single();
  if (error) return serverErrorResponse("admin/expenses:POST", error);
  return NextResponse.json({ expense: data });
}

export async function PATCH(request: Request) {
  const user = await verifyAdminToken(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = expenseUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  if (!hasSupabaseAdminConfig()) return NextResponse.json({ ok: true, demoMode: true });

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("expenses").delete().eq("id", parsed.data.id);
  if (error) return serverErrorResponse("admin/expenses:PATCH", error);
  return NextResponse.json({ ok: true });
}
