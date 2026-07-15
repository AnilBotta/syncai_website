"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowRightLeft,
  Bot,
  FileText,
  ListChecks,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Sparkles,
} from "lucide-react";
import type { LeadActivity } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";

const typeIcons: Record<LeadActivity["type"], typeof MessageSquare> = {
  note: MessageSquare,
  status_change: ArrowRightLeft,
  email: Mail,
  agent_run: Bot,
  task: ListChecks,
  document: FileText,
  call: Phone,
  system: Sparkles,
};

type ActivityTimelineProps = {
  leadId: string;
  getToken: () => Promise<string>;
};

export function ActivityTimeline({ leadId, getToken }: ActivityTimelineProps) {
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [error, setError] = useState("");

  const loadActivities = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = await getToken();
      const response = await fetch(`/api/admin/leads/${leadId}/activities`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not load activity.");
      }

      setActivities(result.activities || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load activity.");
    } finally {
      setLoading(false);
    }
  }, [leadId, getToken]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadActivities();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadActivities]);

  async function addNote() {
    const trimmed = note.trim();
    if (!trimmed) {
      return;
    }

    setSavingNote(true);
    setError("");

    try {
      const token = await getToken();
      const response = await fetch(`/api/admin/leads/${leadId}/activities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type: "note", title: "Note", body: trimmed }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not add note.");
      }

      setNote("");
      await loadActivities();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not add note.");
    } finally {
      setSavingNote(false);
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void addNote();
            }
          }}
          className="h-11 flex-1 rounded-full border border-sidebar-border px-4 text-sm outline-none focus:border-brand-soft focus:ring-4 focus:ring-brand/25"
          placeholder="Add a note to the timeline…"
        />
        <button
          type="button"
          onClick={addNote}
          disabled={savingNote || !note.trim()}
          className="inline-flex h-11 items-center rounded-full bg-brand-deep px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {savingNote ? <Loader2 className="size-4 animate-spin" /> : "Add"}
        </button>
      </div>

      {error ? <p className="mt-3 rounded-2xl bg-danger-soft p-3 text-sm text-danger">{error}</p> : null}

      <div className="mt-4 grid gap-3">
        {loading ? (
          <div className="flex h-24 items-center justify-center text-sm text-muted">
            <Loader2 className="mr-2 size-4 animate-spin" />
            Loading activity
          </div>
        ) : activities.length ? (
          activities.map((activity) => {
            const Icon = typeIcons[activity.type] || Sparkles;
            return (
              <div key={activity.id} className="flex gap-3 rounded-2xl border border-sidebar-border p-3">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-brand-deep/10 text-brand-glow-text">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <p className="text-sm font-bold text-foreground">{activity.title}</p>
                    <p className="text-xs text-muted">{formatDate(activity.created_at)}</p>
                  </div>
                  {activity.body ? (
                    <p className="mt-1 whitespace-pre-line text-sm leading-6 text-muted">{activity.body}</p>
                  ) : null}
                </div>
              </div>
            );
          })
        ) : (
          <p className="rounded-2xl border border-dashed border-sidebar-border p-4 text-center text-sm text-muted">
            No activity yet. Notes, status changes, and agent runs will appear here.
          </p>
        )}
      </div>
    </div>
  );
}
