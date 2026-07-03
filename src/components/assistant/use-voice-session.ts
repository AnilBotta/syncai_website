"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type VoiceStatus = "idle" | "connecting" | "live" | "ended" | "demo" | "error";

export type VoiceBooking = {
  humanTime: string;
  demoMode: boolean;
};

type CaptionLine = {
  id: number;
  text: string;
};

export function useVoiceSession() {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [error, setError] = useState("");
  const [muted, setMuted] = useState(false);
  const [caption, setCaption] = useState<CaptionLine | null>(null);
  const [micLevel, setMicLevel] = useState(0);
  const [booking, setBooking] = useState<VoiceBooking | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const levelTimerRef = useRef<number | null>(null);
  const captionIdRef = useRef(0);

  const cleanup = useCallback(() => {
    if (levelTimerRef.current !== null) {
      window.clearInterval(levelTimerRef.current);
      levelTimerRef.current = null;
    }
    audioContextRef.current?.close().catch(() => undefined);
    audioContextRef.current = null;
    dcRef.current?.close();
    dcRef.current = null;
    micStreamRef.current?.getTracks().forEach((track) => track.stop());
    micStreamRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
    if (audioRef.current) {
      audioRef.current.srcObject = null;
      audioRef.current = null;
    }
    setMicLevel(0);
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
      micStreamRef.current?.getAudioTracks().forEach((track) => {
        track.enabled = !next;
      });
      return next;
    });
  }, []);

  const start = useCallback(async () => {
    setError("");
    setBooking(null);
    setCaption(null);
    setMuted(false);
    setStatus("connecting");

    try {
      const tokenResponse = await fetch("/api/voice/token", { method: "POST" });
      const tokenData = await tokenResponse.json();

      if (tokenData.demoMode) {
        setStatus("demo");
        return;
      }
      if (!tokenResponse.ok || !tokenData.clientSecret) {
        throw new Error(tokenData.error || "Could not start a voice session.");
      }

      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = micStream;

      // Mic level meter for the orb animation.
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      audioContext.createMediaStreamSource(micStream).connect(analyser);
      const levelData = new Uint8Array(analyser.frequencyBinCount);
      levelTimerRef.current = window.setInterval(() => {
        analyser.getByteFrequencyData(levelData);
        const average = levelData.reduce((sum, value) => sum + value, 0) / levelData.length;
        setMicLevel(Math.min(1, average / 140));
      }, 80);

      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      for (const track of micStream.getAudioTracks()) {
        pc.addTrack(track, micStream);
      }

      pc.ontrack = (event) => {
        const audio = new Audio();
        audio.autoplay = true;
        audio.srcObject = event.streams[0];
        audioRef.current = audio;
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
          setError("Voice connection lost.");
          end();
        }
      };

      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;

      dc.onopen = () => setStatus("live");
      dc.onmessage = (event) => {
        try {
          void handleServerEvent(JSON.parse(event.data));
        } catch {
          // Ignore malformed events.
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpResponse = await fetch(
        `https://api.openai.com/v1/realtime/calls?model=${encodeURIComponent(tokenData.model)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokenData.clientSecret}`,
            "Content-Type": "application/sdp",
          },
          body: offer.sdp,
        }
      );

      if (!sdpResponse.ok) {
        throw new Error("The voice service rejected the connection.");
      }

      await pc.setRemoteDescription({ type: "answer", sdp: await sdpResponse.text() });
    } catch (startError) {
      cleanup();
      setStatus("error");
      setError(
        startError instanceof Error && startError.name === "NotAllowedError"
          ? "Microphone access was blocked. Allow the mic and try again."
          : startError instanceof Error
            ? startError.message
            : "Could not start the voice session."
      );
    }

    async function handleServerEvent(event: Record<string, unknown>) {
      const type = String(event.type || "");

      if (type === "response.created") {
        captionIdRef.current += 1;
        setCaption({ id: captionIdRef.current, text: "" });
      }

      if (type === "response.output_audio_transcript.delta" && typeof event.delta === "string") {
        const delta = event.delta;
        setCaption((current) =>
          current ? { ...current, text: current.text + delta } : { id: captionIdRef.current, text: delta }
        );
      }

      if (type === "response.function_call_arguments.done") {
        const name = String(event.name || "");
        const callId = String(event.call_id || "");
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(String(event.arguments || "{}"));
        } catch {
          // Executor reports the problem back to the model.
        }

        const output = await executeVoiceTool(name, args);

        if (name === "book_appointment" && output.booked) {
          setBooking({
            humanTime: String(output.humanTime || ""),
            demoMode: Boolean(output.demoMode),
          });
        }

        dcRef.current?.send(
          JSON.stringify({
            type: "conversation.item.create",
            item: {
              type: "function_call_output",
              call_id: callId,
              output: JSON.stringify(output),
            },
          })
        );
        dcRef.current?.send(JSON.stringify({ type: "response.create" }));
      }
    }
  }, [cleanup, end]);

  return { status, error, muted, caption: caption?.text || "", micLevel, booking, start, end, toggleMute };
}

/** Voice tool calls run against the same public APIs the site already uses. */
async function executeVoiceTool(
  name: string,
  args: Record<string, unknown>
): Promise<Record<string, unknown>> {
  try {
    if (name === "get_available_slots") {
      const date = String(args.date || "");
      const response = await fetch(`/api/appointments/availability?date=${encodeURIComponent(date)}`);
      const data = await response.json();
      if (!response.ok) {
        return { error: data.error || "Could not load availability." };
      }
      return {
        date,
        timezone: "America/Toronto",
        slots: (data.slots || []).map((slot: { startsAt: string; label: string }) => ({
          startsAt: slot.startsAt,
          label: slot.label,
        })),
        ...(data.demoMode ? { demoMode: true } : {}),
      };
    }

    if (name === "book_appointment") {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(args.name || ""),
          email: String(args.email || ""),
          phone: String(args.phone || ""),
          service: String(args.service || ""),
          notes: String(args.notes || ""),
          startsAt: String(args.startsAt || ""),
          timezone: "America/Toronto",
          source: "voice_bot",
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        return { error: data.error || "Could not book that time." };
      }
      return {
        booked: true,
        humanTime: data.appointment?.humanTime || "",
        ...(data.demoMode ? { demoMode: true } : {}),
      };
    }

    if (name === "capture_lead") {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(args.name || ""),
          email: String(args.email || ""),
          phone: String(args.phone || ""),
          company: String(args.company || ""),
          industry: String(args.industry || ""),
          interest: String(args.interest || ""),
          painPoint: String(args.painPoint || ""),
          source: "voice_bot",
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        return { error: data.error || "Could not save the details." };
      }
      return { saved: true, ...(data.demoMode ? { demoMode: true } : {}) };
    }

    return { error: `Unknown tool: ${name}` };
  } catch {
    return { error: "The tool call failed. Apologize and offer the booking page at /book." };
  }
}
