-- Phase 8: Voice — outbound calls placed via an external voice-agent provider
-- (Retell / Vapi / Millis …). We don't host the audio; we trigger the provider's
-- agent and record the call + transcript it reports back via webhook.
-- Run in the Supabase SQL editor. Safe to re-run (idempotent).

create table if not exists public.calls (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lead_id uuid references public.leads(id) on delete set null,
  provider text not null default 'retell',
  provider_call_id text,
  direction text not null default 'outbound' check (direction in ('outbound', 'inbound')),
  to_number text,
  from_number text,
  status text not null default 'queued'
    check (status in ('queued', 'ringing', 'in_progress', 'completed', 'failed', 'no_answer')),
  started_at timestamptz,
  ended_at timestamptz,
  duration_seconds int,
  transcript text,
  summary text,
  recording_url text,
  outcome text,
  meta jsonb not null default '{}'::jsonb
);

alter table public.calls enable row level security;
drop policy if exists "Admin service role can manage calls" on public.calls;
create policy "Admin service role can manage calls"
on public.calls for all
using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create index if not exists calls_lead_idx on public.calls (lead_id, created_at desc);
create index if not exists calls_provider_idx on public.calls (provider_call_id);
