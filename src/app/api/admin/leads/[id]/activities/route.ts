import { NextResponse } from "next/server";
import {
  createSupabaseAdminClient,
  hasSupabaseAdminConfig,
  type LeadActivity,
  verifyAdminToken,
} from "@/lib/supabase";
import { activityCreateSchema } from "@/lib/validators";
import { serverErrorResponse } from "@/lib/api-errors";

const demoActivities: LeadActivity[] = [
  {
    id: "demo-activity-1",
    created_at: new Date().toISOString(),
    lead_id: "demo-1",
    type: "system",
    title: "Lead captured from AI demo",
    body: null,
    meta: {},
    actor: "system",
  },
];

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAdminToken(request.headers.get("authorization"));

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ activities: demoActivities, demoMode: true });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("lead_activities")
    .select("*")
    .eq("lead_id", id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return serverErrorResponse("admin/leads/activities:GET", error);
  }

  return NextResponse.json({ activities: data });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAdminToken(request.headers.get("authorization"));

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const parsed = activityCreateSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid activity." }, { status: 400 });
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ ok: true, demoMode: true });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("lead_activities")
    .insert({
      lead_id: id,
      type: parsed.data.type,
      title: parsed.data.title,
      body: parsed.data.body || null,
      actor: "ceo",
    })
    .select()
    .single();

  if (error) {
    return serverErrorResponse("admin/leads/activities:POST", error);
  }

  return NextResponse.json({ activity: data });
}
