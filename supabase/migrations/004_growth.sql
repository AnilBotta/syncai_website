-- Phase 4: Growth team — ideal-customer profiles (ICPs) + scraped prospects.
-- Run in the Supabase SQL editor. Safe to re-run (idempotent).

-- Who to hunt for. The CEO defines these, or the Manager proposes them
-- (source='manager', status='proposed') for the CEO to activate.
create table if not exists public.icps (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  industry text,
  location text,
  company_size text,
  keywords text,
  status text not null default 'active' check (status in ('proposed', 'active', 'paused')),
  source text not null default 'ceo' check (source in ('ceo', 'manager')),
  rationale text
);

alter table public.icps enable row level security;

drop policy if exists "Admin service role can manage icps" on public.icps;
create policy "Admin service role can manage icps"
on public.icps
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create index if not exists icps_status_idx on public.icps (status);

-- Companies/contacts the scraper found. Promoted into leads (source='outbound')
-- only when the CEO approves first outreach.
create table if not exists public.prospects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  icp_id uuid references public.icps(id) on delete set null,
  company text not null,
  domain text,
  contact_name text,
  email text,
  phone text,
  source text not null default 'manual' check (source in ('apollo', 'places', 'manual')),
  enrichment jsonb not null default '{}'::jsonb,
  status text not null default 'found' check (status in ('found', 'enriched', 'promoted', 'discarded')),
  lead_id uuid references public.leads(id) on delete set null
);

alter table public.prospects enable row level security;

drop policy if exists "Admin service role can manage prospects" on public.prospects;
create policy "Admin service role can manage prospects"
on public.prospects
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

-- De-dupe: one prospect per company domain per ICP (partial: only when domain is set).
create unique index if not exists prospects_domain_icp_unique
  on public.prospects (icp_id, domain)
  where domain is not null;
create index if not exists prospects_status_idx on public.prospects (status, created_at desc);

-- Allow the scraper agent to be recorded in agent_runs.
alter table public.agent_runs drop constraint if exists agent_runs_agent_check;
alter table public.agent_runs add constraint agent_runs_agent_check
  check (agent in ('manager', 'qualify', 'research', 'email_draft', 'sequence_draft', 'scraper'));
