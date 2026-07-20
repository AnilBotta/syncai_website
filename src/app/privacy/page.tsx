import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout, LegalSection, LegalP, LegalList } from "@/components/legal-layout";
import { contact } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How SyncAI Technologies collects, uses, and protects your personal information, and the choices and rights you have.",
};

const UPDATED = "July 20, 2026";

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      description="Your privacy matters. This policy explains what we collect, why, and the control you have over your information."
      updated={UPDATED}
    >
      <LegalSection heading="Who we are">
        <LegalP>
          SyncAI Technologies (&ldquo;SyncAI,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is an
          AI-solutions agency based in {contact.location}, Canada. This Privacy Policy applies to information we collect
          through our website, forms, booking flows, voice assistant, and related services.
        </LegalP>
      </LegalSection>

      <LegalSection heading="Information we collect">
        <LegalP>We collect only what we need to respond to you and deliver our services:</LegalP>
        <LegalList>
          <li>
            <strong className="text-foreground">Information you give us</strong> — your name, email address, phone
            number, company, and the details you share when you submit a form, request a consultation, book a call,
            subscribe to our newsletter, or speak with our voice assistant.
          </li>
          <li>
            <strong className="text-foreground">Booking &amp; call information</strong> — appointment details and, for
            calls with our AI voice assistant, a transcript and summary of the conversation so we can follow up.
          </li>
          <li>
            <strong className="text-foreground">Information collected automatically</strong> — basic device and usage
            data (such as pages viewed and general location) and cookies or similar technologies. See our{" "}
            <Link href="/cookies" className="font-semibold text-brand-glow-text underline">
              Cookie Policy
            </Link>
            .
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="How we use your information">
        <LegalList>
          <li>To respond to enquiries, schedule consultations, and provide the services you request.</li>
          <li>To send you information you asked for, including newsletter emails you subscribed to.</li>
          <li>To operate, secure, and improve our website and services.</li>
          <li>To meet legal, regulatory, and accounting obligations.</li>
        </LegalList>
        <LegalP>
          We rely on your consent for marketing emails and, where required, other processing. You can withdraw consent
          at any time (see &ldquo;Your choices and rights&rdquo; below).
        </LegalP>
      </LegalSection>

      <LegalSection heading="How we share information">
        <LegalP>
          We do not sell your personal information. We share it only with trusted service providers who help us run our
          business — including website hosting, database, email delivery, video meetings, voice-AI, payment processing,
          and analytics providers — and only as needed to perform those services on our behalf. We may also disclose
          information where required by law or to protect our rights.
        </LegalP>
      </LegalSection>

      <LegalSection heading="Data retention">
        <LegalP>
          We keep personal information only as long as necessary for the purposes described here, to maintain our
          business records, and to meet legal obligations. When it is no longer needed, we delete or anonymize it.
        </LegalP>
      </LegalSection>

      <LegalSection heading="Security">
        <LegalP>
          We use reasonable administrative, technical, and physical safeguards to protect your information. No method of
          transmission or storage is completely secure, but we work to protect your data and to address issues promptly
          if they arise.
        </LegalP>
      </LegalSection>

      <LegalSection heading="Your choices and rights">
        <LegalP>
          Subject to applicable law, including Canada&rsquo;s Personal Information Protection and Electronic Documents Act
          (PIPEDA), you may:
        </LegalP>
        <LegalList>
          <li>Ask what personal information we hold about you and request a copy.</li>
          <li>Ask us to correct or update inaccurate information.</li>
          <li>Ask us to delete your information, where we are not required to keep it.</li>
          <li>Withdraw consent or unsubscribe from marketing at any time using the link in our emails.</li>
        </LegalList>
        <LegalP>
          To make a request, email us at{" "}
          <a href={`mailto:${contact.email}`} className="font-semibold text-brand-glow-text underline">
            {contact.email}
          </a>
          . We will respond within a reasonable time.
        </LegalP>
      </LegalSection>

      <LegalSection heading="International transfers">
        <LegalP>
          Some of our service providers may process data outside your province or country. Where they do, we take steps
          to ensure your information continues to be protected in line with this policy and applicable law.
        </LegalP>
      </LegalSection>

      <LegalSection heading="Children">
        <LegalP>
          Our services are intended for businesses and are not directed to children. We do not knowingly collect
          personal information from children.
        </LegalP>
      </LegalSection>

      <LegalSection heading="Changes to this policy">
        <LegalP>
          We may update this policy from time to time. When we do, we will revise the &ldquo;Last updated&rdquo; date
          above, and significant changes will be reflected on this page.
        </LegalP>
      </LegalSection>

      <LegalSection heading="Contact us">
        <LegalP>
          Questions about this policy or your information? Email{" "}
          <a href={`mailto:${contact.email}`} className="font-semibold text-brand-glow-text underline">
            {contact.email}
          </a>{" "}
          or write to us at {contact.location}, Canada.
        </LegalP>
      </LegalSection>
    </LegalLayout>
  );
}
