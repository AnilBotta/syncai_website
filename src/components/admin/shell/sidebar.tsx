"use client";

import { useEffect } from "react";
import { m } from "framer-motion";
import { LifeBuoy, LogOut, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { navGroups, type View } from "@/components/admin/shell/nav-config";
import { BrandLogo } from "@/components/admin/shell/brand-logo";
import { ThemeToggle } from "@/components/admin/shell/theme-toggle";

type SidebarProps = {
  view: View;
  onNavigate: (view: View) => void;
  approvalsCount: number;
  onSignOut: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
};

export function Sidebar({
  view,
  onNavigate,
  approvalsCount,
  onSignOut,
  mobileOpen,
  onMobileClose,
  theme,
  onToggleTheme,
}: SidebarProps) {
  // Close the mobile drawer on Escape.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onMobileClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, onMobileClose]);

  const nav = (
    <div className="flex h-full flex-col bg-sidebar-bg backdrop-blur-xl">
      {/* Brand — SyncAI wordmark, theme-matched variant */}
      <div className="flex items-center justify-between px-5 pb-5 pt-6">
        <BrandLogo theme={theme} width={132} />
        <button
          type="button"
          onClick={onMobileClose}
          className="grid size-8 place-items-center rounded-lg text-muted hover:bg-[var(--nav-hover-bg)] lg:hidden"
          aria-label="Close navigation"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Grouped nav */}
      <nav aria-label="Admin" className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 pb-1.5 text-[10px] font-black uppercase tracking-[.18em] text-muted/70">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = view === item.view;
                const Icon = item.icon;
                return (
                  <button
                    key={item.view}
                    type="button"
                    onClick={() => onNavigate(item.view)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
                      active
                        ? "bg-[var(--nav-active-bg)] text-[var(--nav-active-fg)]"
                        : "text-muted hover:bg-[var(--nav-hover-bg)] hover:text-foreground",
                    )}
                  >
                    {/* Icon plate (Luminary) */}
                    <span
                      className={cn(
                        "grid size-7 shrink-0 place-items-center rounded-md transition-colors",
                        active
                          ? "bg-brand-soft/20 text-[var(--nav-active-fg)]"
                          : "bg-[var(--nav-hover-bg)] text-muted group-hover:text-foreground",
                      )}
                    >
                      <Icon className="size-4" strokeWidth={active ? 2.4 : 2} />
                    </span>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.view === "approvals" && approvalsCount > 0 ? (
                      <span
                        className={cn(
                          "grid min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-black",
                          active ? "bg-brand-soft/25 text-[var(--nav-active-fg)]" : "bg-brand-deep text-white",
                        )}
                      >
                        {approvalsCount}
                      </span>
                    ) : null}
                    {/* Right-edge glowing active indicator (Luminary) */}
                    {active ? (
                      <m.span
                        layoutId="admin-nav-indicator"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        className="pointer-events-none absolute right-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-l-full bg-brand-soft shadow-[0_0_12px_var(--brand-soft)]"
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer: AI Manager CTA + theme + support + sign out */}
      <div className="space-y-2 border-t border-sidebar-border px-3 py-4">
        <button
          type="button"
          onClick={() => onNavigate("manager")}
          className="flex w-full items-center gap-3 rounded-xl bg-gradient-to-br from-brand-electric to-brand-deep px-3 py-2.5 text-left text-white shadow-[0_10px_24px_var(--accent-glow)] transition hover:brightness-110"
        >
          <Sparkles className="size-4.5 shrink-0" />
          <span className="flex-1">
            <span className="block text-sm font-black leading-tight">Ask the AI Manager</span>
            <span className="block text-[11px] text-white/80">Run the business by chat</span>
          </span>
        </button>
        <div className="flex items-center justify-between rounded-xl px-3 py-2">
          <span className="text-[11px] font-bold text-muted">Theme</span>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
        <a
          href="mailto:support@syncai.tech"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-muted transition hover:bg-[var(--nav-hover-bg)] hover:text-foreground"
        >
          <LifeBuoy className="size-4.5 shrink-0" />
          Support
        </a>
        <button
          type="button"
          onClick={onSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-muted transition hover:bg-[var(--nav-hover-bg)] hover:text-foreground"
        >
          <LogOut className="size-4.5 shrink-0" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop rail */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-sidebar-border lg:block">
        {nav}
      </aside>

      {/* Mobile slide-over */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onMobileClose}
            className="absolute inset-0 bg-overlay backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 left-0 w-72 border-r border-sidebar-border shadow-pop">{nav}</div>
        </div>
      ) : null}
    </>
  );
}
