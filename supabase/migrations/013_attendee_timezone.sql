-- The attendee's own IANA timezone (e.g. Asia/Kolkata, Europe/London), so the
-- confirmation email can show the meeting time in THEIR local time rather than
-- always in the business timezone. Nullable — when unknown we fall back to the
-- business timezone (appointments.timezone). Safe to re-run.

alter table public.appointments add column if not exists attendee_timezone text;
