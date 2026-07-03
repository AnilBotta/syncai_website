/**
 * One tool set shared by the chat route (OpenAI Chat Completions format)
 * and the voice bot (Realtime API session format).
 */

type ToolDef = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
};

export const assistantToolDefs: ToolDef[] = [
  {
    name: "get_available_slots",
    description:
      "Get open strategy-call time slots for a specific day. Returns times in Eastern Time (America/Toronto).",
    parameters: {
      type: "object",
      properties: {
        date: {
          type: "string",
          description: "The day to check, formatted as YYYY-MM-DD.",
        },
      },
      required: ["date"],
    },
  },
  {
    name: "book_appointment",
    description:
      "Book a strategy call in an open slot. Only call after the visitor confirmed a specific time and provided name and email.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "Visitor's full name." },
        email: { type: "string", description: "Visitor's email address." },
        phone: { type: "string", description: "Visitor's phone number (optional)." },
        service: {
          type: "string",
          description:
            "Which service they're interested in, e.g. 'AI chatbot', 'AI voice agent', 'Workflow automation', 'AI strategy', 'AI website'.",
        },
        notes: { type: "string", description: "Anything the visitor wants the team to know (optional)." },
        startsAt: {
          type: "string",
          description: "Exact slot start time as the ISO 8601 string returned by get_available_slots.",
        },
      },
      required: ["name", "email", "startsAt"],
    },
  },
  {
    name: "capture_lead",
    description:
      "Save the visitor's contact details and business challenge so the SyncAI team can follow up. Use when they share a challenge but don't book a call.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "Visitor's full name." },
        email: { type: "string", description: "Visitor's email address." },
        phone: { type: "string", description: "Phone number (optional)." },
        company: { type: "string", description: "Company or business name (optional)." },
        industry: { type: "string", description: "Their industry (optional)." },
        interest: { type: "string", description: "Which service they're interested in (optional)." },
        painPoint: {
          type: "string",
          description: "The business challenge they described, in their own words (at least a sentence).",
        },
      },
      required: ["name", "email", "painPoint"],
    },
  },
];

/** Chat Completions tool format. */
export const chatCompletionTools = assistantToolDefs.map((tool) => ({
  type: "function" as const,
  function: {
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters,
  },
}));

/** Realtime API session tool format. */
export const realtimeTools = assistantToolDefs.map((tool) => ({
  type: "function" as const,
  name: tool.name,
  description: tool.description,
  parameters: tool.parameters,
}));
