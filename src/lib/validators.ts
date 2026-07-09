import { z } from "zod";

export const leadSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(180),
  phone: z.string().max(40).optional().or(z.literal("")),
  company: z.string().max(140).optional().or(z.literal("")),
  industry: z.string().max(120).optional().or(z.literal("")),
  painPoint: z.string().min(12).max(1800),
  interest: z.string().max(120).optional().or(z.literal("")),
  source: z.string().max(80).default("website"),
  demoSummary: z.string().max(2200).optional().or(z.literal("")),
});

export const analyzeSchema = z.object({
  businessType: z.string().min(2).max(120),
  currentProblem: z.string().min(8).max(1500),
  monthlyLeads: z.coerce.number().min(0).max(100000).default(50),
  hoursLostWeekly: z.coerce.number().min(0).max(1000).default(8),
});

export const leadUpdateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["new", "contacted", "qualified", "proposal", "won", "lost"]).optional(),
  notes: z.string().max(4000).optional(),
  value: z.coerce.number().min(0).max(100000000).optional(),
  nextAction: z.string().max(500).optional(),
  floorPrice: z.coerce.number().min(0).max(100000000).nullable().optional(),
  maxDiscountPct: z.coerce.number().int().min(0).max(100).nullable().optional(),
  concessionNotes: z.string().max(2000).optional(),
});

export const activityCreateSchema = z.object({
  type: z.enum(["note", "system"]).default("note"),
  title: z.string().min(1).max(200),
  body: z.string().max(4000).optional().or(z.literal("")),
});

export const taskCreateSchema = z.object({
  leadId: z.string().uuid().nullable().optional(),
  title: z.string().min(1).max(300),
  dueAt: z.string().datetime({ offset: true }).nullable().optional(),
});

export const taskUpdateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["open", "done", "dismissed"]).optional(),
  title: z.string().min(1).max(300).optional(),
  dueAt: z.string().datetime({ offset: true }).nullable().optional(),
});

export const emailCreateSchema = z.object({
  leadId: z.string().uuid().nullable().optional(),
  toEmail: z.string().email().max(180),
  subject: z.string().min(1).max(200),
  bodyText: z.string().min(1).max(20000),
  source: z.enum(["manual", "agent", "sequence"]).default("manual"),
});

export const emailUpdateSchema = z.object({
  id: z.string().min(1),
  subject: z.string().min(1).max(200).optional(),
  bodyText: z.string().min(1).max(20000).optional(),
  action: z.enum(["cancel"]).optional(),
});

export const emailSendSchema = z.object({
  id: z.string().min(1),
});

export const approvalDecisionSchema = z.object({
  id: z.string().min(1),
  decision: z.enum(["approved", "rejected"]),
});

export const managerChatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(6000),
      }),
    )
    .min(1)
    .max(40),
});

export const appointmentSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(180),
  phone: z.string().max(40).optional().or(z.literal("")),
  company: z.string().max(140).optional().or(z.literal("")),
  service: z.string().max(120).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
  startsAt: z.string().datetime({ offset: true }),
  timezone: z.string().max(60).default("America/Toronto"),
  source: z.string().max(80).default("booking_page"),
});

export const appointmentUpdateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["pending", "confirmed", "completed", "cancelled", "no_show"]).optional(),
  notes: z.string().max(4000).optional(),
});

export const availabilityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      })
    )
    .min(1)
    .max(30),
});

export const toolSubmissionSchema = z.object({
  type: z.enum(["ai-readiness", "conversion-audit"]),
  email: z.string().email().max(180),
  url: z.string().url().max(300).optional().or(z.literal("")),
  summary: z.string().min(12).max(1200),
});

export type LeadInput = z.infer<typeof leadSchema>;
export type AnalyzeInput = z.infer<typeof analyzeSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
