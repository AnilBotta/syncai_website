import type { Metadata } from "next";
import { LegalLayout, LegalSection, LegalP, LegalList } from "@/components/legal-layout";
import { contact } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of the SyncAI Technologies website and services.",
};

const UPDATED = "July 20, 2026";

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      description="These terms govern your use of our website and services. Please read them carefully."
      updated={UPDATED}
    >
      <LegalSection heading="Agreement to these terms">
        <LegalP>
          These Terms of Service (&ldquo;Terms&rdquo;) are a legal agreement between you and SyncAI Technologies
          (&ldquo;SyncAI,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;). By accessing or using our website, forms, booking
          tools, or services, you agree to these Terms. If you do not agree, please do not use the site.
        </LegalP>
      </LegalSection>

      <LegalSection heading="Our services">
        <LegalP>
          SyncAI is an AI-solutions agency providing consulting, AI websites and lead systems, AI voice and chat agents,
          and workflow automation. Details discussed during consultations are informational; a specific engagement is
          governed by a separate written agreement or statement of work between us.
        </LegalP>
      </LegalSection>

      <LegalSection heading="Eligibility">
        <LegalP>
          You must be at least the age of majority in your province or territory and able to enter into a binding
          contract to use our services on behalf of yourself or a business you are authorized to represent.
        </LegalP>
      </LegalSection>

      <LegalSection heading="Acceptable use">
        <LegalP>When using our site and services, you agree not to:</LegalP>
        <LegalList>
          <li>Use them for any unlawful, harmful, or fraudulent purpose.</li>
          <li>Attempt to disrupt, damage, or gain unauthorized access to our systems or data.</li>
          <li>Submit false information or another person&rsquo;s details without permission.</li>
          <li>Copy, scrape, or misuse our content except as expressly permitted.</li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="Intellectual property">
        <LegalP>
          The website, its content, branding, and design are owned by SyncAI or our licensors and are protected by
          intellectual-property laws. We grant you a limited, non-exclusive right to view the site for your own
          business purposes. You retain ownership of the content and materials you submit to us.
        </LegalP>
      </LegalSection>

      <LegalSection heading="Bookings and consultations">
        <LegalP>
          Booking a consultation reserves time to discuss your needs; it does not create a service contract or a
          guarantee of any particular outcome. We may reschedule or decline a booking at our discretion.
        </LegalP>
      </LegalSection>

      <LegalSection heading="Third-party services and links">
        <LegalP>
          Our site may rely on or link to third-party services (such as scheduling, video meetings, and payment
          providers). We are not responsible for the content, policies, or practices of those third parties, and their
          own terms apply to your use of them.
        </LegalP>
      </LegalSection>

      <LegalSection heading="Disclaimers">
        <LegalP>
          The website and any free tools or information are provided on an &ldquo;as is&rdquo; and &ldquo;as
          available&rdquo; basis without warranties of any kind, whether express or implied, to the fullest extent
          permitted by law. We do not warrant that the site will be uninterrupted, error-free, or that any result or
          estimate provided is accurate for your situation.
        </LegalP>
      </LegalSection>

      <LegalSection heading="Limitation of liability">
        <LegalP>
          To the fullest extent permitted by law, SyncAI will not be liable for any indirect, incidental, special, or
          consequential damages, or for lost profits or data, arising from your use of the website or free tools. Our
          total liability relating to the website is limited to the amount you paid us, if any, for access to it.
          Nothing in these Terms limits liability that cannot be limited under applicable law.
        </LegalP>
      </LegalSection>

      <LegalSection heading="Indemnification">
        <LegalP>
          You agree to indemnify and hold SyncAI harmless from claims, losses, and expenses arising out of your misuse
          of the site or your breach of these Terms.
        </LegalP>
      </LegalSection>

      <LegalSection heading="Governing law">
        <LegalP>
          These Terms are governed by the laws of the Province of Ontario and the federal laws of Canada that apply
          there, without regard to conflict-of-laws rules. The courts located in Ontario will have jurisdiction over any
          dispute, subject to any mandatory consumer-protection rights you may have.
        </LegalP>
      </LegalSection>

      <LegalSection heading="Changes to these terms">
        <LegalP>
          We may update these Terms from time to time. Changes take effect when posted, and the &ldquo;Last
          updated&rdquo; date above will reflect the revision. Continued use of the site means you accept the updated
          Terms.
        </LegalP>
      </LegalSection>

      <LegalSection heading="Contact us">
        <LegalP>
          Questions about these Terms? Email{" "}
          <a href={`mailto:${contact.email}`} className="font-semibold text-brand-glow-text underline">
            {contact.email}
          </a>{" "}
          or write to us at {contact.location}, Canada.
        </LegalP>
      </LegalSection>
    </LegalLayout>
  );
}
