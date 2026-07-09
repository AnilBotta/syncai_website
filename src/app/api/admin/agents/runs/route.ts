import { NextResponse } from "next/server";
import { createSupabaseAdminClient, hasSupabaseAdminConfig, verifyAdminToken } from "@/lib/supabase";
import { getBudgetStatus } from "@/lib/agents/budget";
import { serverErrorResponse } from "@/lib/api-errors";

export async function GET(request: Request) {
  const user = await verifyAdminToken(request.headers.get("authorization"));

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({
      runs: [],
      spentToday: 0,
      budget: Number(process.env.OPENAI_DAILY_BUDGET_USD || "5"),
      demoMode: true,
    });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const [{ data: runs, error }, budget] = await Promise.all([
      supabase
        .from("agent_runs")
        .select("id, created_at, agent, status, model, cost_usd, error")
        .order("created_at", { ascending: false })
        .limit(50),
      getBudgetStatus(supabase),
    ]);

    if (error) {
      return serverErrorResponse("admin/agents/runs:GET", error);
    }

    return NextResponse.json({
      runs,
      spentToday: budget.spentToday,
      budget: budget.budget,
      remaining: budget.remaining,
    });
  } catch (error) {
    return serverErrorResponse("admin/agents/runs:GET", error);
  }
}
