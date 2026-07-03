import Link from "next/link";
import Image from "next/image";
import { contact } from "@/lib/site-data";

export function SiteFooter() {
  return (
    <footer className="border-t border-border-subtle bg-bg-deep text-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.3fr_.7fr_.7fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/brand/syncai-logo-dark.png"
              alt="SyncAI logo"
              width={154}
              height={50}
              className="h-9 w-auto"
            />
            <div>
              <p className="font-bold text-foreground">Technology</p>
              <p className="text-sm text-muted">AI solutions that deliver ROI.</p>
            </div>
          </div>
          <p className="mt-5 max-w-xl text-sm leading-6 text-muted">
            Built from Brampton, Ontario for businesses that want AI systems tied to real challenges,
            measurable workflows, and qualified leads.
          </p>
        </div>

        <div>
          <p className="font-semibold text-foreground">Explore</p>
          <div className="mt-4 grid gap-3 text-sm">
            <Link href="/demos" className="text-muted transition hover:text-brand-glow-text">Solutions</Link>
            <Link href="/case-studies" className="text-muted transition hover:text-brand-glow-text">Case Studies</Link>
            <Link href="/industries" className="text-muted transition hover:text-brand-glow-text">Industries</Link>
            <Link href="/process" className="text-muted transition hover:text-brand-glow-text">Process</Link>
            <Link href="/blog" className="text-muted transition hover:text-brand-glow-text">Blog</Link>
            <Link href="/contact" className="text-muted transition hover:text-brand-glow-text">Contact</Link>
          </div>
        </div>

        <div>
          <p className="font-semibold text-foreground">Contact</p>
          <div className="mt-4 grid gap-3 text-sm text-muted">
            <a href={`mailto:${contact.email}`} className="transition hover:text-brand-glow-text">
              {contact.email}
            </a>
            <a href={`tel:${contact.phonePrimary.replaceAll(" ", "")}`} className="transition hover:text-brand-glow-text">
              {contact.phonePrimary}
            </a>
            <a href={`tel:${contact.phoneSecondary.replaceAll(" ", "")}`} className="transition hover:text-brand-glow-text">
              {contact.phoneSecondary}
            </a>
            <span>{contact.location}</span>
          </div>
        </div>
      </div>
      <div className="border-t border-border-subtle px-4 py-5 text-center text-xs text-muted">
        (c) {new Date().getFullYear()} SyncAI Technology. All rights reserved.
      </div>
    </footer>
  );
}
