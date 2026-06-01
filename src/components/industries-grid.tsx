import Link from "next/link";
import { HeartPulse, Home, Store, Building2, GraduationCap, Truck, Scale, Stethoscope } from "lucide-react";

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
    <section className="bg-[#f8f9fc] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-black uppercase tracking-[.25em] text-[#4B0082]">Industries</p>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-[#161616] sm:text-5xl">
            AI solutions for every industry
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Tailored AI systems that understand your industry workflows, compliance needs, and growth goals.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {industries.map((industry) => (
            <Link
              key={industry.name}
              href={industry.href}
              className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#4B0082]/20 hover:shadow-md"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#4B0082]/10 text-[#4B0082]">
                <industry.icon className="size-5" />
              </span>
              <span className="text-sm font-bold text-[#161616] group-hover:text-[#4B0082]">{industry.name}</span>
            </Link>
          ))}
        </div>
        <div className="mt-10 text-center">
          <p className="text-sm text-slate-500">
            Not sure where AI fits? <Link href="/contact" className="font-bold text-[#4B0082] underline">Let&apos;s talk.</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
