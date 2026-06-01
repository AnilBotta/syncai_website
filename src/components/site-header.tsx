"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "What We Do", href: "/#what-we-do" },
  { label: "Solutions", href: "/#solutions" },
  { label: "How It Works", href: "/#process" },
  { label: "Results", href: "/#results" },
  { label: "Contact", href: "/#contact" },
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
          ? "bg-[#0f0f1a]/85 shadow-lg shadow-black/20 backdrop-blur-xl"
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
              className="text-sm font-medium text-slate-300 transition hover:text-[#9400D3]"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="inline-flex h-11 items-center rounded-full bg-gradient-to-r from-[#4B0082] to-[#9400D3] px-5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(75,0,130,0.35)] transition hover:opacity-90"
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
              className="rounded-2xl px-4 py-3 text-sm font-semibold text-slate-100 hover:bg-white/10"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="mt-2 rounded-2xl bg-gradient-to-r from-[#4B0082] to-[#9400D3] px-4 py-3 text-center text-sm font-bold text-white"
            onClick={() => setOpen(false)}
          >
            Book a Strategy Call
          </Link>
        </div>
      </div>
    </header>
  );
}
