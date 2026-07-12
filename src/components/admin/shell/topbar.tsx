"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { Bell, Menu, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems, type View } from "@/components/admin/shell/nav-config";

type TopbarProps = {
  title: string;
  onOpenMobileNav: () => void;
  onNavigate: (view: View) => void;
  approvalsCount: number;
  /** Contextual actions (Refresh / CSV) rendered on the right. */
  actions?: ReactNode;
};

/** Sticky top bar: mobile hamburger, section title, nav quick-jump, bell. */
export function Topbar({ title, onOpenMobileNav, onNavigate, approvalsCount, actions }: TopbarProps) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return navItems.filter((i) => i.label.toLowerCase().includes(term)).slice(0, 6);
  }, [q]);

  function go(view: View) {
    onNavigate(view);
    setQ("");
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-sidebar-border bg-admin-canvas/85 backdrop-blur-md">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="grid size-9 shrink-0 place-items-center rounded-xl border border-sidebar-border bg-white text-muted lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="size-4.5" />
        </button>

        <h1 className="shrink-0 text-lg font-black text-foreground sm:text-xl">{title}</h1>

        {/* Quick-jump search (navigates between views) */}
        <div ref={boxRef} className="relative ml-auto hidden w-full max-w-xs sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => window.setTimeout(() => setOpen(false), 120)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && results[0]) go(results[0].view);
              if (e.key === "Escape") setOpen(false);
            }}
            placeholder="Jump to…"
            aria-label="Jump to a section"
            className="h-10 w-full rounded-full border border-sidebar-border bg-white pl-10 pr-4 text-sm outline-none focus:border-brand-soft focus:ring-4 focus:ring-brand/20"
          />
          {open && results.length ? (
            <div className="absolute left-0 right-0 top-12 z-40 overflow-hidden rounded-2xl border border-sidebar-border bg-white p-1.5 shadow-pop">
              {results.map((r) => {
                const Icon = r.icon;
                return (
                  <button
                    key={r.view}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => go(r.view)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-bold text-foreground hover:bg-[var(--nav-hover-bg)]"
                  >
                    <Icon className="size-4 text-brand-glow-text" />
                    {r.label}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className={cn("flex items-center gap-2", "ml-auto sm:ml-0")}>
          {actions}
          <button
            type="button"
            onClick={() => onNavigate("approvals")}
            className="relative grid size-9 place-items-center rounded-xl border border-sidebar-border bg-white text-muted transition hover:text-foreground"
            aria-label={`Notifications${approvalsCount > 0 ? `, ${approvalsCount} pending approvals` : ""}`}
          >
            <Bell className="size-4.5" />
            {approvalsCount > 0 ? (
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-danger ring-2 ring-white" />
            ) : null}
          </button>
        </div>
      </div>
    </header>
  );
}
