import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { ChatbotCostCalculator } from "@/components/tools/chatbot-cost-calculator";

export const metadata: Metadata = {
  title: "Chatbot & Voice Bot Cost Calculator",
  description:
    "Get a realistic price range for building and running a chatbot or AI voice agent — based on complexity, volume, integrations, and languages.",
};

export default function ChatbotCostCalculatorPage() {
  return (
    <PageShell
      eyebrow="Free tool"
      title="Chatbot & Voice Bot Cost Calculator"
      description="Answer five quick questions and get an honest ballpark — one-time build and monthly running costs, with a breakdown of exactly what drives the price."
    >
      <section className="bg-bg-base py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <ChatbotCostCalculator />
        </div>
      </section>
    </PageShell>
  );
}
