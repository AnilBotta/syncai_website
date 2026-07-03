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
  notes text
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
