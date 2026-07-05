import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  /** Adds a persistent brand glow ring + shadow. */
  glow?: boolean;
  /** Stronger surface for content that needs more separation. */
  strong?: boolean;
};

/** Dark glass surface — the base card of the immersive theme. */
export function GlassCard({ children, className, glow = false, strong = false }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-[16px] border border-border-subtle backdrop-blur-md transition-colors duration-300",
        strong ? "bg-surface-strong" : "bg-surface",
        glow
          ? "shadow-[0_2px_10px_rgba(0,0,0,0.05),0_16px_36px_rgba(0,0,0,0.06)] ring-1 ring-brand/15 [.theme-dark_&]:shadow-[0_0_40px_rgba(148,0,211,0.2)] [.theme-dark_&]:ring-brand-soft/20"
          : "shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_20px_rgba(0,0,0,0.04)] hover:border-brand-soft/40 [.theme-dark_&]:shadow-none",
        className
      )}
    >
      {children}
    </div>
  );
}
