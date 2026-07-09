-- Phase 3: Manager agent runs + Telegram conversation memory.
-- Run in the Supabase SQL editor. Safe to re-run (idempotent).

-- One row per agent invocation. Drives the daily budget guard and the
-- "AI spend" indicator, and gives a full audit trail of what agents did.
create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  finished_at timestamptz,
  lead_id uuid references public.leads(id) on delete cascade,
  agent text not null check (agent in ('manager', 'qualify', 'research', 'email_draft', 'sequence_draft')),
  status text not null default 'running' check (status in ('running', 'succeeded', 'failed')),
  thread_key text,
  input jsonb not null default '{}'::jsonb,
  output jsonb,
  model text,
  tokens_in int,
  tokens_out int,
  cost_usd numeric(10,4),
  error text
);

alter table public.agent_runs enable row level security;

drop policy if exists "Admin service role can manage agent_runs" on public.agent_runs;
create policy "Admin service role can manage agent_runs"
on public.agent_runs
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

-- Budget queries scan by created_at; this index keeps them cheap.
create index if not exists agent_runs_created_at_idx on public.agent_runs (created_at desc);
create index if not exists agent_runs_lead_id_idx on public.agent_runs (lead_id, created_at desc);

-- Conversation memory for channels with no client-held history (Telegram).
-- The dashboard chat keeps its own history client-side, so it doesn't use this.
create table if not exists public.manager_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  channel text not null check (channel in ('dashboard', 'telegram')),
  external_key text not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null
);

alter table public.manager_messages enable row level security;

drop policy if exists "Admin service role can manage manager_messages" on public.manager_messages;
create policy "Admin service role can manage manager_messages"
on public.manager_messages
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create index if not exists manager_messages_key_idx
  on public.manager_messages (channel, external_key, created_at desc);
