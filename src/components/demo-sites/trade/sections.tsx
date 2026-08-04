import { ArrowRight, ChevronDown, MapPin, Phone, Quote } from "lucide-react";
import type { DemoSite } from "@/lib/demo-sites";
import { tradeContent } from "@/lib/demo-sites/trade";
import { DemoImage } from "@/components/demo-sites/demo-image";
import { DemoAssistant } from "@/components/demo-sites/demo-assistant";
import { AmberButton, ServiceIcon, StarRating, Tick } from "./bits";

/**
 * The bespoke trade sections.
 *
 * None of the shared vocabulary appears here: no numbered micro-labels, no
 * parallax gallery, no editorial services list, no pull-quote. What replaces
 * it is what local trade sites actually run — credentials above the fold, a
 * quote form second on the page, star reviews with names and towns, a dense
 * "areas we cover" list, and very little whitespace.
 */

/**
 * Photograph with a solid charcoal card sitting on it. Real trade sites put a
 * box over the photo rather than typesetting into it, because the photo is
 * usually somebody else's stock image and the copy has to survive it.
 */
export function TradeHero({ site }: { site: DemoSite }) {
  return (
    <section className="relative isolate">
      <div className="absolute inset-0">
        <DemoImage src={site.images.hero.src} alt={site.images.hero.alt} fill sizes="100vw" priority />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(95deg,rgba(22,24,29,0.94)_0%,rgba(22,24,29,0.86)_34%,rgba(22,24,29,0.35)_62%,rgba(22,24,29,0.15)_100%)]"
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <div className="h-1.5 w-24 bg-[color:var(--trade-amber)]" />
          <p className="mt-6 flex items-center gap-2 text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-[color:var(--trade-amber)]">
            <MapPin className="size-3.5" aria-hidden />
            {site.hero.eyebrow}
          </p>
          <h1 className="mt-4 text-white">{site.hero.heading}</h1>
          <p className="mt-6 text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
            {site.hero.body}
          </p>

          <ul className="mt-8 space-y-3">
            {tradeContent.heroTicks.map((tick) => (
              <Tick key={tick} light>
                {tick}
              </Tick>
            ))}
          </ul>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={`tel:${site.phone.replace(/[^\d+]/g, "")}`}
              className="inline-flex h-14 items-center justify-center gap-3 bg-[color:var(--trade-amber)] px-7 text-[color:var(--trade-ink)] transition hover:bg-[color:var(--trade-amber-hot)]"
            >
              <Phone className="size-5" aria-hidden />
              <span className="font-serif text-2xl leading-none tracking-tight">{site.phone}</span>
            </a>
            <a
              href="#quote"
              className="inline-flex h-14 items-center justify-center gap-2 border-2 border-white/35 px-7 text-sm font-bold uppercase tracking-[0.08em] text-white transition hover:border-white hover:bg-white hover:text-[color:var(--trade-ink)]"
            >
              {site.hero.cta}
              <ArrowRight className="size-4" aria-hidden />
            </a>
          </div>
        </div>
      </div>

      {/* Credential row, still above the fold on a laptop. The visitor's real
          first question is whether we are legitimate. */}
      <div className="relative border-y-2 border-[color:var(--trade-ink)] bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x-2 divide-[color:var(--trade-ink)]/10 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          {tradeContent.badges.map((badge) => (
            <p
              key={badge}
              className="px-4 py-4 text-center text-[0.6875rem] font-bold uppercase leading-4 tracking-[0.12em] text-[color:var(--trade-ink)]"
            >
              {badge}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * The AI agent, styled as the quote form a trade site would normally have here.
 *
 * Second on the page on purpose. Editorial sites earn the booking at the
 * bottom; a plumbing site that makes you scroll past an About section to ask
 * for a price has already lost the job.
 */
export function QuoteWidget({ site }: { site: DemoSite }) {
  return (
    <section id="quote" className="scroll-mt-24 bg-[color:var(--trade-ink)] py-14 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-14 lg:px-8">
        <div className="lg:col-span-5">
          <div className="h-1.5 w-16 bg-[color:var(--trade-amber)]" />
          <h2 className="mt-5 text-white">{site.booking.heading}</h2>
          <p className="mt-4 text-base leading-7 text-white/70">{site.booking.body}</p>

          <ol className="mt-9 space-y-6">
            {[
              ["Tell us what's wrong", "A sentence is enough. No twelve-field form."],
              ["We take your details", "Name, email, and the town you're in."],
              ["We come back with a time", "The diary is live — you can pick a slot now."],
            ].map(([title, body], index) => (
              <li key={title} className="flex gap-4">
                <span className="grid size-8 shrink-0 place-items-center bg-[color:var(--trade-amber)] font-serif text-lg leading-none text-[color:var(--trade-ink)]">
                  {index + 1}
                </span>
                <span>
                  <span className="block font-serif text-lg uppercase leading-tight tracking-tight text-white">
                    {title}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-white/60">{body}</span>
                </span>
              </li>
            ))}
          </ol>

          <p className="mt-10 border-t border-white/15 pt-6 text-sm leading-6 text-white/60">
            Would rather talk to a person?{" "}
            <a
              href={`tel:${site.phone.replace(/[^\d+]/g, "")}`}
              className="font-bold text-[color:var(--trade-amber)] hover:underline"
            >
              {site.phone}
            </a>{" "}
            — answered 24/7.
          </p>
        </div>

        <div className="lg:col-span-7">
          <div className="border-4 border-[color:var(--trade-amber)] bg-white">
            <div className="flex items-center justify-between gap-3 bg-[color:var(--trade-amber)] px-5 py-3">
              <p className="font-serif text-lg uppercase leading-none tracking-tight text-[color:var(--trade-ink)]">
                Quote &amp; booking desk
              </p>
              <p className="flex items-center gap-2 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-[color:var(--trade-ink)]/75">
                <span className="size-1.5 rounded-full bg-[color:var(--trade-ink)]" />
                {site.booking.assistantLabel} · online
              </p>
            </div>
            <DemoAssistant
              slug={site.slug}
              business={site.business}
              welcome={site.booking.welcome}
              starters={site.booking.starters}
              assistantLabel={site.booking.assistantLabel}
              voice={site.voice}
              bare
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Six icon cards. A grid, not an editorial list — you scan it, you don't read it. */
export function ServiceGrid({ site }: { site: DemoSite }) {
  return (
    <section id="services" className="scroll-mt-24 py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2>{site.servicesHeading}</h2>
            <p className="mt-3 max-w-xl text-base leading-7 text-muted">
              Six things we do every week. Everything is quoted before it starts.
            </p>
          </div>
          <AmberButton href="#quote">Get a price</AmberButton>
        </div>

        <div className="mt-10 grid gap-px bg-[color:var(--trade-ink)]/15 sm:grid-cols-2 lg:grid-cols-3">
          {tradeContent.services.map((service) => (
            <div
              key={service.title}
              className="group bg-white p-7 transition hover:bg-[color:var(--bg-deep)]"
            >
              <span className="grid size-12 place-items-center bg-[color:var(--trade-ink)] transition group-hover:bg-[color:var(--trade-amber)]">
                <ServiceIcon
                  name={service.icon}
                  className="size-6 text-[color:var(--trade-amber)] transition group-hover:text-[color:var(--trade-ink)]"
                />
              </span>
              <h3 className="mt-5 uppercase text-[color:var(--trade-ink)]">{service.title}</h3>
              <p className="mt-2.5 text-sm leading-6 text-muted">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Why people rebook, beside the team photograph. */
export function WhyUs({ site }: { site: DemoSite }) {
  return (
    <section className="bg-[color:var(--bg-deep)] py-14 lg:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <DemoImage
          src={site.images.team.src}
          alt={site.images.team.alt}
          aspect="aspect-[4/3]"
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="border-4 border-[color:var(--trade-ink)]"
        />
        <div>
          <div className="h-1.5 w-16 bg-[color:var(--trade-amber)]" />
          <h2 className="mt-5">{tradeContent.why.heading}</h2>
          <p className="mt-3 text-base leading-7 text-muted">{tradeContent.why.body}</p>

          <ul className="mt-8 space-y-5">
            {site.proofPoints.map((point) => (
              <li key={point.title} className="border-l-4 border-[color:var(--trade-amber)] pl-5">
                <h3 className="uppercase text-[color:var(--trade-ink)]">{point.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-muted">{point.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** The stores wall, carrying the "no second visit" claim. */
export function WorkshopStrip({ site }: { site: DemoSite }) {
  return (
    <section className="bg-[color:var(--trade-ink)]">
      <div className="mx-auto grid max-w-7xl items-stretch lg:grid-cols-2">
        <div className="relative min-h-[16rem] lg:min-h-[24rem]">
          <DemoImage
            src={site.images.wide?.src}
            alt={site.images.wide?.alt || ""}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </div>
        <div className="flex items-center px-4 py-12 sm:px-6 lg:px-14 lg:py-16">
          <div>
            <h2 className="text-white">{tradeContent.workshop.heading}</h2>
            <p className="mt-4 text-base leading-7 text-white/70">{tradeContent.workshop.body}</p>
            <dl className="mt-9 grid grid-cols-2 gap-x-6 gap-y-7">
              {site.stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="font-serif text-4xl leading-none tracking-tight text-[color:var(--trade-amber)]">
                    {stat.value}
                  </dd>
                  <p className="mt-2 text-xs font-bold uppercase leading-4 tracking-[0.1em] text-white/55">
                    {stat.label}
                  </p>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Star reviews with names and towns — what trade sites run instead of a quote. */
export function ReviewWall() {
  const { average, count, source, items } = tradeContent.reviews;

  return (
    <section id="reviews" className="scroll-mt-24 py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b-4 border-[color:var(--trade-ink)] pb-7">
          <h2>What our customers say</h2>
          <div className="flex items-center gap-4">
            <span className="font-serif text-5xl leading-none tracking-tight text-[color:var(--trade-ink)]">
              {average}
            </span>
            <span>
              <StarRating value={5} />
              <span className="mt-1 block text-xs font-bold uppercase tracking-[0.1em] text-muted">
                {count} reviews {source}
              </span>
            </span>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((review) => (
            <figure
              key={review.name + review.job}
              className="flex flex-col border-2 border-[color:var(--trade-ink)]/15 bg-white p-6 transition hover:border-[color:var(--trade-amber)]"
            >
              <div className="flex items-center justify-between gap-3">
                <StarRating value={review.stars} />
                <Quote className="size-5 text-[color:var(--trade-ink)]/15" aria-hidden />
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-6 text-foreground">
                {review.text}
              </blockquote>
              <figcaption className="mt-5 border-t border-[color:var(--trade-ink)]/10 pt-4">
                <span className="block text-sm font-bold text-[color:var(--trade-ink)]">
                  {review.name} · {review.town}
                </span>
                <span className="mt-0.5 block text-xs text-muted">
                  {review.job} · {review.when}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Photographs of actual jobs, captioned like job sheets. */
export function RecentWork() {
  return (
    <section id="work" className="scroll-mt-24 bg-[color:var(--bg-deep)] py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2>{tradeContent.work.heading}</h2>
        <p className="mt-3 max-w-xl text-base leading-7 text-muted">{tradeContent.work.body}</p>

        <div className="mt-9 grid gap-7 md:grid-cols-3">
          {tradeContent.work.items.map((item) => (
            <article key={item.title} className="bg-white">
              <DemoImage
                src={item.image.src}
                alt={item.image.alt}
                aspect="aspect-[4/3]"
                sizes="(min-width: 768px) 33vw, 100vw"
              />
              <div className="border-t-4 border-[color:var(--trade-amber)] p-6">
                <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-[color:var(--trade-amber-ink)]">
                  {item.area}
                </p>
                <h3 className="mt-2 uppercase text-[color:var(--trade-ink)]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{item.blurb}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Dense town list beside the van — how a visitor self-qualifies in two seconds. */
export function AreaList() {
  return (
    <section id="areas" className="scroll-mt-24 py-14 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-14 lg:px-8">
        <div className="lg:col-span-5">
          <DemoImage
            src={tradeContent.van.src}
            alt={tradeContent.van.alt}
            aspect="aspect-[16/10]"
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="border-4 border-[color:var(--trade-ink)]"
          />
        </div>
        <div className="lg:col-span-7">
          <h2>{tradeContent.areas.heading}</h2>
          <p className="mt-3 text-base leading-7 text-muted">{tradeContent.areas.body}</p>

          <ul className="mt-7 flex flex-wrap gap-2">
            {tradeContent.areas.items.map((area) => (
              <li
                key={area}
                className="border-2 border-[color:var(--trade-ink)]/15 px-3.5 py-1.5 text-sm font-bold text-[color:var(--trade-ink)]"
              >
                {area}
              </li>
            ))}
          </ul>

          <p className="mt-7 flex items-center gap-2 text-sm text-muted">
            <MapPin className="size-4 shrink-0 text-[color:var(--trade-amber-ink)]" aria-hidden />
            {tradeContent.areas.note}
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * Native <details> rather than a state-driven accordion — this is a static list
 * of answers, and making it a client component to animate a chevron would be
 * shipping JavaScript to do what the browser already does.
 */
export function FaqList({ site }: { site: DemoSite }) {
  return (
    <section id="faq" className="scroll-mt-24 bg-[color:var(--bg-deep)] py-14 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-14 lg:px-8">
        <div className="lg:col-span-4">
          <h2>{site.faqIntro.heading}</h2>
          <p className="mt-3 text-base leading-7 text-muted">{site.faqIntro.body}</p>
          <AmberButton href="#quote" className="mt-7">
            Ask the office
          </AmberButton>
        </div>

        <div className="lg:col-span-8">
          {site.faq.map((item) => (
            <details
              key={item.question}
              className="group border-b-2 border-[color:var(--trade-ink)]/12 bg-transparent"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-base font-bold text-[color:var(--trade-ink)] marker:hidden">
                {item.question}
                <ChevronDown
                  className="size-5 shrink-0 text-[color:var(--trade-amber-ink)] transition group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <p className="pb-5 pr-8 text-sm leading-6 text-muted">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
