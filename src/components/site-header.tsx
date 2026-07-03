"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Showcase", href: "/demos" },
  { label: "Industries", href: "/industries" },
  { label: "Process", href: "/process" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contact", href: "/contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-bg-deep/85 shadow-lg shadow-black/40 backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3" aria-label="SyncAI Technology home">
          <Image
            src="/brand/syncai-logo-dark.png"
            alt="SyncAI logo"
            width={154}
            height={50}
            priority
            className="h-10 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted transition hover:text-brand-glow-text"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/book"
            className="inline-flex h-11 items-center rounded-full bg-gradient-to-r from-brand-electric to-brand-soft px-5 text-sm font-bold text-white shadow-[0_0_24px_rgba(160,120,255,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_0_36px_rgba(160,120,255,0.45)]"
          >
            Book a Strategy Call
          </Link>
        </nav>

        <button
          type="button"
          className="grid size-11 place-items-center rounded-full border border-white/15 text-white lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <div className={cn("border-t border-white/10 lg:hidden", open ? "block" : "hidden")}>
        <div className="mx-auto grid max-w-7xl gap-2 px-4 py-4 sm:px-6">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl px-4 py-3 text-sm font-semibold text-foreground hover:bg-surface"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/book"
            className="mt-2 rounded-2xl bg-gradient-to-r from-brand-electric to-brand-soft px-4 py-3 text-center text-sm font-bold text-white"
            onClick={() => setOpen(false)}
          >
            Book a Strategy Call
          </Link>
        </div>
      </div>
    </header>
  );
}
