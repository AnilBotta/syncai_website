import type { Metadata } from "next";
import { DemoPageShell } from "@/components/demo-page-shell";
import { ExternalLink, MonitorSmartphone, Zap, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Websites & Apps",
  description: "Modern AI-powered websites with lead capture, qualification, booking flows, and customer education built in.",
};

/** `url: null` renders as a non-clickable "Soon" card until the demo is built. */
const demoSites: {
  name: string;
  url: string | null;
  description: string;
  features: string[];
}[] = [
  {
    name: "Dental Clinic Demo",
    url: "/demos/live/dental",
    description:
      "Northgate Dental Studio — a full clinic site with an AI receptionist that answers questions and books appointments.",
    features: ["24/7 lead capture", "Smart booking", "Patient FAQ agent"],
  },
  {
    name: "Real Estate Demo",
    url: null,
    description: "Property inquiry system with AI routing, after-hours response, and follow-up automation.",
    features: ["Instant lead routing", "After-hours capture", "Follow-up sequences"],
  },
  {
    name: "Physiotherapy Demo",
    url: null,
    description: "Patient intake automation with AI forms, calendar sync, and admin dashboard.",
    features: ["Digital intake", "Calendar integration", "Admin dashboard"],
  },
  {
    name: "Service Business Demo",
    url: null,
    description: "Full-service AI website with chat, booking, and automated client communication.",
    features: ["Live chat agent", "Auto-booking", "Client portal"],
  },
];

export default function AiWebsitesPage() {
  return (
    <DemoPageShell
      title="AI Websites & Apps"
      tagline="Demo"
      description="Modern sites with AI-assisted lead capture, qualification, booking flows, and customer education built in."
    >
      {/* Live site links */}
      <section className="bg-bg-base py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-5xl">
              See it in action
            </h2>
            <p className="mt-5 text-lg leading-8 text-muted">
              Real working sites for invented businesses. Talk to the AI receptionist, ask it
              anything, book yourself in — it all runs live.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {demoSites.map((site) => {
              const body = (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-foreground">{site.name}</h3>
                    <p className="mt-3 leading-7 text-muted">{site.description}</p>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {site.features.map((f) => (
                        <li key={f} className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand-glow-text">
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {site.url ? (
                    <ExternalLink className="mt-1 size-5 shrink-0 text-muted transition group-hover:text-brand-glow-text" />
                  ) : (
                    <span className="mt-1 shrink-0 rounded-full border border-border-subtle px-3 py-1 text-xs font-bold text-muted">
                      Soon
                    </span>
                  )}
                </div>
              );

              // Only the built ones are links. A card that looks clickable and
              // goes nowhere is worse than one that says it isn't ready.
              return site.url ? (
                <Link
                  key={site.name}
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-[2rem] border border-border-subtle bg-surface backdrop-blur-md p-6 shadow-sm transition hover:border-brand-soft/40 hover:shadow-md"
                >
                  {body}
                </Link>
              ) : (
                <div
                  key={site.name}
                  className="rounded-[2rem] border border-border-subtle bg-surface/60 p-6 opacity-70 backdrop-blur-md"
                >
                  {body}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-bg-elevated py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-5xl">
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
              <div key={feat.title} className="rounded-[2rem] border border-border-subtle bg-surface backdrop-blur-md p-6 shadow-sm">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                  <feat.icon className="size-6" />
                </span>
                <h3 className="mt-5 text-xl font-black text-foreground">{feat.title}</h3>
                <p className="mt-3 leading-7 text-muted">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-bg-deep py-20 text-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-foreground sm:text-5xl">
            Want a website like these?
          </h2>
          <p className="mt-5 text-lg text-muted">Let&apos;s build your AI-powered website that captures leads around the clock.</p>
          <Link
            href="/contact"
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-brand-electric to-brand-soft px-6 text-sm font-bold text-white shadow-[0_6px_20px_rgba(125,60,152,0.25)]"
          >
            Book a Strategy Call <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </DemoPageShell>
  );
}
