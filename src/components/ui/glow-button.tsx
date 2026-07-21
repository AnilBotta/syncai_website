import Link from "next/link";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type GlowButtonProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  variant?: "primary" | "ghost" | "whatsapp";
  size?: "md" | "lg";
  className?: string;
  /** Render an external link (new tab) instead of a client-side next/link. */
  external?: boolean;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60";

const variants = {
  primary:
    "bg-gradient-to-r from-brand-electric to-brand-soft text-white shadow-[0_6px_20px_var(--accent-glow)] hover:-translate-y-0.5 hover:shadow-[0_8px_26px_var(--accent-glow)]",
  ghost:
    "border border-border-subtle bg-surface text-foreground backdrop-blur-md hover:border-brand-soft/40 hover:text-brand-glow-text",
  whatsapp:
    "bg-[#25D366] text-white shadow-[0_6px_20px_rgba(37,211,102,0.35)] hover:-translate-y-0.5 hover:bg-[#1fb457] hover:shadow-[0_8px_26px_rgba(37,211,102,0.45)]",
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
  external = false,
}: GlowButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], className);

  if (href && external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    );
  }

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
