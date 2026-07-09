import OpenAI from "openai";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getBudgetStatus } from "@/lib/agents/budget";
import { estimateCost } from "@/lib/agents/pricing";

const MODEL = process.env.OPENAI_AGENT_MODEL || process.env.OPENAI_MODEL || "gpt-4.1-mini";
const USE_WEB_SEARCH = process.env.RESEARCH_USE_WEB_SEARCH === "true";

const briefSchema = z.object({
  company_overview: z.string(),
  likely_ai_pain_points: z.array(z.string()),
  talking_points: z.array(z.string()),
  competitor_landscape: z.string().optional().default(""),
  sources: z.array(z.string()).optional().default([]),
});

export type ResearchBrief = z.infer<typeof briefSchema> & {
  grounding: "web_search" | "model_knowledge";
};

function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON found in research output.");
  return JSON.parse(text.slice(start, end + 1));
}

const promptFor = (company: string, industry: string, painPoint: string) =>
  `Research this company for a B2B sales conversation. SyncAI Technologies sells AI websites, chatbots, voice agents, and workflow automation to SMBs.

Company: ${company}
Industry: ${industry || "unknown"}
Known context: ${painPoint || "none"}

Return ONLY a JSON object with keys:
- company_overview (2-3 sentences)
- likely_ai_pain_points (array of 3-5 short strings)
- talking_points (array of 3-5 short strings tailored to opening a conversation)
- competitor_landscape (1-2 sentences, or "")
- sources (array of URLs you used, or [])`;

/**
 * Produces a sales research brief for a company. Uses OpenAI web search when
 * RESEARCH_USE_WEB_SEARCH=true, otherwise a knowledge-only brief clearly
 * labelled grounding="model_knowledge". Records an agent_runs row with cost.
 */
export async function runResearch(
  supabase: SupabaseClient,
  args: { company: string; industry?: string | null; painPoint?: string | null; leadId?: string | null; prospectId?: string | null },
): Promise<{ ok: true; data: ResearchBrief; runId: string | null } | { ok: false; error: string; refused?: boolean }> {
  if (!process.env.OPENAI_API_KEY) {
    return { ok: false, error: "OpenAI is not configured (no OPENAI_API_KEY)." };
  }

  const budget = await getBudgetStatus(supabase);
  if (budget.exceeded) {
    return { ok: false, refused: true, error: `Daily AI budget of $${budget.budget.toFixed(2)} reached.` };
  }

  const { data: run } = await supabase
    .from("agent_runs")
    .insert({
      agent: "research",
      status: "running",
      lead_id: args.leadId ?? null,
      input: { company: args.company, prospectId: args.prospectId ?? null },
      model: MODEL,
    })
    .select("id")
    .single();
  const runId: string | null = run?.id ?? null;

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const prompt = promptFor(args.company, args.industry || "", args.painPoint || "");

  try {
    let brief: ResearchBrief;
    let tokensIn = 0;
    let tokensOut = 0;

    if (USE_WEB_SEARCH) {
      const resp = await openai.responses.create({
        model: MODEL,
        tools: [{ type: "web_search" }],
        input: prompt,
      });
      const parsed = briefSchema.parse(extractJson(resp.output_text || "{}"));
      brief = { ...parsed, grounding: "web_search" };
      tokensIn = resp.usage?.input_tokens || 0;
      tokensOut = resp.usage?.output_tokens || 0;
    } else {
      const completion = await openai.chat.completions.create({
        model: MODEL,
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You are a precise B2B sales researcher. Return strict JSON." },
          { role: "user", content: prompt },
        ],
      });
      const parsed = briefSchema.parse(JSON.parse(completion.choices[0]?.message?.content || "{}"));
      brief = { ...parsed, grounding: "model_knowledge" };
      tokensIn = completion.usage?.prompt_tokens || 0;
      tokensOut = completion.usage?.completion_tokens || 0;
    }

    const cost = estimateCost(MODEL, tokensIn, tokensOut);

    if (runId) {
      await supabase
        .from("agent_runs")
        .update({
          status: "succeeded",
          finished_at: new Date().toISOString(),
          output: brief,
          tokens_in: tokensIn,
          tokens_out: tokensOut,
          cost_usd: cost,
        })
        .eq("id", runId);
    }

    // Persist the latest brief onto the prospect (if any) and the lead timeline.
    if (args.prospectId) {
      await supabase
        .from("prospects")
        .update({ enrichment: brief, status: "enriched" })
        .eq("id", args.prospectId);
    }
    if (args.leadId) {
      await supabase.from("lead_activities").insert({
        lead_id: args.leadId,
        type: "agent_run",
        title: `Research brief for ${args.company}`,
        body: brief.company_overview,
        meta: { agent: "research", grounding: brief.grounding, run_id: runId },
        actor: "agent:research",
      });
    }

    return { ok: true, data: brief, runId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Research failed.";
    if (runId) {
      await supabase
        .from("agent_runs")
        .update({ status: "failed", finished_at: new Date().toISOString(), error: message })
        .eq("id", runId);
    }
    return { ok: false, error: message };
  }
}
