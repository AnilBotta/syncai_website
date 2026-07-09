-- Phase 2: Email infrastructure + generalized approval inbox.
-- Run in the Supabase SQL editor. Safe to re-run (idempotent).

-- Every outbound email is a row here. The only code path that calls Resend is
-- POST /api/admin/emails/send, so "nothing auto-sends" is enforced structurally.
create table if not exists public.emails (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lead_id uuid references public.leads(id) on delete set null,
  direction text not null default 'outbound' check (direction in ('outbound', 'inbound')),
  to_email text not null,
  subject text not null,
  body_text text not null,
  status text not null default 'draft' check (status in ('draft', 'approved', 'sent', 'failed', 'cancelled')),
  source text not null default 'manual' check (source in ('manual', 'agent', 'sequence')),
  sequence_enrollment_id uuid,
  approved_at timestamptz,
  sent_at timestamptz,
  resend_id text,
  error text,
  meta jsonb not null default '{}'::jsonb
);

alter table public.emails enable row level security;

drop policy if exists "Admin service role can manage emails" on public.emails;
create policy "Admin service role can manage emails"
on public.emails
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create index if not exists emails_status_idx on public.emails (status, created_at desc);
create index if not exists emails_lead_id_idx on public.emails (lead_id);

-- Generalized approval queue. Every artifact an agent could ever send/activate
-- lands here as 'pending' until the CEO decides. entity_id points at the
-- underlying row (an email, document, invoice, etc.) by type.
create table if not exists public.approvals (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type text not null check (type in ('email', 'negotiation_reply', 'document', 'invoice', 'icp', 'sequence_autosend')),
  entity_id uuid,
  lead_id uuid references public.leads(id) on delete cascade,
  title text not null,
  summary text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  decided_at timestamptz,
  meta jsonb not null default '{}'::jsonb
);

alter table public.approvals enable row level security;

drop policy if exists "Admin service role can manage approvals" on public.approvals;
create policy "Admin service role can manage approvals"
on public.approvals
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create index if not exists approvals_status_idx on public.approvals (status, created_at desc);
create index if not exists approvals_entity_idx on public.approvals (entity_id);

alter table public.leads
  add column if not exists unsubscribed_at timestamptz;
