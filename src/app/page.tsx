import { HomeExperience } from "@/components/home/home-experience";
import { TourChapters } from "@/components/home/chapters/tour-chapters";
import { IndustriesGrid } from "@/components/industries-grid";
import { DemoAnalyzer } from "@/components/demo-analyzer";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SectionShell } from "@/components/ui/section-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { faqs } from "@/lib/site-data";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <HomeExperience>
          <TourChapters />
        </HomeExperience>

        <IndustriesGrid />
        <DemoAnalyzer />

        <SectionShell tier="base" glow="center" id="faq">
          <SectionHeading eyebrow="FAQ" title="Clear answers for serious buyers" />
          <div className="mx-auto mt-10 grid max-w-4xl gap-4">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-[16px] border border-border-subtle bg-surface p-5 backdrop-blur-md transition hover:border-brand-soft/30"
              >
                <summary className="cursor-pointer list-none text-lg font-black text-foreground">
                  {faq.question}
                </summary>
                <p className="mt-3 leading-7 text-muted">{faq.answer}</p>
              </details>
            ))}
          </div>
        </SectionShell>
      </main>
      <SiteFooter />
    </>
  );
}
