"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2, LogOut, RefreshCcw, Search } from "lucide-react";
import { leadStatuses, type LeadStatus } from "@/lib/site-data";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Lead } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import { AdminAppointments } from "@/components/admin-appointments";
import { KanbanBoard } from "@/components/admin/kanban-board";
import { LeadDrawer } from "@/components/admin/lead-drawer";
import { TaskList } from "@/components/admin/task-list";
import { ApprovalInbox } from "@/components/admin/approval-inbox";
import { ManagerChat } from "@/components/admin/manager-chat";

const views = [
  { value: "manager", label: "Manager" },
  { value: "pipeline", label: "Pipeline" },
  { value: "leads", label: "Leads" },
  { value: "approvals", label: "Approvals" },
  { value: "appointments", label: "Appointments" },
  { value: "tasks", label: "Tasks" },
] as const;

type View = (typeof views)[number]["value"];

const viewTitles: Record<View, string> = {
  manager: "Manager",
  pipeline: "Pipeline",
  leads: "Lead List",
  approvals: "Approval Inbox",
  appointments: "Appointments",
  tasks: "Tasks",
};

export function AdminDashboard() {
  const router = useRouter();
  const [view, setView] = useState<View>("manager");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [drawerLead, setDrawerLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [error, setError] = useState("");
  const [demoMode, setDemoMode] = useState(false);
  const [approvalsCount, setApprovalsCount] = useState(0);

  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      const text = [lead.name, lead.email, lead.company, lead.industry, lead.pain_point]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesQuery = text.includes(query.toLowerCase());
      const matchesStatus = status === "all" || lead.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [leads, query, status]);

  const getToken = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || "";
  }, []);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = await getToken();
      if (!token) {
        router.push("/admin/login");
        return;
      }

      const response = await fetch("/api/admin/leads", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not load leads.");
      }

      setLeads(result.leads || []);
      setSelected(result.leads?.[0] || null);
      setDemoMode(Boolean(result.demoMode));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load leads.");
    } finally {
      setLoading(false);
    }
  }, [getToken, router]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadLeads();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadLeads]);

  const loadApprovalsCount = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        return;
      }
      const response = await fetch("/api/admin/approvals?status=pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        return;
      }
      const result = await response.json();
      setApprovalsCount((result.approvals || []).length);
    } catch {
      // Non-critical: the badge just won't show a count.
    }
  }, [getToken]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadApprovalsCount();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadApprovalsCount]);

  const moveLead = useCallback(
    async (lead: Lead, nextStatus: LeadStatus) => {
      if (lead.status === nextStatus) {
        return;
      }

      setError("");
      const previous = leads;
      // Optimistic move so the card lands in the column immediately.
      setLeads((current) =>
        current.map((item) => (item.id === lead.id ? { ...item, status: nextStatus } : item)),
      );

      try {
        const token = await getToken();
        const response = await fetch("/api/admin/leads", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id: lead.id, status: nextStatus }),
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Could not move lead.");
        }
      } catch (moveError) {
        setLeads(previous);
        setError(moveError instanceof Error ? moveError.message : "Could not move lead.");
      }
    },
    [leads, getToken],
  );

  function handleDrawerSaved(updated: Lead) {
    setDrawerLead(updated);
    setLeads((current) => current.map((lead) => (lead.id === updated.id ? updated : lead)));
    setSelected((current) => (current?.id === updated.id ? updated : current));
  }

  async function saveLead(formData: FormData) {
    if (!selected) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const token = await getToken();
      const nextStatus = String(formData.get("status") || selected.status);
      const notes = String(formData.get("notes") || "");

      const response = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: selected.id, status: nextStatus, notes }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not save lead.");
      }

      const updated = { ...selected, status: nextStatus as Lead["status"], notes };
      setSelected(updated);
      setLeads((current) => current.map((lead) => (lead.id === selected.id ? updated : lead)));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save lead.");
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  function exportCsv() {
    const headers = ["created_at", "name", "email", "phone", "company", "industry", "interest", "source", "status", "value", "score", "pain_point", "notes"];
    const rows = filtered.map((lead) =>
      headers.map((header) => JSON.stringify(String(lead[header as keyof Lead] ?? ""))).join(","),
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "syncai-leads.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-bg-base">
      <header className="border-b border-border-subtle bg-bg-elevated">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[.22em] text-brand-glow-text">SyncAi Admin</p>
            <h1 className="mt-1 text-3xl font-black text-foreground">{viewTitles[view]}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex rounded-full border border-border-subtle bg-bg-elevated p-1">
              {views.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setView(tab.value)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition ${
                    view === tab.value ? "bg-brand-deep text-white" : "text-muted"
                  }`}
                >
                  {tab.label}
                  {tab.value === "approvals" && approvalsCount > 0 ? (
                    <span
                      className={`grid min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-black ${
                        view === tab.value ? "bg-white text-brand-deep" : "bg-brand-deep text-white"
                      }`}
                    >
                      {approvalsCount}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
            {view === "pipeline" || view === "leads" ? (
              <button onClick={loadLeads} className="inline-flex h-11 items-center gap-2 rounded-full border border-border-subtle bg-bg-elevated px-4 text-sm font-bold text-muted">
                <RefreshCcw className="size-4" />
                Refresh
              </button>
            ) : null}
            {view === "leads" ? (
              <button onClick={exportCsv} className="inline-flex h-11 items-center gap-2 rounded-full border border-border-subtle bg-bg-elevated px-4 text-sm font-bold text-muted">
                <Download className="size-4" />
                CSV
              </button>
            ) : null}
            <button onClick={signOut} className="inline-flex h-11 items-center gap-2 rounded-full bg-brand-deep px-4 text-sm font-bold text-white">
              <LogOut className="size-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      {view === "manager" ? (
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <ManagerChat getToken={getToken} />
        </main>
      ) : null}

      {view === "pipeline" ? (
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {demoMode ? (
            <div className="mb-5 rounded-2xl border border-amber-300/30 bg-amber-400/10 p-4 text-sm text-amber-700">
              Demo mode is active. Add Supabase service keys to show live leads.
            </div>
          ) : null}
          {error ? <p className="mb-5 rounded-2xl bg-red-500/10 p-4 text-sm text-red-600">{error}</p> : null}
          {loading ? (
            <div className="flex h-60 items-center justify-center text-muted">
              <Loader2 className="mr-2 size-5 animate-spin" />
              Loading pipeline
            </div>
          ) : (
            <KanbanBoard leads={leads} onMove={moveLead} onSelect={setDrawerLead} />
          )}
        </main>
      ) : null}

      {view === "approvals" ? (
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <ApprovalInbox getToken={getToken} onCountChange={setApprovalsCount} />
        </main>
      ) : null}

      {view === "tasks" ? (
        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <TaskList getToken={getToken} leads={leads} />
        </main>
      ) : null}

      {view === "appointments" ? <AdminAppointments getToken={getToken} /> : null}

      <main className={view === "leads" ? "mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[.95fr_1.05fr] lg:px-8" : "hidden"}>
        <section className="rounded-[2rem] border border-border-subtle bg-bg-elevated p-5 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <label className="relative">
              <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-12 w-full rounded-full border border-border-subtle pl-11 pr-4 text-sm outline-none focus:border-brand-soft focus:ring-4 focus:ring-brand/25"
                placeholder="Search leads"
              />
            </label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-12 rounded-full border border-border-subtle px-4 text-sm font-semibold outline-none focus:border-brand-soft focus:ring-4 focus:ring-brand/25"
            >
              <option value="all">All statuses</option>
              {leadStatuses.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {demoMode ? (
            <div className="mt-4 rounded-2xl border border-amber-300/30 bg-amber-400/10 p-4 text-sm text-amber-700">
              Demo mode is active. Add Supabase service keys to show live leads.
            </div>
          ) : null}

          {error ? <p className="mt-4 rounded-2xl bg-red-500/10 p-4 text-sm text-red-600">{error}</p> : null}

          <div className="mt-5 grid gap-3">
            {loading ? (
              <div className="flex h-40 items-center justify-center text-muted">
                <Loader2 className="mr-2 size-5 animate-spin" />
                Loading leads
              </div>
            ) : filtered.length ? (
              filtered.map((lead) => (
                <button
                  type="button"
                  key={lead.id}
                  onClick={() => setSelected(lead)}
                  className={`rounded-3xl border p-4 text-left transition ${
                    selected?.id === lead.id ? "border-brand-soft bg-brand-deep/20" : "border-border-subtle hover:border-border-subtle"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-foreground">{lead.name}</p>
                      <p className="mt-1 text-sm text-muted">{lead.company || lead.industry || lead.email}</p>
                    </div>
                    <span className="rounded-full bg-brand-deep px-3 py-1 text-xs font-bold capitalize text-white">
                      {lead.status}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted">{lead.pain_point}</p>
                </button>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-border-subtle p-8 text-center text-sm text-muted">
                No leads match this view.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-border-subtle bg-bg-elevated p-5 shadow-sm">
          {selected ? (
            <form action={saveLead}>
              <div className="flex flex-col gap-4 border-b border-border-subtle pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-2xl font-black text-foreground">{selected.name}</h2>
                  <p className="mt-1 text-sm text-muted">{formatDate(selected.created_at)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDrawerLead(selected)}
                    className="inline-flex h-11 items-center rounded-full border border-border-subtle px-4 text-sm font-bold text-muted transition hover:text-foreground"
                  >
                    Full view
                  </button>
                  <select
                    name="status"
                    defaultValue={selected.status}
                    className="h-11 rounded-full border border-border-subtle px-4 text-sm font-bold capitalize outline-none focus:border-brand-soft focus:ring-4 focus:ring-brand/25"
                  >
                    {leadStatuses.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Info label="Email" value={selected.email} />
                <Info label="Phone" value={selected.phone || "Not provided"} />
                <Info label="Company" value={selected.company || "Not provided"} />
                <Info label="Industry" value={selected.industry || "Not provided"} />
                <Info label="Interest" value={selected.interest || "Not provided"} />
                <Info label="Source" value={selected.source} />
              </div>

              <div className="mt-6 rounded-3xl bg-surface p-5">
                <p className="text-sm font-black text-foreground">Business challenge</p>
                <p className="mt-2 leading-7 text-muted">{selected.pain_point}</p>
              </div>

              {selected.demo_summary ? (
                <div className="mt-4 rounded-3xl bg-brand-deep/15 p-5">
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
                  className="resize-none rounded-3xl border border-border-subtle p-4 text-sm font-normal leading-7 text-muted outline-none focus:border-brand-soft focus:ring-4 focus:ring-brand/25"
                  placeholder="Add follow-up notes, call outcome, or proposal context."
                />
              </label>

              <button
                type="submit"
                disabled={saving}
                className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand-deep px-6 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                Save lead
              </button>
            </form>
          ) : (
            <div className="flex min-h-96 items-center justify-center text-sm text-muted">
              Select a lead to view details.
            </div>
          )}
        </section>
      </main>

      {drawerLead ? (
        <LeadDrawer
          lead={drawerLead}
          getToken={getToken}
          onClose={() => setDrawerLead(null)}
          onSaved={handleDrawerSaved}
        />
      ) : null}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-border-subtle p-4">
      <p className="text-xs font-black uppercase tracking-[.18em] text-muted">{label}</p>
      <p className="mt-2 break-words text-sm font-bold text-foreground/90">{value}</p>
    </div>
  );
}
