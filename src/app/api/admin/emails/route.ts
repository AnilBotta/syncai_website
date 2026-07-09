import { NextResponse } from "next/server";
import {
  createSupabaseAdminClient,
  hasSupabaseAdminConfig,
  type Email,
  verifyAdminToken,
} from "@/lib/supabase";
import { emailCreateSchema, emailUpdateSchema } from "@/lib/validators";
import { createApproval } from "@/lib/approvals";
import { serverErrorResponse } from "@/lib/api-errors";

const demoEmails: Email[] = [
  {
    id: "demo-email-1",
    created_at: new Date().toISOString(),
    lead_id: "demo-1",
    direction: "outbound",
    to_email: "owner@example.com",
    subject: "Following up on your AI intake question",
    body_text:
      "Hi there,\n\nThanks for trying our AI demo. I'd love to show you how SyncAI can handle after-hours calls for your clinic.\n\nBest,\nAnil",
    status: "draft",
    source: "manual",
    approved_at: null,
    sent_at: null,
    resend_id: null,
    error: null,
    meta: {},
  },
];

export async function GET(request: Request) {
  const user = await verifyAdminToken(request.headers.get("authorization"));

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ emails: demoEmails, demoMode: true });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const leadId = url.searchParams.get("leadId");

  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("emails")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (status) {
    query = query.eq("status", status);
  }
  if (leadId) {
    query = query.eq("lead_id", leadId);
  }

  const { data, error } = await query;

  if (error) {
    return serverErrorResponse("admin/emails:GET", error);
  }

  return NextResponse.json({ emails: data });
}

export async function POST(request: Request) {
  const user = await verifyAdminToken(request.headers.get("authorization"));

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = emailCreateSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email draft." }, { status: 400 });
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ ok: true, demoMode: true });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("emails")
    .insert({
      lead_id: parsed.data.leadId ?? null,
      to_email: parsed.data.toEmail,
      subject: parsed.data.subject,
      body_text: parsed.data.bodyText,
      source: parsed.data.source,
      status: "draft",
    })
    .select()
    .single<Email>();

  if (error || !data) {
    return serverErrorResponse("admin/emails:POST", error);
  }

  // Every draft becomes a pending approval so it shows up in the inbox.
  await createApproval(supabase, {
    type: "email",
    entityId: data.id,
    leadId: data.lead_id,
    title: `Email: ${data.subject}`,
    summary: `To ${data.to_email}`,
    meta: { source: data.source },
  });

  return NextResponse.json({ email: data });
}

export async function PATCH(request: Request) {
  const user = await verifyAdminToken(request.headers.get("authorization"));

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = emailUpdateSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email update." }, { status: 400 });
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ ok: true, demoMode: true });
  }

  const supabase = createSupabaseAdminClient();

  const { data: current, error: fetchError } = await supabase
    .from("emails")
    .select("status")
    .eq("id", parsed.data.id)
    .single<{ status: Email["status"] }>();

  if (fetchError || !current) {
    return NextResponse.json({ error: "Email not found." }, { status: 404 });
  }

  // Only drafts can be edited or cancelled; sent mail is immutable.
  if (current.status !== "draft") {
    return NextResponse.json(
      { error: "Only draft emails can be edited or cancelled." },
      { status: 409 },
    );
  }

  if (parsed.data.action === "cancel") {
    await supabase.from("emails").update({ status: "cancelled" }).eq("id", parsed.data.id);
    await supabase
      .from("approvals")
      .update({ status: "rejected", decided_at: new Date().toISOString() })
      .eq("entity_id", parsed.data.id)
      .eq("type", "email")
      .eq("status", "pending");
    return NextResponse.json({ ok: true });
  }

  const update: Record<string, unknown> = {};
  if (parsed.data.subject) {
    update.subject = parsed.data.subject;
  }
  if (parsed.data.bodyText) {
    update.body_text = parsed.data.bodyText;
  }

  const { error } = await supabase.from("emails").update(update).eq("id", parsed.data.id);

  if (error) {
    return serverErrorResponse("admin/emails:PATCH", error);
  }

  return NextResponse.json({ ok: true });
}
