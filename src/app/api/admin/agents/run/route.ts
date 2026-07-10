import { NextResponse } from "next/server";
import {
  createSupabaseAdminClient,
  hasSupabaseAdminConfig,
  type Lead,
  type Prospect,
  verifyAdminToken,
} from "@/lib/supabase";
import { agentRunSchema } from "@/lib/validators";
import { runQualify } from "@/lib/agents/qualify";
import { runResearch } from "@/lib/agents/research";
import { runOutreach } from "@/lib/agents/outreach";
import { runScraper } from "@/lib/agents/scraper";
import { runNegotiator } from "@/lib/agents/negotiator";
import { serverErrorResponse } from "@/lib/api-errors";

// Agent runs can call external APIs + OpenAI; give them room.
export const maxDuration = 120;

export async function POST(request: Request) {
  const user = await verifyAdminToken(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = agentRunSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid agent request." }, { status: 400 });

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ ok: true, demoMode: true, message: "Agents are offline in demo mode." });
  }

  const supabase = createSupabaseAdminClient();
  const { agent, leadId, prospectId, icpId, instruction, threadContext } = parsed.data;

  try {
    switch (agent) {
      case "qualify": {
        if (!leadId) return NextResponse.json({ error: "leadId required." }, { status: 400 });
        const result = await runQualify(supabase, leadId);
        return NextResponse.json(result);
      }
      case "research": {
        // Research accepts a lead or a prospect; resolve the company either way.
        let company = "";
        let industry: string | null = null;
        let painPoint: string | null = null;
        if (leadId) {
          const { data } = await supabase.from("leads").select("*").eq("id", leadId).single<Lead>();
          if (!data) return NextResponse.json({ error: "Lead not found." }, { status: 404 });
          company = data.company || data.name;
          industry = data.industry ?? null;
          painPoint = data.pain_point;
        } else if (prospectId) {
          const { data } = await supabase.from("prospects").select("*").eq("id", prospectId).single<Prospect>();
          if (!data) return NextResponse.json({ error: "Prospect not found." }, { status: 404 });
          company = data.company;
        } else {
          return NextResponse.json({ error: "leadId or prospectId required." }, { status: 400 });
        }
        const result = await runResearch(supabase, { company, industry, painPoint, leadId, prospectId });
        return NextResponse.json(result);
      }
      case "outreach": {
        const result = await runOutreach(supabase, { leadId, prospectId, instruction });
        return NextResponse.json(result);
      }
      case "scraper": {
        if (!icpId) return NextResponse.json({ error: "icpId required." }, { status: 400 });
        const result = await runScraper(supabase, icpId);
        return NextResponse.json(result);
      }
      case "negotiate": {
        if (!leadId) return NextResponse.json({ error: "leadId required." }, { status: 400 });
        if (!threadContext) return NextResponse.json({ error: "threadContext required." }, { status: 400 });
        const result = await runNegotiator(supabase, { leadId, threadContext });
        return NextResponse.json(result);
      }
      default:
        return NextResponse.json({ error: "Unknown agent." }, { status: 400 });
    }
  } catch (error) {
    return serverErrorResponse("admin/agents/run:POST", error);
  }
}
