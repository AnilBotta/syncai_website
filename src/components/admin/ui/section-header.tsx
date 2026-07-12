import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  title: string;
  /** Tiny uppercase eyebrow above the title. */
  eyebrow?: string;
  /** Muted helper text to the right of / under the title. */
  hint?: string;
  /** Right-aligned slot (toggles, links, buttons). */
  action?: ReactNode;
  className?: string;
};

/** Consistent card/section heading row. */
export function SectionHeader({ title, eyebrow, hint, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[11px] font-black uppercase tracking-[.18em] text-muted">{eyebrow}</p>
        ) : null}
        <h2 className="text-[15px] font-black text-foreground">{title}</h2>
        {hint ? <p className="mt-0.5 text-xs text-muted">{hint}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
