import type { SupabaseClient } from "@supabase/supabase-js";
import { createZoomMeeting, toZoomStartTime } from "@/lib/zoom";
import { sendEmail } from "@/lib/email/resend";
import { notifyCeo } from "@/lib/telegram";
import { BOOKING_CONFIG, formatSlotForHumans, isValidTimezone } from "@/lib/booking";

export type BookingRecord = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  service?: string | null;
  starts_at: string;
  ends_at: string;
  timezone: string;
  /** The attendee's IANA zone; null => show them the business timezone. */
  attendee_timezone?: string | null;
  source?: string | null;
  lead_id?: string | null;
};

/**
 * Finalizes a freshly-inserted appointment: creates a Zoom meeting, stores the
 * link, emails the client a confirmation with the details + link, and pings the
 * CEO on Telegram with the same. Every step is best-effort and never throws —
 * the appointment is already saved, so a Zoom/email/Telegram hiccup must not
 * fail the booking. Shared by the voice, pipeline, and website booking paths.
 */
export async function finalizeBooking(supabase: SupabaseClient, appt: BookingRecord): Promise<{ meetingUrl: string | null }> {
  // The client sees the time in THEIR zone; we (and Telegram) see business time.
  const businessTz = appt.timezone || BOOKING_CONFIG.timezone;
  const attendeeTz = isValidTimezone(appt.attendee_timezone) ? appt.attendee_timezone : businessTz;
  const humanTime = formatSlotForHumans(appt.starts_at, businessTz);
  const attendeeTime = formatSlotForHumans(appt.starts_at, attendeeTz);
  const zonesDiffer = attendeeTz !== businessTz;
  const service = appt.service || "Discovery call";
  const durationMinutes =
    Math.max(15, Math.round((new Date(appt.ends_at).getTime() - new Date(appt.starts_at).getTime()) / 60000)) || 15;
  const firstName = appt.name.split(" ")[0] || appt.name;

  // 1) Create the Zoom meeting and persist the link (best-effort).
  let meetingUrl: string | null = null;
  try {
    const meeting = await createZoomMeeting({
      topic: `${service} — SyncAI × ${appt.name}`,
      startTimeIso: toZoomStartTime(appt.starts_at),
      durationMinutes,
      timezone: appt.timezone,
    });
    if (meeting) {
      meetingUrl = meeting.joinUrl;
      await supabase.from("appointments").update({ meeting_url: meeting.joinUrl, meeting_id: meeting.meetingId }).eq("id", appt.id);
    }
  } catch {
    // ignore — booking stands without a link
  }

  // 2) Confirmation email to the client (transactional: direct send, always).
  const joinLineText = meetingUrl ? `Join on Zoom: ${meetingUrl}` : "We'll email your Zoom link shortly.";
  const text = [
    `Hi ${firstName},`,
    "",
    `You're all set for a ${service.toLowerCase()} with SyncAI.`,
    "",
    `When: ${attendeeTime}${zonesDiffer ? " (your local time)" : ""}`,
    ...(zonesDiffer ? [`That's ${humanTime} for us.`] : []),
    joinLineText,
    "",
    "Need to reschedule? Just reply to this email and we'll sort it out.",
    "",
    "— Anil, SyncAI Technologies",
  ].join("\n");
  const joinLineHtml = meetingUrl
    ? `<a href="${meetingUrl}" style="color:#7D3C98;font-weight:600">Join the Zoom call</a><br/><span style="color:#666;font-size:13px">${meetingUrl}</span>`
    : `We'll email your Zoom link shortly.`;
  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a">
    <p>Hi ${firstName},</p>
    <p>You're all set for a ${service.toLowerCase()} with SyncAI.</p>
    <p style="margin:18px 0;padding:16px 18px;background:#f6f4fb;border-radius:12px">
      <strong>When:</strong> ${attendeeTime}${zonesDiffer ? ` <span style="color:#666">(your local time)</span><br/><span style="color:#666;font-size:13px">That's ${humanTime} for us.</span>` : ""}<br/>
      <strong>Where:</strong> ${joinLineHtml}
    </p>
    <p>Need to reschedule? Just reply to this email and we'll sort it out.</p>
    <p>— Anil, SyncAI Technologies</p>
  </div>`;

  try {
    await sendEmail({ to: appt.email, subject: `Your SyncAI call is confirmed — ${attendeeTime}`, text, html });
    await supabase.from("emails").insert({
      lead_id: appt.lead_id || null,
      direction: "outbound",
      to_email: appt.email,
      subject: `Your SyncAI call is confirmed — ${attendeeTime}`,
      body_text: text,
      status: "sent",
      source: "agent",
      meta: { kind: "appointment_confirmation", appointment_id: appt.id, meeting_url: meetingUrl },
    });
  } catch {
    // ignore
  }

  // 3) Timeline entry on the lead, if this booking is tied to one.
  if (appt.lead_id) {
    try {
      await supabase.from("lead_activities").insert({
        lead_id: appt.lead_id,
        type: "system",
        title: `Appointment confirmed: ${humanTime}`,
        body: meetingUrl ? `Zoom: ${meetingUrl}` : null,
        meta: { appointment_id: appt.id, meeting_url: meetingUrl },
        actor: "agent:pipeline",
      });
    } catch {
      // ignore
    }
  }

  // 4) Notify the CEO with the link.
  try {
    const who = `${appt.name}${appt.company ? ` (${appt.company})` : ""}`;
    const link = meetingUrl
      ? `\n🔗 Zoom: ${meetingUrl}`
      : "\n(No Zoom link — add the ZOOM_* env vars to auto-create meetings.)";
    const theirTime = zonesDiffer ? `\n🌍 Their local time: ${attendeeTime}` : "";
    await notifyCeo(
      `📅 New booking: ${who} — ${humanTime}. A confirmation email is on its way to them.${theirTime}${link}`,
    );
  } catch {
    // ignore
  }

  return { meetingUrl };
}
