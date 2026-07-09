import { NextResponse } from "next/server";
import { createSupabaseAdminClient, hasSupabaseAdminConfig, verifyAdminToken } from "@/lib/supabase";
import { emailSendSchema } from "@/lib/validators";
import { sendEmailRecord } from "@/lib/email/send-core";
import { serverErrorResponse } from "@/lib/api-errors";

export async function POST(request: Request) {
  const user = await verifyAdminToken(request.headers.get("authorization"));

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = emailSendSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid send request." }, { status: 400 });
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ ok: true, demoMode: true });
  }

  try {
    const supabase = createSupabaseAdminClient();

    // Resolve any pending approval for this email as approved.
    await supabase
      .from("approvals")
      .update({ status: "approved", decided_at: new Date().toISOString() })
      .eq("entity_id", parsed.data.id)
      .eq("type", "email")
      .eq("status", "pending");

    const result = await sendEmailRecord(supabase, parsed.data.id);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ ok: true, demoMode: result.demoMode });
  } catch (error) {
    return serverErrorResponse("admin/emails/send:POST", error);
  }
}
