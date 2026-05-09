import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  MousePointerClick,
  PhoneCall,
  PlayCircle,
  TrendingUp,
} from "lucide-react";
import { DemoAnalyzer } from "@/components/demo-analyzer";
import { LeadForm } from "@/components/lead-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { demoCards, faqs, industries, process, proofPoints, services } from "@/lib/site-data";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden bg-[#061018] text-white">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,.18),transparent_34%),radial-gradient(circle_at_75%_15%,rgba(16,185,129,.18),transparent_28%)]" />
          <div className="relative mx-auto grid min-h-[calc(100svh-72px)] max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-8">
            <div>
              <p className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100">
                Canada-based AI strategy and implementation from Brampton, Ontario
              </p>
              <h1 className="mt-7 max-w-4xl text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
                AI systems that solve business pain points and turn websites into lead machines.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                SyncAi Technologies helps businesses identify the right AI opportunities, then builds the
                websites, agents, automations, and workflows that capture leads and reduce manual work.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="inline-flex h-[52px] items-center justify-center gap-2 rounded-full bg-cyan-300 px-6 text-sm font-black text-slate-950 shadow-[0_18px_60px_rgba(34,211,238,.28)] transition hover:bg-white"
                >
                  Book AI Strategy Call
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="#demo"
                  className="inline-flex h-[52px] items-center justify-center gap-2 rounded-full border border-white/15 px-6 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  <PlayCircle className="size-4" />
                  Try the AI Demo
                </Link>
              </div>
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {["AI roadmaps", "Lead agents", "Workflow automation"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                    <CheckCircle2 className="size-4 text-cyan-200" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[2rem] border border-white/12 bg-white/[.06] p-4 shadow-2xl shadow-cyan-950/40 backdrop-blur">
                <div className="rounded-[1.5rem] bg-white p-5 text-slate-950">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-black uppercase tracking-[.2em] text-cyan-700">
                        AI opportunity board
                      </p>
                      <h2 className="mt-2 text-2xl font-black">From pain point to working system</h2>
                    </div>
                    <span className="grid size-12 place-items-center rounded-2xl bg-slate-950 text-cyan-200">
                      <TrendingUp className="size-6" />
                    </span>
                  </div>

                  <div className="mt-6 grid gap-3">
                    {[
                      ["Missed calls", "Voice agent qualifies and routes urgent inquiries"],
                      ["Slow intake", "AI form extracts needs and creates a clean lead record"],
                      ["Manual follow-up", "Automation sends next steps and updates the pipeline"],
                    ].map(([pain, solution], index) => (
                      <div key={pain} className="grid gap-3 rounded-3xl border border-slate-200 p-4 sm:grid-cols-[.8fr_1.2fr]">
                        <div className="flex items-center gap-3">
                          <span className="grid size-9 place-items-center rounded-2xl bg-cyan-50 text-sm font-black text-cyan-700">
                            {index + 1}
                          </span>
                          <p className="font-bold">{pain}</p>
                        </div>
                        <p className="text-sm leading-6 text-slate-600">{solution}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-3 rounded-3xl bg-slate-950 p-5 text-white sm:grid-cols-3">
                    {[
                      ["24/7", "lead capture"],
                      ["1", "admin dashboard"],
                      ["3", "launch demos"],
                    ].map(([value, label]) => (
                      <div key={label}>
                        <p className="text-3xl font-black text-cyan-200">{value}</p>
                        <p className="text-sm text-slate-300">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-14">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
            {proofPoints.map((point) => (
              <div key={point.value} className="rounded-[1.5rem] border border-slate-200 p-5">
                <point.icon className="size-6 text-cyan-700" />
                <p className="mt-4 text-lg font-black text-slate-950">{point.value}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{point.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-950 py-20 text-white sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
              <div>
                <p className="text-sm font-black uppercase tracking-[.25em] text-cyan-200">Services</p>
                <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
                  Strategy first. Technology second. Business result always.
                </h2>
              </div>
              <p className="text-lg leading-8 text-slate-300">
                Most businesses do not need random AI tools. They need a practical system designed around their
                customer journey, team capacity, and revenue goals.
              </p>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {services.map((service) => (
                <div key={service.title} className="rounded-[2rem] border border-white/10 bg-white/[.04] p-6">
                  <service.icon className="size-7 text-cyan-200" />
                  <h3 className="mt-5 text-xl font-black">{service.title}</h3>
                  <p className="mt-3 leading-7 text-slate-300">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <DemoAnalyzer />

        <section className="bg-white py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-black uppercase tracking-[.25em] text-cyan-700">Demos that sell</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
                The website should prove the value before the sales call.
              </h2>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {demoCards.map((demo) => (
                <div key={demo.title} className="rounded-[2rem] border border-slate-200 p-6 shadow-sm">
                  <demo.icon className="size-7 text-cyan-700" />
                  <h3 className="mt-5 text-xl font-black text-slate-950">{demo.title}</h3>
                  <p className="mt-3 leading-7 text-slate-600">{demo.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f4f7fb] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr]">
              <div>
                <p className="text-sm font-black uppercase tracking-[.25em] text-cyan-700">Industries</p>
                <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
                  Built for real operators, not AI theatre.
                </h2>
                <p className="mt-5 text-lg leading-8 text-slate-600">
                  SyncAi can serve many business types, but launch messaging should feel concrete. These are
                  the strongest first verticals for credibility and demand.
                </p>
              </div>
              <div className="grid gap-5">
                {industries.map((industry) => (
                  <div key={industry.title} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-cyan-50 text-cyan-700">
                        <industry.icon className="size-6" />
                      </span>
                      <div>
                        <h3 className="text-xl font-black text-slate-950">{industry.title}</h3>
                        <p className="mt-2 leading-7 text-slate-600">{industry.description}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {industry.outcomes.map((outcome) => (
                            <span key={outcome} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                              {outcome}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-sm font-black uppercase tracking-[.25em] text-cyan-700">Process</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
                A clear path from discovery to launch.
              </h2>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {process.map((item) => (
                <div key={item.step} className="rounded-[2rem] border border-slate-200 p-6">
                  <p className="text-sm font-black text-cyan-700">{item.step}</p>
                  <h3 className="mt-4 text-xl font-black text-slate-950">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-20 text-white sm:py-28">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
            <div>
              <p className="text-sm font-black uppercase tracking-[.25em] text-cyan-200">Lead capture</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
                Start with an AI strategy call.
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-300">
                Tell us where the business is losing time, leads, or follow-up quality. The first conversation
                is about finding the right AI use case, not forcing a tool.
              </p>
              <div className="mt-8 grid gap-4 text-sm text-slate-300">
                <div className="flex gap-3">
                  <MousePointerClick className="size-5 text-cyan-200" />
                  Leads are stored in the private admin dashboard.
                </div>
                <div className="flex gap-3">
                  <PhoneCall className="size-5 text-cyan-200" />
                  SyncAi can follow up using the contact details already on the site.
                </div>
              </div>
            </div>
            <div className="rounded-[2rem] bg-white p-6 text-slate-950">
              <LeadForm source="homepage" />
            </div>
          </div>
        </section>

        <section className="bg-white py-20 sm:py-28">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-black uppercase tracking-[.25em] text-cyan-700">FAQ</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
                Clear answers for serious buyers.
              </h2>
            </div>
            <div className="mt-10 grid gap-4">
              {faqs.map((faq) => (
                <details key={faq.question} className="group rounded-[1.5rem] border border-slate-200 p-5">
                  <summary className="cursor-pointer list-none text-lg font-black text-slate-950">
                    {faq.question}
                  </summary>
                  <p className="mt-3 leading-7 text-slate-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
