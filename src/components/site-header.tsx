"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { contact } from "@/lib/site-data";
import { servicesDropdown, toolsDropdown, type DropdownItem } from "@/lib/nav-data";
import { NavDropdown } from "@/components/nav/nav-dropdown";

const flatLinks = {
  home: { label: "Home", href: "/" },
  about: { label: "About", href: "/about" },
  results: { label: "Results", href: "/case-studies" },
  blog: { label: "Blog", href: "/blog" },
  book: { label: "Book a call", href: "/book" },
  contact: { label: "Contact", href: "/contact" },
};

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const desktopLink = "text-sm font-medium text-muted transition hover:text-brand-glow-text";

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full border-b backdrop-blur-xl transition-all duration-300",
        scrolled
          ? "border-[#e4e7ea] bg-white/90 shadow-sm"
          : "border-transparent bg-white/70",
      )}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex shrink-0 items-center gap-3" aria-label="SyncAI Technology home">
          <Image
            src="/brand/syncai-logo-light.png"
            alt="SyncAI logo"
            width={154}
            height={50}
            priority
            className="h-10 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-6 xl:gap-7 lg:flex" aria-label="Main navigation">
          <Link href={flatLinks.home.href} className={desktopLink}>
            {flatLinks.home.label}
          </Link>
          <Link href={flatLinks.about.href} className={desktopLink}>
            {flatLinks.about.label}
          </Link>
          <NavDropdown
            label="Services"
            items={servicesDropdown}
            viewAllHref="/services"
            viewAllLabel="View all services"
          />
          <Link href={flatLinks.results.href} className={desktopLink}>
            {flatLinks.results.label}
          </Link>
          <NavDropdown
            label="Tools"
            items={toolsDropdown}
            viewAllHref="/tools"
            viewAllLabel="All tools"
          />
          <Link href={flatLinks.blog.href} className={desktopLink}>
            {flatLinks.blog.label}
          </Link>
          <Link href={flatLinks.book.href} className={desktopLink}>
            {flatLinks.book.label}
          </Link>
          <Link href={flatLinks.contact.href} className={desktopLink}>
            {flatLinks.contact.label}
          </Link>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={`tel:${contact.phonePrimary.replaceAll(" ", "")}`}
            className="hidden items-center gap-2 rounded-full border border-border-subtle bg-surface px-4 py-2 text-sm font-semibold text-foreground/90 backdrop-blur-md transition hover:border-brand-soft/40 hover:text-brand-glow-text xl:inline-flex"
          >
            <span className="size-2 animate-pulse rounded-full bg-brand-soft" />
            {contact.phonePrimary}
          </a>
          <Link
            href="/book"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-brand-electric to-brand-soft px-5 text-sm font-bold text-white shadow-[0_6px_20px_rgba(125,60,152,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_26px_rgba(125,60,152,0.4)]"
          >
            Let&apos;s talk
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <button
          type="button"
          className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border border-[#d6dbdf] text-foreground lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div className={cn("max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-[#e4e7ea] bg-white/95 backdrop-blur-xl lg:hidden", open ? "block" : "hidden")}>
        <div className="mx-auto grid max-w-7xl gap-1 px-4 py-4 sm:px-6">
          <MobileLink href={flatLinks.home.href} label={flatLinks.home.label} onNavigate={() => setOpen(false)} />
          <MobileLink href={flatLinks.about.href} label={flatLinks.about.label} onNavigate={() => setOpen(false)} />
          <MobileAccordion
            label="Services"
            items={servicesDropdown}
            viewAllHref="/services"
            viewAllLabel="View all services"
            onNavigate={() => setOpen(false)}
          />
          <MobileLink href={flatLinks.results.href} label={flatLinks.results.label} onNavigate={() => setOpen(false)} />
          <MobileAccordion
            label="Tools"
            items={toolsDropdown}
            viewAllHref="/tools"
            viewAllLabel="All tools"
            onNavigate={() => setOpen(false)}
          />
          <MobileLink href={flatLinks.blog.href} label={flatLinks.blog.label} onNavigate={() => setOpen(false)} />
          <MobileLink href={flatLinks.book.href} label={flatLinks.book.label} onNavigate={() => setOpen(false)} />
          <MobileLink href={flatLinks.contact.href} label={flatLinks.contact.label} onNavigate={() => setOpen(false)} />

          <a
            href={`tel:${contact.phonePrimary.replaceAll(" ", "")}`}
            className="mt-2 flex items-center justify-center gap-2 rounded-2xl border border-border-subtle bg-surface px-4 py-3 text-sm font-semibold text-foreground"
          >
            <span className="size-2 animate-pulse rounded-full bg-brand-soft" />
            {contact.phonePrimary}
          </a>
          <Link
            href="/book"
            className="mt-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-electric to-brand-soft px-4 py-3 text-center text-sm font-bold text-white"
            onClick={() => setOpen(false)}
          >
            Let&apos;s talk
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function MobileLink({ href, label, onNavigate }: { href: string; label: string; onNavigate: () => void }) {
  return (
    <Link
      href={href}
      className="rounded-2xl px-4 py-3 text-sm font-semibold text-foreground hover:bg-[#f5f5f5]"
      onClick={onNavigate}
    >
      {label}
    </Link>
  );
}

function MobileAccordion({
  label,
  items,
  viewAllHref,
  viewAllLabel,
  onNavigate,
}: {
  label: string;
  items: DropdownItem[];
  viewAllHref: string;
  viewAllLabel: string;
  onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full cursor-pointer items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-foreground hover:bg-[#f5f5f5]"
      >
        {label}
        <ChevronDown className={cn("size-4 text-muted transition-transform duration-200", expanded && "rotate-180")} />
      </button>
      {expanded ? (
        <div className="mb-1 ml-3 border-l border-border-subtle pl-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-baseline gap-3 rounded-xl px-4 py-3 text-sm text-foreground/90 hover:bg-[#f5f5f5]"
              onClick={onNavigate}
            >
              <span className="text-xs font-medium tabular-nums text-muted">{item.number} ·</span>
              {item.label}
            </Link>
          ))}
          <Link
            href={viewAllHref}
            className="flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-[.15em] text-muted hover:text-brand-glow-text"
            onClick={onNavigate}
          >
            {viewAllLabel}
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}
