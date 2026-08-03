import { formatInTimeZone } from "date-fns-tz";
import type { DemoSite } from "./types";

const TIMEZONE = "America/Toronto";

/**
 * Grounding prompt for a demo site's receptionist: the business's own facts and
 * persona, plus the guardrails every demo agent shares.
 *
 * The tool names match src/lib/assistant/tools.ts because the demo route reuses
 * those definitions — but they resolve to the sandboxed executor, so the model
 * booking an "appointment" writes nothing anywhere.
 */
export function buildDemoPrompt(site: DemoSite, now = new Date()) {
  const today = formatInTimeZone(now, TIMEZONE, "EEEE, MMMM d, yyyy");
  const serviceLines = site.services.map((s) => `- ${s.title}: ${s.description}`).join("\n");

  return `${site.persona}

BUSINESS FACTS
- Name: ${site.business}
- Location: ${site.location}
- Phone: ${site.phone}
- Hours: ${site.hoursLabel}

SERVICES
${serviceLines}

Today is ${today} (${TIMEZONE}).

GENERAL
- Only use the facts above. If you don't know something, say you'll check with the team rather than inventing it.
- Never claim to be a human if you're asked directly. You're the practice's AI assistant.
- Keep replies short enough to read on a phone.`;
}
