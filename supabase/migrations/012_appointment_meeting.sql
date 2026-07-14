-- Zoom (or any provider) meeting details attached to a booked appointment.
-- Populated when a booking is finalized; both nullable so bookings still work
-- with no video provider configured. Safe to re-run.

alter table public.appointments add column if not exists meeting_url text;
alter table public.appointments add column if not exists meeting_id text;
