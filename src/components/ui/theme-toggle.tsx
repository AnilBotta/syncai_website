"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Theme } from "@/lib/use-theme";

type ThemeToggleProps = {
  theme: Theme;
  onToggle: () => void;
  className?: string;
};

/**
 * Luminary pill sun/moon toggle, shared by the marketing header and the admin
 * sidebar. Presentation only — callers own the state via useTheme().
 *
 * The knob slides with a CSS transform rather than a framer layout animation so
 * this can render on public pages without pulling in a motion provider.
 */
export function ThemeToggle({ theme, onToggle, className }: ThemeToggleProps) {
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={onToggle}
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      title={`Switch to ${isDark ? "light" : "dark"} theme`}
      className={cn(
        "relative inline-flex h-7 w-14 shrink-0 items-center rounded-full border border-border-subtle transition-colors",
        className,
      )}
      style={{ backgroundColor: "var(--nav-hover-bg)" }}
    >
      {/* Faded end icons on the track */}
      <Sun className="pointer-events-none absolute left-1.5 size-3 text-muted/60" />
      <Moon className="pointer-events-none absolute right-1.5 size-3 text-muted/60" />
      {/* Sliding knob */}
      <span
        className={cn(
          "pointer-events-none relative z-10 grid size-5 place-items-center rounded-full bg-brand text-white shadow-sm transition-transform duration-300",
          isDark ? "translate-x-[2.0625rem]" : "translate-x-1",
        )}
      >
        {isDark ? <Moon className="size-3" /> : <Sun className="size-3" />}
      </span>
    </button>
  );
}
