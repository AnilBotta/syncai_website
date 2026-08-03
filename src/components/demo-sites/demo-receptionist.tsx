"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

/**
 * The demo site's AI receptionist, embedded open in the page rather than hidden
 * in a corner bubble — it's the whole point of the demo, so it shouldn't need
 * finding. Client wrapper because `ssr: false` is not allowed in Server
 * Components.
 *
 * Points at /api/demos/<slug>/chat, whose tools write to nothing. It must never
 * be pointed at /api/chat: that executor books real appointments.
 */
const ChatPanel = dynamic(
  () => import("@/components/assistant/chat-panel").then((mod) => mod.ChatPanel),
  {
    ssr: false,
    loading: () => (
      <div className="grid flex-1 place-items-center bg-bg-elevated text-muted">
        <Loader2 className="size-5 animate-spin" />
      </div>
    ),
  }
);

type DemoReceptionistProps = {
  slug: string;
  business: string;
  welcome: string;
  starters: string[];
};

export function DemoReceptionist({ slug, business, welcome, starters }: DemoReceptionistProps) {
  return (
    <div className="flex h-[560px] flex-col overflow-hidden rounded-3xl border border-border-subtle bg-bg-elevated shadow-[0_18px_50px_rgba(38,48,43,0.10)]">
      <div className="flex items-center gap-3 border-b border-border-subtle px-5 py-4">
        <span className="grid size-10 place-items-center rounded-full bg-brand text-sm font-bold text-white">
          {initials(business)}
        </span>
        <div>
          <p className="text-sm font-bold text-foreground">{business}</p>
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <span className="size-1.5 rounded-full bg-success" />
            Reception — replies instantly
          </p>
        </div>
      </div>

      <ChatPanel
        endpoint={`/api/demos/${slug}/chat`}
        welcome={welcome}
        starters={starters}
        storageKey={`demo-${slug}-transcript`}
        placeholder="Ask a question or request a time…"
      />
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}
