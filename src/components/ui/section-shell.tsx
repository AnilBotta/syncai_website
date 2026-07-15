import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionShellProps = {
  children: ReactNode;
  /** Background tier: base (default page bg), elevated (cards region), deep (heroes/footers). */
  tier?: "base" | "elevated" | "deep";
  /** Radial brand glow position, or none. */
  glow?: "left" | "right" | "center" | "none";
  /** Faint dot-grid texture overlay. */
  dotGrid?: boolean;
  id?: string;
  className?: string;
};

const tiers = {
  base: "bg-bg-base",
  elevated: "bg-bg-elevated",
  deep: "bg-bg-deep",
};

// Brand glow follows the active theme via --accent-glow.
const glows = {
  left: "bg-[radial-gradient(circle_at_15%_20%,var(--accent-glow),transparent_45%)]",
  right: "bg-[radial-gradient(circle_at_85%_30%,var(--accent-glow),transparent_45%)]",
  center: "bg-[radial-gradient(circle_at_50%_35%,var(--accent-glow),transparent_55%)]",
  none: "",
};

/** Standard dark section wrapper: bg tier + ambient glow + optional dot grid. */
export function SectionShell({
  children,
  tier = "base",
  glow = "none",
  dotGrid = false,
  id,
  className,
}: SectionShellProps) {
  return (
    <section id={id} className={cn("relative overflow-hidden py-20 text-foreground sm:py-28", tiers[tier], className)}>
      {glow !== "none" ? <div aria-hidden className={cn("pointer-events-none absolute inset-0", glows[glow])} /> : null}
      {dotGrid ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background-image:radial-gradient(rgba(0,0,0,0.04)_1px,transparent_1px)] [background-size:32px_32px]"
        />
      ) : null}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}
