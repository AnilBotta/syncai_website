# SyncAi Technologies Website

Modern AI agency website for SyncAi Technologies, built with Next.js, TypeScript, Tailwind CSS, Supabase, and OpenAI.

## Features

- AI strategy and consulting positioning
- Pages for solutions, demos, industries, process, and contact
- Real AI demo endpoint with OpenAI support and local fallback mode
- Lead capture API
- Private Supabase-powered admin dashboard
- Lead status pipeline and CSV export

## Environment

Copy `.env.example` to `.env.local` and add:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAIL=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
```

`ADMIN_EMAIL` should match the single Supabase Auth user allowed to manage leads.

## Supabase Setup

Run `supabase/schema.sql` in the Supabase SQL editor. Then create one Auth user for the admin account.

## Development

```bash
npm run dev
```

Open `http://localhost:3000`.

## Deployment

Deploy to Vercel, add the environment variables, and point `www.syncai.tech` to the Vercel project. Configure the root domain to redirect to `www.syncai.tech` or the reverse, but make sure both hosts resolve cleanly.
