import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { AIMessage, HumanMessage, type BaseMessage } from "@langchain/core/messages";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase";
import { buildManagerTools, type ToolTraceEntry } from "@/lib/agents/manager-tools";
import { getBudgetStatus } from "@/lib/agents/budget";
import { estimateCost } from "@/lib/agents/pricing";

const MODEL = process.env.OPENAI_AGENT_MODEL || process.env.OPENAI_MODEL || "gpt-4.1-mini";
const MAX_HISTORY = 20;

export type ManagerMessage = { role: "user" | "assistant"; content: string };

export type ManagerResult = {
  reply: string;
  trace: ToolTraceEntry[];
  runId: string | null;
  spentToday: number;
  budget: number;
  demoMode?: boolean;
  refused?: boolean;
};

const SYSTEM_PROMPT = `You are the Manager — the AI operations manager for SyncAI Technologies, an AI-solutions agency based in Ontario, Canada. You report to the CEO, Anil.

Your job is to help the CEO run the business: understand the sales pipeline, keep leads moving, draft outreach, and surface what needs attention.

You have READ ACCESS to the CEO's entire command center and can answer questions about ANY of it — never say you don't have access to something without first trying the relevant tool:
- Pipeline & leads (get_pipeline_summary, search_leads, get_lead)
- Finances & invoices — revenue, payments, who was invoiced, amounts, paid/unpaid (get_finances)
- Documents — proposals, agreements, what's been signed (list_documents)
- Schedule — upcoming appointments and open/overdue tasks (get_schedule)
- Agent activity & AI spend (get_agent_activity)
- Targeting & prospects the scraper found (get_prospecting)
- The approval inbox (list_pending_approvals)
When the CEO asks something like "how many invoices have we sent" or "who did we invoice", CALL get_finances and read the real records before answering. Always ground your answer in tool output — never claim you lack access without checking.

You lead a small team of specialist AI agents that you can dispatch via your tools. If the CEO asks who works for you, what your team/employees are, or what agents exist, describe this team in plain language:
- **Scraper** — finds new prospect companies for an active target (ICP) via Google Places / Apollo.
- **Research** — writes a sales brief on a lead or prospect's company (pain points, talking points).
- **Qualify** — scores a lead 0-100 with a rationale and a suggested next action.
- **Outreach** — drafts a personalized first-touch or follow-up email. It only ever creates a draft in the Approval Inbox — it never sends.
- **Negotiator** — analyzes a deal's guardrails (floor price, max discount, allowed concessions) against what a prospect is asking for. If it's within the rules, it drafts a counter-offer into the Approval Inbox; if not, it refuses to draft and escalates to you with a task instead.
- **Document** — drafts proposals, service agreements, onboarding docs, and offer letters. Each is saved to the Approval Inbox; approving it emails the lead a click-to-accept copy. It never sends on its own.
- **Finance** — creates invoices for a deal. Each invoice is queued in the Approval Inbox; approving it sends the client a Stripe pay-online link or an e-transfer request. It never sends on its own.
You are the one who actually runs these agents (via your tools) and reports back; the CEO commands you, and you command them.

You can also enroll a lead in a nurture sequence (scheduled multi-step follow-up). Enrolled emails are drafted into the Approval Inbox on a daily schedule — they only auto-send if the CEO has explicitly turned on auto-send for that sequence.

If the CEO asks you to scrape/find/hunt for leads in a niche or location that has no matching target yet, DON'T just say no target exists — create one yourself with create_target (using a sensible name/industry/location from what they said), then immediately run find_prospects on it. Only ask a clarifying question if the request is too vague to name a target from (e.g. missing both industry and location).

Rules:
- Be concise and direct, like a sharp chief of staff. Lead with the answer.
- Use your tools to get real data before answering — never invent numbers, lead names, or statuses.
- You can move leads between stages, create tasks, and DRAFT emails. Drafting an email places it in the CEO's approval inbox; it is NEVER sent automatically. Always tell the CEO an email is a draft awaiting their approval.
- When you draft an email, write a complete, personalized, ready-to-send message grounded in the lead's real details (company, pain point, industry). No placeholders.
- Never promise specific pricing or guarantees you can't back up.
- If asked to do something you don't have a tool for, say so plainly and suggest the closest thing you can do.
- When you take an action, confirm what you did in one short sentence.`;

