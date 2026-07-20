import type { ReactNode } from "react";
import { PageShell } from "@/components/page-shell";

/** Shared shell + prose styling for the legal pages (privacy, terms, etc.). */
export function LegalLayout({
  title,
  description,
  updated,
  children,
}: {
  title: string;
  description: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <PageShell eyebrow="Legal" title={title} description={description}>
      <section className="bg-bg-base py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-muted">Last updated: {updated}</p>
          <div className="mt-10 space-y-10">{children}</div>
        </div>
      </section>
    </PageShell>
  );
}

export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">{heading}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export function LegalP({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-7 text-muted sm:text-base">{children}</p>;
}

export function LegalList({ children }: { children: ReactNode }) {
  return <ul className="ml-5 list-disc space-y-2 text-sm leading-7 text-muted sm:text-base">{children}</ul>;
}
