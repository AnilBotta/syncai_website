"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Handshake, Loader2, Mail, Microscope, Receipt, Sparkles, X } from "lucide-react";
import { leadStatuses } from "@/lib/site-data";
import type { Lead } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import { ActivityTimeline } from "@/components/admin/activity-timeline";
import { TaskList } from "@/components/admin/task-list";
import { EmailComposer } from "@/components/admin/email-composer";
import { SequenceEnroll } from "@/components/admin/sequence-enroll";
import { DocumentsPanel } from "@/components/admin/documents-panel";
import { InvoiceComposer } from "@/components/admin/invoice-composer";

type LeadDrawerProps = {
  lead: Lead;
  getToken: () => Promise<string>;
  onClose: () => void;
  onSaved: (lead: Lead) => void;
};

export function LeadDrawer({ lead, getToken, onClose, onSaved }: LeadDrawerProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showRules, setShowRules] = useState(false);
  const [composing, setComposing] = useState(false);
  const [invoicing, setInvoicing] = useState(false);
  const [agentBusy, setAgentBusy] = useState<"qualify" | "research" | "outreach" | null>(null);
  const [agentNotice, setAgentNotice] = useState("");
  const [researchBrief, setResearchBrief] = useState<Record<string, unknown> | null>(null);
  const [negotiating, setNegotiating] = useState(false);
  const [showNegotiate, setShowNegotiate] = useState(false);
  const [threadContext, setThreadContext] = useState("");
  const [negotiationResult, setNegotiationResult] = useState<Record<string, unknown> | null>(null);

  async function runNegotiate() {
    if (!threadContext.trim()) return;
    setNegotiating(true);
    setAgentNotice("");
    setError("");
    setNegotiationResult(null);
    try {
      const token = await getToken();
      const response = await fetch("/api/admin/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ agent: "negotiate", leadId: lead.id, threadContext }),
      });
      const result = await response.json();
      if (!response.ok || result.ok === false) {
        throw new Error(result.error || "Negotiation failed.");
      }
      setNegotiationResult(result.data);
      setAgentNotice(
        result.data.escalated
          ? "Escalated to you — a task was created instead of a draft."
          : "Counter-offer drafted → Approval Inbox.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Negotiation failed.");
    } finally {
      setNegotiating(false);
    }
  }

  async function runAgent(agent: "qualify" | "research" | "outreach") {
    setAgentBusy(agent);
    setAgentNotice("");
    setError("");
    try {
      const token = await getToken();
      const response = await fetch("/api/admin/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ agent, leadId: lead.id }),
      });
      const result = await response.json();
      if (!response.ok || result.ok === false) {
        throw new Error(result.error || `${agent} failed.`);
      }
      if (agent === "qualify" && result.data) {
        onSaved({
          ...lead,
          score: Math.round(result.data.score),
          score_rationale: result.data.rationale,
          next_action: result.data.suggested_next_action,
        });
        setAgentNotice(`Qualified: ${Math.round(result.data.score)}/100.`);
      } else if (agent === "research" && result.data) {
        setResearchBrief(result.data);
        setAgentNotice(`Research brief ready (${result.data.grounding === "web_search" ? "web search" : "model knowledge"}).`);
      } else if (agent === "outreach") {
        setAgentNotice("Outreach drafted → Approval Inbox.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : `${agent} failed.`);
    } finally {
      setAgentBusy(null);
    }
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function save(formData: FormData) {
    setSaving(true);
    setError("");

    try {
      const token = await getToken();
      const payload = {
        id: lead.id,
        status: String(formData.get("status") || lead.status),
        notes: String(formData.get("notes") || ""),
        value: Number(formData.get("value") || 0),
        nextAction: String(formData.get("nextAction") || ""),
        floorPrice: formData.get("floorPrice") ? Number(formData.get("floorPrice")) : null,
        maxDiscountPct: formData.get("maxDiscountPct") ? Number(formData.get("maxDiscountPct")) : null,
        concessionNotes: String(formData.get("concessionNotes") || ""),
      };

      const response = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not save lead.");
      }

      onSaved({
        ...lead,
        status: payload.status as Lead["status"],
        notes: payload.notes,
        value: payload.value,
        next_action: payload.nextAction,
        floor_price: payload.floorPrice,
        max_discount_pct: payload.maxDiscountPct,
        concession_notes: payload.concessionNotes,
        won_at:
          payload.status === "won"
            ? lead.won_at || new Date().toISOString()
            : lead.status === "won"
              ? null
              : lead.won_at,
      });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save lead.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close lead details"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col overflow-y-auto border-l border-border-subtle bg-bg-elevated shadow-2xl">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border-subtle bg-bg-elevated px-6 py-5">
          <div>
            <h2 className="text-2xl font-black text-foreground">{lead.name}</h2>
            <p className="mt-1 text-sm text-muted">
              {lead.company ? `${lead.company} · ` : ""}
              Added {formatDate(lead.created_at)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setComposing(true)}
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-brand-deep px-4 text-sm font-bold text-white"
            >
              <Mail className="size-4" />
              Email
            </button>
            <button
              type="button"
              onClick={() => setInvoicing(true)}
              className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border-subtle px-4 text-sm font-bold text-muted transition hover:text-foreground"
            >
              <Receipt className="size-4" />
              Invoice
            </button>
            <button
              type="button"
              onClick={onClose}
              className="grid size-10 place-items-center rounded-full border border-border-subtle text-muted transition hover:text-foreground"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          </div>
        </header>

        <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle px-6 py-3">
          <button
            type="button"
            onClick={() => runAgent("qualify")}
            disabled={agentBusy !== null}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border-subtle px-3 text-xs font-bold text-muted transition hover:text-foreground disabled:opacity-50"
          >
            {agentBusy === "qualify" ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5 text-brand-glow-text" />}
            Qualify
          </button>
          <button
            type="button"
            onClick={() => runAgent("research")}
            disabled={agentBusy !== null}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border-subtle px-3 text-xs font-bold text-muted transition hover:text-foreground disabled:opacity-50"
          >
            {agentBusy === "research" ? <Loader2 className="size-3.5 animate-spin" /> : <Microscope className="size-3.5 text-brand-glow-text" />}
            Research
          </button>
          <button
            type="button"
            onClick={() => runAgent("outreach")}
            disabled={agentBusy !== null}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border-subtle px-3 text-xs font-bold text-muted transition hover:text-foreground disabled:opacity-50"
          >
            {agentBusy === "outreach" ? <Loader2 className="size-3.5 animate-spin" /> : <Mail className="size-3.5 text-brand-glow-text" />}
            Draft outreach
          </button>
          <button
            type="button"
            onClick={() => setShowNegotiate((current) => !current)}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border-subtle px-3 text-xs font-bold text-muted transition hover:text-foreground"
          >
            <Handshake className="size-3.5 text-brand-glow-text" />
            Negotiate
          </button>
          {agentNotice ? <span className="text-xs font-bold text-emerald-700">{agentNotice}</span> : null}
        </div>

        {showNegotiate ? (
          <div className="border-b border-border-subtle px-6 py-4">
            <p className="text-sm font-black text-foreground">Negotiate within deal rules</p>
            <p className="mt-1 text-xs leading-5 text-muted">
              Paste what the prospect asked for. The Negotiator checks it against this lead&apos;s floor price and max
              discount below — if it&apos;s within the rules it drafts a counter into the Approval Inbox; if not, it
              escalates to you instead of drafting anything.
            </p>
            <textarea
              value={threadContext}
              onChange={(event) => setThreadContext(event.target.value)}
              rows={3}
              placeholder="e.g. They're asking for 30% off and a 90-day payment plan…"
              className="mt-3 w-full resize-none rounded-2xl border border-border-subtle p-3 text-sm leading-6 outline-none focus:border-brand-soft focus:ring-4 focus:ring-brand/25"
            />
            <button
              type="button"
              onClick={runNegotiate}
              disabled={negotiating || !threadContext.trim()}
              className="mt-3 inline-flex h-10 items-center gap-2 rounded-full bg-brand-deep px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {negotiating ? <Loader2 className="size-4 animate-spin" /> : <Handshake className="size-4" />}
              Get negotiation advice
            </button>

            {negotiationResult ? (
              <div className="mt-4 grid gap-2 rounded-2xl bg-surface p-4 text-sm">
                <p>
                  <span className="font-black text-foreground">Their ask:</span>{" "}
                  {String(negotiationResult.their_ask ?? "—")}
                </p>
                <p>
                  <span className="font-black text-foreground">Their leverage:</span>{" "}
                  {String(negotiationResult.their_leverage ?? "—")}
                </p>
                <p>
                  <span className="font-black text-foreground">Our leverage:</span>{" "}
                  {String(negotiationResult.our_leverage ?? "—")}
                </p>
                {negotiationResult.escalated ? (
                  <div className="mt-1 rounded-2xl border border-amber-300/40 bg-amber-400/10 p-3 text-amber-700">
                    <p className="font-black">Escalated to you</p>
                    <p className="mt-1">{String(negotiationResult.reason ?? negotiationResult.rationale ?? "")}</p>
                  </div>
                ) : (
                  <div className="mt-1 rounded-2xl border border-emerald-300/40 bg-emerald-400/10 p-3 text-emerald-700">
                    <p className="font-black">
                      Drafted: ${String(negotiationResult.proposed_price ?? "—")}
                      {negotiationResult.discount_pct != null ? ` (${String(negotiationResult.discount_pct)}% off)` : ""}
                    </p>
                    <p className="mt-1">{String(negotiationResult.rationale ?? "")}</p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        ) : null}

        {researchBrief ? (
          <div className="border-b border-border-subtle px-6 py-4">
            <p className="text-sm font-black text-foreground">Research brief</p>
            <pre className="mt-2 max-h-56 overflow-auto rounded-2xl bg-surface p-3 text-xs leading-5 text-muted">
              {JSON.stringify(researchBrief, null, 2)}
            </pre>
          </div>
        ) : null}

        <form action={save} className="grid gap-5 px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-xs font-black uppercase tracking-wider text-muted">
              Stage
              <select
                name="status"
                defaultValue={lead.status}
                className="h-11 rounded-full border border-border-subtle px-4 text-sm font-bold text-foreground outline-none focus:border-brand-soft focus:ring-4 focus:ring-brand/25"
              >
                {leadStatuses.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-xs font-black uppercase tracking-wider text-muted">
              Deal value (CAD)
              <input
                name="value"
                type="number"
                min={0}
                step={100}
                defaultValue={Number(lead.value) || 0}
                className="h-11 rounded-full border border-border-subtle px-4 text-sm font-bold text-foreground outline-none focus:border-brand-soft focus:ring-4 focus:ring-brand/25"
              />
            </label>
          </div>

          <label className="grid gap-1.5 text-xs font-black uppercase tracking-wider text-muted">
            Next action
            <input
              name="nextAction"
              defaultValue={lead.next_action || ""}
              placeholder="e.g. Send case study, follow up Friday"
              className="h-11 rounded-full border border-border-subtle px-4 text-sm font-normal text-foreground outline-none focus:border-brand-soft focus:ring-4 focus:ring-brand/25"
            />
          </label>

          <div className="grid gap-3 rounded-3xl bg-surface p-4 text-sm">
            <p className="font-black text-foreground">Contact</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <ContactRow label="Email" value={lead.email} />
              <ContactRow label="Phone" value={lead.phone || "—"} />
              <ContactRow label="Industry" value={lead.industry || "—"} />
              <ContactRow label="Source" value={lead.source} />
            </div>
          </div>

          <div className="rounded-3xl bg-surface p-4">
            <p className="text-sm font-black text-foreground">Business challenge</p>
            <p className="mt-1.5 text-sm leading-6 text-muted">{lead.pain_point}</p>
          </div>

          {lead.score != null ? (
            <div className="rounded-3xl border border-border-subtle p-4">
              <p className="text-sm font-black text-foreground">AI qualification score: {lead.score}/100</p>
              {lead.score_rationale ? (
                <p className="mt-1.5 text-sm leading-6 text-muted">{lead.score_rationale}</p>
              ) : null}
            </div>
          ) : null}

          <div className="rounded-3xl border border-border-subtle">
            <button
              type="button"
              onClick={() => setShowRules((current) => !current)}
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-black text-foreground"
            >
              Deal rules (negotiation guardrails)
              <ChevronDown className={`size-4 text-muted transition ${showRules ? "rotate-180" : ""}`} />
            </button>
            {showRules ? (
              <div className="grid gap-4 border-t border-border-subtle p-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-xs font-black uppercase tracking-wider text-muted">
                  Floor price (CAD)
                  <input
                    name="floorPrice"
                    type="number"
                    min={0}
                    step={100}
                    defaultValue={lead.floor_price ?? ""}
                    placeholder="Never go below"
                    className="h-11 rounded-full border border-border-subtle px-4 text-sm font-normal text-foreground outline-none focus:border-brand-soft focus:ring-4 focus:ring-brand/25"
                  />
                </label>
                <label className="grid gap-1.5 text-xs font-black uppercase tracking-wider text-muted">
                  Max discount %
                  <input
                    name="maxDiscountPct"
                    type="number"
                    min={0}
                    max={100}
                    defaultValue={lead.max_discount_pct ?? ""}
                    placeholder="e.g. 15"
                    className="h-11 rounded-full border border-border-subtle px-4 text-sm font-normal text-foreground outline-none focus:border-brand-soft focus:ring-4 focus:ring-brand/25"
                  />
                </label>
                <label className="grid gap-1.5 text-xs font-black uppercase tracking-wider text-muted sm:col-span-2">
                  Allowed concessions
                  <textarea
                    name="concessionNotes"
                    defaultValue={lead.concession_notes || ""}
                    rows={2}
                    placeholder="e.g. Can extend support to 60 days; no scope additions."
                    className="resize-none rounded-2xl border border-border-subtle p-3 text-sm font-normal leading-6 text-foreground outline-none focus:border-brand-soft focus:ring-4 focus:ring-brand/25"
                  />
                </label>
              </div>
            ) : (
              /* Keep values submitted even when the section is collapsed. */
              <div className="hidden">
                <input name="floorPrice" type="number" defaultValue={lead.floor_price ?? ""} readOnly />
                <input name="maxDiscountPct" type="number" defaultValue={lead.max_discount_pct ?? ""} readOnly />
                <textarea name="concessionNotes" defaultValue={lead.concession_notes || ""} readOnly />
              </div>
            )}
          </div>

          <label className="grid gap-1.5 text-xs font-black uppercase tracking-wider text-muted">
            Notes
            <textarea
              name="notes"
              defaultValue={lead.notes || ""}
              rows={4}
              placeholder="Call outcomes, context, proposal details…"
              className="resize-none rounded-2xl border border-border-subtle p-3 text-sm font-normal leading-6 text-foreground outline-none focus:border-brand-soft focus:ring-4 focus:ring-brand/25"
            />
          </label>

          {error ? <p className="rounded-2xl bg-red-500/10 p-3 text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand-deep px-6 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            Save lead
          </button>
        </form>

        <div className="border-t border-border-subtle px-6 py-5">
          <p className="text-sm font-black text-foreground">Documents</p>
          <div className="mt-3">
            <DocumentsPanel leadId={lead.id} getToken={getToken} />
          </div>
        </div>

        <div className="border-t border-border-subtle px-6 py-5">
          <p className="text-sm font-black text-foreground">Nurture sequence</p>
          <div className="mt-3">
            <SequenceEnroll leadId={lead.id} getToken={getToken} />
          </div>
        </div>

        <div className="border-t border-border-subtle px-6 py-5">
          <p className="text-sm font-black text-foreground">Follow-ups</p>
          <div className="mt-3">
            <TaskList getToken={getToken} leadId={lead.id} compact />
          </div>
        </div>

        <div className="border-t border-border-subtle px-6 py-5">
          <p className="text-sm font-black text-foreground">Activity</p>
          <div className="mt-3">
            <ActivityTimeline leadId={lead.id} getToken={getToken} />
          </div>
        </div>
      </aside>

      {composing ? (
        <EmailComposer getToken={getToken} lead={lead} onClose={() => setComposing(false)} />
      ) : null}

      {invoicing ? (
        <InvoiceComposer getToken={getToken} lead={lead} onClose={() => setInvoicing(false)} />
      ) : null}
    </div>
  );
}

function ContactRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-0.5 break-words text-sm font-semibold text-foreground/90">{value}</p>
    </div>
  );
}
