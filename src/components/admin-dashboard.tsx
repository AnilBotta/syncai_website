"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2, LogOut, RefreshCcw, Search } from "lucide-react";
import { leadStatuses } from "@/lib/site-data";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Lead } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import { AdminAppointments } from "@/components/admin-appointments";

export function AdminDashboard() {
  const router = useRouter();
  const [view, setView] = useState<"leads" | "appointments">("leads");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [error, setError] = useState("");
  const [demoMode, setDemoMode] = useState(false);

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
    const headers = ["created_at", "name", "email", "phone", "company", "industry", "interest", "source", "status", "pain_point", "notes"];
    const rows = filtered.map((lead) =>
      headers.map((header) => JSON.stringify(String(lead[header as keyof Lead] || ""))).join(","),
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
    <div className="min-h-screen bg-[#f4f7fb]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[.22em] text-purple-700">SyncAi Admin</p>
            <h1 className="mt-1 text-3xl font-black text-slate-950">
              {view === "leads" ? "Lead Dashboard" : "Appointments"}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex rounded-full border border-slate-200 bg-white p-1">
              {(["leads", "appointments"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setView(tab)}
                  className={`rounded-full px-4 py-2 text-sm font-bold capitalize transition ${
                    view === tab ? "bg-slate-950 text-white" : "text-slate-600"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            {view === "leads" ? (
              <>
                <button onClick={loadLeads} className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700">
                  <RefreshCcw className="size-4" />
                  Refresh
                </button>
                <button onClick={exportCsv} className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700">
                  <Download className="size-4" />
                  CSV
                </button>
              </>
            ) : null}
            <button onClick={signOut} className="inline-flex h-11 items-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-bold text-white">
              <LogOut className="size-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      {view === "appointments" ? <AdminAppointments getToken={getToken} /> : null}

      <main className={view === "leads" ? "mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[.95fr_1.05fr] lg:px-8" : "hidden"}>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <label className="relative">
              <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-12 w-full rounded-full border border-slate-200 pl-11 pr-4 text-sm outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-100"
                placeholder="Search leads"
              />
            </label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-12 rounded-full border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-100"
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
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Demo mode is active. Add Supabase service keys to show live leads.
            </div>
          ) : null}

          {error ? <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}

          <div className="mt-5 grid gap-3">
            {loading ? (
              <div className="flex h-40 items-center justify-center text-slate-500">
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
                    selected?.id === lead.id ? "border-purple-600 bg-purple-50" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-slate-950">{lead.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{lead.company || lead.industry || lead.email}</p>
                    </div>
                    <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold capitalize text-white">
                      {lead.status}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{lead.pain_point}</p>
                </button>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                No leads match this view.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          {selected ? (
            <form action={saveLead}>
              <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-950">{selected.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{formatDate(selected.created_at)}</p>
                </div>
                <select
                  name="status"
                  defaultValue={selected.status}
                  className="h-11 rounded-full border border-slate-200 px-4 text-sm font-bold capitalize outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-100"
                >
                  {leadStatuses.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Info label="Email" value={selected.email} />
                <Info label="Phone" value={selected.phone || "Not provided"} />
                <Info label="Company" value={selected.company || "Not provided"} />
                <Info label="Industry" value={selected.industry || "Not provided"} />
                <Info label="Interest" value={selected.interest || "Not provided"} />
                <Info label="Source" value={selected.source} />
              </div>

              <div className="mt-6 rounded-3xl bg-slate-100 p-5">
                <p className="text-sm font-black text-slate-950">Business challenge</p>
                <p className="mt-2 leading-7 text-slate-700">{selected.pain_point}</p>
              </div>

              {selected.demo_summary ? (
                <div className="mt-4 rounded-3xl bg-purple-50 p-5">
                  <p className="text-sm font-black text-slate-950">Demo summary</p>
                  <p className="mt-2 whitespace-pre-line leading-7 text-slate-700">{selected.demo_summary}</p>
                </div>
              ) : null}

              <label className="mt-6 grid gap-2 text-sm font-black text-slate-950">
                Notes
                <textarea
                  name="notes"
                  defaultValue={selected.notes || ""}
                  rows={7}
                  className="resize-none rounded-3xl border border-slate-200 p-4 text-sm font-normal leading-7 text-slate-700 outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-100"
                  placeholder="Add follow-up notes, call outcome, or proposal context."
                />
              </label>

              <button
                type="submit"
                disabled={saving}
                className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                Save lead
              </button>
            </form>
          ) : (
            <div className="flex min-h-96 items-center justify-center text-sm text-slate-500">
              Select a lead to view details.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 p-4">
      <p className="text-xs font-black uppercase tracking-[.18em] text-slate-400">{label}</p>
      <p className="mt-2 break-words text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}
