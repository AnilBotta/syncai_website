create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  company text,
  industry text,
  pain_point text not null,
  interest text,
  source text not null default 'website',
  demo_summary text,
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'proposal', 'won', 'lost')),
  notes text,
  -- CRM core (migration 001)
  value numeric(12,2) not null default 0,
  won_at timestamptz,
  last_contacted_at timestamptz,
  score int,
  score_rationale text,
  next_action text,
  floor_price numeric(12,2),
  max_discount_pct int,
  concession_notes text
);

alter table public.leads enable row level security;

drop policy if exists "Admin service role can manage leads" on public.leads;
create policy "Admin service role can manage leads"
on public.leads
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  company text,
  service text,
  notes text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null default 'America/Toronto',
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  source text not null default 'booking_page',
  lead_id uuid references public.leads(id) on delete set null
);

alter table public.appointments enable row level security;

drop policy if exists "Admin service role can manage appointments" on public.appointments;
create policy "Admin service role can manage appointments"
on public.appointments
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

-- Prevents double-booking: only one active appointment per slot.
create unique index if not exists appointments_slot_unique
  on public.appointments (starts_at)
  where status in ('pending', 'confirmed');

create index if not exists appointments_starts_at_idx on public.appointments (starts_at);
create index if not exists appointments_status_idx on public.appointments (status);

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
