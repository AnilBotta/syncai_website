import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export type Lead = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  industry?: string | null;
  pain_point: string;
  interest?: string | null;
  source: string;
  demo_summary?: string | null;
  status: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
  notes?: string | null;
  value: number;
  won_at?: string | null;
  last_contacted_at?: string | null;
  score?: number | null;
  score_rationale?: string | null;
  next_action?: string | null;
  floor_price?: number | null;
  max_discount_pct?: number | null;
  concession_notes?: string | null;
  unsubscribed_at?: string | null;
};

export type LeadActivity = {
  id: string;
  created_at: string;
  lead_id: string;
  type: "note" | "status_change" | "email" | "agent_run" | "task" | "document" | "call" | "system";
  title: string;
  body?: string | null;
  meta: Record<string, unknown>;
  actor: string;
};

export type Task = {
  id: string;
  created_at: string;
  lead_id?: string | null;
  title: string;
  due_at?: string | null;
  status: "open" | "done" | "dismissed";
  completed_at?: string | null;
};

export type Email = {
  id: string;
  created_at: string;
  lead_id?: string | null;
  direction: "outbound" | "inbound";
  to_email: string;
  subject: string;
  body_text: string;
  status: "draft" | "approved" | "sent" | "failed" | "cancelled";
  source: "manual" | "agent" | "sequence";
  sequence_enrollment_id?: string | null;
  approved_at?: string | null;
  sent_at?: string | null;
  resend_id?: string | null;
  error?: string | null;
  meta: Record<string, unknown>;
};

export type ApprovalType =
  | "email"
  | "negotiation_reply"
  | "document"
  | "invoice"
  | "icp"
  | "sequence_autosend"
  | "pipeline_batch"
  | "pipeline_calls"
  | "pipeline_bookcall"
  | "pipeline_start";

export type PipelineStage =
  | "queued"
  | "awaiting_email_approval"
  | "awaiting_reply"
  | "awaiting_booking"
  | "paused_cold"
  | "done";

export type Pipeline = {
  id: string;
  created_at: string;
  updated_at: string;
  batch_id?: string | null;
  prospect_id?: string | null;
  lead_id?: string | null;
  stage: PipelineStage;
  status: "active" | "paused" | "completed" | "cancelled";
  stage_changed_at: string;
  meta: Record<string, unknown>;
};

export type Approval = {
  id: string;
  created_at: string;
  type: ApprovalType;
  entity_id?: string | null;
  lead_id?: string | null;
  title: string;
  summary?: string | null;
  status: "pending" | "approved" | "rejected";
  decided_at?: string | null;
  meta: Record<string, unknown>;
};

export type AgentName =
  | "manager"
  | "qualify"
  | "research"
  | "email_draft"
  | "sequence_draft"
  | "scraper"
  | "negotiate"
  | "document"
  | "finance";

export type InvoiceLineItem = { description: string; quantity: number; unit_amount: number };

export type Invoice = {
  id: string;
  created_at: string;
  lead_id?: string | null;
  number: string;
  line_items: InvoiceLineItem[];
  amount: number;
  currency: string;
  method: "stripe" | "etransfer";
  status: "draft" | "approved" | "sent" | "paid" | "void";
  stripe_invoice_id?: string | null;
  hosted_invoice_url?: string | null;
  due_on?: string | null;
  sent_at?: string | null;
  paid_at?: string | null;
  notes?: string | null;
  meta: Record<string, unknown>;
};

export type ExpenseCategory =
  | "software"
  | "contractor"
  | "marketing"
  | "ai_api"
  | "hardware"
  | "fees"
  | "other";

export type Expense = {
  id: string;
  created_at: string;
  incurred_on: string;
  category: ExpenseCategory;
  vendor?: string | null;
  description?: string | null;
  amount: number;
  currency: string;
  recurring: boolean;
  external_source?: string | null;
  external_id?: string | null;
};

export type Call = {
  id: string;
  created_at: string;
  lead_id?: string | null;
  provider: string;
  provider_call_id?: string | null;
  direction: "outbound" | "inbound";
  to_number?: string | null;
  from_number?: string | null;
  status: "queued" | "ringing" | "in_progress" | "completed" | "failed" | "no_answer";
  started_at?: string | null;
  ended_at?: string | null;
  duration_seconds?: number | null;
  transcript?: string | null;
  summary?: string | null;
  recording_url?: string | null;
  outcome?: string | null;
  meta: Record<string, unknown>;
};

export type DocumentType = "proposal" | "agreement" | "onboarding" | "offer_letter";

export type Document = {
  id: string;
  created_at: string;
  lead_id?: string | null;
  type: DocumentType;
  title: string;
  content_md: string;
  status: "draft" | "approved" | "sent" | "viewed" | "accepted" | "cancelled";
  accept_token: string;
  sent_at?: string | null;
  viewed_at?: string | null;
  accepted_at?: string | null;
  accepted_ip?: string | null;
  meta: Record<string, unknown>;
};

export type Icp = {
  id: string;
  created_at: string;
  name: string;
  industry?: string | null;
  location?: string | null;
  company_size?: string | null;
  keywords?: string | null;
  status: "proposed" | "active" | "paused";
  source: "ceo" | "manager";
  rationale?: string | null;
};

export type Prospect = {
  id: string;
  created_at: string;
  icp_id?: string | null;
  company: string;
  domain?: string | null;
  contact_name?: string | null;
  email?: string | null;
  phone?: string | null;
  source: "apollo" | "places" | "manual";
  enrichment: Record<string, unknown>;
  status: "found" | "enriched" | "promoted" | "discarded";
  lead_id?: string | null;
};

export type Sequence = {
  id: string;
  created_at: string;
  name: string;
  description?: string | null;
  active: boolean;
  auto_send: boolean;
};

export type SequenceStep = {
  id: string;
  sequence_id: string;
  step_order: number;
  day_offset: number;
  intent: string;
  instruction: string;
};

export type SequenceEnrollment = {
  id: string;
  created_at: string;
  lead_id: string;
  sequence_id: string;
  status: "active" | "paused" | "completed" | "cancelled";
  current_step: number;
  next_run_at: string;
};

export type AgentRun = {
  id: string;
  created_at: string;
  finished_at?: string | null;
  lead_id?: string | null;
  agent: AgentName;
  status: "running" | "succeeded" | "failed";
  thread_key?: string | null;
  input: Record<string, unknown>;
  output?: Record<string, unknown> | null;
  model?: string | null;
  tokens_in?: number | null;
  tokens_out?: number | null;
  cost_usd?: number | null;
  error?: string | null;
};

export type Appointment = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  service?: string | null;
  notes?: string | null;
  starts_at: string;
  ends_at: string;
  timezone: string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
  source: string;
  lead_id?: string | null;
  meeting_url?: string | null;
  meeting_id?: string | null;
  /** The attendee's IANA timezone; null => use `timezone` (the business zone). */
  attendee_timezone?: string | null;
};

export function hasSupabasePublicConfig() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function hasSupabaseAdminConfig() {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseServiceRoleKey);
}

export function createSupabaseBrowserClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase public environment variables are missing.");
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

export function createSupabaseAdminClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Supabase admin environment variables are missing.");
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function verifyAdminToken(authHeader: string | null) {
  if (!supabaseUrl || !supabaseAnonKey || !authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.replace("Bearer ", "");
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return null;
  }

  // Fail closed: without a configured admin allow-list, no user is an admin.
  // Otherwise any valid Supabase user for this project could read lead PII.
  const allowedEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  if (!allowedEmail || data.user.email?.toLowerCase() !== allowedEmail) {
    return null;
  }

  return data.user;
}
