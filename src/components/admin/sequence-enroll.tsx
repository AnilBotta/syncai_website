"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Play, Plus, X } from "lucide-react";
import { formatDate } from "@/lib/utils";

type Enrollment = {
  id: string;
  status: "active" | "paused" | "completed" | "cancelled";
  current_step: number;
  next_run_at: string;
  sequence_id: string;
  sequence_name: string;
  total_steps: number;
};

type SeqOption = { id: string; name: string };

type SequenceEnrollProps = {
  leadId: string;
  getToken: () => Promise<string>;
};

export function SequenceEnroll({ leadId, getToken }: SequenceEnrollProps) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [sequences, setSequences] = useState<SeqOption[]>([]);
  const [chosen, setChosen] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const [enrRes, seqRes] = await Promise.all([
        fetch(`/api/admin/sequences/enroll?leadId=${leadId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/sequences", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const enr = await enrRes.json();
      const seq = await seqRes.json();
      setEnrollments(enr.enrollments || []);
      const active = (seq.sequences || []).filter((s: { active: boolean }) => s.active);
      setSequences(active.map((s: SeqOption) => ({ id: s.id, name: s.name })));
      if (active[0]) setChosen((c) => c || active[0].id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load sequences.");
    } finally {
      setLoading(false);
    }
  }, [leadId, getToken]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function enroll() {
    if (!chosen) return;
    setBusy(true);
    setError("");
    try {
      const token = await getToken();
      const response = await fetch("/api/admin/sequences/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ leadId, sequenceId: chosen }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not enroll.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not enroll.");
    } finally {
      setBusy(false);
    }
  }

  async function act(enrollment: Enrollment, action: "pause" | "resume" | "cancel") {
    const token = await getToken();
    await fetch("/api/admin/sequences/enroll", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: enrollment.id, action }),
    });
    await load();
  }

  const activeEnrollments = enrollments.filter((e) => e.status === "active" || e.status === "paused");

  return (
    <div>
      {loading ? (
        <div className="flex h-10 items-center text-sm text-muted">
          <Loader2 className="mr-2 size-4 animate-spin" /> Loading
        </div>
      ) : (
        <>
          {activeEnrollments.map((e) => (
            <div key={e.id} className="mb-2 flex items-center justify-between gap-2 rounded-2xl border border-sidebar-border p-3">
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground">{e.sequence_name}</p>
                <p className="text-xs text-muted">
                  Step {Math.min(e.current_step + 1, e.total_steps)}/{e.total_steps}
                  {e.status === "paused" ? " · paused" : ` · next ${formatDate(e.next_run_at)}`}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                {e.status === "paused" ? (
                  <button type="button" onClick={() => act(e, "resume")} className="grid size-8 place-items-center rounded-full text-muted hover:text-emerald-600" title="Resume">
                    <Play className="size-4" />
                  </button>
                ) : (
                  <button type="button" onClick={() => act(e, "pause")} className="h-8 rounded-full px-3 text-xs font-bold text-muted hover:text-foreground">
                    Pause
                  </button>
                )}
                <button type="button" onClick={() => act(e, "cancel")} className="grid size-8 place-items-center rounded-full text-muted hover:text-red-600" title="Cancel">
                  <X className="size-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="flex gap-2">
            <select
              value={chosen}
              onChange={(event) => setChosen(event.target.value)}
              className="h-10 flex-1 rounded-full border border-sidebar-border px-3 text-sm outline-none focus:border-brand-soft"
            >
              {sequences.length ? (
                sequences.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))
              ) : (
                <option value="">No active sequences</option>
              )}
            </select>
            <button
              type="button"
              onClick={enroll}
              disabled={busy || !chosen}
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-brand-deep px-4 text-sm font-bold text-white disabled:opacity-50"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Enroll
            </button>
          </div>
          {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
        </>
      )}
    </div>
  );
}
