"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  {
    quote: "SyncAI helped us identify where we were losing leads and built a system that recovered them. Our booked consultations increased by 40% in the first month.",
    name: "Dr. Sarah Mitchell",
    title: "Owner, Mitchell Dental Clinic",
  },
  {
    quote: "The AI voice agent handles our after-hours calls now. We went from missing 60% of evening inquiries to capturing every single one.",
    name: "James Chen",
    title: "Broker, Chen Realty Group",
  },
  {
    quote: "We were spending 15 hours a week on intake paperwork. SyncAI automated it. Now our team focuses on patients, not forms.",
    name: "Lisa Thompson",
    title: "Operations Director, Thompson Physiotherapy",
  },
];

type TestimonialCarouselProps = {
  /**
   * Drop the full-bleed section wrapper, background glow and display heading,
   * leaving just the quote card. For narrow columns beside other content —
   * the standalone layout assumes a 4xl centred container and breaks in one.
   */
  compact?: boolean;
};

export function TestimonialCarousel({ compact = false }: TestimonialCarouselProps) {
  const [current, setCurrent] = useState(0);
  const testimonial = testimonials[current];

  const card = (
    <div
      className={
        compact
          ? "rounded-[16px] border border-border-subtle bg-surface p-7 backdrop-blur-md"
          : "mt-14 rounded-[16px] border border-border-subtle bg-surface p-8 backdrop-blur-md sm:p-12"
      }
    >
      {compact ? (
        <p className="text-[11px] font-semibold uppercase tracking-[.2em] text-muted">
          What clients say
        </p>
      ) : null}
      <Quote className={compact ? "mt-4 size-7 text-brand/30" : "mx-auto size-10 text-brand/30"} />
      <blockquote
        className={
          compact
            ? "mt-4 text-base leading-7 text-foreground/90"
            : "mt-6 text-xl leading-9 text-foreground/90"
        }
      >
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>
      <div className={compact ? "mt-5" : "mt-8"}>
        <p className="font-bold text-foreground">{testimonial.name}</p>
        <p className="text-sm text-muted">{testimonial.title}</p>
      </div>
      <div
        className={
          compact
            ? "mt-6 flex items-center gap-3"
            : "mt-8 flex items-center justify-center gap-4"
        }
      >
        <button
          type="button"
          aria-label="Previous testimonial"
          onClick={() => setCurrent((p) => (p === 0 ? testimonials.length - 1 : p - 1))}
          className="grid size-10 cursor-pointer place-items-center rounded-full border border-border-subtle text-muted transition hover:border-brand-soft/40 hover:text-brand-glow-text"
        >
          <ChevronLeft className="size-5" />
        </button>
        <div className="flex gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to testimonial ${i + 1}`}
              onClick={() => setCurrent(i)}
              className={`size-2 cursor-pointer rounded-full transition ${
                i === current ? "bg-brand-soft shadow-[0_0_10px_var(--accent-glow)]" : "bg-white/20"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          aria-label="Next testimonial"
          onClick={() => setCurrent((p) => (p === testimonials.length - 1 ? 0 : p + 1))}
          className="grid size-10 cursor-pointer place-items-center rounded-full border border-border-subtle text-muted transition hover:border-brand-soft/40 hover:text-brand-glow-text"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );

  if (compact) {
    return card;
  }

  return (
    <section className="relative overflow-hidden bg-bg-base py-20 text-foreground sm:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_80%,var(--accent-glow),transparent_55%)]"
      />
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-sm font-black uppercase tracking-[.25em] text-brand">Testimonials</p>
        <h2 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-5xl">
          Trusted by Canadian businesses
        </h2>
        {card}
      </div>
    </section>
  );
}
