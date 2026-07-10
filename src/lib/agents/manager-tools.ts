import { tool } from "@langchain/core/tools";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Icp, Lead } from "@/lib/supabase";
import { leadStatuses } from "@/lib/site-data";
import { createApproval } from "@/lib/approvals";
import { runQualify } from "@/lib/agents/qualify";
import { runResearch } from "@/lib/agents/research";
import { runScraper } from "@/lib/agents/scraper";
import { runNegotiator } from "@/lib/agents/negotiator";
import { runDocument } from "@/lib/agents/document";
import { createInvoiceDraft } from "@/lib/invoices";

const STATUSES = ["new", "contacted", "qualified", "proposal", "won", "lost"] as const;

const cad = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });

/** Records a tool action on the manager for the run's trace + UI chips. */
export type ToolTraceEntry = { tool: string; summary: string };

/**
 * Builds the Manager's tool set bound to a service-role Supabase client. Actions
 * that could reach a lead only ever create drafts + approvals — never send.
 * The `trace` array is appended to so the route can surface what the Manager did.
 */
export function buildManagerTools(supabase: SupabaseClient, trace: ToolTraceEntry[]) {
  async function findLead(idOrName: string): Promise<Lead | null> {
    // Try exact id first, then a name/company ilike match.
    const byId = await supabase.from("leads").select("*").eq("id", idOrName).maybeSingle();
    if (byId.data) return byId.data as Lead;

    const byName = await supabase
      .from("leads")
      .select("*")
      .or(`name.ilike.%${idOrName}%,company.ilike.%${idOrName}%`)
      .limit(1);
    return (byName.data?.[0] as Lead) ?? null;
  }

  const getPipelineSummary = tool(
    async () => {
      const { data, error } = await supabase.from("leads").select("status, value");
      if (error) return `Error reading pipeline: ${error.message}`;
      const rows = data || [];
      const lines = leadStatuses.map((s) => {
        const inStage = rows.filter((r) => r.status === s.value);
        const total = inStage.reduce((sum, r) => sum + (Number(r.value) || 0), 0);
        return `${s.label}: ${inStage.length} leads, ${cad.format(total)}`;
      });
      const openValue = rows
        .filter((r) => ["contacted", "qualified", "proposal"].includes(r.status))
        .reduce((sum, r) => sum + (Number(r.value) || 0), 0);
      trace.push({ tool: "get_pipeline_summary", summary: "read pipeline" });
      return `Pipeline (${rows.length} leads total):\n${lines.join("\n")}\nOpen pipeline value: ${cad.format(openValue)}`;
    },
    {
      name: "get_pipeline_summary",
      description: "Get a summary of the whole sales pipeline: lead counts and total deal value per stage.",
      schema: z.object({}),
    },
  );

  const searchLeads = tool(
    async ({ query }) => {
      const { data, error } = await supabase
        .from("leads")
        .select("id, name, company, email, status, value")
        .or(`name.ilike.%${query}%,company.ilike.%${query}%,email.ilike.%${query}%,industry.ilike.%${query}%`)
        .limit(10);
      if (error) return `Error: ${error.message}`;
      if (!data?.length) return `No leads found matching "${query}".`;
      trace.push({ tool: "search_leads", summary: `searched "${query}"` });
      return data
        .map((l) => `- ${l.name}${l.company ? ` (${l.company})` : ""} · ${l.status} · ${cad.format(Number(l.value) || 0)} · id:${l.id}`)
        .join("\n");
    },
    {
      name: "search_leads",
      description: "Search leads by name, company, email, or industry. Returns matching leads with their id and stage.",
      schema: z.object({ query: z.string().describe("Text to search for") }),
    },
  );

  const getLead = tool(
    async ({ lead }) => {
      const found = await findLead(lead);
      if (!found) return `No lead found for "${lead}".`;
      trace.push({ tool: "get_lead", summary: found.name });
      return [
        `Name: ${found.name}`,
        `Company: ${found.company || "—"}`,
        `Email: ${found.email}`,
        `Industry: ${found.industry || "—"}`,
        `Stage: ${found.status}`,
        `Deal value: ${cad.format(Number(found.value) || 0)}`,
        `Score: ${found.score ?? "not scored"}`,
        `Next action: ${found.next_action || "—"}`,
        `Pain point: ${found.pain_point}`,
        `Notes: ${found.notes || "—"}`,
        `id: ${found.id}`,
      ].join("\n");
    },
    {
      name: "get_lead",
      description: "Get full details for one lead by id or by name/company.",
      schema: z.object({ lead: z.string().describe("Lead id, or a name/company to look up") }),
    },
  );

  const listPendingApprovals = tool(
    async () => {
      const { data, error } = await supabase
        .from("approvals")
        .select("title, summary, type, created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) return `Error: ${error.message}`;
      if (!data?.length) return "Nothing is awaiting approval right now.";
      trace.push({ tool: "list_pending_approvals", summary: `${data.length} pending` });
      return `${data.length} item(s) awaiting your approval:\n${data
        .map((a) => `- [${a.type}] ${a.title}${a.summary ? ` — ${a.summary}` : ""}`)
        .join("\n")}`;
    },
    {
      name: "list_pending_approvals",
      description: "List everything currently waiting in the CEO's approval inbox (emails, etc.).",
      schema: z.object({}),
    },
  );

  const createTask = tool(
    async ({ title, lead, dueInDays }) => {
      let leadId: string | null = null;
      if (lead) {
        const found = await findLead(lead);
        leadId = found?.id ?? null;
      }
      const dueAt =
        typeof dueInDays === "number"
          ? new Date(Date.now() + dueInDays * 86400000).toISOString()
          : null;
      const { error } = await supabase.from("tasks").insert({ title, lead_id: leadId, due_at: dueAt });
      if (error) return `Could not create task: ${error.message}`;
      trace.push({ tool: "create_task", summary: title });
      return `Task created: "${title}"${leadId ? " (linked to lead)" : ""}${dueAt ? `, due in ${dueInDays} day(s)` : ""}.`;
    },
    {
      name: "create_task",
      description: "Create a follow-up task, optionally linked to a lead and with a due date.",
      schema: z.object({
        title: z.string().describe("What needs to be done"),
        lead: z.string().optional().describe("Optional lead id or name to link the task to"),
        dueInDays: z.number().optional().describe("Optional: due this many days from now"),
      }),
    },
  );

  const moveLeadStatus = tool(
    async ({ lead, status }) => {
      const found = await findLead(lead);
      if (!found) return `No lead found for "${lead}".`;
      if (found.status === status) return `${found.name} is already at "${status}".`;

      const update: Record<string, unknown> = { status };
      if (status === "won") update.won_at = new Date().toISOString();
      else if (found.status === "won") update.won_at = null;

      const { error } = await supabase.from("leads").update(update).eq("id", found.id);
      if (error) return `Could not move lead: ${error.message}`;

      await supabase.from("lead_activities").insert({
        lead_id: found.id,
        type: "status_change",
        title: `Status: ${found.status} → ${status}`,
        meta: { from: found.status, to: status },
        actor: "agent:manager",
      });
      trace.push({ tool: "move_lead_status", summary: `${found.name}: ${found.status} → ${status}` });
      return `Moved ${found.name} from "${found.status}" to "${status}".`;
    },
    {
      name: "move_lead_status",
      description: "Move a lead to a different pipeline stage. Logs the change to the lead's timeline.",
      schema: z.object({
        lead: z.string().describe("Lead id or name"),
        status: z.enum(STATUSES).describe("Target stage"),
      }),
    },
  );

  const draftEmail = tool(
    async ({ lead, subject, body }) => {
      const found = await findLead(lead);
      if (!found) return `No lead found for "${lead}".`;
      if (found.unsubscribed_at) return `${found.name} has unsubscribed — I won't draft an email to them.`;

      const { data: email, error } = await supabase
        .from("emails")
        .insert({
          lead_id: found.id,
          to_email: found.email,
          subject,
          body_text: body,
          source: "agent",
          status: "draft",
        })
        .select()
        .single();
      if (error || !email) return `Could not create draft: ${error?.message}`;

      await createApproval(supabase, {
        type: "email",
        entityId: email.id,
        leadId: found.id,
        title: `Email: ${subject}`,
        summary: `To ${found.email} (drafted by Manager)`,
        meta: { source: "agent" },
      });
      trace.push({ tool: "draft_email", summary: `to ${found.name} → Approvals` });
      return `Drafted an email to ${found.name} ("${subject}") and put it in the Approval Inbox. It will NOT send until you approve it.`;
    },
    {
      name: "draft_email",
      description:
        "Draft a personalized email to a lead and place it in the approval inbox. This NEVER sends — the CEO must approve. Write a complete, ready-to-send message.",
      schema: z.object({
        lead: z.string().describe("Lead id or name"),
        subject: z.string().describe("Email subject line"),
        body: z.string().describe("Full email body, personalized to the lead"),
      }),
    },
  );

  const qualifyLead = tool(
    async ({ lead }) => {
      const found = await findLead(lead);
      if (!found) return `No lead found for "${lead}".`;
      const result = await runQualify(supabase, found.id);
      if (!result.ok) return `Couldn't qualify: ${result.error}`;
      trace.push({ tool: "qualify_lead", summary: `${found.name}: ${Math.round(result.data.score)}/100` });
      return `Qualified ${found.name}: ${Math.round(result.data.score)}/100. ${result.data.rationale} Suggested: ${result.data.suggested_next_action}`;
    },
    {
      name: "qualify_lead",
      description: "Run the qualification agent on a lead — scores it 0-100 and writes the score, rationale, and next action.",
      schema: z.object({ lead: z.string().describe("Lead id or name") }),
    },
  );

  const researchCompany = tool(
    async ({ lead }) => {
      const found = await findLead(lead);
      if (!found) return `No lead found for "${lead}".`;
      const result = await runResearch(supabase, {
        company: found.company || found.name,
        industry: found.industry,
        painPoint: found.pain_point,
        leadId: found.id,
      });
      if (!result.ok) return `Couldn't research: ${result.error}`;
      trace.push({ tool: "research_company", summary: found.company || found.name });
      return `Research brief for ${found.company || found.name} (${result.data.grounding}):\n${result.data.company_overview}\nTalking points: ${result.data.talking_points.join("; ")}`;
    },
    {
      name: "research_company",
      description: "Run the research agent on a lead's company — produces a sales brief with pain points and talking points.",
      schema: z.object({ lead: z.string().describe("Lead id or name") }),
    },
  );

  const createTarget = tool(
    async ({ name, industry, location, keywords }) => {
      const { data, error } = await supabase
        .from("icps")
        .insert({
          name,
          industry: industry || null,
          location: location || null,
          keywords: keywords || null,
          status: "active",
          source: "ceo",
        })
        .select()
        .single();
      if (error) return `Could not create target: ${error.message}`;
      trace.push({ tool: "create_target", summary: name });
      return `Created and activated target "${data.name}". You can now ask me to find prospects for it.`;
    },
    {
      name: "create_target",
      description:
        "Create a new target (ICP) to hunt for — e.g. an industry + location combination like 'real estate agencies in Brampton'. Creates it active and ready to search immediately. Use this when the CEO asks to find/scrape leads in a niche that doesn't exist as a target yet.",
      schema: z.object({
        name: z.string().describe("Short name for the target, e.g. 'Real estate — Brampton'"),
        industry: z.string().optional().describe("Industry, e.g. 'real estate agency'"),
        location: z.string().optional().describe("Location, e.g. 'Brampton, ON'"),
        keywords: z.string().optional().describe("Extra search keywords"),
      }),
    },
  );

  const findProspects = tool(
    async ({ icp }) => {
      const { data, error } = await supabase
        .from("icps")
        .select("*")
        .ilike("name", `%${icp}%`)
        .limit(1);
      if (error) return `Error looking up targets: ${error.message}`;
      const target = data?.[0] as Icp | undefined;
      if (!target) return `No target (ICP) found matching "${icp}". Use create_target first to set one up, then search again.`;
      if (target.status !== "active") return `The "${target.name}" target is ${target.status}. Activate it before searching.`;
      const result = await runScraper(supabase, target.id);
      if (!result.ok) return `Scraper error: ${result.error}`;
      trace.push({ tool: "find_prospects", summary: `${result.inserted} for ${target.name}` });
      return result.summary;
    },
    {
      name: "find_prospects",
      description:
        "Run the lead scraper for an active target (ICP) by name — finds new prospect companies via Google Places / Apollo.",
      schema: z.object({ icp: z.string().describe("The name of an active ICP/target to hunt") }),
    },
  );

  const enrollInSequence = tool(
    async ({ lead, sequence }) => {
      const found = await findLead(lead);
      if (!found) return `No lead found for "${lead}".`;
      if (found.unsubscribed_at) return `${found.name} has unsubscribed — I won't enroll them.`;

      const seqQuery = supabase.from("sequences").select("id, name").eq("active", true);
      const { data: seqs } = sequence
        ? await seqQuery.ilike("name", `%${sequence}%`).limit(1)
        : await seqQuery.order("created_at", { ascending: true }).limit(1);
      const seq = seqs?.[0];
      if (!seq) return sequence ? `No active sequence matching "${sequence}".` : "No active sequences exist yet.";

      const { data: firstStep } = await supabase
        .from("sequence_steps")
        .select("day_offset")
        .eq("sequence_id", seq.id)
        .order("step_order", { ascending: true })
        .limit(1)
        .maybeSingle();
      const nextRunAt = new Date(Date.now() + ((firstStep?.day_offset as number) || 0) * 86400000).toISOString();

      const { error } = await supabase.from("sequence_enrollments").insert({
        lead_id: found.id,
        sequence_id: seq.id,
        status: "active",
        current_step: 0,
        next_run_at: nextRunAt,
      });
      if (error) {
        if (error.code === "23505") return `${found.name} is already enrolled in "${seq.name}".`;
        return `Could not enroll: ${error.message}`;
      }
      trace.push({ tool: "enroll_in_sequence", summary: `${found.name} → ${seq.name}` });
      return `Enrolled ${found.name} in "${seq.name}". The first email will draft into your Approval Inbox on the next daily run.`;
    },
    {
      name: "enroll_in_sequence",
      description:
        "Enroll a lead in a nurture sequence so it gets scheduled follow-up emails (drafted for approval). Defaults to the standard sequence if none is named.",
      schema: z.object({
        lead: z.string().describe("Lead id or name"),
        sequence: z.string().optional().describe("Optional sequence name; defaults to the standard nurture sequence"),
      }),
    },
  );

  const negotiate = tool(
    async ({ lead, threadContext }) => {
      const found = await findLead(lead);
      if (!found) return `No lead found for "${lead}".`;
      const result = await runNegotiator(supabase, { leadId: found.id, threadContext });
      if (!result.ok) return `Couldn't negotiate: ${result.error}`;
      trace.push({ tool: "negotiate", summary: `${found.name}: ${result.data.escalated ? "escalated" : "drafted"}` });
      if (result.data.escalated) {
        return `This needs your call, not mine: ${result.data.reason || result.data.rationale}. I've created a task for you instead of drafting anything.`;
      }
      return `Drafted a counter-offer to ${found.name} and put it in the Approval Inbox (never sends without your OK). ${result.data.rationale}`;
    },
    {
      name: "negotiate",
      description:
        "Analyze a negotiation with a lead against their deal guardrails (floor price, max discount, allowed concessions) and either draft a compliant counter-offer into the Approval Inbox, or escalate to the CEO if their ask breaks the rules.",
      schema: z.object({
        lead: z.string().describe("Lead id or name"),
        threadContext: z.string().describe("What the prospect asked for / said — paste their message or summarize it"),
      }),
    },
  );

  const draftDocument = tool(
    async ({ lead, documentType, instruction }) => {
      const found = await findLead(lead);
      if (!found) return `No lead found for "${lead}".`;
      const result = await runDocument(supabase, {
        leadId: found.id,
        type: documentType,
        instruction,
      });
      if (!result.ok) return `Couldn't draft the document: ${result.error}`;
      trace.push({ tool: "draft_document", summary: `${documentType} for ${found.name}` });
      return `Drafted a ${documentType.replace("_", " ")} ("${result.data.title}") for ${found.name} and put it in the Approval Inbox. Approve it there to email them a signable copy — nothing is sent until you do.`;
    },
    {
      name: "draft_document",
      description:
        "Draft a business document (proposal, service agreement, onboarding doc, or offer letter) for a lead. It's saved as a draft in the Approval Inbox; approving it emails the lead a click-to-accept copy. Never sends on its own.",
      schema: z.object({
        lead: z.string().describe("Lead id or name"),
        documentType: z
          .enum(["proposal", "agreement", "onboarding", "offer_letter"])
          .describe("Which document to generate"),
        instruction: z.string().optional().describe("Optional special instructions (scope, term, price framing)"),
      }),
    },
  );

  const createInvoice = tool(
    async ({ lead, description, amount, method }) => {
      const found = await findLead(lead);
      if (!found) return `No lead found for "${lead}".`;
      const result = await createInvoiceDraft(supabase, {
        leadId: found.id,
        lineItems: [{ description, quantity: 1, unit_amount: amount }],
        method: method ?? "etransfer",
      });
      if (!result.ok) return `Couldn't create the invoice: ${result.error}`;
      trace.push({ tool: "create_invoice", summary: `${result.number} for ${found.name}` });
      return `Drafted invoice ${result.number} for ${found.name} (${cad.format(result.amount)}, ${
        method === "stripe" ? "Stripe" : "e-transfer"
      }) → Approval Inbox. Approve it there to send it to the client.`;
    },
    {
      name: "create_invoice",
      description:
        "Create a draft invoice for a lead with a single line item. It's queued in the Approval Inbox; approving sends it (Stripe pay-online link or e-transfer email). Never sends on its own.",
      schema: z.object({
        lead: z.string().describe("Lead id or name"),
        description: z.string().describe("What the invoice is for"),
        amount: z.number().describe("Amount in CAD dollars for the line item"),
        method: z.enum(["stripe", "etransfer"]).optional().describe("Payment method; defaults to e-transfer"),
      }),
    },
  );

  return [
    getPipelineSummary,
    searchLeads,
    getLead,
    listPendingApprovals,
    createTask,
    moveLeadStatus,
    draftEmail,
    qualifyLead,
    researchCompany,
    createTarget,
    findProspects,
    enrollInSequence,
    negotiate,
    draftDocument,
    createInvoice,
  ];
}
