"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import type { Lead } from "@/lib/supabase";

type EmailComposerProps = {
  getToken: () => Promise<string>;
  lead?: Lead | null;
  defaultTo?: string;
  onClose: () => void;
  onCreated?: () => void;
};

export function EmailComposer({ getToken, lead, defaultTo, onClose, onCreated }: EmailComposerProps) {
  const [to, setTo] = useState(defaultTo || lead?.email || "");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState(lead ? `Hi ${lead.name.split(" ")[0]},\n\n` : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function createDraft() {
    if (!to.trim() || !subject.trim() || !body.trim()) {
      setError("To, subject, and message are all required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const token = await getToken();
      const response = await fetch("/api/admin/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          leadId: lead?.id ?? null,
          toEmail: to.trim(),
          subject: subject.trim(),
          bodyText: body.trim(),
          source: "manual",
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not create draft.");
      }

      setDone(true);
      onCreated?.();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Could not create draft.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close composer"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-lg rounded-[var(--radius-card-lg)] border border-sidebar-border bg-white p-6 shadow-pop">
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-black text-foreground">Compose email</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-full border border-sidebar-border text-muted transition hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {done ? (
          <div className="mt-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700">
            Draft created and sent to your Approval Inbox. Nothing is emailed until you approve it there.
            <button
              type="button"
              onClick={onClose}
              className="mt-3 inline-flex h-10 items-center rounded-full bg-brand-deep px-5 text-sm font-bold text-white"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="mt-5 grid gap-4">
            <label className="grid gap-1.5 text-xs font-black uppercase tracking-wider text-muted">
              To
              <input
                value={to}
                onChange={(event) => setTo(event.target.value)}
                type="email"
                className="h-11 rounded-full border border-sidebar-border px-4 text-sm font-normal text-foreground outline-none focus:border-brand-soft focus:ring-4 focus:ring-brand/25"
              />
            </label>
            <label className="grid gap-1.5 text-xs font-black uppercase tracking-wider text-muted">
              Subject
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="h-11 rounded-full border border-sidebar-border px-4 text-sm font-normal text-foreground outline-none focus:border-brand-soft focus:ring-4 focus:ring-brand/25"
              />
            </label>
            <label className="grid gap-1.5 text-xs font-black uppercase tracking-wider text-muted">
              Message
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                rows={8}
                className="resize-none rounded-2xl border border-sidebar-border p-3 text-sm font-normal leading-6 text-foreground outline-none focus:border-brand-soft focus:ring-4 focus:ring-brand/25"
              />
            </label>

            <p className="text-xs text-muted">
              A CASL-compliant footer (business address + one-click unsubscribe) is added automatically at send time.
            </p>

            {error ? <p className="rounded-2xl bg-red-500/10 p-3 text-sm text-red-600">{error}</p> : null}

            <button
              type="button"
              onClick={createDraft}
              disabled={saving}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand-deep px-6 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              Save to Approval Inbox
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
