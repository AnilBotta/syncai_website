"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RetellWebClient } from "retell-client-js-sdk";

export type VoiceStatus = "idle" | "connecting" | "live" | "ended" | "demo" | "error";

type CaptionLine = {
  id: number;
  text: string;
};

/**
 * Browser voice session backed by the Retell agent — the same agent that answers
 * the phone, so web and phone callers get identical answers and one prompt to
 * maintain (edited in the Retell dashboard, no deploy needed).
 *
 * The agent's tools (availability + booking) run server-side as Retell custom
 * functions against /api/voice/tools/*, so unlike the previous implementation
 * there are no client-side tool calls here.
 */
export function useVoiceSession() {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [error, setError] = useState("");
  const [muted, setMuted] = useState(false);
  const [caption, setCaption] = useState<CaptionLine | null>(null);
  // Drives the orb's pulse. Retell owns the mic, so rather than capture a second
  // stream just to meter it, this tracks when the AGENT is speaking.
  const [level, setLevel] = useState(0);

  const clientRef = useRef<RetellWebClient | null>(null);
  const captionIdRef = useRef(0);

  const cleanup = useCallback(() => {
    const client = clientRef.current;
    if (client) {
      try {
        client.stopCall();
      } catch {
        // Already torn down.
      }
      client.removeAllListeners();
      clientRef.current = null;
    }
    setLevel(0);
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const end = useCallback(() => {
    cleanup();
    setStatus("ended");
    setCaption(null);
  }, [cleanup]);

  const toggleMute = useCallback(() => {
    setMuted((current) => {
      const next = !current;
      const client = clientRef.current;
      if (!client) return next;
      try {
        if (next) client.mute();
        else client.unmute();
      } catch {
        // SDK not connected yet — the next start() resets muted to false anyway.
      }
      return next;
    });
  }, []);

  const start = useCallback(async () => {
    setError("");
    setCaption(null);
    setMuted(false);
    setStatus("connecting");

    try {
      const response = await fetch("/api/voice/web-call", { method: "POST" });
      const data = await response.json();

      if (data.demoMode) {
        setStatus("demo");
        return;
      }
      if (!response.ok || !data.accessToken) {
        throw new Error(data.error || "Could not start a voice session.");
      }

      const client = new RetellWebClient();
      clientRef.current = client;

      client.on("call_started", () => setStatus("live"));
      client.on("call_ended", () => {
        setStatus("ended");
        setLevel(0);
      });
      client.on("agent_start_talking", () => setLevel(0.55));
      client.on("agent_stop_talking", () => setLevel(0));
      client.on("update", (update: { transcript?: { role: string; content: string }[] }) => {
        // Show the agent's latest line as a caption.
        const last = [...(update.transcript ?? [])].reverse().find((t) => t.role === "agent");
        if (!last?.content) return;
        setCaption((current) =>
          current && current.text === last.content
            ? current
            : { id: (captionIdRef.current += 1), text: last.content },
        );
      });
      client.on("error", (message: unknown) => {
        setError(typeof message === "string" ? message : "The voice session hit an error.");
        cleanup();
        setStatus("error");
      });

      await client.startCall({ accessToken: data.accessToken });
    } catch (startError) {
      cleanup();
      setStatus("error");
      setError(
        startError instanceof Error && startError.name === "NotAllowedError"
          ? "Microphone access was blocked. Allow the mic and try again."
          : startError instanceof Error
            ? startError.message
            : "Could not start the voice session.",
      );
    }
  }, [cleanup]);

  return {
    status,
    error,
    muted,
    caption: caption?.text || "",
    micLevel: level,
    start,
    end,
    toggleMute,
  };
}
