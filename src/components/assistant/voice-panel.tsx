"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2, Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import Link from "next/link";
import { useVoiceSession } from "./use-voice-session";

type VoicePanelProps = {
  active: boolean;
  /** Increments when something (e.g. the header's "Let's talk") asks to dial. */
  autoStart?: number;
};

export function VoicePanel({ active, autoStart = 0 }: VoicePanelProps) {
  const { status, error, muted, caption, micLevel, start, end, toggleMute } = useVoiceSession();
  // Remembers which dial request we've already acted on, so a re-render never
  // restarts a call that's already connecting or live.
  const handledDialRef = useRef(0);

  // End the call if the user switches away from the voice tab mid-session.
  useEffect(() => {
    if (!active && status === "live") {
      end();
    }
  }, [active, status, end]);

  // "Let's talk" opens straight into a live call.
  useEffect(() => {
    if (autoStart === 0 || handledDialRef.current === autoStart) return;
    handledDialRef.current = autoStart;
    void start();
  }, [autoStart, start]);

  const live = status === "live";
  const connecting = status === "connecting";

  return (
    <div className="flex flex-1 flex-col items-center justify-between gap-6 overflow-y-auto bg-bg-deep px-6 py-8 text-foreground">
      <div className="text-center">
        <p className="text-sm font-black uppercase tracking-[.2em] text-brand-soft">Voice Assistant</p>
        <p className="mt-2 text-sm leading-6 text-muted">
          {live
            ? "Listening — ask about our services or book a call."
            : connecting
              ? "Connecting your voice session…"
              : "Talk to SyncAI. Ask questions or book a strategy call, hands-free."}
        </p>
      </div>

      {/* Orb */}
      <div className="relative grid place-items-center">
        <motion.div
          animate={{
            scale: live ? 1 + micLevel * 0.35 : 1,
            opacity: live ? 0.9 : 0.5,
          }}
          transition={{ duration: 0.12 }}
          className="absolute size-40 rounded-full bg-[radial-gradient(circle,var(--accent-glow)_0%,var(--accent-glow)_60%,transparent_75%)] blur-md"
        />
        <motion.div
          animate={
            live
              ? { scale: [1, 1.06, 1] }
              : connecting
                ? { rotate: 360 }
                : { scale: 1 }
          }
          transition={
            live
              ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
              : connecting
                ? { duration: 1.6, repeat: Infinity, ease: "linear" }
                : {}
          }
          className="grid size-28 place-items-center rounded-full border border-brand-glow-text/30 bg-gradient-to-br from-brand-deep to-brand shadow-[0_0_60px_var(--accent-glow)]"
        >
          {connecting ? (
            <Loader2 className="size-8 animate-spin text-white" />
          ) : (
            <Mic className={`size-8 ${live ? "text-white" : "text-white/70"}`} />
          )}
        </motion.div>
      </div>

      {/* Caption / status */}
      <div className="min-h-16 w-full">
        {caption ? (
          <p className="mx-auto max-w-xs text-center text-sm leading-6 text-brand-soft">{caption}</p>
        ) : null}

        {/* Booking now happens agent-side (Retell custom functions), so the
            confirmation comes from the agent's own reply and the email that
            follows — the browser isn't told about it. */}

        {status === "demo" ? (
          <div className="mx-auto max-w-xs rounded-2xl border border-amber-300/30 bg-amber-400/10 px-4 py-3 text-center text-xs leading-5 text-amber-200">
            The voice agent isn&apos;t connected yet. Meanwhile, you can{" "}
            <Link href="/book" className="font-bold underline">
              book a call here
            </Link>
            .
          </div>
        ) : null}

        {error ? (
          <p className="mx-auto max-w-xs text-center text-xs leading-5 text-danger">{error}</p>
        ) : null}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {live ? (
          <>
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Unmute microphone" : "Mute microphone"}
              className={`grid size-13 place-items-center rounded-full border transition ${
                muted
                  ? "border-amber-300/50 bg-amber-400/20 text-amber-200"
                  : "border-white/20 bg-bg-elevated/10 text-white hover:bg-bg-elevated/20"
              }`}
            >
              {muted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
            </button>
            <button
              type="button"
              onClick={end}
              aria-label="End voice session"
              className="grid size-13 place-items-center rounded-full bg-red-500 text-white transition hover:bg-red-600"
            >
              <PhoneOff className="size-5" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={start}
            disabled={connecting}
            className="inline-flex h-13 items-center gap-2 rounded-full bg-gradient-to-r from-brand-electric to-brand-soft px-8 text-sm font-bold text-white shadow-[0_8px_30px_var(--accent-glow)] transition hover:opacity-90 disabled:opacity-60"
          >
            <Phone className="size-4" />
            {status === "ended" ? "Start another session" : "Start voice session"}
          </button>
        )}
      </div>
    </div>
  );
}
