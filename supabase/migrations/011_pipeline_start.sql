-- Automation Pipeline: add a single-lead "start automation?" gate so the
-- Manager can ask the CEO on Telegram before drafting outreach for one lead
-- (the batch flow already asks via pipeline_batch). Safe to re-run.

alter table public.approvals drop constraint if exists approvals_type_check;
alter table public.approvals add constraint approvals_type_check
  check (type in (
    'email', 'negotiation_reply', 'document', 'invoice', 'icp', 'sequence_autosend',
    'pipeline_batch', 'pipeline_calls', 'pipeline_bookcall', 'pipeline_start'
  ));
