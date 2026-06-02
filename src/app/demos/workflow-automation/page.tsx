import type { Metadata } from "next";
import { DemoPageShell } from "@/components/demo-page-shell";
import { Play, Workflow, Calendar, Mail, Database, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Workflow Automation",
  description: "See SyncAI workflow automation demos — automations across forms, calendars, email, CRMs, and internal handoffs.",
};

export default function WorkflowAutomationPage() {
  return (
    <DemoPageShell
      title="Workflow Automation"
      tagline="Demo"
      description="Automations across forms, calendars, email, CRMs, and internal handoffs so teams spend less time on repetitive work."
    >
      {/* Video demos */}
      <section className="bg-[#0f0f1a] py-20 text-white sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-black tracking-tight sm:text-5xl">
              See automation in action
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              Watch how SyncAI automations eliminate repetitive tasks and connect your tools.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {[
              {
                title: "Lead Intake Automation",
                description: "Watch how leads from web forms, chat, and calls are automatically captured, qualified, and routed to the right team member.",
                duration: "2:34",
              },
              {
                title: "Calendar & Booking Sync",
                description: "See AI-driven scheduling that syncs across calendars, sends reminders, and reduces no-shows automatically.",
                duration: "1:58",
              },
              {
                title: "Email & Follow-Up Sequences",
                description: "Automated email campaigns triggered by lead behavior — from welcome sequences to re-engagement flows.",
                duration: "3:12",
              },
              {
                title: "CRM & Data Integration",
                description: "Two-way sync between your website, forms, and CRM — no manual data entry required.",
                duration: "2:45",
              },
            ].map((video) => (
              <div key={video.title} className="group rounded-[2rem] border border-white/10 bg-white/[.07] p-6 backdrop-blur-xl transition hover:border-[#9400D3]/35">
                <div className="relative mb-5 aspect-video w-full rounded-xl border border-white/10 bg-[#0f0f1a]/80">
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <span className="flex size-16 items-center justify-center rounded-full bg-[#9400D3]/20 text-[#9400D3] transition group-hover:scale-110">
                      <Play className="size-8 fill-current" />
                    </span>
                    <p className="mt-3 text-xs text-slate-500">{video.duration}</p>
                    <p className="mt-2 text-xs text-slate-500">[Video embed placeholder]</p>
                  </div>
                </div>
                <h3 className="text-xl font-black">{video.title}</h3>
                <p className="mt-3 leading-7 text-slate-300">{video.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration list */}
      <section className="bg-[#f8f9fc] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-black tracking-tight text-[#161616] sm:text-5xl">
              What we automate
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Calendar, title: "Scheduling", description: "Automated booking, reminders, rescheduling, and calendar sync." },
              { icon: Mail, title: "Email Campaigns", description: "Triggered sequences for lead nurture, follow-ups, and re-engagement." },
              { icon: Database, title: "CRM Sync", description: "Two-way data sync between web forms, chat, and your CRM." },
              { icon: Workflow, title: "Internal Handoffs", description: "Auto-route leads, tasks, and notifications to the right person." },
            ].map((item) => (
              <div key={item.title} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-[#4B0082]/10 text-[#4B0082]">
                  <item.icon className="size-6" />
                </span>
                <h3 className="mt-5 text-xl font-black text-[#161616]">{item.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0f0f1a] py-20 text-center text-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black sm:text-5xl">Ready to automate your workflows?</h2>
          <p className="mt-5 text-lg text-slate-300">Let&apos;s find the automations that save your team the most time.</p>
          <Link
            href="/contact"
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-[#4B0082] to-[#9400D3] px-6 text-sm font-bold text-white shadow-[0_8px_24px_rgba(75,0,130,0.35)]"
          >
            Book a Strategy Call <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </DemoPageShell>
  );
}
