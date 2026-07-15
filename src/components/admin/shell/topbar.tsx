"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Bell, CalendarClock, Menu, Receipt, Search, User } from "lucide-react";
import type { Appointment, Invoice, Lead } from "@/lib/supabase";
import { navItems, type View } from "@/components/admin/shell/nav-config";
import { Badge, type BadgeTone } from "@/components/admin/ui/badge";

const cad = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });

type TopbarProps = {
  title: string;
  onOpenMobileNav: () => void;
  onNavigate: (view: View) => void;
  approvalsCount: number;
  /** All leads, so the search can find them. */
  leads: Lead[];
  /** Open a lead (drawer) when picked from search. */
  onSelectLead: (lead: Lead) => void;
  appointments?: Appointment[];
  invoices?: Invoice[];
  /** Contextual actions (Refresh / CSV) rendered on the right. */
  actions?: ReactNode;
};

const statusTone: Record<string, BadgeTone> = {
  new: "info",
  contacted: "brand",
  qualified: "success",
  proposal: "warn",
  won: "success",
  lost: "danger",
};

const apptTone: Record<string, BadgeTone> = {
  pending: "warn",
  confirmed: "success",
  completed: "neutral",
  cancelled: "danger",
  no_show: "danger",
};

const invoiceTone: Record<string, BadgeTone> = {
  draft: "neutral",
  approved: "brand",
  sent: "warn",
  paid: "success",
  void: "danger",
};

/** Sticky top bar: mobile hamburger, section title, global search (leads + pages), bell. */
export function Topbar({
  title,
  onOpenMobileNav,
  onNavigate,
  approvalsCount,
  leads,
  onSelectLead,
  appointments = [],
  invoices = [],
  actions,
}: TopbarProps) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const term = q.trim().toLowerCase();

  const leadResults = useMemo(() => {
    if (!term) return [];
    return leads
      .filter((l) =>
        [l.name, l.company, l.email, l.industry, l.pain_point]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term),
      )
      .slice(0, 5);
  }, [term, leads]);

  const apptResults = useMemo(() => {
    if (!term) return [];
    return appointments
      .filter((a) => [a.name, a.company, a.email, a.service].filter(Boolean).join(" ").toLowerCase().includes(term))
      .slice(0, 4);
  }, [term, appointments]);

  const invoiceResults = useMemo(() => {
    if (!term) return [];
    return invoices
      .filter((i) => [i.number, i.notes, String(i.amount)].filter(Boolean).join(" ").toLowerCase().includes(term))
      .slice(0, 4);
  }, [term, invoices]);

  const pageResults = useMemo(() => {
    if (!term) return [];
    return navItems.filter((i) => i.label.toLowerCase().includes(term)).slice(0, 3);
  }, [term]);

  const hasResults = leadResults.length > 0 || apptResults.length > 0 || invoiceResults.length > 0 || pageResults.length > 0;

  function pickLead(lead: Lead) {
    onSelectLead(lead);
    setQ("");
    setOpen(false);
  }
  function pickPage(view: View) {
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
          className="grid size-9 shrink-0 place-items-center rounded-xl border border-sidebar-border bg-card text-muted lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="size-4.5" />
        </button>

        <h1 className="shrink-0 text-lg font-black text-foreground sm:text-xl">{title}</h1>

        {/* Global search — leads + pages */}
        <div className="relative ml-auto hidden w-full max-w-sm sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => window.setTimeout(() => setOpen(false), 150)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (leadResults[0]) pickLead(leadResults[0]);
                else if (apptResults[0]) pickPage("appointments");
                else if (invoiceResults[0]) pickPage("finance");
                else if (pageResults[0]) pickPage(pageResults[0].view);
              }
              if (e.key === "Escape") setOpen(false);
            }}
            placeholder="Search leads, pages…"
            aria-label="Search leads and pages"
            className="h-10 w-full rounded-full border border-sidebar-border bg-input-bg pl-10 pr-4 text-sm text-foreground outline-none backdrop-blur-md focus:border-brand-soft focus:ring-4 focus:ring-brand/20"
          />
          {open && term ? (
            <div className="absolute left-0 right-0 top-12 z-40 max-h-96 overflow-y-auto rounded-2xl border border-sidebar-border bg-card-elevated p-1.5 shadow-pop backdrop-blur-2xl">
              {!hasResults ? (
                <p className="px-3 py-3 text-sm text-muted">No matches for “{q}”.</p>
              ) : null}

              {leadResults.length ? (
                <>
                  <p className="px-3 pb-1 pt-2 text-[10px] font-black uppercase tracking-[.16em] text-muted/70">Leads</p>
                  {leadResults.map((lead) => (
                    <button
                      key={lead.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => pickLead(lead)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-[var(--nav-hover-bg)]"
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand-glow-text">
                        <User className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-foreground">{lead.name}</span>
                        <span className="block truncate text-xs text-muted">{lead.company || lead.email}</span>
                      </span>
                      <Badge tone={statusTone[lead.status] || "neutral"}>{lead.status}</Badge>
                    </button>
                  ))}
                </>
              ) : null}

              {apptResults.length ? (
                <>
                  <p className="px-3 pb-1 pt-2 text-[10px] font-black uppercase tracking-[.16em] text-muted/70">Appointments</p>
                  {apptResults.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => pickPage("appointments")}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-[var(--nav-hover-bg)]"
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-info-soft text-info">
                        <CalendarClock className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-foreground">{a.name}</span>
                        <span className="block truncate text-xs text-muted">
                          {new Date(a.starts_at).toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short" })}
                        </span>
                      </span>
                      <Badge tone={apptTone[a.status] || "neutral"}>{a.status.replace("_", " ")}</Badge>
                    </button>
                  ))}
                </>
              ) : null}

              {invoiceResults.length ? (
                <>
                  <p className="px-3 pb-1 pt-2 text-[10px] font-black uppercase tracking-[.16em] text-muted/70">Invoices</p>
                  {invoiceResults.map((inv) => (
                    <button
                      key={inv.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => pickPage("finance")}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-[var(--nav-hover-bg)]"
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand-glow-text">
                        <Receipt className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-foreground">{inv.number}</span>
                        <span className="block truncate text-xs text-muted">{cad.format(Number(inv.amount) || 0)}</span>
                      </span>
                      <Badge tone={invoiceTone[inv.status] || "neutral"}>{inv.status}</Badge>
                    </button>
                  ))}
                </>
              ) : null}

              {pageResults.length ? (
                <>
                  <p className="px-3 pb-1 pt-2 text-[10px] font-black uppercase tracking-[.16em] text-muted/70">Pages</p>
                  {pageResults.map((r) => {
                    const Icon = r.icon;
                    return (
                      <button
                        key={r.view}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => pickPage(r.view)}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-bold text-foreground hover:bg-[var(--nav-hover-bg)]"
                      >
                        <Icon className="size-4 text-brand-glow-text" />
                        {r.label}
                      </button>
                    );
                  })}
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="ml-auto flex items-center gap-2 sm:ml-0">
          {actions}
          <button
            type="button"
            onClick={() => onNavigate("approvals")}
            className="relative grid size-9 place-items-center rounded-xl border border-sidebar-border bg-card text-muted transition hover:text-foreground"
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
