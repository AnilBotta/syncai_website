import { LeadForm } from "@/components/lead-form";
import { PageShell } from "@/components/page-shell";
import { contact } from "@/lib/site-data";

export default function ContactPage() {
  return (
    <PageShell
      eyebrow="Contact"
      title="Request an AI strategy call."
      description="Tell SyncAi Technologies what the business is trying to improve. Your lead will go directly into the private admin dashboard."
    >
      <section className="bg-[#f7fbfb] py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
          <div className="rounded-[2rem] bg-slate-950 p-7 text-white">
            <h2 className="text-2xl font-black">SyncAi Technologies</h2>
            <p className="mt-4 leading-7 text-slate-300">
              Canada-based AI strategy and implementation from Brampton, Ontario.
            </p>
            <div className="mt-8 grid gap-3 text-sm text-slate-200">
              <a href={`mailto:${contact.email}`} className="hover:text-cyan-200">
                {contact.email}
              </a>
              <a href={`tel:${contact.phonePrimary.replaceAll(" ", "")}`} className="hover:text-cyan-200">
                {contact.phonePrimary}
              </a>
              <a href={`tel:${contact.phoneSecondary.replaceAll(" ", "")}`} className="hover:text-cyan-200">
                {contact.phoneSecondary}
              </a>
              <span>{contact.location}</span>
            </div>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <LeadForm source="contact-page" />
          </div>
        </div>
      </section>
    </PageShell>
  );
}
