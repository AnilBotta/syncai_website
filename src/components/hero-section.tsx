import Link from "next/link";
import { ArrowRight, Sparkles, Headphones, Bot, Globe, MessageSquareText, PhoneCall } from "lucide-react";
import { HeroCanvas } from "@/components/three/hero-canvas";

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#131313] text-white">
      <div className="pointer-events-none absolute inset-0 hero-bg-pattern" />
      <style>{`.hero-bg-pattern { background-image: radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 32px 32px; }`}</style>

      {/* Ambient light orbs */}
      <div className="pointer-events-none absolute -top-20 -left-20 size-[600px] rounded-full bg-[radial-gradient(circle,rgba(160,120,255,0.15)_0%,rgba(19,19,19,0)_70%)] blur-[60px]" />
      <div className="pointer-events-none absolute top-1/2 -right-40 size-[600px] rounded-full bg-[radial-gradient(circle,rgba(96,1,209,0.15)_0%,rgba(19,19,19,0)_70%)] blur-[60px]" />

      <div className="relative mx-auto grid min-h-screen max-w-7xl gap-12 px-5 pt-32 pb-14 sm:px-8 lg:grid-cols-2 lg:items-center lg:px-12 xl:py-32">
        {/* Left column */}
        <div className="flex flex-col gap-8">
          {/* Trust chips */}
          <div className="flex flex-wrap gap-3">
            {[
              { icon: null, label: "Canada-Based", dot: true },
              { icon: "briefcase", label: "Built for SMBs" },
              { icon: "code", label: "Custom AI Systems" },
            ].map((chip) => (
              <div
                key={chip.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#131313]/60 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#cbc3d7] backdrop-blur-md"
              >
                {chip.dot && <span className="size-2 animate-pulse rounded-full bg-[#d0bcff]" />}
                {chip.label}
              </div>
            ))}
          </div>

          {/* Headlines */}
          <div className="flex flex-col gap-4">
            <h1 className="text-[clamp(2rem,5vw,4.5rem)] font-bold leading-[1.1] tracking-tighter text-white">
              AI Systems That Turn Business Chaos Into{" "}
              <span className="bg-gradient-to-r from-[#e5e2e1] to-[#d0bcff] bg-clip-text text-transparent">
                Growth
              </span>
            </h1>
            <p className="text-xl font-semibold text-[#d0bcff]">
              Automate. Capture Leads. Grow Faster.
            </p>
            <p className="max-w-[600px] text-lg leading-relaxed text-[#cbc3d7]">
              SyncAI designs and implements custom AI websites, voice agents, chatbots, and workflow
              automations that help businesses save time, respond faster, and generate more revenue.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-4 pt-4 sm:flex-row">
            <Link
              href="/book"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#6001d1] to-[#a078ff] px-8 py-4 text-sm font-semibold text-white shadow-[0_0_20px_rgba(160,120,255,0)] transition-all hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(160,120,255,0.4)]"
            >
              Book a Strategy Call
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/demos"
              className="glass-panel-hover inline-flex items-center justify-center gap-2 rounded-full border border-[#494454] bg-[#131313]/60 px-8 py-4 text-sm font-semibold text-white backdrop-blur-md transition-all hover:text-[#d0bcff]"
            >
              <Sparkles className="size-4" />
              Explore AI Solutions
            </Link>
          </div>
        </div>

        {/* Right column: image container */}
        <div className="group relative aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-[#131313]/40 p-2 backdrop-blur-md md:aspect-[4/3] lg:aspect-square">
          {/* Hover glow ring */}
          <div className="pointer-events-none absolute inset-0 z-10 rounded-2xl border border-[#d0bcff]/20 transition-colors duration-500 group-hover:border-[#d0bcff]/40" />

          <div className="relative h-full w-full overflow-hidden rounded-xl bg-[#0e0e0e]">
            <HeroCanvas />
          </div>

          {/* Floating UI cards */}
          <div className="absolute left-3 top-6 animate-[bounce_4s_infinite] rounded-lg border border-white/10 bg-[#131313]/60 px-4 py-2 backdrop-blur-md sm:left-4 sm:top-8">
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-full bg-[#d0bcff]/20">
                <Headphones className="size-4 text-[#d0bcff]" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#cbc3d7]">Voice Agent Active</p>
                <p className="text-sm text-white">Processing...</p>
              </div>
            </div>
          </div>

          <div className="absolute bottom-10 right-3 animate-[bounce_5s_infinite_reverse] rounded-lg border border-white/10 bg-[#131313]/60 px-4 py-2 backdrop-blur-md sm:bottom-12 sm:right-4">
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-full bg-[#4cd7f6]/20">
                <MessageSquareText className="size-4 text-[#4cd7f6]" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#cbc3d7]">Lead Capture</p>
                <p className="text-sm text-[#4cd7f6]">+34% Efficiency</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="relative z-10 mx-auto -mt-10 max-w-7xl px-5 pb-20 sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 gap-6 rounded-2xl border border-white/10 bg-[#131313]/60 p-6 backdrop-blur-md md:grid-cols-4 md:p-8">
          {[
            { icon: PhoneCall, value: "24/7", label: "Customer Response", color: "#d0bcff" },
            { icon: Bot, value: "100%", label: "Automated Lead Capture", color: "#d2bbff" },
            { icon: Globe, value: "3x", label: "Faster Follow-Ups", color: "#4cd7f6" },
            { icon: ArrowRight, value: "-80%", label: "Lower Manual Work", color: "#ffb4ab" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-2 text-center">
              <span
                className="flex size-10 items-center justify-center rounded-full bg-[#201f1f] transition-colors hover:bg-[#d0bcff]/10"
                style={{ color: stat.color }}
              >
                <stat.icon className="size-5" />
              </span>
              <p className="text-3xl font-semibold tracking-tight text-white">{stat.value}</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#cbc3d7]">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
