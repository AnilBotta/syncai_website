"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/admin/ui/card";
import { IconChip } from "@/components/admin/ui/icon-chip";
import type { BadgeTone } from "@/components/admin/ui/badge";

type Tone = "brand" | "warn" | "danger" | "success" | "info";

const toneToChip: Record<Tone, BadgeTone> = {
  brand: "brand",
  warn: "warn",
  danger: "danger",
  success: "success",
  info: "info",
};

type StatCardProps = {
  label: string;
  /** Display string (e.g. "$124,500", "12"). Shown as-is unless numericValue is given. */
  value: string;
  icon: LucideIcon;
  tone?: Tone;
  delta?: { value: number; label: string } | null;
  /** Small caption under the value. */
  sub?: string;
  /**
   * If provided, the numeric portion counts up on mount. `value` should be the
   * formatted target; `format` re-formats the animated number back to the value's shape.
   */
  numericValue?: number;
  format?: (n: number) => string;
};

/** Premium KPI tile: icon chip, count-up value, delta pill. Successor to KpiCard. */
export function StatCard({ label, value, icon, tone = "brand", delta, sub, numericValue, format }: StatCardProps) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(numericValue != null && !reduce ? (format ? format(0) : "0") : value);
  const started = useRef(false);

  useEffect(() => {
    if (numericValue == null || reduce || started.current) {
      setDisplay(value);
      return;
    }
    started.current = true;
    const controls = animate(0, numericValue, {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(format ? format(v) : String(Math.round(v))),
      onComplete: () => setDisplay(value),
    });
    return () => controls.stop();
  }, [numericValue, value, format, reduce]);

  const positive = delta ? delta.value >= 0 : null;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-black uppercase tracking-[.16em] text-muted">{label}</p>
        <IconChip icon={icon} tone={toneToChip[tone]} size="sm" />
      </div>
      <p className="mt-3 text-[28px] font-black leading-none text-foreground tabular-nums">{display}</p>
      <div className="mt-2 flex items-center gap-2">
        {delta ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-black",
              positive ? "bg-success-soft text-success" : "bg-danger-soft text-danger",
            )}
          >
            {positive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
            {Math.abs(delta.value)}
          </span>
        ) : null}
        {delta ? <span className="text-[11px] text-muted">{delta.label}</span> : null}
        {sub && !delta ? <span className="text-[11px] text-muted">{sub}</span> : null}
      </div>
    </Card>
  );
}
