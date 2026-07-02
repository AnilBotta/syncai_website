import Image from "next/image";
import { LeadForm } from "@/components/lead-form";
import { MousePointerClick, PhoneCall } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

export function CtaSection() {
  return (
    <section id="contact" className="relative overflow-hidden bg-[#0f0f1a] py-20 text-white sm:py-28">
      <Image
        src="/brand/syncai-lead-handoff-visual.png"
        alt=""
        width={1792}
        height={1024}
        className="absolute inset-0 h-full w-full object-cover object-center opacity-10"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(75,0,130,.15),transparent_60%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
        <Reveal>
          <p className="text-sm font-black uppercase tracking-[.25em] text-[#9400D3]">Get started</p>
          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
            Ready to transform your business with AI?
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            Tell us where the business is losing time, leads, or follow-up quality. The first conversation
            is about finding the right AI use case, not forcing a tool.
          </p>
          <div className="mt-8 grid gap-4 text-sm text-slate-300">
            <div className="flex gap-3">
              <MousePointerClick className="size-5 text-[#9400D3]" />
              Leads are stored in the private admin dashboard.
            </div>
            <div className="flex gap-3">
              <PhoneCall className="size-5 text-[#9400D3]" />
              SyncAI can follow up using the contact details you provide.
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.12} className="rounded-[2rem] bg-white p-6 text-[#161616]">
          <LeadForm source="homepage" />
        </Reveal>
      </div>
    </section>
  );
}
