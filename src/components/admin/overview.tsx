"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Bot, CalendarClock, CheckCircle2, Loader2, TrendingUp, Wallet } from "lucide-react";
import { KpiCard } from "@/components/admin/kpi-card";
import { MiniBarChart } from "@/components/admin/mini-bar-chart";
import { ActivityFeed } from "@/components/admin/activity-feed";
import { leadStatuses } from "@/lib/site-data";

const cad = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });

type Metrics = {
  newLeadsThisWeek: number;
  newLeadsLastWeek: number;
  pipelineValue: number;
  wonValue: number;
  qualifiedRate: number;
  pendingApprovals: number;
  upcomingAppointments: number;
  overdueTasks: number;
  aiSpendToday: number;
  netThisMonth: number;
  collectedRevenue: number;
  outstanding: number;
  weeklyLeads: { weekStart: string; count: number }[];
  pipelineByStage: { status: string; count: number; value: number }[];
  recentActivity: {
    id: string;
    created_at: string;
    type: "note" | "status_change" | "email" | "agent_run" | "task" | "document" | "call" | "system";
    title: string;
    body?: string | null;
    lead_name?: string | null;
  }[];
};

export function Overview({ getToken }: { getToken: () => Promise<string> }) {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [demoMode, setDemoMode] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      const response = await fetch("/api/admin/metrics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load metrics.");
      setMetrics(result.metrics);
      setDemoMode(Boolean(result.demoMode));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load metrics.");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center text-muted">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Loading overview
      </div>
    );
  }

  if (demoMode || !metrics) {
    return (
      <div className="rounded-2xl border border-amber-300/30 bg-amber-400/10 p-4 text-sm text-amber-700">
        Demo mode is active. Add Supabase service keys to show live metrics.
      </div>
    );
  }

  const leadsDelta = metrics.newLeadsThisWeek - metrics.newLeadsLastWeek;
  const maxStageValue = Math.max(1, ...metrics.pipelineByStage.map((s) => s.value));

  return (
    <div className="grid gap-6">
      {error ? <p className="rounded-2xl bg-red-500/10 p-4 text-sm text-red-600">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="New leads this week"
          value={String(metrics.newLeadsThisWeek)}
          icon={TrendingUp}
          delta={{ value: leadsDelta, label: "vs last week" }}
        />
        <KpiCard label="Open pipeline value" value={cad.format(metrics.pipelineValue)} icon={Wallet} />
        <KpiCard label="Qualified rate" value={`${metrics.qualifiedRate}%`} icon={CheckCircle2} />
        <KpiCard
          label="Pending approvals"
          value={String(metrics.pendingApprovals)}
          icon={AlertTriangle}
          tone={metrics.pendingApprovals > 0 ? "warn" : "default"}
        />
        <KpiCard label="Upcoming appointments (7d)" value={String(metrics.upcomingAppointments)} icon={CalendarClock} />
        <KpiCard
          label="Overdue tasks"
          value={String(metrics.overdueTasks)}
          icon={AlertTriangle}
          tone={metrics.overdueTasks > 0 ? "warn" : "default"}
        />
        <KpiCard label="AI spend today" value={`$${metrics.aiSpendToday.toFixed(2)}`} icon={Bot} />
        <KpiCard
          label="Net this month"
          value={cad.format(metrics.netThisMonth ?? 0)}
          icon={Wallet}
          tone={(metrics.netThisMonth ?? 0) < 0 ? "warn" : "default"}
        />
        <KpiCard label="Outstanding invoices" value={cad.format(metrics.outstanding ?? 0)} icon={Wallet} />
        <KpiCard label="Won value" value={cad.format(metrics.wonValue)} icon={Wallet} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className="rounded-[2rem] border border-border-subtle bg-bg-elevated p-5 shadow-sm">
          <p className="text-sm font-black text-foreground">New leads — last 12 weeks</p>
          <div className="mt-4">
            <MiniBarChart
              data={metrics.weeklyLeads.map((w) => ({
                label: new Date(w.weekStart).toLocaleDateString("en-CA", { month: "short", day: "numeric" }),
                value: w.count,
              }))}
            />
          </div>
        </section>

        <section className="rounded-[2rem] border border-border-subtle bg-bg-elevated p-5 shadow-sm">
          <p className="text-sm font-black text-foreground">Pipeline by stage</p>
          <div className="mt-4 grid gap-3">
            {metrics.pipelineByStage.map((stage) => {
              const label = leadStatuses.find((s) => s.value === stage.status)?.label || stage.status;
              const pct = Math.round((stage.value / maxStageValue) * 100);
              return (
                <div key={stage.status}>
                  <div className="flex items-center justify-between text-xs font-bold text-muted">
                    <span className="text-foreground">{label}</span>
                    <span>
                      {stage.count} · {cad.format(stage.value)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface">
                    <div className="h-full rounded-full bg-brand-deep/80" style={{ width: `${Math.max(2, pct)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section className="rounded-[2rem] border border-border-subtle bg-bg-elevated p-5 shadow-sm">
        <p className="text-sm font-black text-foreground">Recent activity</p>
        <div className="mt-4">
          <ActivityFeed items={metrics.recentActivity} />
        </div>
      </section>
    </div>
  );
}
