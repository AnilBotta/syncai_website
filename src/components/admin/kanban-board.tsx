"use client";

import { useState } from "react";
import { leadStatuses, type LeadStatus } from "@/lib/site-data";
import type { Lead } from "@/lib/supabase";

const currency = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
});

function leadAgeDays(lead: Lead) {
  return Math.max(0, Math.floor((Date.now() - new Date(lead.created_at).getTime()) / 86400000));
}

type KanbanBoardProps = {
  leads: Lead[];
  onMove: (lead: Lead, status: LeadStatus) => Promise<void>;
  onSelect: (lead: Lead) => void;
};

export function KanbanBoard({ leads, onMove, onSelect }: KanbanBoardProps) {
  const [dragOver, setDragOver] = useState<LeadStatus | null>(null);

  function handleDrop(event: React.DragEvent, status: LeadStatus) {
    event.preventDefault();
    setDragOver(null);
    const id = event.dataTransfer.getData("text/plain");
    const lead = leads.find((item) => item.id === id);
    if (lead && lead.status !== status) {
      void onMove(lead, status);
    }
  }

  return (
    <div className="grid gap-4 overflow-x-auto pb-4 lg:grid-cols-3 xl:grid-cols-6">
      {leadStatuses.map((column) => {
        const columnLeads = leads.filter((lead) => lead.status === column.value);
        const columnValue = columnLeads.reduce((sum, lead) => sum + (Number(lead.value) || 0), 0);

        return (
          <section
            key={column.value}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(column.value);
            }}
            onDragLeave={() => setDragOver((current) => (current === column.value ? null : current))}
            onDrop={(event) => handleDrop(event, column.value)}
            className={`min-w-56 rounded-3xl border p-3 transition ${
              dragOver === column.value
                ? "border-brand-soft bg-brand-deep/10"
                : "border-border-subtle bg-bg-elevated/70"
            }`}
          >
            <header className="flex items-baseline justify-between px-1">
              <p className="text-sm font-black text-foreground">{column.label}</p>
              <p className="text-xs font-bold text-muted">{columnLeads.length}</p>
            </header>
            <p className="px-1 text-xs text-muted">{columnValue > 0 ? currency.format(columnValue) : "—"}</p>

            <div className="mt-3 grid gap-2">
              {columnLeads.map((lead) => (
                <article
                  key={lead.id}
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData("text/plain", lead.id);
                    event.dataTransfer.effectAllowed = "move";
                  }}
                  onClick={() => onSelect(lead)}
                  className="cursor-pointer rounded-2xl border border-border-subtle bg-bg-elevated p-3 shadow-sm transition hover:border-brand-soft"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 truncate text-sm font-black text-foreground">{lead.name}</p>
                    {typeof lead.score === "number" ? (
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-black ${
                          lead.score >= 70
                            ? "bg-emerald-500/15 text-emerald-700"
                            : lead.score >= 40
                              ? "bg-amber-400/20 text-amber-700"
                              : "bg-red-500/10 text-red-600"
                        }`}
                        title="AI qualification score"
                      >
                        {lead.score}
                      </span>
                    ) : null}
                  </div>
                  {lead.company ? (
                    <p className="mt-0.5 truncate text-xs text-muted">{lead.company}</p>
                  ) : null}
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-brand-glow-text">
                      {Number(lead.value) > 0 ? currency.format(Number(lead.value)) : "No value"}
                    </p>
                    <p className="text-[11px] text-muted">{leadAgeDays(lead)}d</p>
                  </div>
                  {/* Always-available fallback for touch devices where drag doesn't work. */}
                  <select
                    value={lead.status}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) => {
                      event.stopPropagation();
                      void onMove(lead, event.target.value as LeadStatus);
                    }}
                    className="mt-2 h-8 w-full rounded-full border border-border-subtle bg-transparent px-2 text-xs font-semibold text-muted outline-none focus:border-brand-soft"
                    aria-label={`Move ${lead.name} to stage`}
                  >
                    {leadStatuses.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </article>
              ))}
              {columnLeads.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-border-subtle p-3 text-center text-xs text-muted">
                  Empty
                </p>
              ) : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}
