# SyncAI Technologies Website

Premium AI agency website for SyncAI Technologies, built with Next.js, TypeScript, Tailwind CSS, Framer Motion, React Three Fiber, Supabase, and OpenAI.

## Features

- Interactive 3D hero — a mouse-reactive neural orb rendered with React Three Fiber (phones, reduced-motion users, and non-WebGL browsers automatically get the static brand image instead)
- Scroll reveals, parallax, and 3D tilt cards across every section
- **SyncAI Assistant** — a site-wide chat + voice widget:
  - Chat tab: streaming AI answers grounded in the site's services, industries, process, and FAQs; can capture leads and book appointments mid-conversation
  - Voice tab: real-time voice conversations via the OpenAI Realtime API (WebRTC) that can answer questions and book appointments hands-free
- **Appointment booking** — custom Supabase-backed scheduler at `/book` (Mon–Fri, 9–5 Eastern, 30-minute slots, double-booking protection), also used by the chat and voice bots
- AI Pain Point Analyzer demo with OpenAI support and local fallback mode
- Lead capture API
- Private Supabase-powered admin dashboard with **Leads and Appointments tabs**, status pipelines, notes, and CSV export
- Every AI/database feature degrades gracefully to demo mode when API keys are missing

## Environment

Copy `.env.example` to `.env.local` and add:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAIL=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
OPENAI_REALTIME_MODEL=gpt-realtime-2
```

- `ADMIN_EMAIL` should match the single Supabase Auth user allowed to manage leads and appointments.
- `OPENAI_API_KEY` powers the demo analyzer, the chatbot, and the voice bot. Without it, everything runs in demo mode.
- `OPENAI_REALTIME_MODEL` is the Realtime model used for voice sessions (swap to `gpt-realtime-mini` to reduce cost).

## Supabase Setup

Run `supabase/schema.sql` in the Supabase SQL editor — it creates both the `leads` and `appointments` tables (re-running it is safe; everything is `if not exists`). Then create one Auth user for the admin account.

## Booking configuration

Slot rules (business hours, slot length, lead time, booking horizon, timezone) live in `src/lib/booking.ts` under `BOOKING_CONFIG`.

## Development

```bash
npm run dev
```

Open `http://localhost:3000`.

## Deployment

Deploy to Vercel, add the environment variables, and point `www.syncai.tech` to the Vercel project. Configure the root domain to redirect to `www.syncai.tech` or the reverse, but make sure both hosts resolve cleanly.

Voice sessions use WebRTC directly from the browser to OpenAI; no extra infrastructure is needed, but the site must be served over HTTPS (or localhost) for microphone access.
