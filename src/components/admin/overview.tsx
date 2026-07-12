"use client";

import { useCallback, useEffect, useMemo, useState, type ComponentProps, type ReactNode } from "react";
import {
  ArrowRight,
  Bot,
  CalendarClock,
  ChevronRight,
  Inbox,
  ListChecks,
  TrendingUp,
  Trophy,
  Wallet,
} from "lucide-react";
import { leadStatuses } from "@/lib/site-data";
import type { View } from "@/components/admin/shell/nav-config";
import { Card } from "@/components/admin/ui/card";
import { StatCard } from "@/components/admin/ui/stat-card";
import { SectionHeader } from "@/components/admin/ui/section-header";
import { IconChip } from "@/components/admin/ui/icon-chip";
import { Badge } from "@/components/admin/ui/badge";
import { ProgressBar } from "@/components/admin/ui/progress-bar";
import { Segmented } from "@/components/admin/ui/segmented";
import { Skeleton } from "@/components/admin/ui/skeleton";
import { DemoBanner, ErrorBanner } from "@/components/admin/ui/banners";
import { GradientAreaChart, type ChartSeries } from "@/components/admin/ui/gradient-area-chart";
import { ActivityFeed } from "@/components/admin/activity-feed";
import { deriveInsights } from "@/components/admin/insights";

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

