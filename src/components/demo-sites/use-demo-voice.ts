"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type DemoVoiceStatus =
  | "idle"
  | "connecting"
  | "live"
  | "ended"
  | "expired"
  | "demo"
  | "error";

/**
 * Browser side of the demo voice agent, over the OpenAI Realtime API.
 *
 * Flow: our server mints an ephemeral client secret, the browser opens a
 * WebRTC peer connection straight to OpenAI with it, and audio flows
 * peer-to-peer. Events (transcripts, tool calls) ride a data channel.
 *
 * Tool calls arrive HERE rather than server-side — that is the fundamental
 * difference from the Retell path on the main site. Each one is posted to
 * /voice/tool, which runs the sandboxed executor, and the result is written back
 * into the session as a `function_call_output` item followed by `response.create`.
 *
 * The session is capped at CALL_SECONDS. Realtime bills per minute of audio, so
 * this is a cost guard rather than a nicety — but note it is enforced by this
 * client. The real ceiling on spend is the rate limit on minting.
 */

const CALL_SECONDS = 60;

type ToolCall = { name: string; call_id: string; arguments: string };

export function useDemoVoice(slug: string) {
  const [status, setStatus] = useState<DemoVoiceStatus>("idle");
  const [error, setError] = useState("");
  const [muted, setMuted] = useState(false);
  const [caption, setCaption] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(CALL_SECONDS);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<RTCDataChannel | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);

  const teardown = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    channelRef.current?.close();
    channelRef.current = null;
    // Releasing the tracks is what actually turns the mic indicator off.
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
    if (audioRef.current) {
      audioRef.current.srcObject = null;
      audioRef.current.remove();
      audioRef.current = null;
    }
    setSpeaking(false);
  }, []);

  useEffect(() => teardown, [teardown]);

  const end = useCallback(() => {
    teardown();
    setStatus("ended");
    setCaption("");
  }, [teardown]);

  const toggleMute = useCallback(() => {
    setMuted((current) => {
      const next = !current;
      streamRef.current?.getAudioTracks().forEach((track) => {
        track.enabled = !next;
      });
      return next;
    });
  }, []);

  const start = useCallback(async () => {
    setError("");
    setCaption("");
    setMuted(false);
    setSecondsLeft(CALL_SECONDS);
    setStatus("connecting");

    try {
      const minted = await fetch(`/api/demos/${slug}/voice`, { method: "POST" });
      const session = await minted.json();

      if (session.demoMode) {
        setStatus("demo");
        return;
      }
      if (!minted.ok || !session.clientSecret) {
        throw new Error(session.error || "Could not start a voice session.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      // The model's voice arrives as a remote track; it needs a real element to play.
      const audio = document.createElement("audio");
      audio.autoplay = true;
      audioRef.current = audio;
      pc.ontrack = (event) => {
        audio.srcObject = event.streams[0];
      };

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const channel = pc.createDataChannel("oai-events");
      channelRef.current = channel;

      channel.addEventListener("open", () => {
        setStatus("live");
        // Ask for the opening line rather than waiting for the visitor to speak
        // first — a silent orb reads as broken.
        if (session.greeting) {
          channel.send(
            JSON.stringify({
              type: "response.create",
              response: { instructions: `Greet the caller: "${session.greeting}"` },
            })
          );
        }

        timerRef.current = window.setInterval(() => {
          setSecondsLeft((remaining) => {
            if (remaining <= 1) {
              teardown();
              setStatus("expired");
              return 0;
            }
            return remaining - 1;
          });
        }, 1000);
      });

      channel.addEventListener("message", (event) => {
        let payload: Record<string, unknown>;
        try {
          payload = JSON.parse(event.data);
        } catch {
          return;
        }
        void handleServerEvent(payload, channel, slug, {
          setCaption,
          setSpeaking,
        });
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const answer = await fetch(
        `https://api.openai.com/v1/realtime/calls?model=${encodeURIComponent(session.model)}`,
        {
          method: "POST",
          body: offer.sdp,
          headers: {
            Authorization: `Bearer ${session.clientSecret}`,
            "Content-Type": "application/sdp",
          },
        }
      );

      if (!answer.ok) {
        throw new Error("The voice service refused the connection.");
      }

      await pc.setRemoteDescription({ type: "answer", sdp: await answer.text() });
    } catch (startError) {
      teardown();
      setStatus("error");
      setError(
        startError instanceof Error && startError.name === "NotAllowedError"
          ? "Microphone access was blocked. Allow the mic and try again."
          : startError instanceof Error
            ? startError.message
            : "Could not start the voice session."
      );
    }
  }, [slug, teardown]);

  return {
    status,
    error,
    muted,
    caption,
    speaking,
    secondsLeft,
    totalSeconds: CALL_SECONDS,
    start,
    end,
    toggleMute,
  };
}

async function handleServerEvent(
  payload: Record<string, unknown>,
  channel: RTCDataChannel,
  slug: string,
  ui: {
    setCaption: (value: string) => void;
    setSpeaking: (value: boolean) => void;
  }
) {
  const type = typeof payload.type === "string" ? payload.type : "";

  if (type === "response.output_audio.started") ui.setSpeaking(true);
  if (type === "response.done") ui.setSpeaking(false);

  // Live caption of what the assistant is saying.
  if (type === "response.output_audio_transcript.done" && typeof payload.transcript === "string") {
    ui.setCaption(payload.transcript);
  }

  if (type !== "response.function_call_arguments.done") return;

  const call = payload as unknown as ToolCall;
  if (!call.name || !call.call_id) return;

  let args: Record<string, unknown> = {};
  try {
    args = JSON.parse(call.arguments || "{}");
  } catch {
    // Leave empty; the executor reports the validation error back to the model.
  }

  let result: unknown = { error: "The tool could not be reached." };
  try {
    const response = await fetch(`/api/demos/${slug}/voice/tool`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: call.name, arguments: args }),
    });
    const body = await response.json();
    result = body.result ?? body;
  } catch {
    // Keep the fallback error; the model will apologise rather than hang.
  }

  channel.send(
    JSON.stringify({
      type: "conversation.item.create",
      item: {
        type: "function_call_output",
        call_id: call.call_id,
        output: JSON.stringify(result),
      },
    })
  );
  channel.send(JSON.stringify({ type: "response.create" }));
}
