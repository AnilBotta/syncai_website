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
          ? "shadow-[0_0_40px_rgba(148,0,211,0.2)] ring-1 ring-brand-soft/20"
          : "hover:border-brand-soft/30",
        className
      )}
    >
      {children}
    </div>
  );
}
