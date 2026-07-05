"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarCheck, CheckCircle2, Clock, Loader2 } from "lucide-react";

const services = [
  "AI strategy",
  "AI website",
  "AI chatbot",
  "AI voice agent",
  "Workflow automation",
  "Not sure yet",
];

type BookableDay = { date: string; label: string };
type Slot = { startsAt: string; endsAt: string; label: string };

type BookingWidgetProps = {
  source?: string;
  compact?: boolean;
};

export function BookingWidget({ source = "booking_page", compact = false }: BookingWidgetProps) {
  const [days, setDays] = useState<BookableDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<BookableDay | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loadingDays, setLoadingDays] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [demoMode, setDemoMode] = useState(false);
  const [confirmedTime, setConfirmedTime] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/appointments/availability")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setDays(data.days || []);
          setLoadingDays(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadingDays(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadSlots = useCallback(async (day: BookableDay) => {
    setSelectedDay(day);
    setSelectedSlot(null);
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/appointments/availability?date=${day.date}`);
      const data = await res.json();
      setSlots(data.slots || []);
      setDemoMode(Boolean(data.demoMode));
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  async function submitBooking(formData: FormData) {
    if (!selectedSlot) {
      return;
    }

    setSubmitStatus("loading");
    setMessage("");

    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      company: String(formData.get("company") || ""),
      service: String(formData.get("service") || ""),
      notes: String(formData.get("notes") || ""),
      startsAt: selectedSlot.startsAt,
      timezone: "America/Toronto",
      source,
    };

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409 && selectedDay) {
          loadSlots(selectedDay);
        }
        throw new Error(result.error || "Could not book the appointment.");
      }

      setSubmitStatus("success");
      setConfirmedTime(result.appointment?.humanTime || `${selectedDay?.label} at ${selectedSlot.label}`);
      setMessage(
        result.demoMode
          ? "Booked in demo mode. Connect Supabase to store live appointments."
          : "You're booked! We'll reach out to confirm shortly."
      );
    } catch (error) {
      setSubmitStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    }
  }

  const inputClass =
    "h-12 rounded-2xl border border-border-subtle bg-bg-elevated px-4 text-foreground outline-none transition focus:border-brand-soft focus:ring-4 focus:ring-brand/25";

  if (submitStatus === "success") {
    return (
      <div className="grid place-items-center gap-4 rounded-[2rem] border border-brand/25 bg-surface backdrop-blur-md p-10 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-brand/10 text-brand">
          <CalendarCheck className="size-8" />
        </span>
        <h3 className="text-2xl font-black text-foreground">Strategy call booked</h3>
        <p className="text-lg font-semibold text-brand-glow-text">{confirmedTime}</p>
        <p className="max-w-md text-sm leading-6 text-muted">{message}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {/* Step 1: pick a day */}
      <div className="grid gap-3">
        <p className="text-sm font-black uppercase tracking-wider text-muted">1. Pick a day</p>
        {loadingDays ? (
          <p className="flex items-center gap-2 text-sm text-muted">
            <Loader2 className="size-4 animate-spin" /> Loading availability…
          </p>
        ) : (
          <div className={`flex gap-2 overflow-x-auto pb-2 ${compact ? "" : "flex-wrap"}`}>
            {days.map((day) => (
              <button
                key={day.date}
                type="button"
                onClick={() => loadSlots(day)}
                className={`shrink-0 rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                  selectedDay?.date === day.date
                    ? "border-brand-soft bg-gradient-to-r from-brand-electric to-brand text-white "
                    : "border-border-subtle bg-surface text-foreground hover:border-brand-soft/40"
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Step 2: pick a slot */}
      {selectedDay ? (
        <div className="grid gap-3">
          <p className="text-sm font-black uppercase tracking-wider text-muted">
            2. Pick a time <span className="normal-case text-muted">(Eastern Time)</span>
          </p>
          {loadingSlots ? (
            <p className="flex items-center gap-2 text-sm text-muted">
              <Loader2 className="size-4 animate-spin" /> Checking open slots…
            </p>
          ) : slots.length === 0 ? (
            <p className="text-sm text-muted">No open times that day — try another day.</p>
          ) : (
            <div className={`grid gap-2 ${compact ? "grid-cols-3" : "grid-cols-3 sm:grid-cols-4 md:grid-cols-6"}`}>
              {slots.map((slot) => (
                <button
                  key={slot.startsAt}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`inline-flex items-center justify-center gap-1 rounded-xl border px-2 py-2.5 text-sm font-bold transition ${
                    selectedSlot?.startsAt === slot.startsAt
                      ? "border-brand-soft bg-gradient-to-r from-brand-electric to-brand text-white "
                      : "border-border-subtle bg-surface text-foreground hover:border-brand-soft/40"
                  }`}
                >
                  <Clock className="size-3.5" />
                  {slot.label}
                </button>
              ))}
            </div>
          )}
          {demoMode ? (
            <p className="text-xs text-muted">Demo availability — connect Supabase for live scheduling.</p>
          ) : null}
        </div>
      ) : null}

      {/* Step 3: details */}
      {selectedSlot ? (
        <form action={submitBooking} className="grid gap-4">
          <p className="text-sm font-black uppercase tracking-wider text-muted">3. Your details</p>
          <div className={compact ? "grid gap-4" : "grid gap-4 md:grid-cols-2"}>
            <label className="grid gap-2 text-sm font-semibold text-muted">
              Name
              <input name="name" required className={inputClass} placeholder="Your name" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-muted">
              Email
              <input name="email" type="email" required className={inputClass} placeholder="you@company.com" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-muted">
              Phone
              <input name="phone" className={inputClass} placeholder="+1" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-muted">
              Service
              <select name="service" className={inputClass} defaultValue="">
                <option value="" disabled>
                  What do you need?
                </option>
                {services.map((service) => (
                  <option key={service}>{service}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="grid gap-2 text-sm font-semibold text-muted">
            Anything we should know before the call?
            <textarea
              name="notes"
              rows={compact ? 3 : 4}
              className="resize-none rounded-2xl border border-border-subtle bg-bg-elevated px-4 py-3 text-foreground outline-none transition focus:border-brand-soft focus:ring-4 focus:ring-brand/25"
              placeholder="Optional — your business, the challenge, or what you want to see."
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={submitStatus === "loading"}
              className="inline-flex h-[52px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-electric to-brand-soft px-6 text-sm font-bold text-white shadow-[0_6px_20px_rgba(125,60,152,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_26px_rgba(125,60,152,0.4)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitStatus === "loading" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ArrowRight className="size-4" />
              )}
              Confirm {selectedDay?.label} · {selectedSlot.label}
            </button>
            <button
              type="button"
              onClick={() => setSelectedSlot(null)}
              className="inline-flex items-center gap-1 text-sm font-bold text-muted transition hover:text-brand-glow-text"
            >
              <ArrowLeft className="size-3.5" /> Change time
            </button>
          </div>

          {message && submitStatus === "error" ? (
            <p className="text-sm text-red-300">{message}</p>
          ) : null}
          {message && submitStatus !== "error" ? (
            <p className="flex items-center gap-2 text-sm text-brand-glow-text">
              <CheckCircle2 className="size-4" /> {message}
            </p>
          ) : null}
        </form>
      ) : null}
    </div>
  );
}
