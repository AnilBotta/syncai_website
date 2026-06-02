import { HeroSection } from "@/components/hero-section";
import { TrustBar } from "@/components/trust-bar";
import { WhatWeDo } from "@/components/what-we-do";
import { SolutionsGrid } from "@/components/solutions-grid";
import { IndustriesGrid } from "@/components/industries-grid";
import { ResultsMetrics } from "@/components/results-metrics";
import { DemoAnalyzer } from "@/components/demo-analyzer";
import { TestimonialCarousel } from "@/components/testimonial-carousel";
import { CtaSection } from "@/components/cta-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { faqs } from "@/lib/site-data";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <TrustBar />
        <WhatWeDo />
        <SolutionsGrid />
        <IndustriesGrid />
        <ResultsMetrics />
        <DemoAnalyzer />
        <TestimonialCarousel />
        <CtaSection />

        <section className="bg-white py-20 sm:py-28">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-black uppercase tracking-[.25em] text-[#4B0082]">FAQ</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-[#161616] sm:text-5xl">
                Clear answers for serious buyers
              </h2>
            </div>
            <div className="mt-10 grid gap-4">
              {faqs.map((faq) => (
                <details key={faq.question} className="group rounded-[1.5rem] border border-slate-200 p-5">
                  <summary className="cursor-pointer list-none text-lg font-black text-[#161616]">
                    {faq.question}
                  </summary>
                  <p className="mt-3 leading-7 text-slate-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
