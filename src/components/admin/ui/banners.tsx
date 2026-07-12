import { Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

/** Amber demo-mode notice, used wherever Supabase keys are missing. */
export function DemoBanner({ message, className }: { message?: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-[var(--radius-control)] border border-warn/20 bg-warn-soft p-3.5 text-sm text-warn",
        className,
      )}
    >
      <Info className="mt-0.5 size-4 shrink-0" />
      <p>{message || "Demo mode is active. Add Supabase service keys to show live data."}</p>
    </div>
  );
}

/** Red inline error strip. */
export function ErrorBanner({ message, className }: { message: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-[var(--radius-control)] border border-danger/20 bg-danger-soft p-3.5 text-sm text-danger",
        className,
      )}
    >
      <TriangleAlert className="mt-0.5 size-4 shrink-0" />
      <p>{message}</p>
    </div>
  );
}
