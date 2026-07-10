import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

type KpiCardProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  delta?: { value: number; label: string } | null;
  tone?: "default" | "warn";
};

export function KpiCard({ label, value, icon: Icon, delta, tone = "default" }: KpiCardProps) {
  const positive = delta ? delta.value >= 0 : null;

  return (
    <div className="rounded-[2rem] border border-border-subtle bg-bg-elevated p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-xs font-black uppercase tracking-[.18em] text-muted">{label}</p>
        <span
          className={`grid size-9 shrink-0 place-items-center rounded-full ${
            tone === "warn" ? "bg-amber-400/15 text-amber-600" : "bg-brand-deep/10 text-brand-glow-text"
          }`}
        >
          <Icon className="size-4.5" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-black text-foreground">{value}</p>
      {delta ? (
        <p
          className={`mt-1.5 inline-flex items-center gap-1 text-xs font-bold ${
            positive ? "text-emerald-600" : "text-red-500"
          }`}
        >
          {positive ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
          {Math.abs(delta.value)} {delta.label}
        </p>
      ) : null}
    </div>
  );
}
