"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

/**
 * The assistant's chat and voice panels, mounted inline in a page instead of in
 * the floating widget — so the "Try the live agents" demo runs OUR agents rather
 * than a third-party embed.
 *
 * This wrapper is a Client Component because `ssr: false` is not allowed in
 * Server Components, and the voice panel must not be server-rendered: its
 * session hook imports `retell-client-js-sdk` at module scope. Same reason
 * `assistant-mount.tsx` loads the widget this way.
 */

/** Forced-dark island, so both panels look identical to the floating widget
    whichever theme the visitor is browsing in. Tall enough for the voice panel's
    orb + caption + controls, which overflow a 400px box. */
const FRAME =
  "theme-dark mt-6 flex h-[480px] flex-col overflow-hidden rounded-xl border border-border-subtle";

function PanelLoading() {
  return (
    <div className="grid flex-1 place-items-center bg-bg-elevated text-muted">
      <Loader2 className="size-5 animate-spin" />
    </div>
  );
}

const ChatPanel = dynamic(() => import("./chat-panel").then((mod) => mod.ChatPanel), {
  ssr: false,
  loading: PanelLoading,
});

const VoicePanel = dynamic(() => import("./voice-panel").then((mod) => mod.VoicePanel), {
  ssr: false,
  loading: PanelLoading,
});

export function InlineChatAgent() {
  return (
    <div className={`${FRAME} bg-bg-elevated`}>
      <ChatPanel />
    </div>
  );
}

export function InlineVoiceAgent() {
  return (
    <div className={FRAME}>
      {/* No `autoStart` — the visitor presses "Start voice session" themselves.
          A page that dialled itself would take the mic unasked and bill a
          Retell call on every page view. */}
      <VoicePanel active />
    </div>
  );
}
