import type { SupabaseClient } from "@supabase/supabase-js";
import type { Lead, Sequence, SequenceEnrollment, SequenceStep } from "@/lib/supabase";
import { runOutreach } from "@/lib/agents/outreach";
import { sendEmailRecord } from "@/lib/email/send-core";

const MAX_PER_TICK = 5;

export type TickResult = {
  processed: number;
  drafted: number;
  sent: number;
  completed: number;
  details: string[];
};

/**
 * Advances every nurture enrollment that is due. For each: drafts the current
 * step's email into the Approval Inbox (via the outreach agent), auto-sends only
 * if the sequence opted in, then schedules the next step. Bounded per tick so it
 * fits the cron's time budget. Skips (and completes) leads that unsubscribed,
 * won, or lost.
 */
export async function tickDueEnrollments(supabase: SupabaseClient): Promise<TickResult> {
  const result: TickResult = { processed: 0, drafted: 0, sent: 0, completed: 0, details: [] };

  const { data: due } = await supabase
    .from("sequence_enrollments")
    .select("*")
    .eq("status", "active")
    .lte("next_run_at", new Date().toISOString())
    .order("next_run_at", { ascending: true })
    .limit(MAX_PER_TICK)
    .returns<SequenceEnrollment[]>();

  for (const enrollment of due || []) {
    result.processed += 1;

    const { data: lead } = await supabase
      .from("leads")
      .select("*")
      .eq("id", enrollment.lead_id)
      .single<Lead>();

    // Stop nurturing leads that are done or opted out.
    if (!lead || lead.unsubscribed_at || lead.status === "won" || lead.status === "lost") {
      await supabase
        .from("sequence_enrollments")
        .update({ status: "completed" })
        .eq("id", enrollment.id);
      result.completed += 1;
      result.details.push(`${lead?.name ?? "lead"}: completed (unsubscribed/won/lost)`);
      continue;
    }

    const { data: seq } = await supabase
      .from("sequences")
      .select("*")
      .eq("id", enrollment.sequence_id)
      .single<Sequence>();
    const { data: steps } = await supabase
      .from("sequence_steps")
      .select("*")
      .eq("sequence_id", enrollment.sequence_id)
      .order("step_order", { ascending: true })
      .returns<SequenceStep[]>();

    if (!seq || !seq.active || !steps || enrollment.current_step >= steps.length) {
      await supabase.from("sequence_enrollments").update({ status: "completed" }).eq("id", enrollment.id);
      result.completed += 1;
      continue;
    }

    const step = steps[enrollment.current_step];

    const outreach = await runOutreach(supabase, {
      leadId: lead.id,
      instruction: step.instruction,
      source: "sequence",
      sequenceEnrollmentId: enrollment.id,
    });

    if (outreach.ok) {
      result.drafted += 1;
      // Auto-send only if the CEO opted this sequence in.
      if (seq.auto_send && outreach.data.emailId) {
        const sent = await sendEmailRecord(supabase, outreach.data.emailId);
        if (sent.ok) result.sent += 1;
      }
      result.details.push(`${lead.name}: step ${enrollment.current_step + 1}/${steps.length} (${step.intent})`);
    } else {
      result.details.push(`${lead.name}: step ${enrollment.current_step + 1} failed — ${outreach.error}`);
    }

    // Schedule the next step, or complete the enrollment.
    const nextStep = enrollment.current_step + 1;
    if (nextStep >= steps.length) {
      await supabase
        .from("sequence_enrollments")
        .update({ status: "completed", current_step: nextStep })
        .eq("id", enrollment.id);
      result.completed += 1;
    } else {
      const base = new Date(enrollment.created_at).getTime();
      const nextRunAt = new Date(base + steps[nextStep].day_offset * 86400000).toISOString();
      await supabase
        .from("sequence_enrollments")
        .update({ current_step: nextStep, next_run_at: nextRunAt })
        .eq("id", enrollment.id);
    }
  }

  return result;
}
