"use client";

import { m } from "framer-motion";
import { Moon, Sun } from "lucide-react";

type ThemeToggleProps = {
  theme: "dark" | "light";
  onToggle: () => void;
};

/**
 * Luminary pill sun/moon toggle (ported from the syncai-office dashboard).
 * Pure presentation — the admin dashboard owns the theme state + persistence.
 */
export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={onToggle}
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      className="relative flex h-7 w-14 items-center rounded-full border border-sidebar-border px-1 transition-colors"
      style={{ backgroundColor: "var(--nav-hover-bg)" }}
    >
      {/* Faded end icons on the track */}
      <Sun className="absolute left-1.5 size-3 text-muted/60" />
      <Moon className="absolute right-1.5 size-3 text-muted/60" />
      {/* Sliding knob */}
      <m.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        className="relative z-10 grid size-5 place-items-center rounded-full bg-brand text-white shadow-sm"
        style={{ marginLeft: isDark ? "auto" : 0 }}
      >
        {isDark ? <Moon className="size-3" /> : <Sun className="size-3" />}
      </m.span>
    </button>
  );
}
