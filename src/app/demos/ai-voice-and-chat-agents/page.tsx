import type { Metadata } from "next";
import { DemoPageShell } from "@/components/demo-page-shell";
import { PhoneCall, MessageSquareText, Headphones, ArrowRight, Bot } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Voice & Chat Agents",
  description: "Live AI voice and chat agent demos — 24/7 customer engagement, missed-call recovery, and instant support.",
};

export default function AiVoiceChatPage() {
  return (
    <DemoPageShell
      title="AI Voice & Chat Agents"
      tagline="Demo"
      description="Website chat, missed-call recovery, appointment support, FAQs, intake, and follow-up agents for daily operations."
    >
      {/* Live agents section */}
      <section className="bg-[#0f0f1a] py-20 text-white sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-black tracking-tight sm:text-5xl">
              Try the live agents
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              These embedded demos show how SyncAI voice and chat agents handle real conversations.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <div className="rounded-[2rem] border border-white/10 bg-white/[.07] p-6 backdrop-blur-xl">
              <span className="flex size-12 items-center justify-center rounded-2xl border border-[#9400D3]/20 bg-[#4B0082]/15 text-[#D9A0FF]">
                <MessageSquareText className="size-6" />
              </span>
              <h3 className="mt-5 text-xl font-black">Live Chat Agent</h3>
              <p className="mt-3 leading-7 text-slate-300">
                AI chatbot that answers FAQs, qualifies visitors, and captures leads in real time.
              </p>
              <div className="mt-6 h-[400px] rounded-xl border border-white/10 bg-[#0f0f1a]/80 p-4">
                <div className="flex h-full items-center justify-center text-center">
                  <div>
                    <Bot className="mx-auto size-10 text-[#9400D3]" />
                    <p className="mt-4 text-sm text-slate-400">[Chat agent embed code goes here]</p>
                    <p className="mt-2 text-xs text-slate-500">Paste your Botpress / Voiceflow / Tidio embed script</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[.07] p-6 backdrop-blur-xl">
              <span className="flex size-12 items-center justify-center rounded-2xl border border-[#9400D3]/20 bg-[#4B0082]/15 text-[#D9A0FF]">
                <PhoneCall className="size-6" />
              </span>
              <h3 className="mt-5 text-xl font-black">Voice Agent Demo</h3>
              <p className="mt-3 leading-7 text-slate-300">
                AI voice agent that handles after-hours calls, appointment bookings, and follow-ups.
              </p>
              <div className="mt-6 h-[400px] rounded-xl border border-white/10 bg-[#0f0f1a]/80 p-4">
                <div className="flex h-full items-center justify-center text-center">
                  <div>
                    <Headphones className="mx-auto size-10 text-[#9400D3]" />
                    <p className="mt-4 text-sm text-slate-400">[Voice agent embed code goes here]</p>
                    <p className="mt-2 text-xs text-slate-500">Paste your Vapi / Bland AI / Retell embed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="bg-[#f8f9fc] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-black tracking-tight text-[#161616] sm:text-5xl">
              Common use cases
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Missed-Call Recovery",
                description: "AI answers every after-hours call, qualifies the lead, and books the appointment — no human needed.",
                metric: "60% of missed calls recovered",
              },
              {
                title: "Website Chat Support",
                description: "24/7 live chat that answers questions, captures contact info, and routes hot leads to your team.",
                metric: "3x faster response times",
              },
              {
                title: "Follow-Up Automation",
                description: "AI sends personalized follow-up messages, reminders, and re-engagement sequences automatically.",
                metric: "40% increase in conversion",
              },
            ].map((use) => (
              <div key={use.title} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-black text-[#161616]">{use.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{use.description}</p>
                <p className="mt-4 text-sm font-bold text-[#4B0082]">{use.metric}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0f0f1a] py-20 text-center text-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black sm:text-5xl">Ready to deploy your AI agent?</h2>
          <p className="mt-5 text-lg text-slate-300">Let&apos;s build a voice or chat agent that works for your business 24/7.</p>
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
