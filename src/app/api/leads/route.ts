import { NextResponse } from "next/server";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase";
import { leadSchema } from "@/lib/validators";
import { serverErrorResponse } from "@/lib/api-errors";
import { clientIpFromRequest, getTurnstileToken, verifyTurnstile } from "@/lib/turnstile";

export async function POST(request: Request) {
  const raw = await request.json().catch(() => null);
  const parsed = leadSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json({ error: "Please complete the required lead details." }, { status: 400 });
  }

  const token = getTurnstileToken(raw);
  if (!(await verifyTurnstile(token, clientIpFromRequest(request)))) {
    return NextResponse.json({ error: "Human verification failed. Please try again." }, { status: 403 });
  }

  const lead = parsed.data;

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({
      ok: true,
      demoMode: true,
      message: "Lead accepted in demo mode. Add Supabase environment variables to persist leads.",
    });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("leads").insert({
    name: lead.name,
    email: lead.email,
    phone: lead.phone || null,
    company: lead.company || null,
    industry: lead.industry || null,
    pain_point: lead.painPoint,
    interest: lead.interest || null,
    source: lead.source,
    demo_summary: lead.demoSummary || null,
    status: "new",
  });

  if (error) {
    return serverErrorResponse("leads:POST", error);
  }

  return NextResponse.json({ ok: true });
}
