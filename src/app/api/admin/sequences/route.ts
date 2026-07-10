import { NextResponse } from "next/server";
import {
  createSupabaseAdminClient,
  hasSupabaseAdminConfig,
  type Sequence,
  type SequenceStep,
  verifyAdminToken,
} from "@/lib/supabase";
import { sequenceUpdateSchema } from "@/lib/validators";
import { serverErrorResponse } from "@/lib/api-errors";

const demoSequences = [
  {
    id: "demo-seq-1",
    created_at: new Date().toISOString(),
    name: "Standard nurture",
    description: "3-touch follow-up: intro, value, case study",
    active: true,
    auto_send: false,
    steps: [] as SequenceStep[],
    activeEnrollments: 0,
  },
];

export async function GET(request: Request) {
  const user = await verifyAdminToken(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ sequences: demoSequences, demoMode: true });
  }

  const supabase = createSupabaseAdminClient();
  const { data: sequences, error } = await supabase
    .from("sequences")
    .select("*")
    .order("created_at", { ascending: true })
    .returns<Sequence[]>();
  if (error) return serverErrorResponse("admin/sequences:GET", error);

  const { data: steps } = await supabase
    .from("sequence_steps")
    .select("*")
    .order("step_order", { ascending: true })
    .returns<SequenceStep[]>();
  const { data: enrollments } = await supabase
    .from("sequence_enrollments")
    .select("sequence_id")
    .eq("status", "active");

  const enriched = (sequences || []).map((s) => ({
    ...s,
    steps: (steps || []).filter((st) => st.sequence_id === s.id),
    activeEnrollments: (enrollments || []).filter((e) => e.sequence_id === s.id).length,
  }));

  return NextResponse.json({ sequences: enriched });
}

export async function PATCH(request: Request) {
  const user = await verifyAdminToken(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = sequenceUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid update." }, { status: 400 });

  if (!hasSupabaseAdminConfig()) return NextResponse.json({ ok: true, demoMode: true });

  const update: Record<string, unknown> = {};
  if (typeof parsed.data.active === "boolean") update.active = parsed.data.active;
  if (typeof parsed.data.autoSend === "boolean") update.auto_send = parsed.data.autoSend;

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("sequences").update(update).eq("id", parsed.data.id);
  if (error) return serverErrorResponse("admin/sequences:PATCH", error);
  return NextResponse.json({ ok: true });
}
