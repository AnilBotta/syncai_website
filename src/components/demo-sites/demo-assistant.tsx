"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Loader2, MessageSquareText, Mic } from "lucide-react";
import { businessInitials } from "@/lib/demo-sites/initials";

/**
 * The demo site's assistant: chat, and — where the site enables it — live voice.
 *
 * Both panels stay mounted and are hidden with CSS rather than unmounted, so
 * switching tabs never drops a transcript. The voice panel is told whether it is
 * `active` so it can release the microphone when hidden. Same arrangement as the
 * floating SyncAI widget.
 *
 * `ssr: false` on both: the chat holds a session transcript and the voice panel
 * reaches for WebRTC and getUserMedia, neither of which exist on the server.
 */
const Loading = () => (
  <div className="grid flex-1 place-items-center bg-bg-elevated text-muted">
    <Loader2 className="size-5 animate-spin" />
  </div>
);

const ChatPanel = dynamic(
  () => import("@/components/assistant/chat-panel").then((mod) => mod.ChatPanel),
  { ssr: false, loading: Loading }
);

const DemoVoicePanel = dynamic(
  () => import("./demo-voice-panel").then((mod) => mod.DemoVoicePanel),
  { ssr: false, loading: Loading }
);

type DemoAssistantProps = {
  slug: string;
  business: string;
  welcome: string;
  starters: string[];
  assistantLabel: string;
  /** Undefined means this site is chat-only and no tabs are shown. */
  voice?: { invitation: string };
  /** Omit the outer card when the host already provides one. */
  bare?: boolean;
};

export function DemoAssistant({
  slug,
  business,
  welcome,
  starters,
  assistantLabel,
  voice,
  bare = false,
}: DemoAssistantProps) {
  const [tab, setTab] = useState<"chat" | "voice">("chat");

  return (
    <div
      className={
        bare
          ? "flex h-[520px] flex-col overflow-hidden"
          : "flex h-[560px] flex-col overflow-hidden rounded-3xl border border-border-subtle bg-bg-elevated shadow-[0_18px_50px_var(--accent-glow)]"
      }
    >
      <div
        className={`flex items-center gap-3 border-b border-border-subtle px-5 py-4 ${
          bare ? "hidden" : ""
        }`}
      >
        <span className="grid size-10 place-items-center rounded-full bg-brand text-sm font-bold text-white">
          {businessInitials(business)}
        </span>
        <div>
          <p className="text-sm font-bold text-foreground">{business}</p>
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <span className="size-1.5 rounded-full bg-success" />
            {assistantLabel} — replies instantly
          </p>
        </div>
      </div>

      {voice ? (
        <div className="flex border-b border-border-subtle">
          {(
            [
              { value: "chat", label: "Chat", icon: MessageSquareText },
              { value: "voice", label: "Voice", icon: Mic },
            ] as const
          ).map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setTab(item.value)}
              aria-pressed={tab === item.value}
              className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-bold transition ${
                tab === item.value
                  ? "border-b-2 border-brand text-brand-glow-text"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <item.icon className="size-4" />
              {item.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className={tab === "chat" ? "flex min-h-0 flex-1 flex-col" : "hidden"}>
        <ChatPanel
          endpoint={`/api/demos/${slug}/chat`}
          welcome={welcome}
          starters={starters}
          storageKey={`demo-${slug}-transcript`}
          placeholder="Ask a question or request a time…"
        />
      </div>

      {voice ? (
        <div className={tab === "voice" ? "flex min-h-0 flex-1 flex-col" : "hidden"}>
          <DemoVoicePanel slug={slug} active={tab === "voice"} invitation={voice.invitation} />
        </div>
      ) : null}
    </div>
  );
}
