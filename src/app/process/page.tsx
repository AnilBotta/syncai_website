import { PageShell } from "@/components/page-shell";
import { process } from "@/lib/site-data";

export default function ProcessPage() {
  return (
    <PageShell
      eyebrow="Process"
      title="A consulting process built around business outcomes."
      description="The goal is to avoid random AI experiments. Every engagement starts by understanding the business, then ships a focused AI solution."
    >
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {process.map((item) => (
            <article key={item.step} className="rounded-[2rem] border border-slate-200 p-6 shadow-sm">
              <p className="text-sm font-black text-purple-700">{item.step}</p>
              <h2 className="mt-4 text-xl font-black text-slate-950">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
