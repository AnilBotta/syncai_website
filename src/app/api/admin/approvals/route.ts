import { NextResponse } from "next/server";
import {
  createSupabaseAdminClient,
  hasSupabaseAdminConfig,
  type Approval,
  verifyAdminToken,
} from "@/lib/supabase";
import { approvalDecisionSchema } from "@/lib/validators";
import { sendEmailRecord } from "@/lib/email/send-core";
import { serverErrorResponse } from "@/lib/api-errors";

const demoApprovals: Approval[] = [
  {
    id: "demo-approval-1",
    created_at: new Date().toISOString(),
    type: "email",
    entity_id: "demo-email-1",
    lead_id: "demo-1",
    title: "Email: Following up on your AI intake question",
    summary: "To owner@example.com",
    status: "pending",
    decided_at: null,
    meta: { source: "manual" },
  },
];

export async function GET(request: Request) {
  const user = await verifyAdminToken(request.headers.get("authorization"));

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ approvals: demoApprovals, demoMode: true });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status") || "pending";

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("approvals")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return serverErrorResponse("admin/approvals:GET", error);
  }

  return NextResponse.json({ approvals: data });
}

export async function PATCH(request: Request) {
  const user = await verifyAdminToken(request.headers.get("authorization"));

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = approvalDecisionSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid approval decision." }, { status: 400 });
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ ok: true, demoMode: true });
  }

  const supabase = createSupabaseAdminClient();

  const { data: approval, error: fetchError } = await supabase
    .from("approvals")
    .select("*")
    .eq("id", parsed.data.id)
    .single<Approval>();

  if (fetchError || !approval) {
    return NextResponse.json({ error: "Approval not found." }, { status: 404 });
  }

  if (approval.status !== "pending") {
    return NextResponse.json({ error: "This item was already decided." }, { status: 409 });
  }

  const now = new Date().toISOString();

  if (parsed.data.decision === "rejected") {
    await supabase
      .from("approvals")
      .update({ status: "rejected", decided_at: now })
      .eq("id", approval.id);
    // Cancel the underlying draft email so it can't be sent later.
    if (approval.type === "email" && approval.entity_id) {
      await supabase
        .from("emails")
        .update({ status: "cancelled" })
        .eq("id", approval.entity_id)
        .eq("status", "draft");
    }
    return NextResponse.json({ ok: true });
  }

  // Approved. For emails, approving IS sending.
  if (approval.type === "email" && approval.entity_id) {
    const result = await sendEmailRecord(supabase, approval.entity_id);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    await supabase
      .from("approvals")
      .update({ status: "approved", decided_at: now })
      .eq("id", approval.id);
    return NextResponse.json({ ok: true, demoMode: result.demoMode });
  }

  // Other approval types (document/invoice/icp/…) are wired up in later phases.
  await supabase
    .from("approvals")
    .update({ status: "approved", decided_at: now })
    .eq("id", approval.id);

  return NextResponse.json({ ok: true });
}
