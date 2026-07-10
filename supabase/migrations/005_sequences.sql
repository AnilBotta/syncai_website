-- Phase 5: Nurture sequences — templates, steps, and per-lead enrollments.
-- Run in the Supabase SQL editor. Safe to re-run (idempotent).

create table if not exists public.sequences (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  description text,
  active boolean not null default true,
  -- OFF by default: the CEO must explicitly opt a sequence into auto-sending.
  auto_send boolean not null default false
);

alter table public.sequences enable row level security;
drop policy if exists "Admin service role can manage sequences" on public.sequences;
create policy "Admin service role can manage sequences"
on public.sequences for all
using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- Steps are instructions to the outreach agent (not static templates), so each
-- send is personalized from the lead's real data.
create table if not exists public.sequence_steps (
  id uuid primary key default gen_random_uuid(),
  sequence_id uuid not null references public.sequences(id) on delete cascade,
  step_order int not null,
  day_offset int not null,
  intent text not null default 'follow_up',
  instruction text not null
);

alter table public.sequence_steps enable row level security;
drop policy if exists "Admin service role can manage sequence_steps" on public.sequence_steps;
create policy "Admin service role can manage sequence_steps"
on public.sequence_steps for all
using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create index if not exists sequence_steps_seq_idx on public.sequence_steps (sequence_id, step_order);

create table if not exists public.sequence_enrollments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  sequence_id uuid not null references public.sequences(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'cancelled')),
  current_step int not null default 0,
  next_run_at timestamptz not null
);

alter table public.sequence_enrollments enable row level security;
drop policy if exists "Admin service role can manage sequence_enrollments" on public.sequence_enrollments;
create policy "Admin service role can manage sequence_enrollments"
on public.sequence_enrollments for all
using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- One active enrollment per lead per sequence.
create unique index if not exists sequence_enrollments_active_unique
  on public.sequence_enrollments (lead_id, sequence_id)
  where status = 'active';
create index if not exists sequence_enrollments_due_idx
  on public.sequence_enrollments (status, next_run_at);

-- Link drafted emails back to the enrollment that produced them.
alter table public.emails
  drop constraint if exists emails_sequence_enrollment_fk;
alter table public.emails
  add constraint emails_sequence_enrollment_fk
  foreign key (sequence_enrollment_id) references public.sequence_enrollments(id) on delete set null;

-- Seed one default sequence (day 0 intro / day 3 value / day 7 case study).
insert into public.sequences (name, description, active, auto_send)
select 'Standard nurture', '3-touch follow-up: intro, value, case study', true, false
where not exists (select 1 from public.sequences where name = 'Standard nurture');

insert into public.sequence_steps (sequence_id, step_order, day_offset, intent, instruction)
select s.id, v.step_order, v.day_offset, v.intent, v.instruction
from public.sequences s
cross join (values
  (0, 0, 'intro', 'Warm, brief intro. Reference their business/pain point and offer a quick 15-min call.'),
  (1, 3, 'value', 'Share one specific, concrete way SyncAI could help their business. Still low-pressure.'),
  (2, 7, 'case_study', 'Share a relevant result/case study for a similar business and invite a reply.')
) as v(step_order, day_offset, intent, instruction)
where s.name = 'Standard nurture'
  and not exists (select 1 from public.sequence_steps ss where ss.sequence_id = s.id);
