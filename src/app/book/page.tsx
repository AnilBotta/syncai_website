import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { BookingWidget } from "@/components/booking-widget";
import { contact } from "@/lib/site-data";
import { CalendarCheck, Clock, PhoneCall } from "lucide-react";

export const metadata: Metadata = {
  title: "Book a Strategy Call",
  description:
    "Book a free 30-minute AI strategy call with SyncAI Technologies. Pick a time that works and we'll map your best AI opportunities.",
};

const expectations = [
  {
    title: "30 focused minutes",
    description: "We review your business, your bottleneck, and where AI can realistically help first.",
    icon: Clock,
  },
  {
    title: "A practical next step",
    description: "You leave with a clear recommendation — even if the answer is 'not yet'.",
    icon: CalendarCheck,
  },
  {
    title: "No pressure, no jargon",
    description: "A plain-language conversation about your operations, not a sales pitch.",
    icon: PhoneCall,
  },
];

export default function BookPage() {
  return (
    <PageShell
      eyebrow="Book a call"
      title="Book your free AI strategy call"
      description="Pick a day and time that works for you. Calls run on Eastern Time from Brampton, Ontario."
    >
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:px-8">
          <div className="grid content-start gap-6">
            {expectations.map((item) => (
              <div key={item.title} className="flex gap-4 rounded-[1.5rem] border border-slate-200 p-5">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#4B0082]/10 text-[#4B0082]">
                  <item.icon className="size-6" />
                </span>
                <div>
                  <h2 className="text-lg font-black text-[#161616]">{item.title}</h2>
                  <p className="mt-1 leading-7 text-slate-600">{item.description}</p>
                </div>
              </div>
            ))}
            <p className="text-sm leading-6 text-slate-500">
              Prefer to talk first? Call {contact.phonePrimary} or email {contact.email}.
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <BookingWidget />
          </div>
        </div>
      </section>
    </PageShell>
  );
}
