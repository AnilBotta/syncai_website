"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Radar, Trash2 } from "lucide-react";
import type { Icp } from "@/lib/supabase";

type TargetingProps = {
  getToken: () => Promise<string>;
};

const empty = { name: "", industry: "", location: "", companySize: "", keywords: "" };

export function Targeting({ getToken }: TargetingProps) {
  const [icps, setIcps] = useState<Icp[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [demoMode, setDemoMode] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      const response = await fetch("/api/admin/icps", { headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load ICPs.");
      setIcps(result.icps || []);
      setDemoMode(Boolean(result.demoMode));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load ICPs.");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function createIcp() {
    if (!form.name.trim()) {
      setError("Give the ICP a name.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const token = await getToken();
      const response = await fetch("/api/admin/icps", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not create ICP.");
      setForm(empty);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create ICP.");
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(icp: Icp, status: Icp["status"]) {
    const token = await getToken();
    await fetch("/api/admin/icps", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: icp.id, status }),
    });
    await load();
  }

  async function remove(icp: Icp) {
    const token = await getToken();
    await fetch(`/api/admin/icps?id=${icp.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    await load();
  }

  async function runScraper(icp: Icp) {
    setRunningId(icp.id);
    setError("");
    setNotice("");
    try {
      const token = await getToken();
      const response = await fetch("/api/admin/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ agent: "scraper", icpId: icp.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Scraper failed.");
      setNotice(result.summary || `Found ${result.inserted ?? 0} prospects.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scraper failed.");
    } finally {
      setRunningId(null);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
      <section className="rounded-[var(--radius-card-lg)] border border-sidebar-border bg-card p-5 shadow-card backdrop-blur-xl">
        <h2 className="text-lg font-black text-foreground">New target (ICP)</h2>
        <p className="mt-1 text-sm text-muted">Define who to hunt for. The scraper only searches active ICPs.</p>
        <div className="mt-4 grid gap-3">
          <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Dental clinics — Mississauga" />
          <Field label="Industry" value={form.industry} onChange={(v) => setForm({ ...form, industry: v })} placeholder="Dental clinic" />
          <Field label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} placeholder="Mississauga, ON" />
          <Field label="Company size" value={form.companySize} onChange={(v) => setForm({ ...form, companySize: v })} placeholder="5-50" />
          <Field label="Keywords" value={form.keywords} onChange={(v) => setForm({ ...form, keywords: v })} placeholder="dental clinic, orthodontist" />
          <button
            type="button"
            onClick={createIcp}
            disabled={saving}
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full bg-brand-deep px-5 text-sm font-black text-white disabled:opacity-60"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Add target
          </button>
        </div>
      </section>

      <section className="rounded-[var(--radius-card-lg)] border border-sidebar-border bg-card p-5 shadow-card backdrop-blur-xl">
        <h2 className="text-lg font-black text-foreground">Active targets</h2>
        {demoMode ? (
          <p className="mt-3 rounded-2xl border border-warn/20 bg-warn-soft p-3 text-xs text-warn">
            Demo mode. Connect Supabase to manage live ICPs.
          </p>
        ) : null}
        {error ? <p className="mt-3 rounded-2xl bg-danger-soft p-3 text-sm text-danger">{error}</p> : null}
        {notice ? <p className="mt-3 rounded-2xl bg-success-soft p-3 text-sm text-success">{notice}</p> : null}

        <div className="mt-4 grid gap-3">
          {loading ? (
            <div className="flex h-24 items-center justify-center text-sm text-muted">
              <Loader2 className="mr-2 size-4 animate-spin" /> Loading
            </div>
          ) : icps.length ? (
            icps.map((icp) => (
              <div key={icp.id} className="rounded-2xl border border-sidebar-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-foreground">{icp.name}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {[icp.industry, icp.location, icp.company_size].filter(Boolean).join(" · ") || "—"}
                    </p>
                    {icp.source === "manager" && icp.rationale ? (
                      <p className="mt-1 text-xs italic text-muted">Manager: {icp.rationale}</p>
                    ) : null}
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-black ${
                      icp.status === "active"
                        ? "bg-success-soft text-success"
                        : icp.status === "proposed"
                          ? "bg-warn-soft text-warn"
                          : "bg-border-subtle text-muted"
                    }`}
                  >
                    {icp.status}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => runScraper(icp)}
                    disabled={runningId === icp.id || icp.status !== "active"}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full bg-brand-deep px-4 text-xs font-bold text-white disabled:opacity-50"
                    title={icp.status !== "active" ? "Activate this ICP first" : "Find prospects"}
                  >
                    {runningId === icp.id ? <Loader2 className="size-3.5 animate-spin" /> : <Radar className="size-3.5" />}
                    Find prospects
                  </button>
                  {icp.status !== "active" ? (
                    <button type="button" onClick={() => setStatus(icp, "active")} className="h-9 rounded-full border border-sidebar-border px-4 text-xs font-bold text-muted">
                      Activate
                    </button>
                  ) : (
                    <button type="button" onClick={() => setStatus(icp, "paused")} className="h-9 rounded-full border border-sidebar-border px-4 text-xs font-bold text-muted">
                      Pause
                    </button>
                  )}
                  <button type="button" onClick={() => remove(icp)} className="grid size-9 place-items-center rounded-full text-muted transition hover:text-danger" title="Delete">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="rounded-2xl border border-dashed border-sidebar-border p-6 text-center text-sm text-muted">
              No targets yet. Add one to start finding prospects.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1.5 text-xs font-black uppercase tracking-wider text-muted">
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-full border border-sidebar-border px-4 text-sm font-normal text-foreground outline-none focus:border-brand-soft focus:ring-4 focus:ring-brand/25"
      />
    </label>
  );
}
