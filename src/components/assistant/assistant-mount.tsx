"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const AssistantWidget = dynamic(
  () => import("./assistant-widget").then((mod) => mod.AssistantWidget),
  { ssr: false }
);

/**
 * Routes that render without the floating launcher.
 *
 * /admin is the private dashboard — a sales assistant has no place there.
 * The voice-and-chat demo embeds these same panels inline, and two mounted
 * voice panels means two simultaneous Retell calls: two mic captures, audible
 * echo, and double the per-minute billing.
 */
const HIDDEN_ON = ["/admin", "/demos/ai-voice-and-chat-agents"];

export function AssistantMount() {
  const pathname = usePathname();

  if (HIDDEN_ON.some((route) => pathname?.startsWith(route))) {
    return null;
  }

  return <AssistantWidget />;
}
