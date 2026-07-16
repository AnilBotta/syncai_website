import { NextResponse } from "next/server";
import { serverErrorResponse } from "@/lib/api-errors";

/**
 * Mints a Retell web-call token so a visitor can talk to the SyncAI agent in the
 * browser. The API key stays server-side; the browser only ever receives a
 * short-lived access token scoped to one call.
 *
 * Same agent as the phone line, so web and phone callers get one brain, and the
 * agent's booking custom-functions (/api/voice/tools/*) work here too — it just
 * has to collect a name and email during the call, since a web visitor has no
 * phone-call record to resolve a lead from.
 */
const RETELL_API_KEY = process.env.RETELL_API_KEY;
const RETELL_WEB_AGENT_ID = process.env.RETELL_WEB_AGENT_ID;

export function hasRetellWebConfig() {
  return Boolean(RETELL_API_KEY && RETELL_WEB_AGENT_ID);
}

export async function POST() {
  // Mirrors the demo-mode pattern used across the site: with no keys the UI
  // shows a friendly "not connected" state instead of erroring.
  if (!hasRetellWebConfig()) {
    return NextResponse.json({ demoMode: true });
  }

  try {
    const response = await fetch("https://api.retellai.com/v2/create-web-call", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RETELL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ agent_id: RETELL_WEB_AGENT_ID }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("[voice/web-call] Retell rejected the request", response.status, detail);
      return NextResponse.json({ error: "Could not start a voice session." }, { status: 502 });
    }

    const data = (await response.json()) as { access_token?: string; call_id?: string };
    if (!data.access_token) {
      return NextResponse.json({ error: "Could not start a voice session." }, { status: 502 });
    }

    return NextResponse.json({ accessToken: data.access_token, callId: data.call_id ?? null });
  } catch (error) {
    return serverErrorResponse("voice/web-call:POST", error);
  }
}
