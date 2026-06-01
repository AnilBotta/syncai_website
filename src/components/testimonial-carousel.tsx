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

export function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);
  const testimonial = testimonials[current];

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-sm font-black uppercase tracking-[.25em] text-[#4B0082]">Testimonials</p>
        <h2 className="mt-4 text-3xl font-black tracking-tight text-[#161616] sm:text-5xl">
          Trusted by Canadian businesses
        </h2>
        <div className="mt-14 rounded-[2rem] border border-slate-200 bg-[#f8f9fc] p-8 sm:p-12">
          <Quote className="mx-auto size-10 text-[#4B0082]/20" />
          <blockquote className="mt-6 text-xl leading-9 text-slate-700">
            &ldquo;{testimonial.quote}&rdquo;
          </blockquote>
          <div className="mt-8">
            <p className="font-bold text-[#161616]">{testimonial.name}</p>
            <p className="text-sm text-slate-500">{testimonial.title}</p>
          </div>
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setCurrent((p) => (p === 0 ? testimonials.length - 1 : p - 1))}
              className="grid size-10 place-items-center rounded-full border border-slate-300 text-slate-600 transition hover:bg-[#4B0082] hover:text-white"
            >
              <ChevronLeft className="size-5" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrent(i)}
                  className={`size-2 rounded-full transition ${i === current ? "bg-[#4B0082]" : "bg-slate-300"}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setCurrent((p) => (p === testimonials.length - 1 ? 0 : p + 1))}
              className="grid size-10 place-items-center rounded-full border border-slate-300 text-slate-600 transition hover:bg-[#4B0082] hover:text-white"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
