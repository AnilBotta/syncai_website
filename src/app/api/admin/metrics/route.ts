import { NextResponse } from "next/server";
import { createSupabaseAdminClient, hasSupabaseAdminConfig, verifyAdminToken } from "@/lib/supabase";
import { serverErrorResponse } from "@/lib/api-errors";

const WEEKS = 12;
const MS_PER_DAY = 86400000;
const MS_PER_WEEK = 7 * MS_PER_DAY;

export async function GET(request: Request) {
  const user = await verifyAdminToken(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ demoMode: true, metrics: null });
  }

  const supabase = createSupabaseAdminClient();
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setUTCHours(0, 0, 0, 0);
  weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay());
  const thisWeekStart = weekStart.getTime();
  const lastWeekStart = thisWeekStart - MS_PER_WEEK;
  const trendStart = new Date(thisWeekStart - (WEEKS - 1) * MS_PER_WEEK).toISOString();
  const todayStart = new Date(now);
  todayStart.setUTCHours(0, 0, 0, 0);
  const in7days = new Date(now.getTime() + 7 * MS_PER_DAY).toISOString();

  try {
    const [
      { data: leadRows, error: leadsError },
      { count: pendingApprovals },
      { count: upcomingAppointments },
      { count: overdueTasks },
      { data: spendRows },
      { data: activityRows },
    ] = await Promise.all([
      supabase.from("leads").select("id, status, value, created_at"),
      supabase.from("approvals").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .gte("starts_at", now.toISOString())
        .lte("starts_at", in7days)
        .in("status", ["pending", "confirmed"]),
      supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("status", "open")
        .lt("due_at", now.toISOString()),
      supabase.from("agent_runs").select("cost_usd").gte("created_at", todayStart.toISOString()),
      supabase
        .from("lead_activities")
        .select("id, created_at, type, title, body, actor, lead_id, leads(name)")
        .order("created_at", { ascending: false })
        .limit(15),
    ]);

    if (leadsError) return serverErrorResponse("admin/metrics:GET", leadsError);

    const leads = leadRows || [];
    const newLeadsThisWeek = leads.filter((l) => new Date(l.created_at).getTime() >= thisWeekStart).length;
    const newLeadsLastWeek = leads.filter((l) => {
      const t = new Date(l.created_at).getTime();
      return t >= lastWeekStart && t < thisWeekStart;
    }).length;

    const pipelineValue = leads
      .filter((l) => ["contacted", "qualified", "proposal"].includes(l.status))
      .reduce((sum, l) => sum + (Number(l.value) || 0), 0);
    const wonValue = leads.filter((l) => l.status === "won").reduce((sum, l) => sum + (Number(l.value) || 0), 0);

    const qualifiedOrBetter = leads.filter((l) => ["qualified", "proposal", "won"].includes(l.status)).length;
    const qualifiedRate = leads.length ? Math.round((qualifiedOrBetter / leads.length) * 100) : 0;

    const spendToday = (spendRows || []).reduce((sum, r) => sum + (Number(r.cost_usd) || 0), 0);

    // 12-week new-lead trend, oldest first.
    const trendLeads = leads.filter((l) => new Date(l.created_at).getTime() >= new Date(trendStart).getTime());
    const weeklyLeads = Array.from({ length: WEEKS }, (_, i) => {
      const bucketStart = thisWeekStart - (WEEKS - 1 - i) * MS_PER_WEEK;
      const bucketEnd = bucketStart + MS_PER_WEEK;
      const count = trendLeads.filter((l) => {
        const t = new Date(l.created_at).getTime();
        return t >= bucketStart && t < bucketEnd;
      }).length;
      return { weekStart: new Date(bucketStart).toISOString(), count };
    });

    const pipelineByStage = ["new", "contacted", "qualified", "proposal", "won", "lost"].map((status) => {
      const inStage = leads.filter((l) => l.status === status);
      return {
        status,
        count: inStage.length,
        value: inStage.reduce((sum, l) => sum + (Number(l.value) || 0), 0),
      };
    });

    const recentActivity = (activityRows || []).map((row) => {
      const leadRel = row.leads as unknown as { name?: string } | { name?: string }[] | null;
      const leadName = Array.isArray(leadRel) ? leadRel[0]?.name : leadRel?.name;
      return {
        id: row.id,
        created_at: row.created_at,
        type: row.type,
        title: row.title,
        body: row.body,
        actor: row.actor,
        lead_id: row.lead_id,
        lead_name: leadName || null,
      };
    });

    return NextResponse.json({
      metrics: {
        newLeadsThisWeek,
        newLeadsLastWeek,
        pipelineValue,
        wonValue,
        qualifiedRate,
        pendingApprovals: pendingApprovals || 0,
        upcomingAppointments: upcomingAppointments || 0,
        overdueTasks: overdueTasks || 0,
        aiSpendToday: Math.round(spendToday * 10_000) / 10_000,
        weeklyLeads,
        pipelineByStage,
        recentActivity,
      },
    });
  } catch (error) {
    return serverErrorResponse("admin/metrics:GET", error);
  }
}
