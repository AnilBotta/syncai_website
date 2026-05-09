import { DemoAnalyzer } from "@/components/demo-analyzer";
import { PageShell } from "@/components/page-shell";
import { demoCards } from "@/lib/site-data";

export default function DemosPage() {
  return (
    <PageShell
      eyebrow="Demos"
      title="Real AI demos that educate prospects and capture leads."
      description="The public site includes AI-powered experiences that show business value before the consultation call."
    >
      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          {demoCards.map((demo) => (
            <article key={demo.title} className="rounded-[2rem] border border-slate-200 p-6 shadow-sm">
              <demo.icon className="size-8 text-purple-700" />
              <h2 className="mt-5 text-xl font-black text-slate-950">{demo.title}</h2>
              <p className="mt-3 leading-7 text-slate-600">{demo.description}</p>
            </article>
          ))}
        </div>
      </section>
      <DemoAnalyzer />
    </PageShell>
  );
}
