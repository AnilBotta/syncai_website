"use client";

import { useCallback, useEffect, useState } from "react";
import { Banknote, Loader2, Plus, Receipt, Trash2, TrendingDown, Trophy, Wallet } from "lucide-react";
import type { Expense, Invoice } from "@/lib/supabase";
import { expenseCategories } from "@/lib/site-data";
import { formatDate } from "@/lib/utils";
import { Card } from "@/components/admin/ui/card";
import { StatCard } from "@/components/admin/ui/stat-card";
import { SectionHeader } from "@/components/admin/ui/section-header";
import { Badge, type BadgeTone } from "@/components/admin/ui/badge";
import { GradientAreaChart, type ChartSeries } from "@/components/admin/ui/gradient-area-chart";
import { DemoBanner, ErrorBanner } from "@/components/admin/ui/banners";

const cad = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });
const cad2 = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 2 });

type Summary = {
  collectedRevenue: number;
  wonDealValue: number;
  outstanding: number;
  expensesTotal: number;
  netCash: number;
  netThisMonth: number;
  monthly: { month: string; revenue: number; expenses: number }[];
};

const invoiceStatusTone: Record<Invoice["status"], BadgeTone> = {
  draft: "neutral",
  approved: "brand",
  sent: "warn",
  paid: "success",
  void: "danger",
};

