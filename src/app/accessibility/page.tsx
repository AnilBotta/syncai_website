import type { Metadata } from "next";
import { LegalLayout, LegalSection, LegalP, LegalList } from "@/components/legal-layout";
import { contact } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Accessibility",
  description: "SyncAI Technologies is committed to making its website usable by everyone.",
};

const UPDATED = "July 20, 2026";

export default function AccessibilityPage() {
  return (
    <LegalLayout
      title="Accessibility"
      description="We want everyone to be able to use our site. Here's our commitment and how to reach us."
      updated={UPDATED}
    >
      <LegalSection heading="Our commitment">
        <LegalP>
          SyncAI Technologies is committed to making our website accessible to as many people as possible, including
          people who use assistive technologies. We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.1
          Level AA as a practical standard, and to align with applicable Ontario and Canadian accessibility legislation.
        </LegalP>
      </LegalSection>

      <LegalSection heading="What we do">
        <LegalList>
          <li>Use semantic, keyboard-navigable markup and a visible skip-to-content link.</li>
          <li>Aim for sufficient colour contrast in both light and dark modes.</li>
          <li>Respect reduced-motion preferences for animations.</li>
          <li>Provide text alternatives for meaningful images and label interactive controls.</li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="Ongoing effort">
        <LegalP>
          Accessibility is an ongoing effort. Some content may not yet be fully accessible, and we continue to test and
          improve the experience over time.
        </LegalP>
      </LegalSection>

      <LegalSection heading="Give us feedback">
        <LegalP>
          If you encounter a barrier on our site or need information in a different format, please tell us — your
          feedback helps us improve. Email{" "}
          <a href={`mailto:${contact.email}`} className="font-semibold text-brand-glow-text underline">
            {contact.email}
          </a>{" "}
          and we&rsquo;ll do our best to help and to provide the content you need in an accessible way.
        </LegalP>
      </LegalSection>
    </LegalLayout>
  );
}
