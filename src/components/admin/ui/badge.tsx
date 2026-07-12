import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "brand" | "success" | "warn" | "danger" | "info" | "neutral";

const tones: Record<BadgeTone, string> = {
  brand: "bg-brand/10 text-brand-glow-text",
  success: "bg-success-soft text-success",
  warn: "bg-warn-soft text-warn",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  neutral: "bg-foreground/[.06] text-muted",
};

type BadgeProps = {
  tone?: BadgeTone;
  size?: "sm" | "md";
  className?: string;
  children: ReactNode;
};

/** Status pill — replaces the ad-hoc amber/emerald/red chips across the admin. */
export function Badge({ tone = "neutral", size = "sm", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-bold capitalize",
        size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
