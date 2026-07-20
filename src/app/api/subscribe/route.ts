import { NextResponse } from "next/server";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Footer newsletter signup. Intentionally light: an email + a honeypot, no
 * Turnstile (a low-value target compared to the lead form). Stores into
 * newsletter_subscribers, deduped by the table's unique(email) constraint.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { email?: unknown; company?: unknown }
    | null;

  // Honeypot: real users never fill the hidden "company" field.
  if (body && typeof body.company === "string" && body.company.trim()) {
    return NextResponse.json({ ok: true });
  }

  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ ok: true, demoMode: true });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("newsletter_subscribers").insert({ email, source: "footer" });

  // 23505 = already subscribed; treat as success so we don't leak membership.
  if (error && error.code !== "23505") {
    return NextResponse.json({ error: "Couldn't subscribe right now. Please try again later." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
