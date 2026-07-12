import type { LucideIcon } from "lucide-react";
import { StatCard } from "@/components/admin/ui/stat-card";

type KpiCardProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  delta?: { value: number; label: string } | null;
  tone?: "default" | "warn";
};

/**
 * Back-compat shim over the new StatCard, so files that still import KpiCard
 * (e.g. finance.tsx) keep working during the phased redesign. Removed in the
 * final polish PR once all callers migrate to StatCard directly.
 */
export function KpiCard({ label, value, icon, delta, tone = "default" }: KpiCardProps) {
  return <StatCard label={label} value={value} icon={icon} delta={delta} tone={tone === "warn" ? "warn" : "brand"} />;
}
