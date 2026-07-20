"use client";

import { useState } from "react";
import { ArrowRight, ArrowUp, Check, Loader2 } from "lucide-react";

/** Small back-to-top control for the footer bottom bar. */
export function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className="grid size-10 place-items-center rounded-full border border-border-subtle bg-[var(--input-bg)] text-muted transition hover:border-brand-soft/50 hover:text-brand-glow-text"
    >
      <ArrowUp className="size-4" />
    </button>
  );
}

type Status = "idle" | "loading" | "done" | "error";

/**
 * Footer newsletter box. Posts to /api/subscribe (light: email + honeypot, no
 * captcha). Shows an inline success state rather than a page navigation.
 */
export function FooterSubscribe() {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("done");
      setEmail("");
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-brand-soft/25 bg-[var(--input-bg)] px-4 py-3 text-sm text-brand-soft">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-soft/15">
          <Check className="size-4" />
        </span>
        You&apos;re on the list — watch your inbox.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-2">
      <div className="flex items-center gap-2 rounded-2xl border border-border-subtle bg-[var(--input-bg)] p-1.5 transition focus-within:border-brand-soft/50">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          aria-label="Email address"
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none"
        />
        {/* Honeypot — hidden from real users. */}
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="hidden"
          aria-hidden
        />
        <button
          type="submit"
          disabled={status === "loading"}
          aria-label="Subscribe"
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-electric to-brand-soft px-4 text-sm font-bold text-white shadow-[0_6px_18px_var(--accent-glow)] transition hover:opacity-90 disabled:opacity-60"
        >
          {status === "loading" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              Subscribe
              <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </div>
      {error ? <p className="px-1 text-xs text-danger">{error}</p> : null}
    </form>
  );
}
