import { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

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
      <main id="main" className="bg-bg-base text-foreground">
        <section className="relative overflow-hidden bg-bg-deep px-4 pt-28 pb-20 sm:px-6 sm:py-32 lg:px-8">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(148,0,211,0.2),transparent_40%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 [background-image:radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:32px_32px]"
          />
          <Reveal className="relative mx-auto max-w-5xl">
            <Link
              href="/demos"
              className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-glow-text transition hover:text-brand-soft"
            >
              <ArrowLeft className="size-4" />
              Back to Demos
            </Link>
            <p className="text-sm font-black uppercase tracking-[.25em] text-brand-soft">{tagline}</p>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-foreground sm:text-6xl">{title}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">{description}</p>
          </Reveal>
        </section>
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
