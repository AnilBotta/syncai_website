import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Case Studies",
  description: "See how Canadian businesses are using SyncAI to cut costs, capture leads, and grow revenue with custom AI systems.",
};

const caseStudies = [
  {
    industry: "Healthcare",
    title: "Dental Clinic Recovers $50K in Missed Revenue",
    metric: "40% more booked consultations",
    description: "A multi-provider dental clinic was losing after-hours inquiries and struggling with patient intake. SyncAI built an AI website with a lead qualification agent and automated follow-up system.",
    results: ["40% increase in booked consultations", "15 hours/week saved on admin", "24/7 lead capture active"],
  },
  {
    industry: "Real Estate",
    title: "Real Estate Team Captures 300+ Leads/Month",
    metric: "300+ qualified leads monthly",
    description: "A growing real estate team needed to qualify buyer and seller leads faster. SyncAI deployed an AI voice agent for after-hours calls and a lead routing system.",
    results: ["300+ leads captured monthly", "60% of after-hours calls converted", "2min average response time"],
  },
  {
    industry: "Small Business",
    title: "Physiotherapy Clinic Automates Intake",
    metric: "15 hours/week saved",
    description: "A physiotherapy practice was spending 15 hours weekly on manual intake paperwork. SyncAI automated the entire patient intake workflow with AI forms and calendar integration.",
    results: ["15 hours/week admin saved", "100% digital intake adoption", "Same-day booking rate increased"],
  },
];

export default function CaseStudiesPage() {
  return (
    <PageShell
      eyebrow="Case Studies"
      title="Real results from real businesses"
      description="See how Canadian businesses are using SyncAI systems to reduce costs, capture more leads, and grow revenue."
    >
      <section className="bg-[#f8f9fc] py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:px-8">
          {caseStudies.map((cs) => (
            <div key={cs.title} className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
                <div>
                  <span className="rounded-full bg-[#4B0082]/10 px-3 py-1 text-xs font-bold text-[#4B0082]">
                    {cs.industry}
                  </span>
                  <h2 className="mt-4 text-2xl font-black text-[#161616]">{cs.title}</h2>
                  <p className="mt-4 leading-7 text-slate-600">{cs.description}</p>
                  <ul className="mt-6 grid gap-3">
                    {cs.results.map((r) => (
                      <li key={r} className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                        <span className="size-1.5 rounded-full bg-[#4B0082]" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-[#4B0082]/5 to-[#9400D3]/5 p-8 text-center">
                  <div>
                    <p className="text-3xl font-black text-[#4B0082]">{cs.metric}</p>
                    <p className="mt-2 text-sm text-slate-500">Key result</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-[#0f0f1a] py-20 text-center text-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black sm:text-5xl">Ready to be our next success story?</h2>
          <p className="mt-5 text-lg text-slate-300">Book a free strategy call and discover what AI can do for your business.</p>
          <Link
            href="/contact"
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-[#4B0082] to-[#9400D3] px-6 text-sm font-bold text-white shadow-[0_8px_24px_rgba(75,0,130,0.35)]"
          >
            Book a Strategy Call <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
