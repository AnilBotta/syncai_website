"use client";

import { useCallback, useEffect, useState } from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "syncai-theme";

/**
 * Shared Luminary theme state for the whole product (marketing site + admin).
 *
 * The source of truth is the `data-theme` attribute on <html>, which the inline
 * script in layout.tsx sets before first paint. This hook reads it back after
 * mount and writes changes to both the attribute and localStorage, so the
 * marketing header toggle and the admin sidebar toggle stay in sync.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    // Defer: reading the DOM/localStorage synchronously in an effect trips the
    // project's react-hooks/set-state-in-effect rule.
    const timer = window.setTimeout(() => {
      const current = document.documentElement.getAttribute("data-theme");
      setThemeState(current === "light" ? "light" : "dark");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    const root = document.documentElement;
    // Ease every colour across the flip, then drop the class so it doesn't
    // slow down ordinary interactions.
    root.classList.add("theme-transitioning");
    root.setAttribute("data-theme", next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private mode / storage disabled — the theme still applies for this visit.
    }
    setThemeState(next);
    window.setTimeout(() => root.classList.remove("theme-transitioning"), 450);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light");
  }, [setTheme]);

  return { theme, setTheme, toggleTheme };
}
