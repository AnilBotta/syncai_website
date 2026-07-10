import { ArrowRightLeft, Bot, FileText, ListChecks, Mail, MessageSquare, Phone, Sparkles } from "lucide-react";
import { formatDate } from "@/lib/utils";

type ActivityItem = {
  id: string;
  created_at: string;
  type: "note" | "status_change" | "email" | "agent_run" | "task" | "document" | "call" | "system";
  title: string;
  body?: string | null;
  lead_name?: string | null;
};

const typeIcons: Record<ActivityItem["type"], typeof MessageSquare> = {
  note: MessageSquare,
  status_change: ArrowRightLeft,
  email: Mail,
  agent_run: Bot,
  task: ListChecks,
  document: FileText,
  call: Phone,
  system: Sparkles,
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (!items.length) {
    return (
      <p className="rounded-2xl border border-dashed border-border-subtle p-6 text-center text-sm text-muted">
        No activity yet.
      </p>
    );
  }

  return (
    <div className="grid gap-2.5">
      {items.map((item) => {
        const Icon = typeIcons[item.type] || Sparkles;
        return (
          <div key={item.id} className="flex gap-3 rounded-2xl border border-border-subtle p-3">
            <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-brand-deep/10 text-brand-glow-text">
              <Icon className="size-4" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <p className="text-sm font-bold text-foreground">
                  {item.lead_name ? `${item.lead_name} — ` : ""}
                  {item.title}
                </p>
                <p className="text-xs text-muted">{formatDate(item.created_at)}</p>
              </div>
              {item.body ? <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted">{item.body}</p> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
