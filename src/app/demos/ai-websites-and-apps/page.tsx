import type { Metadata } from "next";
import { DemoPageShell } from "@/components/demo-page-shell";
import { ExternalLink, MonitorSmartphone, Zap, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Websites & Apps",
  description: "Modern AI-powered websites with lead capture, qualification, booking flows, and customer education built in.",
};

export default function AiWebsitesPage() {
  return (
    <DemoPageShell
      title="AI Websites & Apps"
      tagline="Demo"
      description="Modern sites with AI-assisted lead capture, qualification, booking flows, and customer education built in."
    >
      {/* Live site links */}
      <section className="bg-[#f8f9fc] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-black tracking-tight text-[#161616] sm:text-5xl">
              See it in action
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Click the links below to explore live AI-powered websites built by SyncAI.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {[
              {
                name: "Dental Clinic Demo",
                url: "#",
                description: "AI website with lead qualification agent, booking flows, and automated patient intake.",
                features: ["24/7 lead capture", "Smart booking", "Patient FAQ agent"],
              },
              {
                name: "Real Estate Demo",
                url: "#",
                description: "Property inquiry system with AI routing, after-hours response, and follow-up automation.",
                features: ["Instant lead routing", "After-hours capture", "Follow-up sequences"],
              },
              {
                name: "Physiotherapy Demo",
                url: "#",
                description: "Patient intake automation with AI forms, calendar sync, and admin dashboard.",
                features: ["Digital intake", "Calendar integration", "Admin dashboard"],
              },
              {
                name: "Service Business Demo",
                url: "#",
                description: "Full-service AI website with chat, booking, and automated client communication.",
                features: ["Live chat agent", "Auto-booking", "Client portal"],
              },
            ].map((site) => (
              <a
                key={site.name}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#4B0082]/20 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-black text-[#161616]">{site.name}</h3>
                    <p className="mt-3 leading-7 text-slate-600">{site.description}</p>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {site.features.map((f) => (
                        <li key={f} className="rounded-full bg-[#4B0082]/10 px-3 py-1 text-xs font-bold text-[#4B0082]">
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <ExternalLink className="mt-1 size-5 shrink-0 text-slate-300 transition group-hover:text-[#4B0082]" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-black tracking-tight text-[#161616] sm:text-5xl">
              What&apos;s included
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: MonitorSmartphone,
                title: "Modern Design",
                description: "Responsive, fast, and built for conversion with your brand at the center.",
              },
              {
                icon: Zap,
                title: "AI Lead Capture",
                description: "Smart forms and chat agents that qualify visitors and capture every lead.",
              },
              {
                icon: Users,
                title: "Admin Dashboard",
                description: "Private dashboard to review, manage, and follow up with every lead.",
              },
            ].map((feat) => (
              <div key={feat.title} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-[#4B0082]/10 text-[#4B0082]">
                  <feat.icon className="size-6" />
                </span>
                <h3 className="mt-5 text-xl font-black text-[#161616]">{feat.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0f0f1a] py-20 text-center text-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black sm:text-5xl">Want a website like these?</h2>
          <p className="mt-5 text-lg text-slate-300">Let&apos;s build your AI-powered website that captures leads around the clock.</p>
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
