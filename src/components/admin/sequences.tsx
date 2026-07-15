"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Send, Users } from "lucide-react";
import type { Sequence, SequenceStep } from "@/lib/supabase";

type SequenceWithSteps = Sequence & { steps: SequenceStep[]; activeEnrollments: number };

type SequencesProps = { getToken: () => Promise<string> };

export function Sequences({ getToken }: SequencesProps) {
  const [sequences, setSequences] = useState<SequenceWithSteps[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [demoMode, setDemoMode] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      const response = await fetch("/api/admin/sequences", { headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load sequences.");
      setSequences(result.sequences || []);
      setDemoMode(Boolean(result.demoMode));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load sequences.");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function patch(seq: SequenceWithSteps, body: { active?: boolean; autoSend?: boolean }) {
    setBusyId(seq.id);
    setError("");
    try {
      const token = await getToken();
      const response = await fetch("/api/admin/sequences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: seq.id, ...body }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Update failed.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed.");
    } finally {
      setBusyId(null);
    }
  }

  function toggleAutoSend(seq: SequenceWithSteps) {
    if (!seq.auto_send) {
      const ok = window.confirm(
        `Turn ON auto-send for "${seq.name}"?\n\nEmails in this sequence will be sent to leads AUTOMATICALLY without waiting for your approval. Only do this for a sequence you fully trust.`,
      );
      if (!ok) return;
    }
    void patch(seq, { autoSend: !seq.auto_send });
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4">
        <h2 className="text-lg font-black text-foreground">Nurture sequences</h2>
        <p className="mt-1 text-sm text-muted">
          Automated follow-up cadences. Each step drafts a personalized email into your Approval Inbox on schedule.
          Enroll leads from their detail drawer.
        </p>
      </div>

      {demoMode ? (
        <p className="mb-3 rounded-2xl border border-warn/20 bg-warn-soft p-3 text-xs text-warn">
          Demo mode. Connect Supabase to manage live sequences.
        </p>
      ) : null}
      {error ? <p className="mb-3 rounded-2xl bg-danger-soft p-3 text-sm text-danger">{error}</p> : null}

      {loading ? (
        <div className="flex h-32 items-center justify-center text-sm text-muted">
          <Loader2 className="mr-2 size-4 animate-spin" /> Loading
        </div>
      ) : (
        <div className="grid gap-4">
          {sequences.map((seq) => (
            <div key={seq.id} className="rounded-[var(--radius-card-lg)] border border-sidebar-border bg-card p-5 shadow-card backdrop-blur-xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-foreground">{seq.name}</p>
                  <p className="mt-0.5 text-sm text-muted">{seq.description}</p>
                  <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-muted">
                    <Users className="size-3.5" /> {seq.activeEnrollments} active · {seq.steps.length} steps
                  </p>
                </div>
                {busyId === seq.id ? <Loader2 className="size-4 animate-spin text-muted" /> : null}
              </div>

              <ol className="mt-3 grid gap-1.5">
                {seq.steps.map((st) => (
                  <li key={st.id} className="flex gap-2 text-xs text-muted">
                    <span className="font-black text-brand-glow-text">Day {st.day_offset}</span>
                    <span className="capitalize">{st.intent.replace("_", " ")}:</span>
                    <span className="min-w-0 flex-1">{st.instruction}</span>
                  </li>
                ))}
              </ol>

              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-sidebar-border pt-4">
                <label className="inline-flex items-center gap-2 text-sm font-bold text-foreground">
                  <input
                    type="checkbox"
                    checked={seq.active}
                    onChange={() => patch(seq, { active: !seq.active })}
                    className="size-4"
                  />
                  Active
                </label>
                <label
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold ${
                    seq.auto_send ? "bg-danger-soft text-danger" : "text-muted"
                  }`}
                >
                  <Send className="size-3.5" />
                  <input type="checkbox" checked={seq.auto_send} onChange={() => toggleAutoSend(seq)} className="size-4" />
                  Auto-send {seq.auto_send ? "(ON — sends without approval)" : "(off — drafts to approvals)"}
                </label>
              </div>
            </div>
          ))}
          {!sequences.length ? (
            <p className="rounded-2xl border border-dashed border-sidebar-border p-8 text-center text-sm text-muted">
              No sequences yet. Run migration 005 to seed the default nurture sequence.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
