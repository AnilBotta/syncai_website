import { randomBytes } from "crypto";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { DocumentType, Lead } from "@/lib/supabase";
import { runOneShotAgent } from "@/lib/agents/run-agent";
import { createApproval } from "@/lib/approvals";

const cad = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });

const docSchema = z.object({
  title: z.string(),
  content_md: z.string(),
});

const COMPANY = process.env.COMPANY_LEGAL_NAME || "SyncAI Technologies";

const TYPE_GUIDANCE: Record<DocumentType, string> = {
  proposal: `Write a PROPOSAL / statement of work. Sections: a short cover paragraph, "Objectives", "Scope of Work" (concrete deliverables as a bulleted list), "Timeline" (phased), "Investment" (state the deal value clearly), and "Next Steps". Be specific to their pain point.`,
  agreement: `Write a plain-language SERVICE AGREEMENT. Sections: Parties, Services, Fees & Payment, Term & Termination, Confidentiality, Ownership of Deliverables, and a short Acceptance line. Keep it fair and readable — not dense legalese. Note it is a starting point and not legal advice.`,
  onboarding: `Write a CLIENT ONBOARDING document. Sections: Welcome, What Happens Next (week-by-week), What We Need From You (access, assets, points of contact), Communication & Cadence, and How to Reach Us.`,
  offer_letter: `Write an OFFER LETTER (for a contractor/hire). Sections: Role, Start Date, Compensation, Scope & Expectations, and an Acceptance line. Warm and professional.`,
};

const SYSTEM = `You draft professional business documents for ${COMPANY}, an AI-solutions agency (AI websites, chatbots, voice agents, workflow automation) in Ontario, Canada. The CEO is Anil.

Write in clean Markdown (headings with #/##, bullet lists, short paragraphs). Ground every detail in the real data provided — company name, pain point, deal value. Never invent numbers not given to you; if a figure is unknown, describe it qualitatively instead of fabricating it. Do not add a signature image or a click-to-accept line — those are handled by the platform.

Return strict JSON: { "title": "...", "content_md": "..." }.`;

/**
 * Generates a business document (proposal/agreement/onboarding/offer letter)
 * for a lead, stores it as a draft with a unique accept token, and queues it in
 * the Approval Inbox. Nothing is sent to the lead until the CEO approves.
 */
export async function runDocument(
  supabase: SupabaseClient,
  args: { leadId: string; type: DocumentType; instruction?: string },
) {
  const { data: lead } = await supabase.from("leads").select("*").eq("id", args.leadId).single<Lead>();
  if (!lead) return { ok: false as const, error: "Lead not found." };

  const userPrompt = [
    `Document type: ${args.type}`,
    TYPE_GUIDANCE[args.type],
    "",
    `Client/recipient: ${lead.name}`,
    `Company: ${lead.company || "—"}`,
    `Industry: ${lead.industry || "—"}`,
    `Their pain point / context: ${lead.pain_point}`,
    `Deal value on record: ${lead.value ? cad.format(Number(lead.value)) : "not set"}`,
    lead.notes ? `CEO notes: ${lead.notes}` : "",
    args.instruction ? `Special instruction from the CEO: ${args.instruction}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const result = await runOneShotAgent(supabase, {
    agent: "document",
    leadId: lead.id,
    systemPrompt: SYSTEM,
    userPrompt,
    schema: docSchema,
    input: { leadId: lead.id, type: args.type },
  });

  if (!result.ok) return result;

  const acceptToken = randomBytes(24).toString("hex");
  const { data: doc, error } = await supabase
    .from("documents")
    .insert({
      lead_id: lead.id,
      type: args.type,
      title: result.data.title,
      content_md: result.data.content_md,
      status: "draft",
      accept_token: acceptToken,
    })
    .select()
    .single();
  if (error || !doc) return { ok: false as const, error: `Could not save document: ${error?.message}` };

  await createApproval(supabase, {
    type: "document",
    entityId: doc.id,
    leadId: lead.id,
    title: `${labelFor(args.type)}: ${result.data.title}`,
    summary: `For ${lead.name}${lead.company ? ` at ${lead.company}` : ""} — approve to email them a signable copy`,
    meta: { agent: "document", document_type: args.type },
  });

  await supabase.from("lead_activities").insert({
    lead_id: lead.id,
    type: "document",
    title: `${labelFor(args.type)} drafted: ${result.data.title}`,
    meta: { agent: "document", run_id: result.runId, document_id: doc.id },
    actor: "agent:document",
  });

  return { ok: true as const, data: { documentId: doc.id, title: result.data.title }, runId: result.runId };
}

function labelFor(type: DocumentType): string {
  return type === "proposal"
    ? "Proposal"
    : type === "agreement"
      ? "Service Agreement"
      : type === "onboarding"
        ? "Onboarding Doc"
        : "Offer Letter";
}
