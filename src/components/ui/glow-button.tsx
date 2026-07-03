import Link from "next/link";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type GlowButtonProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  variant?: "primary" | "ghost";
  size?: "md" | "lg";
  className?: string;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60";

const variants = {
  primary:
    "bg-gradient-to-r from-brand-electric to-brand-soft text-white shadow-[0_0_20px_rgba(160,120,255,0.15)] hover:-translate-y-0.5 hover:shadow-[0_0_36px_rgba(160,120,255,0.45)]",
  ghost:
    "border border-border-subtle bg-surface text-foreground backdrop-blur-md hover:border-brand-soft/40 hover:text-brand-glow-text",
};

const sizes = {
  md: "h-11 px-6",
  lg: "h-[52px] px-8",
};

/** Brand CTA button of the immersive theme. Renders a Link when href is given. */
export function GlowButton({
  children,
  href,
  onClick,
  type = "button",
  disabled,
  variant = "primary",
  size = "md",
  className,
}: GlowButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
