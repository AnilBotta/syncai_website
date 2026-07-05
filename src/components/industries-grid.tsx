import Link from "next/link";
import { HeartPulse, Home, Store, Building2, GraduationCap, Truck, Scale, Stethoscope } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { SectionShell } from "@/components/ui/section-shell";
import { SectionHeading } from "@/components/ui/section-heading";

const industries = [
  { name: "Healthcare & Clinics", icon: HeartPulse, href: "/industries" },
  { name: "Real Estate", icon: Home, href: "/industries" },
  { name: "E-commerce & Retail", icon: Store, href: "/industries" },
  { name: "Financial Services", icon: Building2, href: "/industries" },
  { name: "Education", icon: GraduationCap, href: "/industries" },
  { name: "Logistics & Supply Chain", icon: Truck, href: "/industries" },
  { name: "Legal & Professional", icon: Scale, href: "/industries" },
  { name: "Small Business", icon: Stethoscope, href: "/industries" },
];

export function IndustriesGrid() {
  return (
    <SectionShell tier="elevated" glow="right">
      <SectionHeading
        eyebrow="Industries"
        title="AI solutions for every industry"
        description="Tailored AI systems that understand your industry workflows, compliance needs, and growth goals."
      />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {industries.map((industry, index) => (
          <Reveal key={industry.name} delay={(index % 4) * 0.06}>
            <TiltCard className="h-full rounded-[16px]">
              <Link
                href={industry.href}
                className="group flex h-full items-center gap-4 rounded-[16px] border border-border-subtle bg-surface p-5 backdrop-blur-md transition hover:border-brand-soft/40"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-brand/25 bg-brand/10 text-brand">
                  <industry.icon className="size-5" />
                </span>
                <span className="text-sm font-bold text-foreground transition group-hover:text-brand-glow-text">
                  {industry.name}
                </span>
              </Link>
            </TiltCard>
          </Reveal>
        ))}
      </div>
      <div className="mt-10 text-center">
        <p className="text-sm text-muted">
          Not sure where AI fits?{" "}
          <Link href="/contact" className="font-bold text-brand-glow-text underline transition hover:text-brand">
            Let&apos;s talk.
          </Link>
        </p>
      </div>
    </SectionShell>
  );
}
