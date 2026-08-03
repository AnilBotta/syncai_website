import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

/**
 * Fixed bar on every demo site. Two jobs, both essential:
 *
 * 1. Conversion — a visitor deep in a fake clinic needs one always-visible route
 *    back to SyncAI, or they just close the tab.
 * 2. Honesty — these sites are convincing enough to be mistaken for a real
 *    business. This states plainly that it isn't one. Do not remove it.
 */
export function DemoSiteBar({ business }: { business: string }) {
  return (
    <div className="theme-dark fixed inset-x-0 bottom-0 z-50 border-t border-border-subtle bg-bg-deep/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <p className="flex items-center gap-2 text-sm leading-6 text-foreground">
          <Sparkles className="size-4 shrink-0 text-brand-soft" />
          <span>
            <span className="font-bold">{business}</span>{" "}
            <span className="text-muted">
              is a demo site built by SyncAI — the business is fictional.
            </span>
          </span>
        </p>
        <Link
          href="/contact"
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-brand-electric to-brand-soft px-5 text-sm font-bold text-white transition hover:opacity-90"
        >
          Get one for your business
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
