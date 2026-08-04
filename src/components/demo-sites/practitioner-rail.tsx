import { Reveal } from "@/components/motion/reveal";
import { SectionLabel } from "./section-label";
import { DemoImage } from "./demo-image";
import type { DemoSite } from "@/lib/demo-sites";

/**
 * Named practitioners as a horizontal rail.
 *
 * Scroll-snaps on narrow screens and settles into a three-up grid on desktop, so
 * it reads as a deliberate rail rather than a grid that happens to overflow. The
 * people are invented, like the rest of the clinic.
 */
export function PractitionerRail({
  index,
  practitioners,
}: {
  index: number;
  practitioners: NonNullable<DemoSite["practitioners"]>;
}) {
  return (
    <section id="team" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <Reveal>
        <SectionLabel index={index}>{practitioners.label}</SectionLabel>
        <h2 className="mt-6 max-w-lg">{practitioners.heading}</h2>
      </Reveal>

      <div className="mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0">
        {practitioners.items.map((person, i) => (
          <Reveal
            key={person.name}
            delay={i * 0.08}
            className="w-[78vw] shrink-0 snap-start sm:w-[20rem] lg:w-auto"
          >
            <article className="group h-full overflow-hidden rounded-[1.5rem] border border-border-subtle bg-surface">
              <DemoImage
                src={person.image.src}
                alt={person.image.alt}
                aspect="aspect-[4/5]"
                sizes="(min-width: 1024px) 33vw, 78vw"
              />
              <div className="p-6">
                <h3 className="text-xl">{person.name}</h3>
                <p className="demo-label mt-2 text-brand-glow-text">{person.role}</p>
                <p className="mt-4 leading-7 text-muted">{person.focus}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
