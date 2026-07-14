"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { Download, Loader2, RefreshCcw } from "lucide-react";
import { type LeadStatus } from "@/lib/site-data";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Appointment, Invoice, Lead } from "@/lib/supabase";
import { AdminAppointments } from "@/components/admin-appointments";
import { KanbanBoard } from "@/components/admin/kanban-board";
import { LeadDrawer } from "@/components/admin/lead-drawer";
import { TaskList } from "@/components/admin/task-list";
import { ApprovalInbox } from "@/components/admin/approval-inbox";
import { ManagerChat } from "@/components/admin/manager-chat";
import { Targeting } from "@/components/admin/targeting";
import { ProspectsTable } from "@/components/admin/prospects-table";
import { Sequences } from "@/components/admin/sequences";
import { Overview } from "@/components/admin/overview";
import { Finance } from "@/components/admin/finance";
import { LeadsView } from "@/components/admin/leads-view";
import { Sidebar } from "@/components/admin/shell/sidebar";
import { Topbar } from "@/components/admin/shell/topbar";
import { viewTitles, type View } from "@/components/admin/shell/nav-config";
import { DemoBanner, ErrorBanner } from "@/components/admin/ui/banners";

export function AdminDashboard() {
  const router = useRouter();
  const [view, setView] = useState<View>("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
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
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

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

  // Load appointments + invoices once so the global search can find them.
  const loadSearchData = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const [apptRes, invRes] = await Promise.all([
        fetch("/api/admin/appointments", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/invoices", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (apptRes.ok) setAppointments((await apptRes.json()).appointments || []);
      if (invRes.ok) setInvoices((await invRes.json()).invoices || []);
    } catch {
      // Non-critical: search just won't include these until reloaded.
    }
  }, [getToken]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSearchData();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadSearchData]);

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

  function handleDrawerDeleted(deletedId: string) {
    setLeads((current) => current.filter((lead) => lead.id !== deletedId));
    setSelected((current) => (current?.id === deletedId ? null : current));
    setDrawerLead(null);
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

  const actions = (
    <>
      {view === "pipeline" || view === "leads" ? (
        <button
          onClick={loadLeads}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-sidebar-border bg-white px-3 text-sm font-bold text-muted transition hover:text-foreground"
        >
          <RefreshCcw className="size-4" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      ) : null}
      {view === "leads" ? (
        <button
          onClick={exportCsv}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-sidebar-border bg-white px-3 text-sm font-bold text-muted transition hover:text-foreground"
        >
          <Download className="size-4" />
          <span className="hidden sm:inline">CSV</span>
        </button>
      ) : null}
    </>
  );

  // Wraps a conditionally-rendered view in a subtle entrance animation.
  // NOTE: the leads view is intentionally excluded — it stays always-mounted
  // (toggled by a `hidden` class) so form + selection state survive nav changes.
  const enter = (node: ReactNode) => (
    <m.main
      key={view}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6"
    >
      {node}
    </m.main>
  );

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-admin-canvas text-foreground lg:grid lg:grid-cols-[16rem_1fr]">
        <Sidebar
          view={view}
          onNavigate={(v) => {
            setView(v);
            setMobileNavOpen(false);
          }}
          approvalsCount={approvalsCount}
          onSignOut={signOut}
          mobileOpen={mobileNavOpen}
          onMobileClose={() => setMobileNavOpen(false)}
        />

        <div className="flex min-w-0 flex-col">
          <Topbar
            title={viewTitles[view]}
            onOpenMobileNav={() => setMobileNavOpen(true)}
            onNavigate={setView}
            approvalsCount={approvalsCount}
            leads={leads}
            onSelectLead={setDrawerLead}
            appointments={appointments}
            invoices={invoices}
            actions={actions}
          />

          {view === "overview" ? enter(<Overview getToken={getToken} onNavigate={setView} />) : null}
          {view === "manager" ? enter(<ManagerChat getToken={getToken} />) : null}

          {view === "pipeline"
            ? enter(
                <>
                  {demoMode ? <DemoBanner className="mb-5" message="Demo mode is active. Add Supabase service keys to show live leads." /> : null}
                  {error ? <ErrorBanner className="mb-5" message={error} /> : null}
                  {loading ? (
                    <div className="flex h-60 items-center justify-center text-muted">
                      <Loader2 className="mr-2 size-5 animate-spin" />
                      Loading pipeline
                    </div>
                  ) : (
                    <KanbanBoard leads={leads} onMove={moveLead} onSelect={setDrawerLead} />
                  )}
                </>,
              )
            : null}

          {view === "approvals" ? enter(<ApprovalInbox getToken={getToken} onCountChange={setApprovalsCount} />) : null}
          {view === "targeting" ? enter(<Targeting getToken={getToken} />) : null}
          {view === "prospects" ? enter(<ProspectsTable getToken={getToken} />) : null}
          {view === "sequences" ? enter(<Sequences getToken={getToken} />) : null}
          {view === "finance" ? enter(<Finance getToken={getToken} />) : null}
          {view === "tasks" ? enter(<TaskList getToken={getToken} leads={leads} />) : null}
          {view === "appointments" ? enter(<AdminAppointments getToken={getToken} />) : null}

          {/* Leads view is ALWAYS mounted (hidden when inactive) to preserve state. */}
          <main className={view === "leads" ? "mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6" : "hidden"}>
            <LeadsView
              filtered={filtered}
              selected={selected}
              onSelect={setSelected}
              query={query}
              onQueryChange={setQuery}
              status={status}
              onStatusChange={setStatus}
              saveLead={saveLead}
              saving={saving}
              loading={loading}
              error={error}
              demoMode={demoMode}
              onOpenDrawer={setDrawerLead}
            />
          </main>
        </div>

        {drawerLead ? (
          <LeadDrawer lead={drawerLead} getToken={getToken} onClose={() => setDrawerLead(null)} onSaved={handleDrawerSaved} onDeleted={handleDrawerDeleted} />
        ) : null}
      </div>
    </LazyMotion>
  );
}
