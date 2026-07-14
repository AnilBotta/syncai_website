import { NextResponse } from "next/server";
import { createSupabaseAdminClient, hasSupabaseAdminConfig, verifyAdminToken } from "@/lib/supabase";
import { activateProspectBatch, offerLeadAutomation, pipelineStatus } from "@/lib/pipeline";
import { serverErrorResponse } from "@/lib/api-errors";

// Starting a batch drafts research/outreach for a few prospects synchronously.
export const maxDuration = 120;

export async function GET(request: Request) {
  const user = await verifyAdminToken(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasSupabaseAdminConfig()) return NextResponse.json({ stages: {}, demoMode: true });

  const supabase = createSupabaseAdminClient();
  const stages = await pipelineStatus(supabase);
  return NextResponse.json({ stages });
}

export async function POST(request: Request) {
  const user = await verifyAdminToken(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  if (!hasSupabaseAdminConfig()) return NextResponse.json({ ok: true, demoMode: true });

  const supabase = createSupabaseAdminClient();
  try {
    if (typeof body.leadId === "string") {
      // Single-lead start asks the CEO on Telegram first (Approve/Skip), then
      // drafts outreach on approval — same idempotent gate the button uses.
      const res = await offerLeadAutomation(supabase, body.leadId);
      return NextResponse.json(res);
    }
    if (Array.isArray(body.prospectIds) && body.prospectIds.length) {
      const res = await activateProspectBatch(supabase, body.prospectIds as string[]);
      return NextResponse.json(res);
    }
    return NextResponse.json({ ok: false, message: "Provide leadId or prospectIds." }, { status: 400 });
  } catch (error) {
    return serverErrorResponse("admin/pipeline:POST", error);
  }
}
