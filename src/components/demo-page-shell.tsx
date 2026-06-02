import { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type DemoPageShellProps = {
  title: string;
  tagline: string;
  description: string;
  children: ReactNode;
};

export function DemoPageShell({ title, tagline, description, children }: DemoPageShellProps) {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden bg-[#0f0f1a] px-4 pt-28 pb-20 text-white sm:px-6 sm:py-32 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(75,0,130,0.32),transparent_34%),linear-gradient(115deg,#0f0f1a_0%,#1a0033_46%,#0f0f1a_100%)]" />
          <div className="relative mx-auto max-w-5xl">
            <Link
              href="/demos"
              className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#D9A0FF] transition hover:text-[#9400D3]"
            >
              <ArrowLeft className="size-4" />
              Back to Demos
            </Link>
            <p className="text-sm font-black uppercase tracking-[.25em] text-[#9400D3]">{tagline}</p>
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
