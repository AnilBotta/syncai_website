import { AlertTriangle, CheckCircle2, Inbox, Sparkles, TrendingUp, Wallet, type LucideIcon } from "lucide-react";
import type { BadgeTone } from "@/components/admin/ui/badge";
import type { View } from "@/components/admin/shell/nav-config";

export type Insight = {
  id: string;
  tone: BadgeTone;
  icon: LucideIcon;
  title: string;
  body: string;
  target: View;
};

const cad = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });

type MetricsLike = {
  pendingApprovals: number;
  overdueTasks: number;
  newLeadsThisWeek: number;
  newLeadsLastWeek: number;
  outstanding: number;
  upcomingAppointments: number;
  pipelineValue: number;
};

/**
 * Turns the raw metrics into ranked, actionable insights — no backend needed.
 * The first insight fronts the AI briefing strip; the rest fill the AI
 * Recommendations panel. Ordered by urgency.
 */
export function deriveInsights(m: MetricsLike): Insight[] {
  const out: Insight[] = [];

  if (m.pendingApprovals > 0) {
    out.push({
      id: "approvals",
      tone: "warn",
      icon: Inbox,
      title: `${m.pendingApprovals} item${m.pendingApprovals > 1 ? "s" : ""} awaiting approval`,
      body: "Review and release the drafts your agents prepared.",
      target: "approvals",
    });
  }
  if (m.overdueTasks > 0) {
    out.push({
      id: "overdue",
      tone: "danger",
      icon: AlertTriangle,
      title: `${m.overdueTasks} task${m.overdueTasks > 1 ? "s" : ""} overdue`,
      body: "Clear these to keep deals from going cold.",
      target: "tasks",
    });
  }

  const delta = m.newLeadsThisWeek - m.newLeadsLastWeek;
  if (delta !== 0) {
    out.push({
      id: "leadflow",
      tone: delta > 0 ? "success" : "neutral",
      icon: TrendingUp,
      title: delta > 0 ? `Lead flow up ${delta} vs last week` : `Lead flow down ${Math.abs(delta)} vs last week`,
      body: delta > 0 ? "Momentum is building — keep the sequences running." : "Consider scraping a new target or launching outreach.",
      target: delta > 0 ? "pipeline" : "targeting",
    });
  }
  if (m.outstanding > 0) {
    out.push({
      id: "outstanding",
      tone: "info",
      icon: Wallet,
      title: `${cad.format(m.outstanding)} outstanding`,
      body: "Follow up on unpaid invoices to tighten cash flow.",
      target: "finance",
    });
  }
  if (m.upcomingAppointments > 0) {
    out.push({
      id: "appts",
      tone: "brand",
      icon: CheckCircle2,
      title: `${m.upcomingAppointments} appointment${m.upcomingAppointments > 1 ? "s" : ""} this week`,
      body: "Prep your discovery calls and confirm attendees.",
      target: "appointments",
    });
  }

  if (!out.length) {
    out.push({
      id: "clear",
      tone: "success",
      icon: CheckCircle2,
      title: "All systems clear",
      body: `${cad.format(m.pipelineValue)} in open pipeline. Nothing needs your attention right now.`,
      target: "pipeline",
    });
  }

  // Always give the recommendations panel something forward-looking.
  out.push({
    id: "playbook",
    tone: "brand",
    icon: Sparkles,
    title: "Ask the AI Manager to find new leads",
    body: "Tell it a niche and location — it will scrape prospects and draft outreach.",
    target: "manager",
  });

  return out;
}
