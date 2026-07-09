import type { SupabaseClient } from "@supabase/supabase-js";
import type { ApprovalType } from "@/lib/supabase";

/**
 * Creates a pending approval. Agents and automations call this instead of ever
 * sending/activating directly — the CEO decides from the Approval Inbox.
 */
export async function createApproval(
  supabase: SupabaseClient,
  input: {
    type: ApprovalType;
    entityId: string;
    leadId?: string | null;
    title: string;
    summary?: string | null;
    meta?: Record<string, unknown>;
  },
) {
  return supabase.from("approvals").insert({
    type: input.type,
    entity_id: input.entityId,
    lead_id: input.leadId ?? null,
    title: input.title,
    summary: input.summary ?? null,
    meta: input.meta ?? {},
  });
}
