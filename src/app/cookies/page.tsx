import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout, LegalSection, LegalP, LegalList } from "@/components/legal-layout";
import { contact } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How SyncAI Technologies uses cookies and similar technologies, and how you can control them.",
};

const UPDATED = "July 20, 2026";

export default function CookiesPage() {
  return (
    <LegalLayout
      title="Cookie Policy"
      description="How we use cookies and similar technologies, and the control you have over them."
      updated={UPDATED}
    >
      <LegalSection heading="What are cookies?">
        <LegalP>
          Cookies are small text files stored on your device when you visit a website. Similar technologies — such as
          local storage — work in comparable ways. They help websites function, remember your preferences, and
          understand how the site is used.
        </LegalP>
      </LegalSection>

      <LegalSection heading="How we use them">
        <LegalList>
          <li>
            <strong className="text-foreground">Essential</strong> — needed for the site to work and to remember basic
            preferences, such as your light or dark theme choice (stored on your device).
          </li>
          <li>
            <strong className="text-foreground">Functional</strong> — remember choices you make to improve your
            experience.
          </li>
          <li>
            <strong className="text-foreground">Analytics</strong> — help us understand, in aggregate, how visitors use
            the site so we can improve it. Where required, these are used only with your consent.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="Managing cookies">
        <LegalP>
          You can control or delete cookies through your browser settings, and set your browser to warn you before
          accepting them. Blocking some cookies may affect how parts of the site work. Your theme preference is stored
          locally on your device and can be cleared through your browser at any time.
        </LegalP>
      </LegalSection>

      <LegalSection heading="Related policy">
        <LegalP>
          For more about the information we collect and how we handle it, see our{" "}
          <Link href="/privacy" className="font-semibold text-brand-glow-text underline">
            Privacy Policy
          </Link>
          .
        </LegalP>
      </LegalSection>

      <LegalSection heading="Changes and contact">
        <LegalP>
          We may update this Cookie Policy from time to time; the &ldquo;Last updated&rdquo; date above will reflect any
          changes. Questions? Email{" "}
          <a href={`mailto:${contact.email}`} className="font-semibold text-brand-glow-text underline">
            {contact.email}
          </a>
          .
        </LegalP>
      </LegalSection>
    </LegalLayout>
  );
}
