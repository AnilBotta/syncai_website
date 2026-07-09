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

export async function GET(request: Request) {
  const url = new URL(request.url);
  const leadId = url.searchParams.get("lid");
  const sig = url.searchParams.get("sig");

  if (!leadId || !sig || !verifyUnsubscribe(leadId, sig)) {
    return page(
      "Invalid unsubscribe link",
      "This unsubscribe link is invalid or has expired. Please contact us directly to be removed.",
      false,
    );
  }

  if (!hasSupabaseAdminConfig()) {
    return page(
      "You're unsubscribed",
      "You will no longer receive emails from us. (Demo mode: no change was saved.)",
      true,
    );
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

    return page(
      "You're unsubscribed",
      "You will no longer receive marketing emails from us. We're sorry to see you go.",
      true,
    );
  } catch {
    return page(
      "Something went wrong",
      "We couldn't process your request right now. Please contact us directly to be removed.",
      false,
    );
  }
}
