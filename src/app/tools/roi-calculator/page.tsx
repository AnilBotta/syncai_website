import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { RoiCalculator } from "@/components/tools/roi-calculator";

export const metadata: Metadata = {
  title: "ROI & Automation Savings Calculator",
  description:
    "Calculate exactly how many hours and dollars automation would save your business every month — with honest math, including when it's not worth it.",
};

export default function RoiCalculatorPage() {
  return (
    <PageShell
      eyebrow="Free tool"
      title="ROI & Automation Savings Calculator"
      description="Plug in your numbers and see the real monthly savings, payback period, and annual ROI of automating a task — including the honest answer when it isn't worth it yet."
    >
      <section className="bg-bg-base py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <RoiCalculator />
        </div>
      </section>
    </PageShell>
  );
}
