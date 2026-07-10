-- Phase 6: Negotiator agent — no new tables (guardrail columns already exist on
-- leads from migration 001). Just allow 'negotiate' in agent_runs.
-- Run in the Supabase SQL editor. Safe to re-run (idempotent).

alter table public.agent_runs drop constraint if exists agent_runs_agent_check;
alter table public.agent_runs add constraint agent_runs_agent_check
  check (agent in ('manager', 'qualify', 'research', 'email_draft', 'sequence_draft', 'scraper', 'negotiate'));
