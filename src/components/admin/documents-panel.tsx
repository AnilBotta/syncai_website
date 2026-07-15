"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, FileText, Loader2 } from "lucide-react";
import type { Document } from "@/lib/supabase";
import { documentTypes } from "@/lib/site-data";
import { formatDate } from "@/lib/utils";

type DocumentsPanelProps = {
  leadId: string;
  getToken: () => Promise<string>;
};

const statusStyles: Record<Document["status"], string> = {
  draft: "bg-surface text-muted",
  approved: "bg-brand-deep/15 text-brand-glow-text",
  sent: "bg-brand-deep/15 text-brand-glow-text",
  viewed: "bg-warn-soft text-warn",
  accepted: "bg-success-soft text-success",
  cancelled: "bg-danger-soft text-danger",
};

export function DocumentsPanel({ leadId, getToken }: DocumentsPanelProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState(documentTypes[0].value);
  const [instruction, setInstruction] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [copiedId, setCopiedId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const response = await fetch(`/api/admin/documents?leadId=${leadId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (response.ok) setDocuments(result.documents || []);
    } catch {
      // Non-critical; panel just shows empty.
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

  async function generate() {
    setGenerating(true);
    setError("");
    setNotice("");
    try {
      const token = await getToken();
      const response = await fetch("/api/admin/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ leadId, type, instruction }),
      });
      const result = await response.json();
      if (!response.ok || result.ok === false) throw new Error(result.error || "Could not generate document.");
      setNotice("Drafted → Approval Inbox. Approve it there to email a signable copy.");
      setInstruction("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate document.");
    } finally {
      setGenerating(false);
    }
  }

  async function copyLink(doc: Document) {
    const url = `${window.location.origin}/accept/${doc.accept_token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(doc.id);
      window.setTimeout(() => setCopiedId(""), 1500);
    } catch {
      // Clipboard may be unavailable; ignore.
    }
  }

  return (
    <div className="grid gap-3">
      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <select
          value={type}
          onChange={(event) => setType(event.target.value as typeof type)}
          className="h-10 rounded-full border border-sidebar-border px-4 text-sm font-bold text-foreground outline-none focus:border-brand-soft focus:ring-4 focus:ring-brand/25"
        >
          {documentTypes.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={generate}
          disabled={generating}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-brand-deep px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {generating ? <Loader2 className="size-4 animate-spin" /> : <FileText className="size-4" />}
          Generate
        </button>
      </div>
      <input
        value={instruction}
        onChange={(event) => setInstruction(event.target.value)}
        placeholder="Optional: special instructions (e.g. 3-month engagement, include SEO scope)"
        className="h-10 rounded-full border border-sidebar-border px-4 text-sm outline-none focus:border-brand-soft focus:ring-4 focus:ring-brand/25"
      />

      {notice ? <p className="text-xs font-bold text-success">{notice}</p> : null}
      {error ? <p className="rounded-2xl bg-danger-soft p-3 text-sm text-danger">{error}</p> : null}

      <div className="grid gap-2">
        {loading ? (
          <div className="flex h-16 items-center justify-center text-sm text-muted">
            <Loader2 className="mr-2 size-4 animate-spin" />
            Loading
          </div>
        ) : documents.length ? (
          documents.map((doc) => (
            <div key={doc.id} className="rounded-2xl border border-sidebar-border p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="min-w-0 truncate text-sm font-bold text-foreground">{doc.title}</p>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-black capitalize ${statusStyles[doc.status]}`}>
                  {doc.status}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <p className="text-xs text-muted">{formatDate(doc.created_at)}</p>
                {["sent", "viewed", "accepted"].includes(doc.status) ? (
                  <button
                    type="button"
                    onClick={() => copyLink(doc)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-glow-text"
                  >
                    {copiedId === doc.id ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    {copiedId === doc.id ? "Copied" : "Copy link"}
                  </button>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-sidebar-border p-4 text-center text-sm text-muted">
            No documents yet. Generate a proposal or agreement — it lands in Approvals first.
          </p>
        )}
      </div>
    </div>
  );
}
