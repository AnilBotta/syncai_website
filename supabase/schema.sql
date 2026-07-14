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
  concession_notes text,
  -- Email/compliance (migration 002)
  unsubscribed_at timestamptz
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
  lead_id uuid references public.leads(id) on delete set null,
  -- Video-meeting details (migration 012), populated when a booking is finalized.
  meeting_url text,
  meeting_id text,
  -- The attendee's own IANA timezone (migration 013), used to show them the
  -- meeting time in their local time. Null => fall back to `timezone` above.
  attendee_timezone text
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

create table if not exists public.approvals (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type text not null check (type in ('email', 'negotiation_reply', 'document', 'invoice', 'icp', 'sequence_autosend', 'pipeline_batch', 'pipeline_calls', 'pipeline_bookcall', 'pipeline_start')),
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

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  finished_at timestamptz,
  lead_id uuid references public.leads(id) on delete cascade,
  agent text not null check (agent in ('manager', 'qualify', 'research', 'email_draft', 'sequence_draft', 'scraper', 'negotiate', 'document', 'finance')),
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

create index if not exists agent_runs_created_at_idx on public.agent_runs (created_at desc);
create index if not exists agent_runs_lead_id_idx on public.agent_runs (lead_id, created_at desc);

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

create unique index if not exists prospects_domain_icp_unique
  on public.prospects (icp_id, domain)
  where domain is not null;
create index if not exists prospects_status_idx on public.prospects (status, created_at desc);

create table if not exists public.sequences (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  description text,
  active boolean not null default true,
  auto_send boolean not null default false
);

alter table public.sequences enable row level security;
drop policy if exists "Admin service role can manage sequences" on public.sequences;
create policy "Admin service role can manage sequences"
on public.sequences for all
using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

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

create unique index if not exists sequence_enrollments_active_unique
  on public.sequence_enrollments (lead_id, sequence_id)
  where status = 'active';
create index if not exists sequence_enrollments_due_idx
  on public.sequence_enrollments (status, next_run_at);

alter table public.emails
  drop constraint if exists emails_sequence_enrollment_fk;
alter table public.emails
  add constraint emails_sequence_enrollment_fk
  foreign key (sequence_enrollment_id) references public.sequence_enrollments(id) on delete set null;

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lead_id uuid references public.leads(id) on delete cascade,
  type text not null check (type in ('proposal', 'agreement', 'onboarding', 'offer_letter')),
  title text not null,
  content_md text not null,
  status text not null default 'draft'
    check (status in ('draft', 'approved', 'sent', 'viewed', 'accepted', 'cancelled')),
  accept_token text not null unique,
  sent_at timestamptz,
  viewed_at timestamptz,
  accepted_at timestamptz,
  accepted_ip text,
  meta jsonb not null default '{}'::jsonb
);

alter table public.documents enable row level security;
drop policy if exists "Admin service role can manage documents" on public.documents;
create policy "Admin service role can manage documents"
on public.documents for all
using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create index if not exists documents_lead_idx on public.documents (lead_id, created_at desc);
create index if not exists documents_token_idx on public.documents (accept_token);

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

create unique index if not exists pipelines_active_lead_idx on public.pipelines (lead_id) where status = 'active';
create index if not exists pipelines_batch_idx on public.pipelines (batch_id);
create index if not exists pipelines_stage_idx on public.pipelines (status, stage);
create index if not exists pipelines_lead_idx on public.pipelines (lead_id, created_at desc);
