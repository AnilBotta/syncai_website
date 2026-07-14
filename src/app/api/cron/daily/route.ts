import { NextResponse } from "next/server";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase";
import { tickDueEnrollments } from "@/lib/sequences";
import { buildBriefing } from "@/lib/briefing";
import { sendEmail } from "@/lib/email/resend";
import { notifyCeo } from "@/lib/telegram";
import { pollReplies, hasGmailConfig } from "@/lib/gmail";
import { tickPipelines } from "@/lib/pipeline";
import { serverErrorResponse } from "@/lib/api-errors";

// Hobby plan caps functions at 60s. Keep the work bounded to fit.
export const maxDuration = 60;

const CRON_SECRET = process.env.CRON_SECRET;

/**
 * Daily cron (Vercel triggers with `Authorization: Bearer <CRON_SECRET>`):
 * 1) advance due nurture enrollments (drafts into the Approval Inbox),
 * 2) email + Telegram the CEO a morning briefing.
 * Heavy scraping is intentionally NOT run here — it's triggered from the dashboard.
 */
export async function GET(request: Request) {
  // Verify the caller. When CRON_SECRET is set, require it (Vercel supplies it).
  if (CRON_SECRET) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ ok: true, demoMode: true });
  }

  try {
    const supabase = createSupabaseAdminClient();

    // Fallback for when the 10-min external inbox cron isn't configured: detect
    // replies and run pipeline timers once a day too.
    if (hasGmailConfig()) await pollReplies(supabase).catch(() => {});
    await tickPipelines(supabase).catch(() => {});

    const tick = await tickDueEnrollments(supabase);
    const briefing = await buildBriefing(supabase, tick);

    const adminEmail = process.env.ADMIN_EMAIL;
    let emailed = false;
    if (adminEmail) {
      const sent = await sendEmail({
        to: adminEmail,
        subject: briefing.subject,
        html: briefing.html,
        text: briefing.text,
      });
      emailed = sent.ok;
    }

    const telegrammed = await notifyCeo(briefing.text);

    return NextResponse.json({
      ok: true,
      tick,
      briefing: { emailed, telegrammed },
    });
  } catch (error) {
    return serverErrorResponse("cron/daily:GET", error);
  }
}
