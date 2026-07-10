"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, SendHorizonal, Wrench } from "lucide-react";

type ToolTraceEntry = { tool: string; summary: string };

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  trace?: ToolTraceEntry[];
};

const STORAGE_KEY = "syncai-manager-chat";

const welcome: ChatMessage = {
  role: "assistant",
  content:
    "Hi Anil — I'm your Manager. Ask me anything about the business, or tell me what to do. For example: \"What's in my pipeline?\", \"Draft a follow-up to the dental clinic lead\", or \"Move Acme to proposal and create a task to send the quote Friday.\"",
};

const suggestions = [
  "What's in my pipeline right now?",
  "What's waiting for my approval?",
  "Who are my highest-value open leads?",
];

const toolLabels: Record<string, string> = {
  get_pipeline_summary: "read pipeline",
  search_leads: "searched leads",
  get_lead: "read lead",
  list_pending_approvals: "checked approvals",
  create_task: "created task",
  move_lead_status: "moved lead",
  draft_email: "drafted email → Approvals",
  qualify_lead: "qualified lead",
  research_company: "researched company",
  create_target: "created target",
  find_prospects: "ran scraper",
  enroll_in_sequence: "enrolled in sequence",
};

type ManagerChatProps = {
  getToken: () => Promise<string>;
};

export function ManagerChat({ getToken }: ManagerChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([welcome]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [spend, setSpend] = useState<{ spent: number; budget: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as ChatMessage[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        }
      } catch {
        // Ignore malformed storage.
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)));
    } catch {
      // Storage may be unavailable (private mode); the chat still works.
    }
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) {
      return;
    }

    setError("");
    setBusy(true);
    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setInput("");

    try {
      const token = await getToken();
      const payload = next
        .filter((m) => m.content)
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch("/api/admin/manager/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ messages: payload }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "The Manager couldn't respond.");
      }

      setMessages((current) => [
        ...current,
        { role: "assistant", content: result.reply, trace: result.trace || [] },
      ]);
      if (typeof result.spentToday === "number") {
        setSpend({ spent: result.spentToday, budget: result.budget });
      }
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "The Manager couldn't respond.");
      setMessages((current) => current.slice(0, -1));
      setInput(trimmed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-13rem)] max-w-3xl flex-col rounded-[2rem] border border-border-subtle bg-bg-elevated shadow-sm">
      <header className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-brand-deep to-brand text-white">
            <Bot className="size-5" />
          </span>
          <div>
            <p className="font-black text-foreground">Manager</p>
            <p className="text-xs text-muted">Your AI chief of staff</p>
          </div>
        </div>
        {spend ? (
          <div className="text-right">
            <p className="text-xs font-black text-foreground">${spend.spent.toFixed(2)}</p>
            <p className="text-[11px] text-muted">of ${spend.budget.toFixed(2)} today</p>
          </div>
        ) : null}
      </header>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {messages.map((message, index) => (
          <div key={index} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div className={message.role === "user" ? "max-w-[85%]" : "max-w-[90%]"}>
              <div
                className={`rounded-3xl px-4 py-3 text-sm leading-6 ${
                  message.role === "user"
                    ? "bg-brand-deep text-white"
                    : "border border-border-subtle bg-surface text-foreground"
                }`}
              >
                <p className="whitespace-pre-line">{message.content}</p>
              </div>
              {message.trace && message.trace.length ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {message.trace.map((entry, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-bg-elevated px-2.5 py-1 text-[11px] font-bold text-muted"
                    >
                      <Wrench className="size-3 text-brand-glow-text" />
                      {toolLabels[entry.tool] || entry.tool}: {entry.summary}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ))}

        {busy ? (
          <div className="flex justify-start">
            <div className="inline-flex items-center gap-2 rounded-3xl border border-border-subtle bg-surface px-4 py-3 text-sm text-muted">
              <Loader2 className="size-4 animate-spin" />
              Working on it…
            </div>
          </div>
        ) : null}

        {messages.length <= 1 && !busy ? (
          <div className="flex flex-wrap gap-2 pt-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="rounded-full border border-border-subtle px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-brand-soft hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {error ? <p className="mx-5 rounded-2xl bg-red-500/10 p-3 text-sm text-red-600">{error}</p> : null}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void send(input);
        }}
        className="flex items-center gap-2 border-t border-border-subtle px-4 py-3"
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          disabled={busy}
          className="h-12 flex-1 rounded-full border border-border-subtle px-4 text-sm outline-none focus:border-brand-soft focus:ring-4 focus:ring-brand/25 disabled:opacity-60"
          placeholder="Ask the Manager, or give a command…"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="grid size-12 place-items-center rounded-full bg-brand-deep text-white disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Send"
        >
          {busy ? <Loader2 className="size-5 animate-spin" /> : <SendHorizonal className="size-5" />}
        </button>
      </form>
    </div>
  );
}
