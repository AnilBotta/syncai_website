import { GlowButton } from "@/components/ui/glow-button";
import { ArrowRight } from "lucide-react";

type ToolCtaProps = {
  text?: string;
};

/** Standard closing CTA under every tool's results. */
export function ToolCta({
  text = "Want the exact numbers for your business?",
}: ToolCtaProps) {
  return (
    <div className="mt-8 rounded-[16px] border border-brand/25 bg-[radial-gradient(circle_at_50%_0%,var(--accent-glow),transparent_70%)] p-6 text-center">
      <p className="font-black text-foreground">{text}</p>
      <div className="mt-4 flex justify-center">
        <GlowButton href="/book">
          Book a free call <ArrowRight className="size-4" />
        </GlowButton>
      </div>
    </div>
  );
}
