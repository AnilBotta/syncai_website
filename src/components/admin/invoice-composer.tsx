"use client";

import { useState } from "react";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import type { Lead } from "@/lib/supabase";

const cad = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 2 });

type LineItem = { description: string; quantity: string; unitAmount: string };

type InvoiceComposerProps = {
  getToken: () => Promise<string>;
  lead: Lead;
  onClose: () => void;
  onCreated?: () => void;
};

export function InvoiceComposer({ getToken, lead, onClose, onCreated }: InvoiceComposerProps) {
  const [items, setItems] = useState<LineItem[]>([
    { description: lead.company ? `AI project for ${lead.company}` : "AI project", quantity: "1", unitAmount: String(lead.value || "") },
  ]);
  const [method, setMethod] = useState<"stripe" | "etransfer">("etransfer");
  const [dueOn, setDueOn] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const total = items.reduce((sum, li) => sum + (Number(li.quantity) || 0) * (Number(li.unitAmount) || 0), 0);

  function updateItem(index: number, patch: Partial<LineItem>) {
    setItems((current) => current.map((li, i) => (i === index ? { ...li, ...patch } : li)));
  }

  async function create() {
    const lineItems = items
      .filter((li) => li.description.trim() && Number(li.unitAmount) > 0)
      .map((li) => ({ description: li.description.trim(), quantity: Number(li.quantity) || 1, unitAmount: Number(li.unitAmount) }));
    if (!lineItems.length) {
      setError("Add at least one line item with a description and amount.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const token = await getToken();
      const response = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ leadId: lead.id, lineItems, method, dueOn: dueOn || null, notes }),
      });
      const result = await response.json();
      if (!response.ok || result.ok === false) throw new Error(result.error || "Could not create invoice.");
      setDone(true);
      onCreated?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create invoice.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-overlay backdrop-blur-sm" />
      <div className="relative w-full max-w-lg rounded-[var(--radius-card-lg)] border border-sidebar-border bg-card p-6 shadow-pop backdrop-blur-xl">
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-black text-foreground">New invoice · {lead.name}</h2>
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
          <div className="mt-5 rounded-2xl border border-success/30 bg-success-soft p-4 text-sm text-success">
            Invoice drafted and sent to your Approval Inbox. It goes to the client only after you approve it there.
            <button
              type="button"
              onClick={onClose}
              className="mt-3 inline-flex h-10 items-center rounded-full bg-brand-deep px-5 text-sm font-bold text-white"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="mt-5 grid gap-3">
            <div className="grid gap-2">
              {items.map((li, i) => (
                <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2">
                  <input
                    value={li.description}
                    onChange={(event) => updateItem(i, { description: event.target.value })}
                    placeholder="Description"
                    className="h-10 rounded-full border border-sidebar-border px-3 text-sm outline-none focus:border-brand-soft focus:ring-4 focus:ring-brand/25"
                  />
                  <input
                    value={li.quantity}
                    onChange={(event) => updateItem(i, { quantity: event.target.value })}
                    type="number"
                    min={0}
                    className="h-10 w-14 rounded-full border border-sidebar-border px-2 text-center text-sm outline-none focus:border-brand-soft focus:ring-4 focus:ring-brand/25"
                  />
                  <input
                    value={li.unitAmount}
                    onChange={(event) => updateItem(i, { unitAmount: event.target.value })}
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="$"
                    className="h-10 w-24 rounded-full border border-sidebar-border px-3 text-sm outline-none focus:border-brand-soft focus:ring-4 focus:ring-brand/25"
                  />
                  <button
                    type="button"
                    onClick={() => setItems((current) => current.filter((_, idx) => idx !== i))}
                    disabled={items.length === 1}
                    className="grid size-8 place-items-center rounded-full border border-sidebar-border text-muted transition hover:text-danger disabled:opacity-40"
                    aria-label="Remove line"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setItems((current) => [...current, { description: "", quantity: "1", unitAmount: "" }])}
                className="inline-flex h-9 w-fit items-center gap-1.5 rounded-full border border-sidebar-border px-3 text-xs font-bold text-muted transition hover:text-foreground"
              >
                <Plus className="size-3.5" />
                Add line
              </button>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3">
              <span className="text-sm font-black text-foreground">Total</span>
              <span className="text-sm font-black text-foreground">{cad.format(total)}</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5 text-xs font-black uppercase tracking-wider text-muted">
                Method
                <select
                  value={method}
                  onChange={(event) => setMethod(event.target.value as "stripe" | "etransfer")}
                  className="h-11 rounded-full border border-sidebar-border px-4 text-sm font-bold text-foreground outline-none focus:border-brand-soft focus:ring-4 focus:ring-brand/25"
                >
                  <option value="etransfer">Interac e-Transfer</option>
                  <option value="stripe">Stripe (pay online)</option>
                </select>
              </label>
              <label className="grid gap-1.5 text-xs font-black uppercase tracking-wider text-muted">
                Due date
                <input
                  value={dueOn}
                  onChange={(event) => setDueOn(event.target.value)}
                  type="date"
                  className="h-11 rounded-full border border-sidebar-border px-4 text-sm font-normal text-foreground outline-none focus:border-brand-soft focus:ring-4 focus:ring-brand/25"
                />
              </label>
            </div>

            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={2}
              placeholder="Notes (optional) — shown on the invoice"
              className="resize-none rounded-2xl border border-sidebar-border p-3 text-sm leading-6 outline-none focus:border-brand-soft focus:ring-4 focus:ring-brand/25"
            />

            {error ? <p className="rounded-2xl bg-danger-soft p-3 text-sm text-danger">{error}</p> : null}

            <button
              type="button"
              onClick={create}
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
