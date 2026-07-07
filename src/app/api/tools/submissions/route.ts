import { NextResponse } from "next/server";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase";
import { toolSubmissionSchema } from "@/lib/validators";
import { serverErrorResponse } from "@/lib/api-errors";

/**
 * Captures tool submissions (readiness email gate, conversion-audit URL
 * requests) as leads, so they surface in the existing admin dashboard.
 */
export async function POST(request: Request) {
  const parsed = toolSubmissionSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Please provide a valid email." }, { status: 400 });
  }

  const submission = parsed.data;

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ ok: true, demoMode: true });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("leads").insert({
    name: submission.email.split("@")[0],
    email: submission.email,
    pain_point: submission.summary,
    interest:
      submission.type === "ai-readiness" ? "AI strategy" : "AI website",
    source: `tool-${submission.type}`,
    demo_summary: submission.url ? `Site URL: ${submission.url}` : null,
    status: "new",
  });

  if (error) {
    return serverErrorResponse("tools/submissions:POST", error);
  }

  return NextResponse.json({ ok: true });
}
