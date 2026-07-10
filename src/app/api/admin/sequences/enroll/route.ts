import { NextResponse } from "next/server";
import {
  createSupabaseAdminClient,
  hasSupabaseAdminConfig,
  type Lead,
  type SequenceStep,
  verifyAdminToken,
} from "@/lib/supabase";
import { enrollSchema, enrollmentUpdateSchema } from "@/lib/validators";
import { serverErrorResponse } from "@/lib/api-errors";

// List a lead's enrollments (for the lead drawer progress display).
export async function GET(request: Request) {
  const user = await verifyAdminToken(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const leadId = url.searchParams.get("leadId");
  if (!leadId) return NextResponse.json({ enrollments: [] });

  if (!hasSupabaseAdminConfig()) return NextResponse.json({ enrollments: [], demoMode: true });

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("sequence_enrollments")
    .select("id, status, current_step, next_run_at, sequence_id, sequences(name, sequence_steps(id))")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });
  if (error) return serverErrorResponse("admin/sequences/enroll:GET", error);

  // Flatten the embedded sequence into name + total step count for the UI.
  const enrollments = (data || []).map((e) => {
    const seq = e.sequences as unknown as { name?: string; sequence_steps?: unknown[] } | null;
    return {
      id: e.id,
      status: e.status,
      current_step: e.current_step,
      next_run_at: e.next_run_at,
      sequence_id: e.sequence_id,
      sequence_name: seq?.name ?? "Sequence",
      total_steps: Array.isArray(seq?.sequence_steps) ? seq!.sequence_steps.length : 0,
    };
  });
  return NextResponse.json({ enrollments });
}

export async function POST(request: Request) {
  const user = await verifyAdminToken(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = enrollSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid enrollment." }, { status: 400 });

  if (!hasSupabaseAdminConfig()) return NextResponse.json({ ok: true, demoMode: true });

  const supabase = createSupabaseAdminClient();

  const { data: lead } = await supabase
    .from("leads")
    .select("id, unsubscribed_at")
    .eq("id", parsed.data.leadId)
    .single<Pick<Lead, "id" | "unsubscribed_at">>();
  if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  if (lead.unsubscribed_at) {
    return NextResponse.json({ error: "This lead has unsubscribed." }, { status: 409 });
  }

  // Schedule the first step (day_offset 0 fires on the next cron tick).
  const { data: firstStep } = await supabase
    .from("sequence_steps")
    .select("day_offset")
    .eq("sequence_id", parsed.data.sequenceId)
    .order("step_order", { ascending: true })
    .limit(1)
    .single<Pick<SequenceStep, "day_offset">>();

  const nextRunAt = new Date(Date.now() + (firstStep?.day_offset || 0) * 86400000).toISOString();

  const { error } = await supabase.from("sequence_enrollments").insert({
    lead_id: parsed.data.leadId,
    sequence_id: parsed.data.sequenceId,
    status: "active",
    current_step: 0,
    next_run_at: nextRunAt,
  });

  if (error) {
    // Unique index violation = already actively enrolled.
    if (error.code === "23505") {
      return NextResponse.json({ error: "Lead is already enrolled in this sequence." }, { status: 409 });
    }
    return serverErrorResponse("admin/sequences/enroll:POST", error);
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  const user = await verifyAdminToken(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = enrollmentUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid update." }, { status: 400 });

  if (!hasSupabaseAdminConfig()) return NextResponse.json({ ok: true, demoMode: true });

  const statusMap = { pause: "paused", resume: "active", cancel: "cancelled" } as const;
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("sequence_enrollments")
    .update({ status: statusMap[parsed.data.action] })
    .eq("id", parsed.data.id);
  if (error) return serverErrorResponse("admin/sequences/enroll:PATCH", error);
  return NextResponse.json({ ok: true });
}
