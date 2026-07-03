"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, Loader2, Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import Link from "next/link";
import { useVoiceSession } from "./use-voice-session";

type VoicePanelProps = {
  active: boolean;
};

export function VoicePanel({ active }: VoicePanelProps) {
  const { status, error, muted, caption, micLevel, booking, start, end, toggleMute } =
    useVoiceSession();

  // End the call if the user switches away from the voice tab mid-session.
  useEffect(() => {
    if (!active && status === "live") {
      end();
    }
  }, [active, status, end]);

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
          className="absolute size-40 rounded-full bg-[radial-gradient(circle,rgba(148,0,211,0.5)_0%,rgba(75,0,130,0.15)_60%,transparent_75%)] blur-md"
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
          className="grid size-28 place-items-center rounded-full border border-brand-glow-text/30 bg-gradient-to-br from-brand-deep to-brand shadow-[0_0_60px_rgba(148,0,211,0.45)]"
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
          <p className="mx-auto max-w-xs text-center text-sm leading-6 text-[#d0bcff]">{caption}</p>
        ) : null}

        {booking ? (
          <div className="mx-auto mt-3 flex w-fit items-center gap-2 rounded-xl border border-[#d0bcff]/30 bg-bg-elevated/5 px-4 py-2 text-xs font-bold text-[#d0bcff]">
            <CalendarCheck className="size-4" />
            Booked: {booking.humanTime}
            {booking.demoMode ? " (demo)" : ""}
          </div>
        ) : null}

        {status === "demo" ? (
          <div className="mx-auto max-w-xs rounded-2xl border border-amber-300/30 bg-amber-400/10 px-4 py-3 text-center text-xs leading-5 text-amber-200">
            Voice demo needs an OpenAI API key. Meanwhile, you can{" "}
            <Link href="/book" className="font-bold underline">
              book a call here
            </Link>
            .
          </div>
        ) : null}

        {error ? (
          <p className="mx-auto max-w-xs text-center text-xs leading-5 text-red-300">{error}</p>
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
            className="inline-flex h-13 items-center gap-2 rounded-full bg-gradient-to-r from-brand-electric to-brand-soft px-8 text-sm font-bold text-white shadow-[0_8px_30px_rgba(148,0,211,0.4)] transition hover:opacity-90 disabled:opacity-60"
          >
            <Phone className="size-4" />
            {status === "ended" ? "Start another session" : "Start voice session"}
          </button>
        )}
      </div>
    </div>
  );
}
