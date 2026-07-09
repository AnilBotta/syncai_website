import { NextResponse } from "next/server";
import {
  createSupabaseAdminClient,
  hasSupabaseAdminConfig,
  type Task,
  verifyAdminToken,
} from "@/lib/supabase";
import { taskCreateSchema, taskUpdateSchema } from "@/lib/validators";
import { serverErrorResponse } from "@/lib/api-errors";

const demoTasks: Task[] = [
  {
    id: "demo-task-1",
    created_at: new Date().toISOString(),
    lead_id: "demo-1",
    title: "Call Demo Clinic Owner about after-hours intake",
    due_at: new Date(Date.now() + 86400000).toISOString(),
    status: "open",
    completed_at: null,
  },
];

export async function GET(request: Request) {
  const user = await verifyAdminToken(request.headers.get("authorization"));

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ tasks: demoTasks, demoMode: true });
  }

  const url = new URL(request.url);
  const leadId = url.searchParams.get("leadId");
  const includeAll = url.searchParams.get("all") === "1";

  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("tasks")
    .select("*")
    .order("due_at", { ascending: true, nullsFirst: false })
    .limit(200);

  if (!includeAll) {
    query = query.eq("status", "open");
  }
  if (leadId) {
    query = query.eq("lead_id", leadId);
  }

  const { data, error } = await query;

  if (error) {
    return serverErrorResponse("admin/tasks:GET", error);
  }

  return NextResponse.json({ tasks: data });
}

export async function POST(request: Request) {
  const user = await verifyAdminToken(request.headers.get("authorization"));

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = taskCreateSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid task." }, { status: 400 });
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ ok: true, demoMode: true });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      lead_id: parsed.data.leadId ?? null,
      title: parsed.data.title,
      due_at: parsed.data.dueAt ?? null,
    })
    .select()
    .single();

  if (error) {
    return serverErrorResponse("admin/tasks:POST", error);
  }

  return NextResponse.json({ task: data });
}

export async function PATCH(request: Request) {
  const user = await verifyAdminToken(request.headers.get("authorization"));

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = taskUpdateSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid task update." }, { status: 400 });
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ ok: true, demoMode: true });
  }

  const update: Record<string, unknown> = {};
  if (parsed.data.title) {
    update.title = parsed.data.title;
  }
  if (parsed.data.dueAt !== undefined) {
    update.due_at = parsed.data.dueAt;
  }
  if (parsed.data.status) {
    update.status = parsed.data.status;
    update.completed_at = parsed.data.status === "done" ? new Date().toISOString() : null;
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("tasks").update(update).eq("id", parsed.data.id);

  if (error) {
    return serverErrorResponse("admin/tasks:PATCH", error);
  }

  return NextResponse.json({ ok: true });
}
