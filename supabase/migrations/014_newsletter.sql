-- Newsletter subscribers captured from the site footer's "Stay ahead with AI" box.
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null unique,
  source text not null default 'footer',
  unsubscribed_at timestamptz
);

alter table public.newsletter_subscribers enable row level security;

drop policy if exists "Admin service role can manage newsletter_subscribers" on public.newsletter_subscribers;
create policy "Admin service role can manage newsletter_subscribers"
on public.newsletter_subscribers for all
using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create index if not exists newsletter_subscribers_created_idx
  on public.newsletter_subscribers (created_at desc);