/** Sums usage across all AI messages the agent produced. */
function sumUsage(messages: BaseMessage[]) {
  let tokensIn = 0;
  let tokensOut = 0;
  for (const msg of messages) {
    const usage = (msg as AIMessage).usage_metadata;
    if (usage) {
      tokensIn += usage.input_tokens || 0;
      tokensOut += usage.output_tokens || 0;
    }
  }
  return { tokensIn, tokensOut };
}

/**
 * Runs the Manager agent over a conversation and returns its reply plus a trace
 * of the actions it took. Persists an agent_runs row with token cost, and
 * refuses to run when today's spend has hit the budget.
 */
export async function runManager(
  messages: ManagerMessage[],
  options: { threadKey?: string } = {},
): Promise<ManagerResult> {
  if (!process.env.OPENAI_API_KEY) {
    return {
      reply:
        "I'm in demo mode — add an OPENAI_API_KEY to bring me online. Once connected, I can read your pipeline, move leads, create tasks, and draft outreach for your approval.",
      trace: [],
      runId: null,
      spentToday: 0,
      budget: Number(process.env.OPENAI_DAILY_BUDGET_USD || "5"),
      demoMode: true,
    };
  }

  if (!hasSupabaseAdminConfig()) {
    return {
      reply: "I can't reach the database right now (Supabase isn't configured), so I can't look anything up.",
      trace: [],
      runId: null,
      spentToday: 0,
      budget: Number(process.env.OPENAI_DAILY_BUDGET_USD || "5"),
      demoMode: true,
    };
  }

  const supabase = createSupabaseAdminClient();
  const budget = await getBudgetStatus(supabase);

  if (budget.exceeded) {
    return {
      reply: `I've hit today's AI budget of $${budget.budget.toFixed(2)} (spent $${budget.spentToday.toFixed(
        2,
      )}). I'll be available again tomorrow, or you can raise OPENAI_DAILY_BUDGET_USD.`,
      trace: [],
      runId: null,
      spentToday: budget.spentToday,
      budget: budget.budget,
      refused: true,
    };
  }

  const recent = messages.slice(-MAX_HISTORY);
  const trace: ToolTraceEntry[] = [];

  // Open a run row so cost is tracked even if the request dies mid-flight.
  const { data: run } = await supabase
    .from("agent_runs")
    .insert({
      agent: "manager",
      status: "running",
      thread_key: options.threadKey ?? null,
      input: { messages: recent },
      model: MODEL,
    })
    .select("id")
    .single();
  const runId: string | null = run?.id ?? null;

  try {
    const llm = new ChatOpenAI({ model: MODEL, temperature: 0.3, apiKey: process.env.OPENAI_API_KEY });
    const tools = buildManagerTools(supabase, trace);
    const agent = createReactAgent({ llm, tools, prompt: SYSTEM_PROMPT });

    const lcMessages: BaseMessage[] = recent.map((m) =>
      m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content),
    );

    const result = await agent.invoke({ messages: lcMessages });
    const outMessages = result.messages as BaseMessage[];
    const last = outMessages[outMessages.length - 1];
    const reply =
      typeof last?.content === "string" ? last.content : "I finished, but had nothing to add.";

    const { tokensIn, tokensOut } = sumUsage(outMessages);
    const cost = estimateCost(MODEL, tokensIn, tokensOut);

    if (runId) {
      await supabase
        .from("agent_runs")
        .update({
          status: "succeeded",
          finished_at: new Date().toISOString(),
          output: { reply, trace },
          tokens_in: tokensIn,
          tokens_out: tokensOut,
          cost_usd: cost,
        })
        .eq("id", runId);
    }

    return {
      reply,
      trace,
      runId,
      spentToday: Math.round((budget.spentToday + cost) * 10_000) / 10_000,
      budget: budget.budget,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (runId) {
      await supabase
        .from("agent_runs")
        .update({ status: "failed", finished_at: new Date().toISOString(), error: message })
        .eq("id", runId);
    }
    return {
      reply: "I hit an error trying to work on that. It's been logged — please try again.",
      trace,
      runId,
      spentToday: budget.spentToday,
      budget: budget.budget,
    };
  }
}
