"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Mail, Microscope, X } from "lucide-react";
import type { Prospect } from "@/lib/supabase";

type ProspectsTableProps = {
  getToken: () => Promise<string>;
};

export function ProspectsTable({ getToken }: ProspectsTableProps) {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [demoMode, setDemoMode] = useState(false);
  const [openBrief, setOpenBrief] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      const response = await fetch("/api/admin/prospects", { headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load prospects.");
      setProspects(result.prospects || []);
      setDemoMode(Boolean(result.demoMode));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load prospects.");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function runAgent(prospect: Prospect, agent: "research" | "outreach") {
    setBusyId(prospect.id);
    setError("");
    setNotice("");
    try {
      const token = await getToken();
      const response = await fetch("/api/admin/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ agent, prospectId: prospect.id }),
      });
      const result = await response.json();
      if (!response.ok || result.ok === false) {
        throw new Error(result.error || `${agent} failed.`);
      }
      setNotice(
        agent === "research"
          ? `Research brief ready for ${prospect.company}.`
          : `Outreach drafted for ${prospect.company} → Approval Inbox.`,
      );
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : `${agent} failed.`);
    } finally {
      setBusyId(null);
    }
  }

  async function discard(prospect: Prospect) {
    const token = await getToken();
    await fetch("/api/admin/prospects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: prospect.id, action: "discard" }),
    });
    setProspects((current) => current.filter((p) => p.id !== prospect.id));
  }

  return (
    <div className="rounded-[var(--radius-card-lg)] border border-sidebar-border bg-white p-5 shadow-card">
      {demoMode ? (
        <p className="mb-3 rounded-2xl border border-warn/20 bg-warn-soft p-3 text-xs text-warn">
          Demo mode. Connect Supabase + a sourcing key (Google Places / Apollo) to find live prospects.
        </p>
      ) : null}
      {error ? <p className="mb-3 rounded-2xl bg-danger-soft p-3 text-sm text-danger">{error}</p> : null}
      {notice ? <p className="mb-3 rounded-2xl bg-success-soft p-3 text-sm text-success">{notice}</p> : null}

      {loading ? (
        <div className="flex h-32 items-center justify-center text-sm text-muted">
          <Loader2 className="mr-2 size-4 animate-spin" /> Loading prospects
        </div>
      ) : prospects.length ? (
        <div className="grid gap-3">
          {prospects.map((prospect) => {
            const hasBrief = prospect.enrichment && "likely_ai_pain_points" in prospect.enrichment;
            return (
              <div key={prospect.id} className="rounded-2xl border border-sidebar-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-black text-foreground">{prospect.company}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {[prospect.contact_name, prospect.email, prospect.phone, prospect.domain]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="rounded-full bg-border-subtle/60 px-2 py-0.5 text-[11px] font-bold text-muted">
                        {prospect.source}
                      </span>
                      {prospect.status === "promoted" ? (
                        <span className="rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-bold text-success">
                          promoted to lead
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => runAgent(prospect, "research")}
                      disabled={busyId === prospect.id}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-sidebar-border px-3 text-xs font-bold text-muted transition hover:text-foreground disabled:opacity-50"
                    >
                      {busyId === prospect.id ? <Loader2 className="size-3.5 animate-spin" /> : <Microscope className="size-3.5" />}
                      Research
                    </button>
                    <button
                      type="button"
                      onClick={() => runAgent(prospect, "outreach")}
                      disabled={busyId === prospect.id || !prospect.email}
                      title={!prospect.email ? "No email — research to find a contact, or add one" : "Draft outreach"}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full bg-brand-deep px-3 text-xs font-bold text-white disabled:opacity-50"
                    >
                      <Mail className="size-3.5" />
                      Draft outreach
                    </button>
                    <button
                      type="button"
                      onClick={() => discard(prospect)}
                      className="grid size-9 place-items-center rounded-full text-muted transition hover:text-danger"
                      title="Discard"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </div>

                {hasBrief ? (
                  <button
                    type="button"
                    onClick={() => setOpenBrief(openBrief === prospect.id ? null : prospect.id)}
                    className="mt-3 text-xs font-bold text-brand-glow-text"
                  >
                    {openBrief === prospect.id ? "Hide research brief" : "View research brief"}
                  </button>
                ) : null}
                {openBrief === prospect.id && hasBrief ? (
                  <pre className="mt-2 max-h-64 overflow-auto rounded-2xl bg-foreground/[.03] p-3 text-xs leading-5 text-muted">
                    {JSON.stringify(prospect.enrichment, null, 2)}
                  </pre>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-sidebar-border p-8 text-center text-sm text-muted">
          No prospects yet. Go to Targeting, add an ICP, and click &quot;Find prospects&quot;.
        </p>
      )}
    </div>
  );
}
