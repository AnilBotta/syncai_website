import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase";
import { verifyUnsubscribe } from "@/lib/email/compliance";

function page(title: string, message: string, ok: boolean): Response {
  const color = ok ? "#1e8449" : "#c0392b";
  const html = `<!doctype html>
<html lang="en-CA">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="margin:0;background:#f6f7f9;font-family:Arial,Helvetica,sans-serif;color:#1a1a1f;">
    <div style="max-width:480px;margin:12vh auto;background:#fff;border-radius:16px;padding:40px;text-align:center;">
      <h1 style="font-size:22px;color:${color};margin:0 0 12px;">${title}</h1>
      <p style="font-size:15px;line-height:1.7;color:#4b5563;margin:0;">${message}</p>
    </div>
  </body>
</html>`;
  return new Response(html, {
    status: ok ? 200 : 400,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

/** Marks the lead opted-out. Returns false only on a real DB error. */
async function unsubscribeLead(leadId: string): Promise<boolean> {
  if (!hasSupabaseAdminConfig()) {
    return true; // demo mode: nothing to persist
  }
  try {
    const supabase = createSupabaseAdminClient();
    await supabase
      .from("leads")
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq("id", leadId);
    await supabase.from("lead_activities").insert({
      lead_id: leadId,
      type: "system",
      title: "Lead unsubscribed from emails",
      actor: "system",
    });
    return true;
  } catch {
    return false;
  }
}

function readParams(request: Request): { leadId: string | null; sig: string | null; valid: boolean } {
  const url = new URL(request.url);
  const leadId = url.searchParams.get("lid");
  const sig = url.searchParams.get("sig");
  return { leadId, sig, valid: Boolean(leadId && sig && verifyUnsubscribe(leadId, sig)) };
}

/** Human-facing unsubscribe (the visible footer link). */
export async function GET(request: Request) {
  const { leadId, valid } = readParams(request);
  if (!valid || !leadId) {
    return page(
      "Invalid unsubscribe link",
      "This unsubscribe link is invalid or has expired. Please contact us directly to be removed.",
      false,
    );
  }
  const ok = await unsubscribeLead(leadId);
  return ok
    ? page("You're unsubscribed", "You will no longer receive marketing emails from us. We're sorry to see you go.", true)
    : page("Something went wrong", "We couldn't process your request right now. Please contact us directly to be removed.", false);
}

/**
 * RFC 8058 one-click unsubscribe: mail providers (Gmail, Yahoo) POST here when
 * a recipient taps the native "Unsubscribe" button, sending the same signed
 * query params. No page to render — just a 2xx once the opt-out is recorded.
 */
export async function POST(request: Request) {
  const { leadId, valid } = readParams(request);
  if (!valid || !leadId) {
    return new Response("Invalid unsubscribe request", { status: 400 });
  }
  const ok = await unsubscribeLead(leadId);
  return new Response(ok ? "Unsubscribed" : "Failed", { status: ok ? 200 : 500 });
}
