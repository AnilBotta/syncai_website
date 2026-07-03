import { LeadForm } from "@/components/lead-form";
import { PageShell } from "@/components/page-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { contact } from "@/lib/site-data";

export default function ContactPage() {
  return (
    <PageShell
      eyebrow="Contact"
      title="Request an AI strategy call."
      description="Tell SyncAI Technologies what the business is trying to improve. Your lead will go directly into the private admin dashboard."
    >
      <section className="bg-bg-base py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
          <GlassCard glow className="h-fit p-7">
            <h2 className="text-2xl font-black text-foreground">SyncAI Technologies</h2>
            <p className="mt-4 leading-7 text-muted">
              Canada-based AI strategy and implementation from Brampton, Ontario.
            </p>
            <div className="mt-8 grid gap-3 text-sm text-foreground/90">
              <a href={`mailto:${contact.email}`} className="transition hover:text-brand-glow-text">
                {contact.email}
              </a>
              <a
                href={`tel:${contact.phonePrimary.replaceAll(" ", "")}`}
                className="transition hover:text-brand-glow-text"
              >
                {contact.phonePrimary}
              </a>
              <a
                href={`tel:${contact.phoneSecondary.replaceAll(" ", "")}`}
                className="transition hover:text-brand-glow-text"
              >
                {contact.phoneSecondary}
              </a>
              <span className="text-muted">{contact.location}</span>
            </div>
          </GlassCard>
          <GlassCard className="p-6">
            <LeadForm source="contact-page" />
          </GlassCard>
        </div>
      </section>
    </PageShell>
  );
}
