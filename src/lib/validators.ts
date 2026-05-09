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
});

export type LeadInput = z.infer<typeof leadSchema>;
export type AnalyzeInput = z.infer<typeof analyzeSchema>;
