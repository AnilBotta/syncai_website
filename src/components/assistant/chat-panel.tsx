"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarCheck, Loader2, SendHorizonal } from "lucide-react";

type Slot = { startsAt: string; label: string };

type ToolInfo = {
  name: string;
  status: "running" | "done";
  slots?: Slot[];
  slotDate?: string;
  bookedTime?: string;
  demoMode?: boolean;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  tools?: ToolInfo[];
};

const STORAGE_KEY = "syncai-chat-transcript";

const quickReplies = [
  "What does SyncAI build?",
  "Book a strategy call",
  "How does pricing work?",
];

const welcome: ChatMessage = {
  role: "assistant",
  content:
    "Hi! I'm the SyncAI assistant. Ask me about our AI websites, chatbots, voice agents, or workflow automation — or I can book you a free strategy call right here.",
};

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([welcome]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

    setInput("");
    setBusy(true);

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages([...nextMessages, { role: "assistant", content: "" }]);

    const history = nextMessages
      .filter((message) => message.content)
      .slice(-20)
      .map((message) => ({ role: message.role, content: message.content }));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "The assistant is unavailable right now.");
        }
        setDemoMode(Boolean(result.demoMode));
        updateLastAssistant((message) => ({ ...message, content: result.reply || "" }));
        return;
      }

      if (!response.ok || !response.body) {
        throw new Error("The assistant is unavailable right now.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) {
            continue;
          }
          handleEvent(JSON.parse(line));
        }
      }
    } catch (error) {
      updateLastAssistant((message) => ({
        ...message,
        content:
          message.content ||
          (error instanceof Error ? error.message : "Something went wrong. Please try again."),
      }));
    } finally {
      setBusy(false);
    }
  }

  function handleEvent(event: Record<string, unknown>) {
    if (event.type === "text" && typeof event.delta === "string") {
      const delta = event.delta;
      updateLastAssistant((message) => ({ ...message, content: message.content + delta }));
    }

    if (event.type === "tool" && typeof event.name === "string") {
      const name = event.name;
      const status = event.status as "running" | "done";
      const result = (event.result || {}) as Record<string, unknown>;

      updateLastAssistant((message) => {
        const tools = [...(message.tools || [])];
        const index = tools.findIndex((tool) => tool.name === name && tool.status === "running");
        const info: ToolInfo = { name, status };

        if (status === "done") {
          info.demoMode = Boolean(result.demoMode);
          if (name === "get_available_slots" && Array.isArray(result.slots)) {
            info.slots = (result.slots as Slot[]).slice(0, 6);
            info.slotDate = String(result.date || "");
          }
          if (name === "book_appointment" && result.booked) {
            info.bookedTime = String(result.humanTime || "");
          }
        }

        if (index >= 0) {
          tools[index] = info;
        } else {
          tools.push(info);
        }
        return { ...message, tools };
      });
    }

    if (event.type === "error" && typeof event.message === "string") {
      const errorText = event.message;
      updateLastAssistant((message) => ({
        ...message,
        content: message.content || errorText,
      }));
    }
  }

  function updateLastAssistant(update: (message: ChatMessage) => ChatMessage) {
    setMessages((current) => {
      const next = [...current];
      for (let i = next.length - 1; i >= 0; i -= 1) {
        if (next[i].role === "assistant") {
          next[i] = update(next[i]);
          break;
        }
      }
      return next;
    });
  }

  const showQuickReplies = messages.length <= 1 && !busy;

  return (
    <>
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {demoMode ? (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Demo mode — add an OpenAI API key for live AI answers.
          </p>
        ) : null}

        {messages.map((message, index) => (
          <div key={index} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                message.role === "user"
                  ? "bg-gradient-to-r from-[#4B0082] to-[#9400D3] text-white"
                  : "bg-slate-100 text-slate-800"
              }`}
            >
              {message.content ||
                (message.role === "assistant" && busy && index === messages.length - 1 ? (
                  <span className="inline-flex items-center gap-2 text-slate-500">
                    <Loader2 className="size-3.5 animate-spin" /> Thinking…
                  </span>
                ) : null)}

              {message.tools?.map((tool, toolIndex) => (
                <div key={toolIndex} className="mt-2">
                  {tool.status === "running" ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#4B0082]">
                      <Loader2 className="size-3 animate-spin" />
                      {toolLabel(tool.name)}
                    </span>
                  ) : null}

                  {tool.slots && tool.slots.length > 0 ? (
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {tool.slots.map((slot) => (
                        <button
                          key={slot.startsAt}
                          type="button"
                          disabled={busy}
                          onClick={() => send(`Let's book ${slot.label} on ${tool.slotDate}.`)}
                          className="rounded-full border border-[#4B0082]/30 bg-white px-3 py-1 text-xs font-bold text-[#4B0082] transition hover:bg-[#4B0082] hover:text-white disabled:opacity-60"
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {tool.bookedTime ? (
                    <div className="mt-1 flex items-center gap-2 rounded-xl border border-[#4B0082]/20 bg-white px-3 py-2 text-xs font-bold text-[#4B0082]">
                      <CalendarCheck className="size-4" />
                      Booked: {tool.bookedTime}
                      {tool.demoMode ? " (demo)" : ""}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ))}

        {showQuickReplies ? (
          <div className="flex flex-wrap gap-2">
            {quickReplies.map((reply) => (
              <button
                key={reply}
                type="button"
                onClick={() => send(reply)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-[#4B0082]/40 hover:text-[#4B0082]"
              >
                {reply}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-slate-200 bg-white p-3"
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about our AI services…"
          className="h-11 flex-1 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-[#4B0082] focus:ring-4 focus:ring-[#9400D3]/20"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          aria-label="Send message"
          className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-r from-[#4B0082] to-[#9400D3] text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <SendHorizonal className="size-4" />}
        </button>
      </form>
    </>
  );
}

function toolLabel(name: string) {
  switch (name) {
    case "get_available_slots":
      return "Checking availability…";
    case "book_appointment":
      return "Booking your call…";
    case "capture_lead":
      return "Saving your details…";
    default:
      return "Working…";
  }
}
