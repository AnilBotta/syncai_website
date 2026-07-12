import { cn } from "@/lib/utils";
import type { BadgeTone } from "@/components/admin/ui/badge";

const fills: Record<BadgeTone, string> = {
  brand: "bg-brand-deep/80",
  success: "bg-success",
  warn: "bg-warn",
  danger: "bg-danger",
  info: "bg-info",
  neutral: "bg-muted",
};

type ProgressBarProps = {
  value: number;
  max?: number;
  tone?: BadgeTone;
  className?: string;
};

/** Thin progress track — pipeline stages, finance snapshot bars. */
export function ProgressBar({ value, max = 100, tone = "brand", className }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.max(2, Math.round((value / max) * 100))) : 2;
  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-foreground/[.06]", className)}>
      <div className={cn("h-full rounded-full transition-[width] duration-500", fills[tone])} style={{ width: `${pct}%` }} />
    </div>
  );
}
