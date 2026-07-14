import { NextResponse } from "next/server";
import {
  createSupabaseAdminClient,
  hasSupabaseAdminConfig,
  type Approval,
  verifyAdminToken,
} from "@/lib/supabase";
import { approvalDecisionSchema } from "@/lib/validators";
import { sendEmailRecord } from "@/lib/email/send-core";
import { sendDocumentForSignature } from "@/lib/documents";
import { sendInvoice } from "@/lib/invoices";
import { decidePipelineApproval, onEmailDecided } from "@/lib/pipeline";
import { serverErrorResponse } from "@/lib/api-errors";

// Approving a pipeline batch triggers a bounded burst of research/drafts.
export const maxDuration = 120;

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

  // Pipeline gates (batch / calls / book-call) are handled by the shared decision
  // router — the same path Telegram buttons use.
  if (approval.type.startsWith("pipeline_")) {
    await decidePipelineApproval(supabase, approval.id, parsed.data.decision);
    return NextResponse.json({ ok: true });
  }

  const now = new Date().toISOString();

  if (parsed.data.decision === "rejected") {
    await supabase
      .from("approvals")
      .update({ status: "rejected", decided_at: now })
      .eq("id", approval.id);
    // Cancel the underlying draft email so it can't be sent later.
    if ((approval.type === "email" || approval.type === "negotiation_reply") && approval.entity_id) {
      await supabase
        .from("emails")
        .update({ status: "cancelled" })
        .eq("id", approval.entity_id)
        .eq("status", "draft");
    }
    // A rejected pipeline-outreach email ends that lead's automation.
    if (approval.type === "email") {
      await onEmailDecided(supabase, approval.lead_id ?? null, "rejected");
    }
    // Cancel a rejected document so its accept link never activates.
    if (approval.type === "document" && approval.entity_id) {
      await supabase
        .from("documents")
        .update({ status: "cancelled" })
        .eq("id", approval.entity_id)
        .eq("status", "draft");
    }
    // Void a rejected invoice so it can't be sent.
    if (approval.type === "invoice" && approval.entity_id) {
      await supabase
        .from("invoices")
        .update({ status: "void" })
        .eq("id", approval.entity_id)
        .eq("status", "draft");
    }
    return NextResponse.json({ ok: true });
  }

  // Approved. For emails and negotiation replies (which are emails under the
  // hood), approving IS sending.
  if ((approval.type === "email" || approval.type === "negotiation_reply") && approval.entity_id) {
    const result = await sendEmailRecord(supabase, approval.entity_id);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    await supabase
      .from("approvals")
      .update({ status: "approved", decided_at: now })
      .eq("id", approval.id);
    // Advance any automation on this lead: move to contacted + maybe offer calls.
    if (approval.type === "email") {
      await onEmailDecided(supabase, approval.lead_id ?? null, "approved");
    }
    return NextResponse.json({ ok: true, demoMode: result.demoMode });
  }

  // Approving a document emails the lead a signable copy (accept link).
  if (approval.type === "document" && approval.entity_id) {
    const result = await sendDocumentForSignature(supabase, approval.entity_id);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    await supabase
      .from("approvals")
      .update({ status: "approved", decided_at: now })
      .eq("id", approval.id);
    return NextResponse.json({ ok: true, demoMode: result.demoMode });
  }

  // Approving an invoice sends it (Stripe hosted invoice or e-transfer email).
  if (approval.type === "invoice" && approval.entity_id) {
    const result = await sendInvoice(supabase, approval.entity_id);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    await supabase
      .from("approvals")
      .update({ status: "approved", decided_at: now })
      .eq("id", approval.id);
    return NextResponse.json({ ok: true, demoMode: result.demoMode });
  }

  // Other approval types (icp/…) are wired up in later phases.
  await supabase
    .from("approvals")
    .update({ status: "approved", decided_at: now })
    .eq("id", approval.id);

  return NextResponse.json({ ok: true });
}
