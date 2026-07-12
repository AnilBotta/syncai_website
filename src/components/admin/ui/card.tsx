import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** Adds hover elevation + a subtle lift. Use for clickable/selectable cards. */
  interactive?: boolean;
};

/** The base admin surface: white, soft-rounded, layered shadow. */
export function Card({ interactive = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card-lg)] border border-sidebar-border bg-white shadow-card",
        interactive &&
          "transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-card-hover",
        className,
      )}
      {...props}
    />
  );
}
