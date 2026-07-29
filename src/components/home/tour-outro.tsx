import { ArrowRight } from "lucide-react";
import { GlowButton } from "@/components/ui/glow-button";
import { GlassCard } from "@/components/ui/glass-card";
import { SectionShell } from "@/components/ui/section-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { whatsappHref } from "@/lib/whatsapp";

const metrics = [
  { value: "24/7", label: "Customer response" },
  { value: "3x", label: "Faster follow-ups" },
  { value: "-80%", label: "Manual work" },
];

/**
 * Results and the closing CTA, in normal flow below the pinned tour.
 *
 * These used to be the last two overlay chapters. Out from under the pin they
 * get full width instead of half a viewport shared with the video, and the CTA
 * is no longer stranded at maximum scroll depth.
 */
export function TourOutro() {
  return (
    <>
      <SectionShell tier="elevated" glow="center">
        <SectionHeading eyebrow="The payoff" title="Real ROI for real businesses" />
        <p className="mx-auto mt-5 max-w-2xl text-center text-lg leading-8 text-muted">
          Systems that answer every inquiry, follow up faster, and hand the busywork to machines.
        </p>
        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-3 gap-4">
          {metrics.map((metric) => (
            <GlassCard key={metric.label} className="px-4 py-6 text-center">
              <p className="text-3xl font-black text-brand-glow-text sm:text-4xl">{metric.value}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted">
                {metric.label}
              </p>
            </GlassCard>
          ))}
        </div>
      </SectionShell>

      <SectionShell tier="deep" glow="center" dotGrid>
        <h2 className="text-center text-4xl font-black tracking-tight text-foreground sm:text-6xl">
          Ready to <span className="text-gradient-brand">sync</span> your business with AI?
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-center text-lg leading-8 text-muted">
          A free 30-minute strategy call. Real recommendations, plain language, no pressure.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <GlowButton href="/book" size="lg" className="animate-pulse-glow">
            Book Your Free Strategy Call <ArrowRight className="size-4" />
          </GlowButton>
          <GlowButton
            href={whatsappHref("Hi SyncAI, I'd like to know more about your AI solutions.")}
            variant="whatsapp"
            size="lg"
            external
          >
            <WhatsAppIcon className="size-5" />
            Message on WhatsApp
          </GlowButton>
        </div>
      </SectionShell>
    </>
  );
}
