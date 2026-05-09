import { NextResponse } from "next/server";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase";
import { leadSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const parsed = leadSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Please complete the required lead details." }, { status: 400 });
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