export function Overview({ getToken, onNavigate }: { getToken: () => Promise<string>; onNavigate?: (v: View) => void }) {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [demoMode, setDemoMode] = useState(false);
  const [range, setRange] = useState<"4w" | "12w">("12w");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      const response = await fetch("/api/admin/metrics", { headers: { Authorization: `Bearer ${token}` } });
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
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const insights = useMemo(() => (metrics ? deriveInsights(metrics) : []), [metrics]);

  const chartSeries = useMemo<ChartSeries[]>(() => {
    if (!metrics) return [];
    const weeks = range === "4w" ? metrics.weeklyLeads.slice(-4) : metrics.weeklyLeads;
    const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric" });
    const leads = weeks.map((w) => ({ label: fmt(w.weekStart), value: w.count }));
    // Trailing moving average (honest comparison line).
    const window = Math.min(4, weeks.length);
    const avg = weeks.map((_, i) => {
      const slice = weeks.slice(Math.max(0, i - window + 1), i + 1);
      return { label: fmt(weeks[i].weekStart), value: slice.reduce((s, w) => s + w.count, 0) / slice.length };
    });
    return [
      { id: "leads", label: "New leads", data: leads, style: "solid", showArea: true },
      { id: "avg", label: "Trend", data: avg, style: "dashed" },
    ];
  }, [metrics, range]);

  if (loading) return <OverviewSkeleton />;

  if (demoMode || !metrics) {
    return <DemoBanner message="Demo mode is active. Add Supabase service keys to show live metrics." />;
  }

  const leadsDelta = metrics.newLeadsThisWeek - metrics.newLeadsLastWeek;
  const maxStageValue = Math.max(1, ...metrics.pipelineByStage.map((s) => s.value));
  const agentRuns = metrics.recentActivity.filter((a) => a.type === "agent_run").length;
  const briefing = insights[0];
  const recommendations = insights.slice(1);
  const collectedPlusOutstanding = metrics.collectedRevenue + metrics.outstanding;

  return (
    <div className="grid gap-5">
      {error ? <ErrorBanner message={error} /> : null}

      {/* AI briefing strip */}
      {briefing ? (
        <Card className="flex items-center gap-4 p-4 sm:p-5">
          <IconChip icon={briefing.icon} gradient size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase tracking-[.16em] text-brand-glow-text">AI briefing</p>
            <p className="mt-0.5 truncate text-[15px] font-black text-foreground">{briefing.title}</p>
            <p className="truncate text-sm text-muted">{briefing.body}</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate?.(briefing.target)}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-brand-deep px-4 text-sm font-bold text-white transition hover:brightness-110"
          >
            Review
            <ArrowRight className="size-4" />
          </button>
        </Card>
      ) : null}

      {/* Hero KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="New leads this week"
          value={String(metrics.newLeadsThisWeek)}
          numericValue={metrics.newLeadsThisWeek}
          icon={TrendingUp}
          delta={{ value: leadsDelta, label: "vs last week" }}
        />
        <StatCard label="Open pipeline" value={cad.format(metrics.pipelineValue)} icon={Wallet} tone="info" />
        <StatCard label="Won value" value={cad.format(metrics.wonValue)} icon={Trophy} tone="success" />
        <StatCard
          label="Pending approvals"
          value={String(metrics.pendingApprovals)}
          numericValue={metrics.pendingApprovals}
          icon={Inbox}
          tone={metrics.pendingApprovals > 0 ? "warn" : "brand"}
          sub={metrics.pendingApprovals > 0 ? "needs review" : "all clear"}
        />
      </div>

      {/* Chart + recommendations */}
      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Card className="p-5">
          <SectionHeader
            title="Lead momentum"
            eyebrow="New leads over time"
            action={
              <Segmented
                options={[
                  { value: "4w", label: "4W" },
                  { value: "12w", label: "12W" },
                ]}
                value={range}
                onChange={setRange}
                ariaLabel="Chart range"
              />
            }
          />
          <div className="mt-4">
            <GradientAreaChart series={chartSeries} height={240} ariaLabel="New leads per week with trend line" />
          </div>
        </Card>

        <Card className="flex flex-col p-5">
          <SectionHeader title="AI recommendations" eyebrow="What to do next" />
          <div className="mt-4 grid flex-1 gap-2.5">
            {recommendations.slice(0, 4).map((rec) => (
              <button
                key={rec.id}
                type="button"
                onClick={() => onNavigate?.(rec.target)}
                className="group flex items-start gap-3 rounded-[var(--radius-control)] border border-sidebar-border p-3 text-left transition hover:border-brand-soft/60 hover:shadow-card"
              >
                <IconChip icon={rec.icon} tone={rec.tone} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-foreground">{rec.title}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-muted">{rec.body}</span>
                </span>
                <ChevronRight className="mt-1 size-4 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-brand-glow-text" />
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom widget row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MiniStat
          icon={ListChecks}
          tone={metrics.overdueTasks > 0 ? "danger" : "brand"}
          label="Tasks"
          onClick={() => onNavigate?.("tasks")}
        >
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-foreground">{metrics.overdueTasks}</span>
            <span className="text-xs text-muted">overdue</span>
          </div>
        </MiniStat>

        <MiniStat icon={CalendarClock} tone="info" label="Upcoming (7d)" onClick={() => onNavigate?.("appointments")}>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-foreground">{metrics.upcomingAppointments}</span>
            <span className="text-xs text-muted">appointments</span>
          </div>
        </MiniStat>

        <MiniStat icon={Wallet} tone="success" label="Finance" onClick={() => onNavigate?.("finance")}>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted">Collected</span>
              <span className="font-bold text-foreground">{cad.format(metrics.collectedRevenue)}</span>
            </div>
            <ProgressBar value={metrics.collectedRevenue} max={Math.max(1, collectedPlusOutstanding)} tone="success" />
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted">Outstanding</span>
              <span className="font-bold text-foreground">{cad.format(metrics.outstanding)}</span>
            </div>
          </div>
        </MiniStat>

        <MiniStat icon={Bot} tone="brand" label="AI ops (today)" onClick={() => onNavigate?.("manager")}>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-foreground">${metrics.aiSpendToday.toFixed(2)}</span>
            <span className="text-xs text-muted">spend</span>
          </div>
          <p className="mt-1 text-xs text-muted">{agentRuns} recent agent runs</p>
        </MiniStat>
      </div>

      {/* Pipeline by stage + recent activity */}
      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <Card className="p-5">
          <SectionHeader title="Pipeline by stage" />
          <div className="mt-4 grid gap-3">
            {metrics.pipelineByStage.map((stage) => {
              const label = leadStatuses.find((s) => s.value === stage.status)?.label || stage.status;
              return (
                <div key={stage.status}>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="capitalize text-foreground">{label}</span>
                    <span className="text-muted">
                      {stage.count} · {cad.format(stage.value)}
                    </span>
                  </div>
                  <ProgressBar className="mt-1.5" value={stage.value} max={maxStageValue} />
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5">
          <SectionHeader title="Recent activity" action={<Badge tone="neutral">{metrics.recentActivity.length}</Badge>} />
          <div className="mt-4">
            <ActivityFeed items={metrics.recentActivity} />
          </div>
        </Card>
      </div>
    </div>
  );
}

function MiniStat({
  icon,
  tone,
  label,
  onClick,
  children,
}: {
  icon: ComponentProps<typeof IconChip>["icon"];
  tone: ComponentProps<typeof IconChip>["tone"];
  label: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <Card interactive className="cursor-pointer p-4" onClick={onClick}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-black uppercase tracking-[.16em] text-muted">{label}</p>
        <IconChip icon={icon} tone={tone} size="sm" />
      </div>
      <div className="mt-3">{children}</div>
    </Card>
  );
}

function OverviewSkeleton() {
  return (
    <div className="grid gap-5">
      <Skeleton className="h-20" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    </div>
  );
}
