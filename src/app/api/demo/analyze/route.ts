import { NextResponse } from "next/server";
import OpenAI from "openai";
import { analyzeSchema, type AnalyzeInput } from "@/lib/validators";

type Analysis = {
  summary: string;
  opportunities: string[];
  quickWins: string[];
  recommendedSystem: string;
  estimatedImpact: string;
};

export async function POST(request: Request) {
  const parsed = analyzeSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Please describe the business and challenge." }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ analysis: fallbackAnalysis(parsed.data), demoMode: true });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are an AI strategy consultant for SyncAi Technologies in Canada. Return concise JSON only with keys summary, opportunities, quickWins, recommendedSystem, estimatedImpact. Keep claims realistic and avoid guaranteed revenue promises.",
        },
        {
          role: "user",
          content: JSON.stringify(parsed.data),
        },
      ],
    });

    const content = completion.choices[0]?.message.content || "{}";
    const analysis = JSON.parse(content) as Analysis;

    return NextResponse.json({
      analysis: normalizeAnalysis(analysis, parsed.data),
    });
  } catch {
    return NextResponse.json({ analysis: fallbackAnalysis(parsed.data), fallback: true });
  }
}

function normalizeAnalysis(analysis: Partial<Analysis>, input: AnalyzeInput): Analysis {
  const fallback = fallbackAnalysis(input);

  return {
    summary: analysis.summary || fallback.summary,
    opportunities: normalizeList(analysis.opportunities, fallback.opportunities),
    quickWins: normalizeList(analysis.quickWins, fallback.quickWins),
    recommendedSystem: analysis.recommendedSystem || fallback.recommendedSystem,
    estimatedImpact: analysis.estimatedImpact || fallback.estimatedImpact,
  };
}

function normalizeList(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  return value.map(String).filter(Boolean).slice(0, 4);
}

function fallbackAnalysis(input: AnalyzeInput): Analysis {
  const hoursPerMonth = Math.round(input.hoursLostWeekly * 4.33);
  const leadNote =
    input.monthlyLeads > 0
      ? `${input.monthlyLeads} monthly leads gives enough volume to improve response speed and qualification.`
      : "Even with low lead volume, a clean intake flow can reduce manual work.";

  return {
    summary: `${input.businessType} should start by using AI to reduce the friction around "${input.currentProblem}". ${leadNote}`,
    opportunities: [
      "AI intake and qualification assistant",
      "Automated follow-up for missed or incomplete inquiries",
      "Admin workflow that logs leads into a private dashboard",
      "Customer FAQ assistant trained around approved service information",
    ],
    quickWins: [
      "Create one lead form that captures urgency, service need, and contact details",
      "Add an AI website assistant for common questions and next-step routing",
      "Track every inquiry in the admin dashboard instead of scattered inboxes",
    ],
    recommendedSystem:
      "Start with an AI strategy sprint, then launch a website lead assistant connected to the admin dashboard and a simple follow-up workflow.",
    estimatedImpact: `Target up to ${hoursPerMonth} admin hours per month for review and reduction, while improving speed-to-lead and consistency.`,
  };
}
