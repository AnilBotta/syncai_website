-- Phase 1: CRM core — deal fields on leads, activity timeline, tasks.
-- Run in the Supabase SQL editor. Safe to re-run (idempotent).

alter table public.leads
  add column if not exists value numeric(12,2) not null default 0,
  add column if not exists won_at timestamptz,
  add column if not exists last_contacted_at timestamptz,
  add column if not exists score int,
  add column if not exists score_rationale text,
  add column if not exists next_action text,
  add column if not exists floor_price numeric(12,2),
  add column if not exists max_discount_pct int,
  add column if not exists concession_notes text;

create table if not exists public.lead_activities (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  type text not null check (type in ('note', 'status_change', 'email', 'agent_run', 'task', 'document', 'call', 'system')),
  title text not null,
  body text,
  meta jsonb not null default '{}'::jsonb,
  actor text not null default 'ceo'
);

alter table public.lead_activities enable row level security;

drop policy if exists "Admin service role can manage lead_activities" on public.lead_activities;
create policy "Admin service role can manage lead_activities"
on public.lead_activities
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create index if not exists lead_activities_lead_id_idx
  on public.lead_activities (lead_id, created_at desc);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lead_id uuid references public.leads(id) on delete cascade,
  title text not null,
  due_at timestamptz,
  status text not null default 'open' check (status in ('open', 'done', 'dismissed')),
  completed_at timestamptz
);

alter table public.tasks enable row level security;

drop policy if exists "Admin service role can manage tasks" on public.tasks;
create policy "Admin service role can manage tasks"
on public.tasks
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create index if not exists tasks_status_due_idx on public.tasks (status, due_at);
create index if not exists tasks_lead_id_idx on public.tasks (lead_id);
