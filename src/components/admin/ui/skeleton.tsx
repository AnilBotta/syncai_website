import { cn } from "@/lib/utils";

/** Pulse placeholder — used instead of centered spinners so layout doesn't jump. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-foreground/[.06]", className)} />;
}
