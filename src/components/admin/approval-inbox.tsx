"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, FileText, Loader2, Mail, Pencil, Receipt, X } from "lucide-react";
import type { Approval, Document, Email, Invoice } from "@/lib/supabase";

const cad = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 2 });
import { formatDate } from "@/lib/utils";

type ApprovalInboxProps = {
  getToken: () => Promise<string>;
  onCountChange?: (count: number) => void;
};

export function ApprovalInbox({ getToken, onCountChange }: ApprovalInboxProps) {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [selected, setSelected] = useState<Approval | null>(null);
  const [emailPreview, setEmailPreview] = useState<Email | null>(null);
  const [docPreview, setDocPreview] = useState<Document | null>(null);
  const [invoicePreview, setInvoicePreview] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");
  const [error, setError] = useState("");
  const [demoMode, setDemoMode] = useState(false);

  const loadApprovals = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = await getToken();
      const response = await fetch("/api/admin/approvals?status=pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not load approvals.");
      }

      const items: Approval[] = result.approvals || [];
      setApprovals(items);
      setSelected((current) => current && items.find((a) => a.id === current.id) ? current : items[0] || null);
      setDemoMode(Boolean(result.demoMode));
      onCountChange?.(items.length);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load approvals.");
    } finally {
      setLoading(false);
    }
  }, [getToken, onCountChange]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadApprovals();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadApprovals]);

  // Load the underlying email whenever an email approval is selected.
  useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(() => {
      const isEmail = selected?.type === "email" || selected?.type === "negotiation_reply";
      const isDoc = selected?.type === "document";
      const isInvoice = selected?.type === "invoice";
      if (!selected || (!isEmail && !isDoc && !isInvoice) || !selected.entity_id) {
        setEmailPreview(null);
        setDocPreview(null);
        setInvoicePreview(null);
        setEditing(false);
        return;
      }

      void (async () => {
        try {
          const token = await getToken();
          if (isDoc) {
            const response = await fetch(`/api/admin/documents?leadId=${selected.lead_id ?? ""}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const result = await response.json();
            const match: Document | undefined = (result.documents || []).find(
              (d: Document) => d.id === selected.entity_id,
            );
            if (!cancelled) {
              setDocPreview(match || null);
              setEmailPreview(null);
              setInvoicePreview(null);
              setEditing(false);
            }
            return;
          }
          if (isInvoice) {
            const response = await fetch(`/api/admin/invoices?leadId=${selected.lead_id ?? ""}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const result = await response.json();
            const match: Invoice | undefined = (result.invoices || []).find(
              (i: Invoice) => i.id === selected.entity_id,
            );
            if (!cancelled) {
              setInvoicePreview(match || null);
              setEmailPreview(null);
              setDocPreview(null);
              setEditing(false);
            }
            return;
          }
          const response = await fetch(`/api/admin/emails?leadId=${selected.lead_id ?? ""}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const result = await response.json();
          const match: Email | undefined = (result.emails || []).find(
            (e: Email) => e.id === selected.entity_id,
          );
          if (!cancelled) {
            setEmailPreview(match || null);
            setDocPreview(null);
            setInvoicePreview(null);
            setEditing(false);
          }
        } catch {
          if (!cancelled) {
            setEmailPreview(null);
            setDocPreview(null);
            setInvoicePreview(null);
          }
        }
      })();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [selected, getToken]);

  async function decide(approval: Approval, decision: "approved" | "rejected") {
    setBusy(true);
    setError("");

    try {
      const token = await getToken();
      const response = await fetch("/api/admin/approvals", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: approval.id, decision }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not process decision.");
      }

      setSelected(null);
      await loadApprovals();
    } catch (decideError) {
      setError(decideError instanceof Error ? decideError.message : "Could not process decision.");
    } finally {
      setBusy(false);
    }
  }

  async function saveEdits() {
    if (!emailPreview) {
      return;
    }
    setBusy(true);
    setError("");

    try {
      const token = await getToken();
      const response = await fetch("/api/admin/emails", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: emailPreview.id, subject: editSubject, bodyText: editBody }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not save edits.");
      }

      setEmailPreview({ ...emailPreview, subject: editSubject, body_text: editBody });
      setEditing(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save edits.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
      <section className="rounded-[2rem] border border-border-subtle bg-bg-elevated p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-black text-foreground">Pending ({approvals.length})</p>
        </div>

        {demoMode ? (
          <div className="mt-4 rounded-2xl border border-amber-300/30 bg-amber-400/10 p-3 text-xs text-amber-700">
            Demo mode. Connect Supabase + Resend to manage live approvals.
          </div>
        ) : null}

        <div className="mt-4 grid gap-2">
          {loading ? (
            <div className="flex h-32 items-center justify-center text-sm text-muted">
              <Loader2 className="mr-2 size-4 animate-spin" />
              Loading
            </div>
          ) : approvals.length ? (
            approvals.map((approval) => (
              <button
                type="button"
                key={approval.id}
                onClick={() => setSelected(approval)}
                className={`rounded-2xl border p-3 text-left transition ${
                  selected?.id === approval.id
                    ? "border-brand-soft bg-brand-deep/15"
                    : "border-border-subtle hover:border-brand-soft"
                }`}
              >
                <div className="flex items-center gap-2">
                  {approval.type === "document" ? (
                    <FileText className="size-4 shrink-0 text-brand-glow-text" />
                  ) : approval.type === "invoice" ? (
                    <Receipt className="size-4 shrink-0 text-brand-glow-text" />
                  ) : (
                    <Mail className="size-4 shrink-0 text-brand-glow-text" />
                  )}
                  <p className="min-w-0 truncate text-sm font-bold text-foreground">{approval.title}</p>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {approval.summary} · {formatDate(approval.created_at)}
                </p>
              </button>
            ))
          ) : (
            <p className="rounded-2xl border border-dashed border-border-subtle p-6 text-center text-sm text-muted">
              Nothing awaiting approval. Drafts from you and your agents will queue here.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-[2rem] border border-border-subtle bg-bg-elevated p-5 shadow-sm">
        {selected ? (
          <div>
            <div className="flex items-start justify-between gap-3 border-b border-border-subtle pb-4">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-muted">
                  {selected.type.replace("_", " ")}
                </p>
                <h3 className="mt-1 text-lg font-black text-foreground">{selected.title}</h3>
                <p className="mt-0.5 text-sm text-muted">{selected.summary}</p>
              </div>
              {emailPreview && !editing ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditSubject(emailPreview.subject);
                    setEditBody(emailPreview.body_text);
                    setEditing(true);
                  }}
                  className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-border-subtle px-4 text-sm font-bold text-muted transition hover:text-foreground"
                >
                  <Pencil className="size-4" />
                  Edit
                </button>
              ) : null}
            </div>

            {selected.type === "negotiation_reply" ? (
              <div className="mt-4 grid gap-2 rounded-2xl border border-border-subtle bg-surface p-4 text-sm">
                <p className="text-xs font-black uppercase tracking-wider text-muted">Negotiation math</p>
                {typeof selected.meta?.their_ask === "string" ? (
                  <p><span className="font-bold text-foreground">Their ask:</span> {String(selected.meta.their_ask)}</p>
                ) : null}
                {selected.meta?.proposed_price != null ? (
                  <p>
                    <span className="font-bold text-foreground">Proposed:</span> ${String(selected.meta.proposed_price)}
                    {selected.meta?.discount_pct != null ? ` (${String(selected.meta.discount_pct)}% off)` : ""}
                    {selected.meta?.floor_price != null ? ` · floor $${String(selected.meta.floor_price)} ✓` : ""}
                  </p>
                ) : null}
                {typeof selected.meta?.rationale === "string" ? (
                  <p className="text-muted">{String(selected.meta.rationale)}</p>
                ) : null}
              </div>
            ) : null}

            {emailPreview ? (
              editing ? (
                <div className="mt-4 grid gap-3">
                  <input
                    value={editSubject}
                    onChange={(event) => setEditSubject(event.target.value)}
                    className="h-11 rounded-full border border-border-subtle px-4 text-sm outline-none focus:border-brand-soft focus:ring-4 focus:ring-brand/25"
                  />
                  <textarea
                    value={editBody}
                    onChange={(event) => setEditBody(event.target.value)}
                    rows={10}
                    className="resize-none rounded-2xl border border-border-subtle p-3 text-sm leading-6 outline-none focus:border-brand-soft focus:ring-4 focus:ring-brand/25"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={saveEdits}
                      disabled={busy}
                      className="inline-flex h-10 items-center rounded-full bg-brand-deep px-5 text-sm font-bold text-white disabled:opacity-60"
                    >
                      Save edits
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="inline-flex h-10 items-center rounded-full border border-border-subtle px-5 text-sm font-bold text-muted"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl bg-surface p-4">
                  <p className="text-sm font-black text-foreground">{emailPreview.subject}</p>
                  <p className="mt-0.5 text-xs text-muted">To: {emailPreview.to_email}</p>
                  <p className="mt-3 whitespace-pre-line text-sm leading-6 text-foreground/90">
                    {emailPreview.body_text}
                  </p>
                </div>
              )
            ) : selected.type === "document" ? (
              docPreview ? (
                <div className="mt-4 rounded-2xl bg-surface p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 shrink-0 text-brand-glow-text" />
                    <p className="text-sm font-black text-foreground">{docPreview.title}</p>
                  </div>
                  <p className="mt-0.5 text-xs text-muted">Approving emails the client a signable copy.</p>
                  <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap font-sans text-sm leading-6 text-foreground/90">
                    {docPreview.content_md}
                  </pre>
                </div>
              ) : (
                <div className="mt-4 flex h-24 items-center justify-center text-sm text-muted">
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Loading document
                </div>
              )
            ) : selected.type === "invoice" ? (
              invoicePreview ? (
                <div className="mt-4 rounded-2xl bg-surface p-4">
                  <div className="flex items-center gap-2">
                    <Receipt className="size-4 shrink-0 text-brand-glow-text" />
                    <p className="text-sm font-black text-foreground">{invoicePreview.number}</p>
                    <span className="ml-auto text-xs font-bold text-muted">
                      {invoicePreview.method === "stripe" ? "Stripe" : "e-transfer"}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-1.5">
                    {invoicePreview.line_items.map((li, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-foreground/90">
                          {li.description} <span className="text-muted">× {li.quantity}</span>
                        </span>
                        <span className="font-semibold text-foreground">
                          {cad.format((Number(li.quantity) || 0) * (Number(li.unit_amount) || 0))}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-border-subtle pt-3">
                    <span className="text-sm font-black text-foreground">Total</span>
                    <span className="text-sm font-black text-foreground">{cad.format(Number(invoicePreview.amount))}</span>
                  </div>
                  {invoicePreview.due_on ? (
                    <p className="mt-1 text-xs text-muted">Due {invoicePreview.due_on}</p>
                  ) : null}
                  <p className="mt-2 text-xs text-muted">Approving sends this invoice to the client.</p>
                </div>
              ) : (
                <div className="mt-4 flex h-24 items-center justify-center text-sm text-muted">
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Loading invoice
                </div>
              )
            ) : selected.type === "email" || selected.type === "negotiation_reply" ? (
              <div className="mt-4 flex h-24 items-center justify-center text-sm text-muted">
                <Loader2 className="mr-2 size-4 animate-spin" />
                Loading email
              </div>
            ) : (
              <p className="mt-4 rounded-2xl bg-surface p-4 text-sm text-muted">
                This approval type is handled in a later phase.
              </p>
            )}

            {error ? <p className="mt-4 rounded-2xl bg-red-500/10 p-3 text-sm text-red-600">{error}</p> : null}

            {!editing ? (
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => decide(selected, "approved")}
                  disabled={busy}
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-emerald-600 px-6 text-sm font-black text-white disabled:opacity-60"
                >
                  {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                  Approve &amp; send
                </button>
                <button
                  type="button"
                  onClick={() => decide(selected, "rejected")}
                  disabled={busy}
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-border-subtle px-6 text-sm font-bold text-muted transition hover:text-red-600 disabled:opacity-60"
                >
                  <X className="size-4" />
                  Reject
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="flex min-h-72 items-center justify-center text-sm text-muted">
            Select an item to review.
          </div>
        )}
      </section>
    </div>
  );
}
