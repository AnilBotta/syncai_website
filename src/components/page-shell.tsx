import { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

type PageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  /** Override the hero title size — for titles long enough to wrap past two lines. */
  titleClassName?: string;
  children: ReactNode;
};

export function PageShell({ eyebrow, title, description, titleClassName, children }: PageShellProps) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="bg-bg-base text-foreground">
        <section className="relative overflow-hidden bg-bg-deep px-4 pt-28 pb-20 sm:px-6 sm:py-32 lg:px-8">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,var(--accent-glow),transparent_45%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 [background-image:radial-gradient(rgba(0,0,0,0.04)_1px,transparent_1px)] [background-size:32px_32px]"
          />
          <Reveal className="relative mx-auto max-w-5xl">
            <p className="text-sm font-black uppercase tracking-[.25em] text-brand">{eyebrow}</p>
            <h1
              className={cn(
                "mt-5 text-balance text-4xl font-black tracking-tight text-foreground sm:text-6xl",
                titleClassName,
              )}
            >
              {title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">{description}</p>
          </Reveal>
        </section>
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
