-- Phase 7B: Closing team pt.2 — invoices + expenses (finance).
-- Run in the Supabase SQL editor. Safe to re-run (idempotent).

-- Invoices: created by the CEO/Finance agent, approved, then either sent via
-- Stripe Invoicing (hosted pay page) or as an e-transfer request. Marked paid by
-- the Stripe webhook, or manually for e-transfers.
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lead_id uuid references public.leads(id) on delete set null,
  number text not null unique,
  line_items jsonb not null default '[]'::jsonb,
  amount numeric(12,2) not null default 0,
  currency text not null default 'CAD',
  method text not null default 'etransfer' check (method in ('stripe', 'etransfer')),
  status text not null default 'draft'
    check (status in ('draft', 'approved', 'sent', 'paid', 'void')),
  stripe_invoice_id text,
  hosted_invoice_url text,
  due_on date,
  sent_at timestamptz,
  paid_at timestamptz,
  notes text,
  meta jsonb not null default '{}'::jsonb
);

alter table public.invoices enable row level security;
drop policy if exists "Admin service role can manage invoices" on public.invoices;
create policy "Admin service role can manage invoices"
on public.invoices for all
using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create index if not exists invoices_lead_idx on public.invoices (lead_id, created_at desc);
create index if not exists invoices_status_idx on public.invoices (status, created_at desc);
create index if not exists invoices_stripe_idx on public.invoices (stripe_invoice_id);

-- Business expenses for the P&L. external_source/external_id reserved for a
-- future Stripe/QuickBooks import so rows can be de-duplicated.
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  incurred_on date not null default current_date,
  category text not null default 'other'
    check (category in ('software', 'contractor', 'marketing', 'ai_api', 'hardware', 'fees', 'other')),
  vendor text,
  description text,
  amount numeric(12,2) not null default 0,
  currency text not null default 'CAD',
  recurring boolean not null default false,
  external_source text,
  external_id text
);

alter table public.expenses enable row level security;
drop policy if exists "Admin service role can manage expenses" on public.expenses;
create policy "Admin service role can manage expenses"
on public.expenses for all
using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create index if not exists expenses_incurred_idx on public.expenses (incurred_on desc);

-- Allow the finance agent to be recorded in agent_runs.
alter table public.agent_runs drop constraint if exists agent_runs_agent_check;
alter table public.agent_runs add constraint agent_runs_agent_check
  check (agent in ('manager', 'qualify', 'research', 'email_draft', 'sequence_draft', 'scraper', 'negotiate', 'document', 'finance'));
