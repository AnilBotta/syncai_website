"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, MessageSquareText, Mic, X } from "lucide-react";
import { ChatPanel } from "./chat-panel";
import { VoicePanel } from "./voice-panel";

export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"chat" | "voice">("chat");

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close SyncAI assistant" : "Open SyncAI assistant"}
        className="fixed bottom-5 right-5 z-[60] flex size-15 items-center justify-center rounded-full bg-gradient-to-r from-brand-electric to-brand-soft text-white shadow-[0_8px_30px_rgba(75,0,130,0.45)] transition hover:scale-105 sm:bottom-6 sm:right-6"
      >
        {!open ? (
          <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-brand/40" />
        ) : null}
        {open ? <X className="size-6" /> : <Bot className="size-7" />}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="theme-dark fixed inset-0 z-[59] flex flex-col overflow-hidden bg-bg-elevated shadow-2xl sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[600px] sm:max-h-[calc(100vh-8rem)] sm:w-[380px] sm:rounded-[1.75rem] sm:border sm:border-border-subtle"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 bg-bg-deep px-5 py-4 text-foreground">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-gradient-to-r from-brand-electric to-brand-soft">
                  <Bot className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-black">SyncAI Assistant</p>
                  <p className="text-xs text-muted">Ask anything or book a call</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close assistant"
                className="grid size-9 place-items-center rounded-full text-muted transition hover:bg-bg-elevated/10 hover:text-white sm:hidden"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border-subtle bg-bg-elevated">
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
                  className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-bold transition ${
                    tab === item.value
                      ? "border-b-2 border-[#4B0082] text-brand-glow-text"
                      : "text-muted hover:text-foreground/90"
                  }`}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </button>
              ))}
            </div>

            {/* Body — both panels stay mounted so state survives tab switches;
                the voice panel tears its session down on unmount only. */}
            <div className={tab === "chat" ? "flex min-h-0 flex-1 flex-col" : "hidden"}>
              <ChatPanel />
            </div>
            <div className={tab === "voice" ? "flex min-h-0 flex-1 flex-col" : "hidden"}>
              <VoicePanel active={tab === "voice"} />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
