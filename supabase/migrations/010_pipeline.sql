-- Automation Pipeline: per-lead lifecycle state machine driven by the Manager,
-- gated by approvals (dashboard + Telegram buttons).
-- Run in the Supabase SQL editor. Safe to re-run (idempotent).

-- Approvals: add the three pipeline gate types.
alter table public.approvals drop constraint if exists approvals_type_check;
alter table public.approvals add constraint approvals_type_check
  check (type in (
    'email', 'negotiation_reply', 'document', 'invoice', 'icp', 'sequence_autosend',
    'pipeline_batch', 'pipeline_calls', 'pipeline_bookcall'
  ));

create table if not exists public.pipelines (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  batch_id uuid,
  prospect_id uuid references public.prospects(id) on delete set null,
  lead_id uuid references public.leads(id) on delete cascade,
  stage text not null default 'queued'
    check (stage in ('queued', 'awaiting_email_approval', 'awaiting_reply', 'awaiting_booking', 'paused_cold', 'done')),
  status text not null default 'active'
    check (status in ('active', 'paused', 'completed', 'cancelled')),
  stage_changed_at timestamptz not null default now(),
  meta jsonb not null default '{}'::jsonb
);

alter table public.pipelines enable row level security;
drop policy if exists "Admin service role can manage pipelines" on public.pipelines;
create policy "Admin service role can manage pipelines"
on public.pipelines for all
using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- One active pipeline per lead at a time.
create unique index if not exists pipelines_active_lead_idx
  on public.pipelines (lead_id) where status = 'active';
create index if not exists pipelines_batch_idx on public.pipelines (batch_id);
create index if not exists pipelines_stage_idx on public.pipelines (status, stage);
create index if not exists pipelines_lead_idx on public.pipelines (lead_id, created_at desc);
