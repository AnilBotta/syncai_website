import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { ConversionAudit } from "@/components/tools/conversion-audit";

export const metadata: Metadata = {
  title: "Website Conversion Audit",
  description:
    "Score your website across speed, mobile, CTAs, trust signals, and friction — and get your two highest-impact fixes, free.",
};

export default function ConversionAuditPage() {
  return (
    <PageShell
      eyebrow="Free tool"
      title="Website Conversion Audit"
      description="Fifteen honest questions about your site. Get a conversion score out of 100, a category breakdown, and your two highest-impact fixes."
    >
      <section className="bg-bg-base py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <ConversionAudit />
        </div>
      </section>
    </PageShell>
  );
}
