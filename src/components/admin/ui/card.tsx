import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** Adds hover elevation + a subtle lift. Use for clickable/selectable cards. */
  interactive?: boolean;
};

/** The base admin surface: Luminary glass — translucent, blurred, soft-rounded. */
export function Card({ interactive = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card-lg)] border border-sidebar-border bg-card shadow-card backdrop-blur-xl",
        interactive &&
          "transition-[box-shadow,transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-card-elevated hover:shadow-card-hover",
        className,
      )}
      {...props}
    />
  );
}
