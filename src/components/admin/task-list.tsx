"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Loader2, Plus, X } from "lucide-react";
import type { Lead, Task } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";

type TaskListProps = {
  getToken: () => Promise<string>;
  /** When set, scopes the list to one lead (used inside the lead drawer). */
  leadId?: string;
  /** Used in the global view to label which lead a task belongs to. */
  leads?: Lead[];
  compact?: boolean;
};

export function TaskList({ getToken, leadId, leads, compact = false }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadedAt, setLoadedAt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const leadNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const lead of leads || []) {
      map.set(lead.id, lead.name);
    }
    return map;
  }, [leads]);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = await getToken();
      const params = new URLSearchParams();
      if (leadId) {
        params.set("leadId", leadId);
      }
      const response = await fetch(`/api/admin/tasks?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not load tasks.");
      }

      setTasks(result.tasks || []);
      setLoadedAt(Date.now());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load tasks.");
    } finally {
      setLoading(false);
    }
  }, [getToken, leadId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadTasks();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadTasks]);

  async function addTask() {
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const token = await getToken();
      const response = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          leadId: leadId ?? null,
          title: trimmed,
          dueAt: dueDate ? new Date(`${dueDate}T09:00:00`).toISOString() : null,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not add task.");
      }

      setTitle("");
      setDueDate("");
      await loadTasks();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not add task.");
    } finally {
      setSaving(false);
    }
  }

  async function resolveTask(task: Task, status: "done" | "dismissed") {
    setError("");

    try {
      const token = await getToken();
      const response = await fetch("/api/admin/tasks", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: task.id, status }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not update task.");
      }

      setTasks((current) => current.filter((item) => item.id !== task.id));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Could not update task.");
    }
  }

  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void addTask();
            }
          }}
          className="h-11 rounded-full border border-border-subtle px-4 text-sm outline-none focus:border-brand-soft focus:ring-4 focus:ring-brand/25"
          placeholder={leadId ? "Add a follow-up for this lead…" : "Add a task…"}
        />
        <input
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          className="h-11 rounded-full border border-border-subtle px-4 text-sm text-muted outline-none focus:border-brand-soft focus:ring-4 focus:ring-brand/25"
          aria-label="Due date"
        />
        <button
          type="button"
          onClick={addTask}
          disabled={saving || !title.trim()}
          className="inline-flex h-11 items-center gap-1.5 rounded-full bg-brand-deep px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          Add
        </button>
      </div>

      {error ? <p className="mt-3 rounded-2xl bg-red-500/10 p-3 text-sm text-red-600">{error}</p> : null}

      <div className="mt-4 grid gap-2">
        {loading ? (
          <div className="flex h-24 items-center justify-center text-sm text-muted">
            <Loader2 className="mr-2 size-4 animate-spin" />
            Loading tasks
          </div>
        ) : tasks.length ? (
          tasks.map((task) => {
            const overdue = task.due_at ? new Date(task.due_at).getTime() < loadedAt : false;
            const leadName = task.lead_id ? leadNames.get(task.lead_id) : null;
            return (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-2xl border border-border-subtle p-3"
              >
                <button
                  type="button"
                  onClick={() => resolveTask(task, "done")}
                  className="grid size-8 shrink-0 place-items-center rounded-full border border-border-subtle text-muted transition hover:border-emerald-500 hover:text-emerald-600"
                  title="Mark done"
                >
                  <Check className="size-4" />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-foreground">{task.title}</p>
                  <p className="text-xs text-muted">
                    {task.due_at ? (
                      <span className={overdue ? "font-bold text-red-600" : ""}>
                        Due {formatDate(task.due_at)}
                      </span>
                    ) : (
                      "No due date"
                    )}
                    {!compact && leadName ? ` · ${leadName}` : null}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => resolveTask(task, "dismissed")}
                  className="grid size-8 shrink-0 place-items-center rounded-full text-muted transition hover:text-red-600"
                  title="Dismiss"
                >
                  <X className="size-4" />
                </button>
              </div>
            );
          })
        ) : (
          <p className="rounded-2xl border border-dashed border-border-subtle p-4 text-center text-sm text-muted">
            No open tasks. You&apos;re all caught up.
          </p>
        )}
      </div>
    </div>
  );
}
