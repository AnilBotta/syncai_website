import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  MousePointerClick,
  PhoneCall,
  PlayCircle,
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
        <section className="relative overflow-hidden bg-black text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(147,51,234,.32),transparent_34%),linear-gradient(115deg,#050007_0%,#130021_46%,#020003_100%)]" />
          <div className="relative mx-auto grid min-h-[calc(100svh-72px)] max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[.98fr_1.02fr] lg:items-center lg:px-8 xl:py-20">
            <div className="relative z-10">
              <p className="inline-flex rounded-full border border-purple-300/25 bg-white/5 px-4 py-2 text-sm font-bold text-purple-100 shadow-[0_0_40px_rgba(147,51,234,.16)] backdrop-blur">
                Canada-based AI strategy and implementation from Brampton, Ontario
              </p>
              <h1 className="mt-7 max-w-3xl text-4xl font-black leading-[1.04] tracking-tight text-white sm:text-5xl lg:text-[3.45rem] xl:text-[3.75rem]">
                AI systems that solve business challenges and turn ordinary sites into{" "}
                <span className="bg-gradient-to-r from-white via-purple-100 to-fuchsia-300 bg-clip-text text-transparent">
                  AI websites and lead machines.
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                SyncAi Technologies helps businesses identify the right AI opportunities, then builds the
                websites, agents, automations, and workflows that capture leads and reduce manual work.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="inline-flex h-[52px] items-center justify-center gap-2 rounded-full bg-purple-600 px-6 text-sm font-black text-white shadow-[0_18px_60px_rgba(126,34,206,.32)] transition hover:bg-white hover:text-slate-950"
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
              <div className="mt-9 grid gap-3 sm:grid-cols-3">
                {["AI roadmaps", "Lead agents", "Workflow automation"].map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-3 py-2 text-sm font-semibold text-slate-200 backdrop-blur">
                    <CheckCircle2 className="size-4 text-purple-200" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-h-[420px] lg:min-h-[500px]">
              <div className="absolute inset-0 rounded-[3rem] bg-purple-600/20 blur-3xl" />
              <Image
                src="/brand/syncai-hero-ai-workflow.png"
                alt="AI workflow connecting website, voice, CRM, calendar, and lead systems"
                width={1792}
                height={1024}
                priority
                className="absolute inset-0 h-full w-full rounded-[2.5rem] object-cover object-center opacity-95 shadow-2xl shadow-purple-950/40"
              />
              <div className="absolute inset-0 rounded-[2.5rem] bg-[linear-gradient(90deg,rgba(0,0,0,.18),transparent_42%),linear-gradient(0deg,rgba(0,0,0,.45),transparent_52%)]" />
              <div className="absolute left-4 right-4 top-4 rounded-[1.5rem] border border-white/14 bg-black/35 px-5 py-4 shadow-2xl backdrop-blur-md sm:left-6 sm:right-auto sm:max-w-sm">
                <p className="text-xs font-black uppercase tracking-[.24em] text-purple-200">AI growth system</p>
                <p className="mt-2 text-lg font-black">Website, agents, automation, and leads connected.</p>
              </div>
              <div className="absolute bottom-4 left-4 right-4 grid gap-3 rounded-[1.5rem] border border-white/14 bg-black/42 p-4 backdrop-blur-md sm:left-6 sm:right-6 sm:grid-cols-3">
                {[
                  ["24/7", "lead capture"],
                  ["1", "admin dashboard"],
                  ["3", "launch demos"],
                ].map(([value, label]) => (
                  <div key={label} className="border-white/10 px-4 py-3 sm:border-r sm:last:border-r-0">
                    <p className="text-2xl font-black text-white">{value}</p>
                    <p className="text-xs font-semibold text-purple-100">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-14">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
            {proofPoints.map((point) => (
              <div key={point.value} className="rounded-[1.5rem] border border-slate-200 p-5">
                <point.icon className="size-6 text-purple-700" />
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
                <p className="text-sm font-black uppercase tracking-[.25em] text-purple-200">Services</p>
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
                  <service.icon className="size-7 text-purple-200" />
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
              <p className="text-sm font-black uppercase tracking-[.25em] text-purple-700">Demos that sell</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
                The website should prove the value before the sales call.
              </h2>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {demoCards.map((demo) => (
                <div key={demo.title} className="rounded-[2rem] border border-slate-200 p-6 shadow-sm">
                  <demo.icon className="size-7 text-purple-700" />
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
                <p className="text-sm font-black uppercase tracking-[.25em] text-purple-700">Industries</p>
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
                      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-purple-50 text-purple-700">
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
              <p className="text-sm font-black uppercase tracking-[.25em] text-purple-700">Process</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
                A clear path from discovery to launch.
              </h2>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {process.map((item) => (
                <div key={item.step} className="rounded-[2rem] border border-slate-200 p-6">
                  <p className="text-sm font-black text-purple-700">{item.step}</p>
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
              <p className="text-sm font-black uppercase tracking-[.25em] text-purple-200">Lead capture</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
                Start with an AI strategy call.
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-300">
                Tell us where the business is losing time, leads, or follow-up quality. The first conversation
                is about finding the right AI use case, not forcing a tool.
              </p>
              <div className="mt-8 grid gap-4 text-sm text-slate-300">
                <div className="flex gap-3">
                  <MousePointerClick className="size-5 text-purple-200" />
                  Leads are stored in the private admin dashboard.
                </div>
                <div className="flex gap-3">
                  <PhoneCall className="size-5 text-purple-200" />
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
              <p className="text-sm font-black uppercase tracking-[.25em] text-purple-700">FAQ</p>
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
