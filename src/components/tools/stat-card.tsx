import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  value: string;
  label: string;
  sublabel?: string;
  negative?: boolean;
};

/** Big-number result card for tool outputs. */
export function StatCard({ value, label, sublabel, negative = false }: StatCardProps) {
  return (
    <GlassCard className="px-4 py-6 text-center" glow={!negative}>
      <p
        className={cn(
          "text-3xl font-black sm:text-4xl",
          negative ? "text-red-300" : "text-brand-glow-text"
        )}
      >
        {value}
      </p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
      {sublabel ? <p className="mt-1 text-xs text-muted">{sublabel}</p> : null}
    </GlassCard>
  );
}
