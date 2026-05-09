"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { navItems } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/92 text-white backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3" aria-label="SyncAi Technologies home">
          <Image
            src="/brand/syncai-logo-dark.png"
            alt="SyncAi logo"
            width={154}
            height={50}
            priority
            className="h-10 w-auto"
          />
          <span className="hidden text-[11px] font-bold uppercase tracking-[0.28em] text-purple-100/75 sm:inline">
            Technologies
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-200 transition hover:text-purple-200"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/admin/login"
            className="rounded-full px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
          >
            Admin
          </Link>
          <Link
            href="/contact"
            className="rounded-full bg-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_16px_40px_rgba(126,34,206,.28)] transition hover:bg-white hover:text-slate-950"
          >
            Book AI Strategy Call
          </Link>
        </div>

        <button
          type="button"
          className="grid size-11 place-items-center rounded-full border border-white/15 lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <div className={cn("border-t border-white/10 lg:hidden", open ? "block" : "hidden")}>
        <div className="mx-auto grid max-w-7xl gap-2 px-4 py-4 sm:px-6">
          {navItems.map((item) => (
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
            className="mt-2 rounded-2xl bg-purple-600 px-4 py-3 text-center text-sm font-bold text-white"
            onClick={() => setOpen(false)}
          >
            Book AI Strategy Call
          </Link>
        </div>
      </div>
    </header>
  );
}
