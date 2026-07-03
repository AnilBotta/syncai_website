"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2, RefreshCcw, Search } from "lucide-react";
import { appointmentStatuses } from "@/lib/site-data";
import type { Appointment } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";

type AdminAppointmentsProps = {
  getToken: () => Promise<string>;
};

export function AdminAppointments({ getToken }: AdminAppointmentsProps) {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [range, setRange] = useState<"upcoming" | "past" | "all">("upcoming");
  const [error, setError] = useState("");
  const [demoMode, setDemoMode] = useState(false);
  const [now, setNow] = useState(0);

  const filtered = useMemo(() => {
    return appointments.filter((appointment) => {
      const text = [appointment.name, appointment.email, appointment.company, appointment.service]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesQuery = text.includes(query.toLowerCase());
      const matchesStatus = status === "all" || appointment.status === status;
      const startsAt = new Date(appointment.starts_at).getTime();
      const matchesRange =
        range === "all" || (range === "upcoming" ? startsAt >= now : startsAt < now);
      return matchesQuery && matchesStatus && matchesRange;
    });
  }, [appointments, query, status, range, now]);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError("");
    setNow(Date.now());

    try {
      const token = await getToken();
      if (!token) {
        router.push("/admin/login");
        return;
      }

      const response = await fetch("/api/admin/appointments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not load appointments.");
      }

      setAppointments(result.appointments || []);
      setSelected(result.appointments?.[0] || null);
      setDemoMode(Boolean(result.demoMode));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load appointments.");
    } finally {
      setLoading(false);
    }
  }, [getToken, router]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAppointments();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadAppointments]);

  async function saveAppointment(formData: FormData) {
    if (!selected) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const token = await getToken();
      const nextStatus = String(formData.get("status") || selected.status);
      const notes = String(formData.get("notes") || "");

      const response = await fetch("/api/admin/appointments", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: selected.id, status: nextStatus, notes }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not save appointment.");
      }

      const updated = { ...selected, status: nextStatus as Appointment["status"], notes };
      setSelected(updated);
      setAppointments((current) =>
        current.map((appointment) => (appointment.id === selected.id ? updated : appointment)),
      );
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save appointment.");
    } finally {
      setSaving(false);
    }
  }

  function exportCsv() {
    const headers = ["created_at", "name", "email", "phone", "company", "service", "starts_at", "ends_at", "timezone", "source", "status", "notes"];
    const rows = filtered.map((appointment) =>
      headers.map((header) => JSON.stringify(String(appointment[header as keyof Appointment] || ""))).join(","),
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "syncai-appointments.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function formatSlot(appointment: Appointment) {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: appointment.timezone || "America/Toronto",
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(appointment.starts_at));
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[.95fr_1.05fr] lg:px-8">
      <section className="rounded-[2rem] border border-border-subtle bg-bg-elevated p-5 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <label className="relative">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-12 w-full rounded-full border border-border-subtle pl-11 pr-4 text-sm outline-none focus:border-brand-soft focus:ring-4 focus:ring-brand/25"
              placeholder="Search appointments"
            />
          </label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-12 rounded-full border border-border-subtle px-4 text-sm font-semibold outline-none focus:border-brand-soft focus:ring-4 focus:ring-brand/25"
          >
            <option value="all">All statuses</option>
            {appointmentStatuses.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {(["upcoming", "past", "all"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRange(value)}
              className={`rounded-full px-4 py-2 text-xs font-bold capitalize transition ${
                range === value ? "bg-brand-deep text-white" : "border border-border-subtle text-muted"
              }`}
            >
              {value}
            </button>
          ))}
          <span className="flex-1" />
          <button
            onClick={loadAppointments}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-border-subtle bg-bg-elevated px-3 text-xs font-bold text-muted"
          >
            <RefreshCcw className="size-3.5" />
            Refresh
          </button>
          <button
            onClick={exportCsv}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-border-subtle bg-bg-elevated px-3 text-xs font-bold text-muted"
          >
            <Download className="size-3.5" />
            CSV
          </button>
        </div>

        {demoMode ? (
          <div className="mt-4 rounded-2xl border border-amber-300/30 bg-amber-400/10 p-4 text-sm text-amber-200">
            Demo mode is active. Add Supabase service keys to show live appointments.
          </div>
        ) : null}

        {error ? <p className="mt-4 rounded-2xl bg-red-500/10 p-4 text-sm text-red-300">{error}</p> : null}

        <div className="mt-5 grid gap-3">
          {loading ? (
            <div className="flex h-40 items-center justify-center text-muted">
              <Loader2 className="mr-2 size-5 animate-spin" />
              Loading appointments
            </div>
          ) : filtered.length ? (
            filtered.map((appointment) => (
              <button
                type="button"
                key={appointment.id}
                onClick={() => setSelected(appointment)}
                className={`rounded-3xl border p-4 text-left transition ${
                  selected?.id === appointment.id
                    ? "border-brand-soft bg-brand-deep/20"
                    : "border-border-subtle hover:border-border-subtle"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-foreground">{appointment.name}</p>
                    <p className="mt-1 text-sm text-muted">{formatSlot(appointment)}</p>
                  </div>
                  <span className="rounded-full bg-brand-deep px-3 py-1 text-xs font-bold capitalize text-white">
                    {appointment.status.replace("_", " ")}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {appointment.service || "Strategy call"} · via {appointment.source.replace("_", " ")}
                </p>
              </button>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-border-subtle p-8 text-center text-sm text-muted">
              No appointments match this view.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-[2rem] border border-border-subtle bg-bg-elevated p-5 shadow-sm">
        {selected ? (
          <form action={saveAppointment}>
            <div className="flex flex-col gap-4 border-b border-border-subtle pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-black text-foreground">{selected.name}</h2>
                <p className="mt-1 text-sm text-muted">Booked {formatDate(selected.created_at)}</p>
              </div>
              <select
                name="status"
                defaultValue={selected.status}
                className="h-11 rounded-full border border-border-subtle px-4 text-sm font-bold capitalize outline-none focus:border-brand-soft focus:ring-4 focus:ring-brand/25"
              >
                {appointmentStatuses.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Info label="When" value={formatSlot(selected)} />
              <Info label="Timezone" value={selected.timezone} />
              <Info label="Email" value={selected.email} />
              <Info label="Phone" value={selected.phone || "Not provided"} />
              <Info label="Company" value={selected.company || "Not provided"} />
              <Info label="Service" value={selected.service || "Not provided"} />
              <Info label="Source" value={selected.source.replace("_", " ")} />
            </div>

            {selected.notes ? (
              <div className="mt-6 rounded-3xl bg-surface p-5">
                <p className="text-sm font-black text-foreground">Visitor notes</p>
                <p className="mt-2 whitespace-pre-line leading-7 text-muted">{selected.notes}</p>
              </div>
            ) : null}

            <label className="mt-6 grid gap-2 text-sm font-black text-foreground">
              Notes
              <textarea
                name="notes"
                defaultValue={selected.notes || ""}
                rows={6}
                className="resize-none rounded-3xl border border-border-subtle p-4 text-sm font-normal leading-7 text-muted outline-none focus:border-brand-soft focus:ring-4 focus:ring-brand/25"
                placeholder="Call prep, confirmation status, or outcome."
              />
            </label>

            <button
              type="submit"
              disabled={saving}
              className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand-deep px-6 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              Save appointment
            </button>
          </form>
        ) : (
          <div className="flex min-h-96 items-center justify-center text-sm text-muted">
            Select an appointment to view details.
          </div>
        )}
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-border-subtle p-4">
      <p className="text-xs font-black uppercase tracking-[.18em] text-muted">{label}</p>
      <p className="mt-2 break-words text-sm font-bold text-foreground/90">{value}</p>
    </div>
  );
}
