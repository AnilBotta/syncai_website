import type { SupabaseClient } from "@supabase/supabase-js";
import type { Expense, Invoice, InvoiceLineItem } from "@/lib/supabase";

/** Line-item total for an invoice (quantity × unit amount). */
export function invoiceTotal(lineItems: InvoiceLineItem[]): number {
  const sum = lineItems.reduce((acc, li) => acc + (Number(li.quantity) || 0) * (Number(li.unit_amount) || 0), 0);
  return Math.round(sum * 100) / 100;
}

/** Sequential, human-readable invoice number: INV-2026-0001. */
export async function nextInvoiceNumber(supabase: SupabaseClient): Promise<string> {
  const year = new Date().getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1)).toISOString();
  const { count } = await supabase
    .from("invoices")
    .select("*", { count: "exact", head: true })
    .gte("created_at", yearStart);
  const seq = String((count || 0) + 1).padStart(4, "0");
  return `INV-${year}-${seq}`;
}

const MONTHS = 12;

function monthKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export type FinanceSummary = {
  collectedRevenue: number; // cash actually received (paid invoices)
  wonDealValue: number; // booked value of won leads (may not be collected yet)
  outstanding: number; // sent-but-unpaid invoices
  expensesTotal: number;
  netCash: number; // collectedRevenue - expensesTotal
  netThisMonth: number;
  monthly: { month: string; revenue: number; expenses: number }[];
};

/**
 * Cash-basis finance summary. Revenue = paid invoices (real money in), so it
 * never double-counts a won lead that also has a paid invoice. Won deal value is
 * reported separately as a booked-but-maybe-uncollected figure.
 */
export async function getFinanceSummary(supabase: SupabaseClient): Promise<FinanceSummary> {
  const now = new Date();
  const thisMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

  const [{ data: invoices }, { data: expenses }, { data: wonLeads }] = await Promise.all([
    supabase.from("invoices").select("amount, status, paid_at"),
    supabase.from("expenses").select("amount, incurred_on"),
    supabase.from("leads").select("value").eq("status", "won"),
  ]);

  const inv = (invoices || []) as Pick<Invoice, "amount" | "status" | "paid_at">[];
  const exp = (expenses || []) as Pick<Expense, "amount" | "incurred_on">[];

  const collectedRevenue = round(
    inv.filter((i) => i.status === "paid").reduce((s, i) => s + Number(i.amount || 0), 0),
  );
  const outstanding = round(
    inv.filter((i) => i.status === "sent").reduce((s, i) => s + Number(i.amount || 0), 0),
  );
  const wonDealValue = round((wonLeads || []).reduce((s, l) => s + Number(l.value || 0), 0));
  const expensesTotal = round(exp.reduce((s, e) => s + Number(e.amount || 0), 0));

  // 12-month revenue-vs-expense buckets (oldest first).
  const buckets = new Map<string, { revenue: number; expenses: number }>();
  for (let i = MONTHS - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    buckets.set(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`, {
      revenue: 0,
      expenses: 0,
    });
  }
  for (const i of inv) {
    if (i.status !== "paid" || !i.paid_at) continue;
    const k = monthKey(i.paid_at);
    if (buckets.has(k)) buckets.get(k)!.revenue += Number(i.amount || 0);
  }
  for (const e of exp) {
    if (!e.incurred_on) continue;
    const k = monthKey(e.incurred_on);
    if (buckets.has(k)) buckets.get(k)!.expenses += Number(e.amount || 0);
  }

  const monthly = Array.from(buckets.entries()).map(([month, v]) => ({
    month,
    revenue: round(v.revenue),
    expenses: round(v.expenses),
  }));

  const thisMonthBucket = buckets.get(thisMonth) || { revenue: 0, expenses: 0 };

  return {
    collectedRevenue,
    wonDealValue,
    outstanding,
    expensesTotal,
    netCash: round(collectedRevenue - expensesTotal),
    netThisMonth: round(thisMonthBucket.revenue - thisMonthBucket.expenses),
    monthly,
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
