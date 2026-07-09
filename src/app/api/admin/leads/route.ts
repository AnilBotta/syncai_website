import { NextResponse } from "next/server";
import {
  createSupabaseAdminClient,
  hasSupabaseAdminConfig,
  type Lead,
  verifyAdminToken,
} from "@/lib/supabase";
import { leadUpdateSchema } from "@/lib/validators";
import { serverErrorResponse } from "@/lib/api-errors";

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
    value: 4500,
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
    return serverErrorResponse("admin/leads:GET", error);
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

  const supabase = createSupabaseAdminClient();

  const { data: current, error: fetchError } = await supabase
    .from("leads")
    .select("id, status")
    .eq("id", parsed.data.id)
    .single();

  if (fetchError || !current) {
    return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  }

  const update: Record<string, unknown> = {};
  if (typeof parsed.data.notes === "string") {
    update.notes = parsed.data.notes;
  }
  if (typeof parsed.data.value === "number") {
    update.value = parsed.data.value;
  }
  if (typeof parsed.data.nextAction === "string") {
    update.next_action = parsed.data.nextAction;
  }
  if (parsed.data.floorPrice !== undefined) {
    update.floor_price = parsed.data.floorPrice;
  }
  if (parsed.data.maxDiscountPct !== undefined) {
    update.max_discount_pct = parsed.data.maxDiscountPct;
  }
  if (typeof parsed.data.concessionNotes === "string") {
    update.concession_notes = parsed.data.concessionNotes;
  }

  const statusChanged = Boolean(parsed.data.status && parsed.data.status !== current.status);
  if (statusChanged) {
    update.status = parsed.data.status;
    // won_at tracks when the deal closed; clear it if the lead moves back out of won.
    if (parsed.data.status === "won") {
      update.won_at = new Date().toISOString();
    } else if (current.status === "won") {
      update.won_at = null;
    }
  }

  const { error } = await supabase.from("leads").update(update).eq("id", parsed.data.id);

  if (error) {
    return serverErrorResponse("admin/leads:PATCH", error);
  }

  if (statusChanged) {
    const { error: activityError } = await supabase.from("lead_activities").insert({
      lead_id: parsed.data.id,
      type: "status_change",
      title: `Status: ${current.status} → ${parsed.data.status}`,
      meta: { from: current.status, to: parsed.data.status },
      actor: "ceo",
    });

    if (activityError) {
      // The lead update already succeeded; a missing timeline entry shouldn't fail the request.
      console.error("[admin/leads:PATCH] activity insert failed", activityError);
    }
  }

  return NextResponse.json({ ok: true });
}
