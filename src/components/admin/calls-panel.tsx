"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Phone } from "lucide-react";
import type { Call } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";

type CallsPanelProps = {
  leadId: string;
  hasPhone: boolean;
  getToken: () => Promise<string>;
};

const statusStyles: Record<Call["status"], string> = {
  queued: "bg-surface text-muted",
  ringing: "bg-warn-soft text-warn",
  in_progress: "bg-brand-deep/15 text-brand-glow-text",
  completed: "bg-success-soft text-success",
  failed: "bg-danger-soft text-danger",
  no_answer: "bg-danger-soft text-danger",
};

export function CallsPanel({ leadId, hasPhone, getToken }: CallsPanelProps) {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [voiceReady, setVoiceReady] = useState(false);
  const [calling, setCalling] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [expanded, setExpanded] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const response = await fetch(`/api/admin/calls?leadId=${leadId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (response.ok) {
        setCalls(result.calls || []);
        setVoiceReady(Boolean(result.voiceReady));
      }
    } catch {
      // Non-critical.
    } finally {
      setLoading(false);
    }
  }, [getToken, leadId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function call() {
    setCalling(true);
    setError("");
    setNotice("");
    try {
      const token = await getToken();
      const response = await fetch("/api/admin/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ leadId }),
      });
      const result = await response.json();
      if (!response.ok || result.ok === false) throw new Error(result.error || "Could not start the call.");
      setNotice("Calling now — the transcript will appear here when the call ends.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start the call.");
    } finally {
      setCalling(false);
    }
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={call}
          disabled={calling || !hasPhone || !voiceReady}
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-brand-deep px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          title={!hasPhone ? "No phone number on file" : !voiceReady ? "Voice provider not configured" : ""}
        >
          {calling ? <Loader2 className="size-4 animate-spin" /> : <Phone className="size-4" />}
          Call this lead
        </button>
        {!voiceReady ? (
          <span className="text-xs text-muted">Add a voice provider (Retell/Vapi) to enable calling.</span>
        ) : !hasPhone ? (
          <span className="text-xs text-muted">No phone number on file.</span>
        ) : null}
      </div>

      {notice ? <p className="text-xs font-bold text-success">{notice}</p> : null}
      {error ? <p className="rounded-2xl bg-danger-soft p-3 text-sm text-danger">{error}</p> : null}

      <div className="grid gap-2">
        {loading ? (
          <div className="flex h-14 items-center justify-center text-sm text-muted">
            <Loader2 className="mr-2 size-4 animate-spin" />
            Loading
          </div>
        ) : calls.length ? (
          calls.map((c) => (
            <div key={c.id} className="rounded-2xl border border-sidebar-border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-foreground">
                  {c.direction === "outbound" ? "Outbound" : "Inbound"} · {formatDate(c.created_at)}
                </p>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-black capitalize ${statusStyles[c.status]}`}>
                  {c.status.replace("_", " ")}
                </span>
              </div>
              {c.summary ? <p className="mt-1.5 text-sm leading-6 text-muted">{c.summary}</p> : null}
              {c.duration_seconds ? (
                <p className="mt-1 text-xs text-muted">
                  Duration {Math.floor(c.duration_seconds / 60)}m {c.duration_seconds % 60}s
                </p>
              ) : null}
              {c.transcript ? (
                <button
                  type="button"
                  onClick={() => setExpanded((current) => (current === c.id ? "" : c.id))}
                  className="mt-2 text-xs font-bold text-brand-glow-text"
                >
                  {expanded === c.id ? "Hide transcript" : "Show transcript"}
                </button>
              ) : null}
              {expanded === c.id && c.transcript ? (
                <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap rounded-2xl bg-surface p-3 font-sans text-xs leading-5 text-muted">
                  {c.transcript}
                </pre>
              ) : null}
            </div>
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-sidebar-border p-4 text-center text-sm text-muted">
            No calls yet.
          </p>
        )}
      </div>
    </div>
  );
}
