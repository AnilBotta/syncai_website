"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import { useDemoVoice } from "./use-demo-voice";

/**
 * The spoken half of a demo site's assistant.
 *
 * Deliberately shows the countdown: a call that cuts out at sixty seconds with
 * no warning reads as a bug, whereas a visible timer reads as a demo limit.
 */
export function DemoVoicePanel({
  slug,
  active,
  invitation,
}: {
  slug: string;
  /** False when the Chat tab is showing — a hidden panel must not hold the mic. */
  active: boolean;
  invitation: string;
}) {
  const voice = useDemoVoice(slug);
  const live = voice.status === "live";
  const connecting = voice.status === "connecting";
  const { end } = voice;

  // Switching tabs mid-call releases the microphone rather than leaving it open
  // behind a hidden panel. In an effect, not in render — `end` sets state.
  useEffect(() => {
    if (!active && live) end();
  }, [active, live, end]);

  return (
    <div className="flex flex-1 flex-col items-center justify-between gap-6 px-6 py-8 text-center">
      <div>
        <p className="demo-label text-brand-glow-text">Voice assistant</p>
        <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-muted">
          {live
            ? "Listening — ask a question or book yourself in."
            : connecting
              ? "Connecting…"
              : invitation}
        </p>
      </div>

      <div className="relative grid place-items-center">
        <motion.span
          aria-hidden
          animate={{ scale: voice.speaking ? 1.25 : 1, opacity: live ? 0.9 : 0.45 }}
          transition={{ duration: 0.25 }}
          className="absolute size-36 rounded-full bg-[radial-gradient(circle,var(--accent-glow)_0%,var(--accent-glow)_60%,transparent_75%)] blur-md"
        />
        <motion.div
          animate={
            live ? { scale: [1, 1.05, 1] } : connecting ? { rotate: 360 } : { scale: 1 }
          }
          transition={
            live
              ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
              : connecting
                ? { duration: 1.6, repeat: Infinity, ease: "linear" }
                : {}
          }
          className="grid size-24 place-items-center rounded-full bg-brand text-white shadow-[0_0_50px_var(--accent-glow)]"
        >
          {connecting ? (
            <Loader2 className="size-7 animate-spin" />
          ) : (
            <Mic className={`size-7 ${live ? "" : "opacity-70"}`} />
          )}
        </motion.div>
      </div>

      <div className="min-h-20 w-full">
        {voice.caption ? (
          <p className="mx-auto max-w-sm text-sm leading-6 text-foreground">{voice.caption}</p>
        ) : null}

        {voice.status === "expired" ? (
          <p className="mx-auto max-w-xs text-sm leading-6 text-muted">
            That&apos;s the end of the demo call. Start another, or use the chat tab.
          </p>
        ) : null}

        {voice.status === "demo" ? (
          <p className="mx-auto max-w-xs text-sm leading-6 text-muted">
            The voice agent isn&apos;t connected yet — try the chat tab instead.
          </p>
        ) : null}

        {voice.error ? (
          <p className="mx-auto max-w-xs text-sm leading-6 text-danger">{voice.error}</p>
        ) : null}
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-4">
          {live ? (
            <>
              <button
                type="button"
                onClick={voice.toggleMute}
                aria-label={voice.muted ? "Unmute microphone" : "Mute microphone"}
                className={`grid size-12 place-items-center rounded-full border transition ${
                  voice.muted
                    ? "border-warn/50 bg-warn/15 text-warn"
                    : "border-border-subtle text-foreground hover:bg-bg-deep"
                }`}
              >
                {voice.muted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
              </button>
              <button
                type="button"
                onClick={voice.end}
                aria-label="End the call"
                className="grid size-12 place-items-center rounded-full bg-danger text-white transition hover:opacity-90"
              >
                <PhoneOff className="size-5" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={voice.start}
              disabled={connecting}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-brand px-7 text-sm font-bold text-white transition hover:bg-brand-deep disabled:opacity-60"
            >
              <Phone className="size-4" />
              {voice.status === "ended" || voice.status === "expired"
                ? "Start another call"
                : "Start the call"}
            </button>
          )}
        </div>

        <p className="text-xs text-muted">
          {live
            ? `Demo call ends in ${voice.secondsLeft}s`
            : `Demo calls run for ${voice.totalSeconds} seconds`}
        </p>
      </div>
    </div>
  );
}