export function Finance({ getToken }: { getToken: () => Promise<string> }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stripeReady, setStripeReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  // Expense quick-add form.
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(expenseCategories[0].value);
  const [vendor, setVendor] = useState("");
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      const response = await fetch("/api/admin/finance", { headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load finance.");
      setSummary(result.summary);
      setInvoices(result.invoices || []);
      setExpenses(result.expenses || []);
      setStripeReady(Boolean(result.stripeReady));
      setDemoMode(Boolean(result.demoMode));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load finance.");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function invoiceAction(id: string, action: "mark_paid" | "void") {
    setBusyId(id);
    setError("");
    try {
      const token = await getToken();
      const response = await fetch("/api/admin/invoices", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, action }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not update invoice.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update invoice.");
    } finally {
      setBusyId("");
    }
  }

  async function addExpense() {
    const value = Number(amount);
    if (!value || value <= 0) return;
    setAdding(true);
    setError("");
    try {
      const token = await getToken();
      const response = await fetch("/api/admin/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: value, category, vendor }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not add expense.");
      setAmount("");
      setVendor("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add expense.");
    } finally {
      setAdding(false);
    }
  }

  async function deleteExpense(id: string) {
    setBusyId(id);
    try {
      const token = await getToken();
      await fetch("/api/admin/expenses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, action: "delete" }),
      });
      await load();
    } finally {
      setBusyId("");
    }
  }

  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center text-muted">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Loading finance
      </div>
    );
  }

  if (demoMode || !summary) {
    return <DemoBanner message="Demo mode is active. Add Supabase service keys to show live finance data." />;
  }

  const monthLabel = (m: string) => new Date(`${m}-01T00:00:00Z`).toLocaleDateString("en-CA", { month: "short" });
  const financeSeries: ChartSeries[] = [
    { id: "rev", label: "Revenue", data: summary.monthly.map((m) => ({ label: monthLabel(m.month), value: m.revenue })), style: "solid", showArea: true },
    { id: "exp", label: "Expenses", data: summary.monthly.map((m) => ({ label: monthLabel(m.month), value: m.expenses })), style: "dashed" },
  ];

  return (
    <div className="grid gap-6">
      {error ? <ErrorBanner message={error} /> : null}

      {!stripeReady ? (
        <div className="rounded-[var(--radius-control)] border border-sidebar-border bg-foreground/[.03] p-4 text-sm text-muted">
          Stripe isn&apos;t connected yet — invoices will go out as e-transfer requests. Add <code>STRIPE_SECRET_KEY</code>{" "}
          to enable pay-online Stripe invoices.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Collected revenue" value={cad.format(summary.collectedRevenue)} icon={Banknote} tone="success" />
        <StatCard label="Expenses" value={cad.format(summary.expensesTotal)} icon={TrendingDown} tone="warn" />
        <StatCard label="Net cash" value={cad.format(summary.netCash)} icon={Wallet} tone={summary.netCash < 0 ? "danger" : "brand"} />
        <StatCard label="Outstanding" value={cad.format(summary.outstanding)} icon={Receipt} tone="info" />
        <StatCard label="Won deal value" value={cad.format(summary.wonDealValue)} icon={Trophy} tone="brand" />
      </div>

      <Card className="p-5">
        <SectionHeader
          title="Revenue vs expenses"
          eyebrow="Last 12 months"
          action={
            <div className="flex items-center gap-3 text-xs font-bold text-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-0.5 w-4 rounded bg-[var(--chart-line)]" /> Revenue
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-0.5 w-4 rounded bg-[var(--chart-line-compare)]" style={{ borderTop: "2px dashed" }} /> Expenses
              </span>
            </div>
          }
        />
        <div className="mt-4">
          <GradientAreaChart series={financeSeries} height={230} ariaLabel="Revenue versus expenses by month" valueFormatter={(n) => cad.format(n)} />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section className="rounded-[var(--radius-card-lg)] border border-sidebar-border bg-card p-5 shadow-card backdrop-blur-xl">
          <p className="text-sm font-black text-foreground">Invoices</p>
          <div className="mt-4 grid gap-2">
            {invoices.length ? (
              invoices.map((inv) => (
                <div key={inv.id} className="rounded-2xl border border-sidebar-border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-foreground">{inv.number}</p>
                    <Badge tone={invoiceStatusTone[inv.status]}>{inv.status}</Badge>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-sm font-black text-foreground">{cad2.format(Number(inv.amount))}</p>
                    <p className="text-xs text-muted">
                      {inv.method === "stripe" ? "Stripe" : "e-transfer"} · {formatDate(inv.created_at)}
                    </p>
                  </div>
                  {["sent"].includes(inv.status) ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => invoiceAction(inv.id, "mark_paid")}
                        disabled={busyId === inv.id}
                        className="inline-flex h-8 items-center rounded-full bg-success px-3 text-xs font-bold text-white disabled:opacity-60"
                      >
                        Mark paid
                      </button>
                      <button
                        type="button"
                        onClick={() => invoiceAction(inv.id, "void")}
                        disabled={busyId === inv.id}
                        className="inline-flex h-8 items-center rounded-full border border-sidebar-border px-3 text-xs font-bold text-muted disabled:opacity-60"
                      >
                        Void
                      </button>
                      {inv.hosted_invoice_url ? (
                        <a
                          href={inv.hosted_invoice_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-8 items-center rounded-full border border-sidebar-border px-3 text-xs font-bold text-brand-glow-text"
                        >
                          Stripe link
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-sidebar-border p-4 text-center text-sm text-muted">
                No invoices yet. Create one from a lead&apos;s drawer.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-[var(--radius-card-lg)] border border-sidebar-border bg-card p-5 shadow-card backdrop-blur-xl">
          <p className="text-sm font-black text-foreground">Expenses</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-[auto_1fr_auto]">
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              type="number"
              min={0}
              step="0.01"
              placeholder="$ amount"
              className="h-10 w-28 rounded-full border border-sidebar-border px-4 text-sm outline-none focus:border-brand-soft focus:ring-4 focus:ring-brand/25"
            />
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as typeof category)}
              className="h-10 rounded-full border border-sidebar-border px-4 text-sm font-bold text-foreground outline-none focus:border-brand-soft focus:ring-4 focus:ring-brand/25"
            >
              {expenseCategories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addExpense}
              disabled={adding || !amount}
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-brand-deep px-4 text-sm font-bold text-white disabled:opacity-60"
            >
              {adding ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Add
            </button>
          </div>
          <input
            value={vendor}
            onChange={(event) => setVendor(event.target.value)}
            placeholder="Vendor (optional)"
            className="mt-2 h-10 w-full rounded-full border border-sidebar-border px-4 text-sm outline-none focus:border-brand-soft focus:ring-4 focus:ring-brand/25"
          />

          <div className="mt-4 grid gap-2">
            {expenses.length ? (
              expenses.slice(0, 20).map((exp) => (
                <div key={exp.id} className="flex items-center justify-between rounded-2xl border border-sidebar-border p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">
                      {cad2.format(Number(exp.amount))} · {expenseCategories.find((c) => c.value === exp.category)?.label}
                    </p>
                    <p className="text-xs text-muted">
                      {exp.vendor ? `${exp.vendor} · ` : ""}
                      {exp.incurred_on}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteExpense(exp.id)}
                    disabled={busyId === exp.id}
                    className="grid size-8 shrink-0 place-items-center rounded-full border border-sidebar-border text-muted transition hover:text-danger disabled:opacity-60"
                    aria-label="Delete expense"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-sidebar-border p-4 text-center text-sm text-muted">
                No expenses logged yet.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
