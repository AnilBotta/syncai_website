import { NextResponse } from "next/server";
import { createSupabaseAdminClient, hasSupabaseAdminConfig, verifyAdminToken } from "@/lib/supabase";
import { callInitiateSchema } from "@/lib/validators";
import { initiateCallForLead } from "@/lib/calls";
import { hasVoiceConfig } from "@/lib/voice";
import { serverErrorResponse } from "@/lib/api-errors";

export const maxDuration = 60;

export async function GET(request: Request) {
  const user = await verifyAdminToken(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ calls: [], demoMode: true, voiceReady: false });
  }

  const url = new URL(request.url);
  const leadId = url.searchParams.get("leadId");

  const supabase = createSupabaseAdminClient();
  let query = supabase.from("calls").select("*").order("created_at", { ascending: false }).limit(100);
  if (leadId) query = query.eq("lead_id", leadId);
  const { data, error } = await query;
  if (error) return serverErrorResponse("admin/calls:GET", error);
  return NextResponse.json({ calls: data, voiceReady: hasVoiceConfig() });
}

export async function POST(request: Request) {
  const user = await verifyAdminToken(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = callInitiateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid call request." }, { status: 400 });

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ ok: true, demoMode: true, message: "Calling is offline in demo mode." });
  }

  const supabase = createSupabaseAdminClient();
  try {
    const result = await initiateCallForLead(supabase, parsed.data.leadId, parsed.data.context || undefined);
    return NextResponse.json(result);
  } catch (error) {
    return serverErrorResponse("admin/calls:POST", error);
  }
}
