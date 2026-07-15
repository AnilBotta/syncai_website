"use client";

import { useState } from "react";
import { leadStatuses, type LeadStatus } from "@/lib/site-data";
import type { Lead } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Badge, type BadgeTone } from "@/components/admin/ui/badge";

const currency = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
});

// Per-stage accent dot.
const stageDot: Record<string, string> = {
  new: "bg-info",
  contacted: "bg-brand",
  qualified: "bg-success",
  proposal: "bg-warn",
  won: "bg-success",
  lost: "bg-danger",
};

function scoreTone(score: number): BadgeTone {
  return score >= 70 ? "success" : score >= 40 ? "warn" : "danger";
}

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
            className={cn(
              "min-w-56 rounded-[var(--radius-card-lg)] border p-3 transition",
              dragOver === column.value
                ? "border-brand-soft bg-brand/[.06] ring-2 ring-brand/40"
                : "border-sidebar-border bg-card/70 backdrop-blur-lg",
            )}
          >
            <header className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className={cn("size-2 rounded-full", stageDot[column.value] || "bg-muted")} />
                <p className="text-sm font-black text-foreground">{column.label}</p>
                <Badge tone="neutral">{columnLeads.length}</Badge>
              </div>
            </header>
            <p className="mt-0.5 px-1 text-xs text-muted">{columnValue > 0 ? currency.format(columnValue) : "No value"}</p>

            <div className="mt-3 grid gap-2">
              {columnLeads.map((lead) => (
                // min-w-0: the card is a grid item, so it defaults to min-width:auto and
                // won't shrink below its content's min-content. The truncated lines below
                // are `white-space: nowrap`, whose min-content is the WHOLE string — so a
                // long company name blew the card way past its column and painted over the
                // next one. min-w-0 lets it shrink; overflow-hidden clips any stray child.
                <article
                  key={lead.id}
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData("text/plain", lead.id);
                    event.dataTransfer.effectAllowed = "move";
                  }}
                  onClick={() => onSelect(lead)}
                  className="min-w-0 cursor-pointer overflow-hidden rounded-[var(--radius-card)] border border-sidebar-border bg-card p-3 shadow-card transition-shadow hover:shadow-card-hover"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 truncate text-sm font-black text-foreground">{lead.name}</p>
                    {typeof lead.score === "number" ? (
                      <Badge tone={scoreTone(lead.score)} className="shrink-0">
                        {lead.score}
                      </Badge>
                    ) : null}
                  </div>
                  {lead.company ? <p className="mt-0.5 truncate text-xs text-muted">{lead.company}</p> : null}
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
                    className="mt-2 h-8 w-full rounded-full border border-sidebar-border bg-transparent px-2 text-xs font-semibold text-muted outline-none focus:border-brand-soft"
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
                <p className="rounded-[var(--radius-card)] border border-dashed border-sidebar-border p-3 text-center text-xs text-muted">
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
