import { NextResponse } from "next/server";
import {
  createSupabaseAdminClient,
  hasSupabaseAdminConfig,
  type Lead,
  verifyAdminToken,
} from "@/lib/supabase";
import { leadUpdateSchema } from "@/lib/validators";

const demoLeads: Lead[] = [
  {
    id: "demo-1",
    created_at: new Date().toISOString(),
    name: "Demo Clinic Owner",
    email: "owner@example.com",
    phone: "+1 437-925-2349",
    company: "Demo Dental Studio",
    industry: "Dental clinic",
    pain_point: "We miss calls after hours and need better patient intake before appointments.",
    interest: "AI strategy",
    source: "ai-demo",
    demo_summary: "Demo lead shown when Supabase is not configured.",
    status: "new",
    notes: "Connect Supabase to replace demo records with live leads.",
  },
];

export async function GET(request: Request) {
  const user = await verifyAdminToken(request.headers.get("authorization"));

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ leads: demoLeads, demoMode: true });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ leads: data });
}

export async function PATCH(request: Request) {
  const user = await verifyAdminToken(request.headers.get("authorization"));

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = leadUpdateSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid lead update." }, { status: 400 });
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ ok: true, demoMode: true });
  }

  const update: Record<string, string> = {};
  if (parsed.data.status) {
    update.status = parsed.data.status;
  }
  if (typeof parsed.data.notes === "string") {
    update.notes = parsed.data.notes;
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("leads").update(update).eq("id", parsed.data.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
