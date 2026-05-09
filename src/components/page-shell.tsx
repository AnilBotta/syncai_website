import { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

type PageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function PageShell({ eyebrow, title, description, children }: PageShellProps) {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-slate-950 px-4 py-20 text-white sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <p className="text-sm font-black uppercase tracking-[.25em] text-purple-200">{eyebrow}</p>
            <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl">{title}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">{description}</p>
          </div>
        </section>
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
