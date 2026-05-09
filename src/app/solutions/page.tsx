import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { services } from "@/lib/site-data";

export default function SolutionsPage() {
  return (
    <PageShell
      eyebrow="Solutions"
      title="AI consulting that turns into implemented systems."
      description="SyncAi Technologies starts with strategy, then builds the AI website, agent, automation, or workflow that best addresses the business challenge."
    >
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
          {services.map((service) => (
            <article key={service.title} className="rounded-[2rem] border border-slate-200 p-7 shadow-sm">
              <service.icon className="size-8 text-purple-700" />
              <h2 className="mt-5 text-2xl font-black text-slate-950">{service.title}</h2>
              <p className="mt-3 leading-7 text-slate-600">{service.description}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="bg-[#f7fbfb] py-20">
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-5 px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
            Not sure what to build first?
          </h2>
          <p className="max-w-3xl text-lg leading-8 text-slate-600">
            That is exactly where the strategy call helps. We identify where AI can create the most leverage
            before choosing the technology.
          </p>
          <Link href="/contact" className="inline-flex h-[52px] items-center gap-2 rounded-full bg-slate-950 px-6 text-sm font-black text-white">
            Request AI strategy call
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
