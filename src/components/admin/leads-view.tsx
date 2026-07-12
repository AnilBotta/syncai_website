"use client";

import { Loader2, Search } from "lucide-react";
import type { Lead } from "@/lib/supabase";
import { leadStatuses } from "@/lib/site-data";
import { formatDate } from "@/lib/utils";
import { Card } from "@/components/admin/ui/card";
import { Badge, type BadgeTone } from "@/components/admin/ui/badge";
import { DemoBanner, ErrorBanner } from "@/components/admin/ui/banners";
import { EmptyState } from "@/components/admin/ui/empty-state";

const statusTone: Record<string, BadgeTone> = {
  new: "info",
  contacted: "brand",
  qualified: "success",
  proposal: "warn",
  won: "success",
  lost: "danger",
};

type LeadsViewProps = {
  filtered: Lead[];
  selected: Lead | null;
  onSelect: (lead: Lead) => void;
  query: string;
  onQueryChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  saveLead: (formData: FormData) => void;
  saving: boolean;
  loading: boolean;
  error: string;
  demoMode: boolean;
  onOpenDrawer: (lead: Lead) => void;
};

/**
 * The two-pane Leads view. Extracted from admin-dashboard.tsx as a controlled,
 * prop-driven component — all state + saveLead stay in the parent, and the parent
 * keeps this mounted always (toggled by a `hidden` class) so form/selection state
 * survives view switches.
 */
export function LeadsView({
  filtered,
  selected,
  onSelect,
  query,
  onQueryChange,
  status,
  onStatusChange,
  saveLead,
  saving,
  loading,
  error,
  demoMode,
  onOpenDrawer,
}: LeadsViewProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[.95fr_1.05fr]">
      <Card className="p-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <label className="relative">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              className="h-11 w-full rounded-full border border-sidebar-border pl-11 pr-4 text-sm outline-none focus:border-brand-soft focus:ring-4 focus:ring-brand/20"
              placeholder="Search leads"
            />
          </label>
          <select
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
            className="h-11 rounded-full border border-sidebar-border px-4 text-sm font-semibold outline-none focus:border-brand-soft focus:ring-4 focus:ring-brand/20"
          >
            <option value="all">All statuses</option>
            {leadStatuses.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {demoMode ? <DemoBanner className="mt-4" message="Demo mode is active. Add Supabase service keys to show live leads." /> : null}
        {error ? <ErrorBanner className="mt-4" message={error} /> : null}

        <div className="mt-5 grid gap-2.5">
          {loading ? (
            <div className="flex h-40 items-center justify-center text-muted">
              <Loader2 className="mr-2 size-5 animate-spin" />
              Loading leads
            </div>
          ) : filtered.length ? (
            filtered.map((lead) => {
              const active = selected?.id === lead.id;
              return (
                <button
                  type="button"
                  key={lead.id}
                  onClick={() => onSelect(lead)}
                  className={`rounded-[var(--radius-card)] border p-4 text-left transition ${
                    active
                      ? "border-brand-soft bg-brand/[.06] shadow-card"
                      : "border-sidebar-border hover:border-brand-soft/60 hover:shadow-card"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-black text-foreground">{lead.name}</p>
                      <p className="mt-0.5 truncate text-sm text-muted">{lead.company || lead.industry || lead.email}</p>
                    </div>
                    <Badge tone={statusTone[lead.status] || "neutral"}>{lead.status}</Badge>
                  </div>
                  <p className="mt-2.5 line-clamp-2 text-sm leading-6 text-muted">{lead.pain_point}</p>
                </button>
              );
            })
          ) : (
            <EmptyState icon={Search} title="No leads match this view" hint="Try clearing the search or status filter." />
          )}
        </div>
      </Card>

      <Card className="p-5">
        {selected ? (
          <form action={saveLead}>
            <div className="flex flex-col gap-4 border-b border-sidebar-border pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-black text-foreground">{selected.name}</h2>
                <p className="mt-1 text-sm text-muted">{formatDate(selected.created_at)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenDrawer(selected)}
                  className="inline-flex h-11 items-center rounded-full border border-sidebar-border px-4 text-sm font-bold text-muted transition hover:text-foreground"
                >
                  Full view
                </button>
                <select
                  name="status"
                  defaultValue={selected.status}
                  className="h-11 rounded-full border border-sidebar-border px-4 text-sm font-bold capitalize outline-none focus:border-brand-soft focus:ring-4 focus:ring-brand/20"
                >
                  {leadStatuses.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Info label="Email" value={selected.email} />
              <Info label="Phone" value={selected.phone || "Not provided"} />
              <Info label="Company" value={selected.company || "Not provided"} />
              <Info label="Industry" value={selected.industry || "Not provided"} />
              <Info label="Interest" value={selected.interest || "Not provided"} />
              <Info label="Source" value={selected.source} />
            </div>

            <div className="mt-5 rounded-[var(--radius-card)] bg-brand/[.05] p-5">
              <p className="text-sm font-black text-foreground">Business challenge</p>
              <p className="mt-2 leading-7 text-muted">{selected.pain_point}</p>
            </div>

            {selected.demo_summary ? (
              <div className="mt-4 rounded-[var(--radius-card)] bg-brand-deep/[.08] p-5">
                <p className="text-sm font-black text-foreground">Demo summary</p>
                <p className="mt-2 whitespace-pre-line leading-7 text-muted">{selected.demo_summary}</p>
              </div>
            ) : null}

            <label className="mt-6 grid gap-2 text-sm font-black text-foreground">
              Notes
              <textarea
                name="notes"
                defaultValue={selected.notes || ""}
                rows={7}
                className="resize-none rounded-[var(--radius-card)] border border-sidebar-border p-4 text-sm font-normal leading-7 text-muted outline-none focus:border-brand-soft focus:ring-4 focus:ring-brand/20"
                placeholder="Add follow-up notes, call outcome, or proposal context."
              />
            </label>

            <button
              type="submit"
              disabled={saving}
              className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand-deep px-6 text-sm font-black text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              Save lead
            </button>
          </form>
        ) : (
          <div className="flex min-h-96 items-center justify-center text-sm text-muted">Select a lead to view details.</div>
        )}
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-control)] border border-sidebar-border p-4">
      <p className="text-[11px] font-black uppercase tracking-[.16em] text-muted">{label}</p>
      <p className="mt-1.5 break-words text-sm font-bold text-foreground/90">{value}</p>
    </div>
  );
}
