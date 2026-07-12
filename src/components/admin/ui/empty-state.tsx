import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  hint?: string;
  action?: ReactNode;
  className?: string;
};

/** Intelligent empty state — replaces dashed "No X" boxes. */
export function EmptyState({ icon: Icon, title, hint, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[var(--radius-card-lg)] border border-dashed border-sidebar-border px-6 py-10 text-center",
        className,
      )}
    >
      {Icon ? (
        <span className="mb-3 grid size-11 place-items-center rounded-2xl bg-brand/10 text-brand-glow-text">
          <Icon className="size-5" />
        </span>
      ) : null}
      <p className="text-sm font-bold text-foreground">{title}</p>
      {hint ? <p className="mt-1 max-w-xs text-xs leading-5 text-muted">{hint}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
