import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { contact, socials } from "@/lib/site-data";
import { servicesDropdown } from "@/lib/nav-data";
import { FooterSubscribe, BackToTop } from "@/components/footer-subscribe";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  XIcon,
  YouTubeIcon,
} from "@/components/icons/social-icons";

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Industries", href: "/industries" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Process", href: "/process" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const pillars = ["AI Automation", "AI Consulting", "AI Voice Agents", "AI Chatbots"];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Cookie Policy", href: "/cookies" },
  { label: "Accessibility", href: "/accessibility" },
];

type Platform = (typeof socials)[number]["platform"];

/** Accessible name plus glyph — the link shows the icon, screen readers get the name. */
const socialMeta: Record<Platform, { label: string; Icon: (p: { className?: string }) => React.ReactElement }> = {
  linkedin: { label: "LinkedIn", Icon: LinkedInIcon },
  youtube: { label: "YouTube", Icon: YouTubeIcon },
  instagram: { label: "Instagram", Icon: InstagramIcon },
  x: { label: "X", Icon: XIcon },
  facebook: { label: "Facebook", Icon: FacebookIcon },
};

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="theme-dark relative overflow-hidden border-t border-border-subtle bg-bg-deep text-foreground">
      {/* Ambient texture: a faint grid + a soft brand glow, both subtle. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 30%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 30%, transparent 75%)",
          }}
        />
        <div
          className="absolute -top-24 left-1/2 h-64 w-[42rem] -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Top: brand + link columns + contact/subscribe */}
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr_1fr_1.5fr] lg:gap-12">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center" aria-label="SyncAI Technology home">
              <Image src="/brand/syncai-logo-dark.png" alt="SyncAI Technology" width={168} height={54} className="h-11 w-auto" />
            </Link>
            <p className="mt-5 text-base font-semibold text-foreground">AI systems built for measurable ROI.</p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-muted">
              Built from Brampton, Ontario for businesses that want AI tied to real challenges — measurable workflows,
              qualified leads, and agents that plug into the tools they already run.
            </p>
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
              {pillars.map((p) => (
                <li key={p} className="flex items-center gap-2 text-sm text-muted">
                  <span className="size-1.5 rounded-full bg-brand-soft" />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <nav aria-label="Company">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Company</p>
            <ul className="mt-5 space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted transition hover:text-brand-glow-text">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Solutions */}
          <nav aria-label="Solutions">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Solutions</p>
            <ul className="mt-5 space-y-3">
              {servicesDropdown.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-muted transition hover:text-brand-glow-text">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact + subscribe */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Contact</p>
            <ul className="mt-5 space-y-3 text-sm text-muted">
              <li className="flex items-center gap-3">
                <MapPin className="size-4 shrink-0 text-brand-soft" />
                {contact.location}, Canada
              </li>
              <li>
                <a href={`tel:${contact.phonePrimary.replaceAll(" ", "")}`} className="flex items-center gap-3 transition hover:text-brand-glow-text">
                  <Phone className="size-4 shrink-0 text-brand-soft" />
                  {contact.phonePrimary}
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.email}`} className="flex items-center gap-3 transition hover:text-brand-glow-text">
                  <Mail className="size-4 shrink-0 text-brand-soft" />
                  {contact.email}
                </a>
              </li>
            </ul>

            {socials.length > 0 ? (
              <div className="mt-5 flex items-center gap-2">
                {socials.map(({ platform, href }) => {
                  const { label, Icon } = socialMeta[platform];
                  return (
                    <a
                      key={platform}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      title={label}
                      className="grid size-9 place-items-center rounded-full border border-border-subtle bg-[var(--input-bg)] text-muted transition hover:border-brand-soft/50 hover:text-brand-glow-text"
                    >
                      <Icon className="size-4" />
                    </a>
                  );
                })}
              </div>
            ) : null}

            <Link
              href="/book"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-electric to-brand-soft px-5 py-2.5 text-sm font-bold text-white shadow-[0_6px_20px_var(--accent-glow)] transition hover:-translate-y-0.5"
            >
              Schedule a discovery call
              <ArrowRight className="size-4" />
            </Link>

            <div className="mt-6 rounded-2xl border border-border-subtle bg-[var(--card-bg)] p-5 backdrop-blur-sm">
              <p className="text-sm font-bold text-foreground">Stay ahead with AI</p>
              <p className="mt-1 text-xs leading-5 text-muted">
                Practical automation ideas for growing businesses. No spam — unsubscribe anytime.
              </p>
              <div className="mt-3">
                <FooterSubscribe />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center gap-5 border-t border-border-subtle pt-6 text-xs text-muted lg:flex-row lg:justify-between">
          <p className="order-2 lg:order-1">© {year} SyncAI Technologies. All rights reserved.</p>
          <nav aria-label="Legal" className="order-1 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 lg:order-2">
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-brand-glow-text">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="order-3 flex items-center gap-3">
            <BackToTop />
          </div>
        </div>
      </div>
    </footer>
  );
}
