import { NextResponse } from "next/server";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase";
import { pollReplies, hasGmailConfig } from "@/lib/gmail";
import { tickPipelines } from "@/lib/pipeline";
import { serverErrorResponse } from "@/lib/api-errors";

// Polls Gmail for lead replies and runs pipeline timers. Hobby caps at 60s;
// the poll is capped at 20 messages so it always fits.
export const maxDuration = 60;

const CRON_SECRET = process.env.CRON_SECRET;

/**
 * Reply/inbox cron. Registered with an external scheduler (cron-job.org) to run
 * every ~10 minutes since Vercel Hobby only allows daily crons:
 *   GET https://www.syncai.tech/api/cron/inbox   Authorization: Bearer <CRON_SECRET>
 * Also called from /api/cron/daily as a once-a-day fallback.
 */
export async function GET(request: Request) {
  if (CRON_SECRET) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  if (!hasSupabaseAdminConfig()) return NextResponse.json({ ok: true, demoMode: true });

  try {
    const supabase = createSupabaseAdminClient();
    const replies = hasGmailConfig()
      ? await pollReplies(supabase)
      : { ok: false, processed: 0, matched: 0, advanced: 0, reason: "no_gmail_config" as const };
    await tickPipelines(supabase);
    return NextResponse.json({ ok: true, replies });
  } catch (error) {
    return serverErrorResponse("cron/inbox:GET", error);
  }
}
