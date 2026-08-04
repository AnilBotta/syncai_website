import { Reveal } from "@/components/motion/reveal";
import { SectionLabel } from "./section-label";

/**
 * "What we treat" as a dense chip grid.
 *
 * A clinic's credibility comes partly from the specificity of this list — a
 * visitor scans it for their own complaint. Prose would bury that, so it is set
 * as a wrapped run of chips a reader can sweep in a couple of seconds.
 */
export function ConditionChips({
  index,
  label,
  heading,
  body,
  items,
}: {
  index: number;
  label: string;
  heading: string;
  body: string;
  items: string[];
}) {
  return (
    <section id="conditions" className="border-y border-border-subtle bg-bg-deep py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Pinned so the heading travels with the chip list rather than
              leaving a tall empty column behind it. */}
          <div className="lg:col-span-4 lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <SectionLabel index={index}>{label}</SectionLabel>
              <h2 className="mt-6 max-w-sm">{heading}</h2>
              <p className="mt-5 max-w-sm leading-8 text-muted">{body}</p>
            </Reveal>
          </div>
          <div className="lg:col-span-8">
            <Reveal>
              <ul className="flex flex-wrap gap-2.5">
                {items.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-border-subtle bg-surface px-4 py-2 text-sm text-foreground transition hover:border-brand/40 hover:text-brand-glow-text"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
