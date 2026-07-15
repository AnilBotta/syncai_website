import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BadgeTone } from "@/components/admin/ui/badge";

const tones: Record<BadgeTone, string> = {
  brand: "bg-brand/10 text-brand-glow-text",
  success: "bg-success-soft text-success",
  warn: "bg-warn-soft text-warn",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  neutral: "bg-foreground/[.06] text-muted",
};

type IconChipProps = {
  icon: LucideIcon;
  tone?: BadgeTone;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Renders the brand gradient treatment (used by the AI briefing strip). */
  gradient?: boolean;
};

/** Small tinted icon square — the visual anchor for stats, insights, activity rows. */
export function IconChip({ icon: Icon, tone = "brand", size = "md", className, gradient = false }: IconChipProps) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-xl",
        size === "sm" ? "size-8" : size === "md" ? "size-10" : "size-12",
        gradient
          ? "bg-gradient-to-br from-brand-electric to-brand-soft text-white shadow-[0_6px_18px_var(--accent-glow)]"
          : tones[tone],
        className,
      )}
    >
      <Icon className={size === "sm" ? "size-4" : size === "md" ? "size-4.5" : "size-5"} />
    </span>
  );
}
