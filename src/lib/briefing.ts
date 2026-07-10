import type { SupabaseClient } from "@supabase/supabase-js";
import type { TickResult } from "@/lib/sequences";

const cad = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });

async function countSince(supabase: SupabaseClient, table: string, column: string, iso: string) {
  const { count } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .gte(column, iso);
  return count || 0;
}

export type Briefing = { subject: string; text: string; html: string };

/**
 * Gathers the morning numbers and formats them for both an email (html) and a
 * short Telegram message (text). Deterministic + fast — no LLM call.
 */
export async function buildBriefing(supabase: SupabaseClient, tick?: TickResult): Promise<Briefing> {
  const now = new Date();
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
  const in7days = new Date(now.getTime() + 7 * 86400000).toISOString();

  const [
    newLeadsToday,
    newLeadsWeek,
    newProspectsToday,
    { data: leadRows },
    { count: pendingApprovals },
    { data: appts },
    { data: overdueTasks },
    { data: spendRows },
  ] = await Promise.all([
    countSince(supabase, "leads", "created_at", todayStart.toISOString()),
    countSince(supabase, "leads", "created_at", weekAgo),
    countSince(supabase, "prospects", "created_at", todayStart.toISOString()),
    supabase.from("leads").select("status, value"),
    supabase.from("approvals").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase
      .from("appointments")
      .select("name, starts_at")
      .gte("starts_at", now.toISOString())
      .lte("starts_at", in7days)
      .in("status", ["pending", "confirmed"])
      .order("starts_at", { ascending: true }),
    supabase.from("tasks").select("title, due_at").eq("status", "open").lt("due_at", now.toISOString()),
    supabase.from("agent_runs").select("cost_usd").gte("created_at", todayStart.toISOString()),
  ]);

  const leads = leadRows || [];
  const openValue = leads
    .filter((l) => ["contacted", "qualified", "proposal"].includes(l.status))
    .reduce((sum, l) => sum + (Number(l.value) || 0), 0);
  const wonValue = leads
    .filter((l) => l.status === "won")
    .reduce((sum, l) => sum + (Number(l.value) || 0), 0);
  const spendToday = (spendRows || []).reduce((s, r) => s + (Number(r.cost_usd) || 0), 0);
  const upcoming = appts || [];
  const overdue = overdueTasks || [];

  const dateLabel = now.toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" });

  const lines = [
    `📊 New leads: ${newLeadsToday} today, ${newLeadsWeek} this week`,
    `🔎 New prospects found: ${newProspectsToday} today`,
    `💰 Open pipeline: ${cad.format(openValue)} · Won: ${cad.format(wonValue)}`,
    `✅ Awaiting your approval: ${pendingApprovals || 0}`,
    `📅 Upcoming appointments (7d): ${upcoming.length}`,
    `⏰ Overdue tasks: ${overdue.length}`,
    `🤖 AI spend today: $${spendToday.toFixed(2)}`,
  ];
  if (tick && tick.processed > 0) {
    lines.push(`✉️ Nurture: ${tick.drafted} drafted, ${tick.sent} auto-sent, ${tick.completed} completed`);
  }

  const decisions: string[] = [];
  if ((pendingApprovals || 0) > 0) decisions.push(`${pendingApprovals} item(s) need approval in your inbox`);
  if (overdue.length > 0) decisions.push(`${overdue.length} overdue task(s)`);

  const text =
    `☀️ SyncAI briefing — ${dateLabel}\n\n${lines.join("\n")}` +
    (decisions.length ? `\n\n👉 Needs you: ${decisions.join("; ")}` : "\n\nAll clear — nothing needs a decision.");

  const html = `<!doctype html><html><body style="margin:0;background:#f6f7f9;padding:24px;font-family:Arial,sans-serif;color:#1a1a1f;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;">
    <h1 style="font-size:20px;margin:0 0 4px;">☀️ Your morning briefing</h1>
    <p style="color:#6b7280;font-size:13px;margin:0 0 20px;">${dateLabel}</p>
    <table style="width:100%;border-collapse:collapse;font-size:15px;">
      ${lines.map((l) => `<tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">${l}</td></tr>`).join("")}
    </table>
    ${
      decisions.length
        ? `<div style="margin-top:20px;padding:14px 16px;background:#fff7ed;border-radius:12px;color:#9a3412;font-size:14px;">
             <strong>Needs your decision:</strong><br/>${decisions.join("<br/>")}</div>`
        : `<p style="margin-top:20px;color:#1e8449;font-size:14px;">All clear — nothing needs a decision today.</p>`
    }
    <p style="margin-top:24px;color:#9ca3af;font-size:12px;">— The Manager</p>
  </div></body></html>`;

  return { subject: `☀️ SyncAI briefing — ${dateLabel}`, text, html };
}
