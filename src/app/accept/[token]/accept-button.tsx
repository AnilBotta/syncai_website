"use client";

import { useState } from "react";

type AcceptButtonProps = {
  token: string;
  recipientName: string;
  documentLabel: string;
};

export function AcceptButton({ token, recipientName, documentLabel }: AcceptButtonProps) {
  const [state, setState] = useState<"idle" | "submitting" | "accepted" | "error">("idle");
  const [error, setError] = useState("");

  async function accept() {
    setState("submitting");
    setError("");
    try {
      const response = await fetch("/api/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not record your acceptance.");
      setState("accepted");
    } catch (e) {
      setState("error");
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  if (state === "accepted") {
    return (
      <div
        style={{
          marginTop: 28,
          padding: "18px 20px",
          borderRadius: 14,
          background: "#ecfdf5",
          border: "1px solid #a7f3d0",
          color: "#065f46",
        }}
      >
        <strong>✓ Accepted.</strong> Thank you, {recipientName}. Your acceptance of this {documentLabel.toLowerCase()} has
        been recorded and the SyncAI team has been notified. We&apos;ll be in touch shortly.
      </div>
    );
  }

  return (
    <div style={{ marginTop: 28 }}>
      <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 12, lineHeight: 1.6 }}>
        By clicking below, you, {recipientName}, agree to the terms of this {documentLabel.toLowerCase()}. Your name, the
        date, and your IP address will be recorded as your electronic signature.
      </p>
      <button
        type="button"
        onClick={accept}
        disabled={state === "submitting"}
        style={{
          appearance: "none",
          border: "none",
          cursor: state === "submitting" ? "not-allowed" : "pointer",
          background: "#6c3486",
          color: "#fff",
          fontWeight: 800,
          fontSize: 15,
          padding: "14px 28px",
          borderRadius: 999,
          opacity: state === "submitting" ? 0.6 : 1,
        }}
      >
        {state === "submitting" ? "Recording…" : `I accept this ${documentLabel.toLowerCase()}`}
      </button>
      {state === "error" ? (
        <p style={{ marginTop: 12, color: "#b91c1c", fontSize: 14 }}>{error}</p>
      ) : null}
    </div>
  );
}
