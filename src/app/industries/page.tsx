import { PageShell } from "@/components/page-shell";
import { industries } from "@/lib/site-data";

export default function IndustriesPage() {
  return (
    <PageShell
      eyebrow="Industries"
      title="AI systems for clinics, real estate, and small businesses."
      description="SyncAi Technologies can serve many business types, while the first version focuses on industries where lead speed, intake quality, and follow-up matter immediately."
    >
      <section className="bg-[#f7fbfb] py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:px-8">
          {industries.map((industry) => (
            <article key={industry.title} className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex flex-col gap-5 md:flex-row md:items-start">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-purple-50 text-purple-700">
                  <industry.icon className="size-7" />
                </span>
                <div>
                  <h2 className="text-2xl font-black text-slate-950">{industry.title}</h2>
                  <p className="mt-3 max-w-3xl leading-7 text-slate-600">{industry.description}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {industry.outcomes.map((outcome) => (
                      <span key={outcome} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                        {outcome}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
