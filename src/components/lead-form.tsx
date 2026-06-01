"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

const industries = [
  "Dental clinic",
  "Physiotherapy clinic",
  "Real estate",
  "Small business",
  "Other",
];

const interests = [
  "AI strategy",
  "AI website",
  "AI chatbot",
  "AI voice agent",
  "Workflow automation",
  "Not sure yet",
];

type LeadFormProps = {
  source?: string;
  compact?: boolean;
  demoSummary?: string;
};

export function LeadForm({ source = "website", compact = false, demoSummary = "" }: LeadFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submitLead(formData: FormData) {
    setStatus("loading");
    setMessage("");

    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      company: String(formData.get("company") || ""),
      industry: String(formData.get("industry") || ""),
      interest: String(formData.get("interest") || ""),
      painPoint: String(formData.get("painPoint") || ""),
      source,
      demoSummary,
    };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not submit lead.");
      }

      setStatus("success");
      setMessage(result.demoMode ? "Saved locally for demo mode. Connect Supabase to store live leads." : "Your request is in the dashboard.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    }
  }

  return (
    <form action={submitLead} className="grid gap-4">
      <div className={compact ? "grid gap-4" : "grid gap-4 md:grid-cols-2"}>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Name
          <input
            name="name"
            required
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-950 outline-none transition focus:border-[#4B0082] focus:ring-4 focus:ring-[#9400D3]/20"
            placeholder="Your name"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Email
          <input
            name="email"
            type="email"
            required
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-950 outline-none transition focus:border-[#4B0082] focus:ring-4 focus:ring-[#9400D3]/20"
            placeholder="you@company.com"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Phone
          <input
            name="phone"
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-950 outline-none transition focus:border-[#4B0082] focus:ring-4 focus:ring-[#9400D3]/20"
            placeholder="+1"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Company
          <input
            name="company"
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-950 outline-none transition focus:border-[#4B0082] focus:ring-4 focus:ring-[#9400D3]/20"
            placeholder="Business name"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Industry
          <select
            name="industry"
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-950 outline-none transition focus:border-[#4B0082] focus:ring-4 focus:ring-[#9400D3]/20"
            defaultValue=""
          >
            <option value="" disabled>
              Select industry
            </option>
            {industries.map((industry) => (
              <option key={industry}>{industry}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Interest
          <select
            name="interest"
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-950 outline-none transition focus:border-[#4B0082] focus:ring-4 focus:ring-[#9400D3]/20"
            defaultValue=""
          >
            <option value="" disabled>
              Select service
            </option>
            {interests.map((interest) => (
              <option key={interest}>{interest}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        What business challenge should AI help solve?
        <textarea
          name="painPoint"
          required
          rows={compact ? 4 : 5}
          className="resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-[#4B0082] focus:ring-4 focus:ring-[#9400D3]/20"
          placeholder="Example: We miss calls after hours, spend too much time on intake, and need better follow-up for new leads."
        />
      </label>

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex h-[52px] items-center justify-center gap-2 rounded-full bg-[#0f0f1a] px-6 text-sm font-bold text-white shadow-[0_16px_40px_rgba(15,15,26,.2)] transition hover:bg-[#4B0082] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "loading" ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
        Request AI Strategy Call
      </button>

      {message ? (
        <p className={`flex items-center gap-2 text-sm ${status === "success" ? "text-[#4B0082]" : "text-red-600"}`}>
          {status === "success" ? <CheckCircle2 className="size-4" /> : null}
          {message}
        </p>
      ) : null}
    </form>
  );
}
