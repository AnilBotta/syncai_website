import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { AiReadiness } from "@/components/tools/ai-readiness";

export const metadata: Metadata = {
  title: "AI Readiness Assessment",
  description:
    "A free 12-question assessment that scores how ready your business is for AI across data, team, leadership, and current usage — with a tier-based action plan.",
};

export default function AiReadinessPage() {
  return (
    <PageShell
      eyebrow="Free tool"
      title="AI Readiness Assessment"
      description="Twelve quick questions across four areas — data, team, leadership, and current AI usage. Get a score out of 100 and the exact next moves for your tier."
    >
      <section className="bg-bg-base py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <AiReadiness />
        </div>
      </section>
    </PageShell>
  );
}
