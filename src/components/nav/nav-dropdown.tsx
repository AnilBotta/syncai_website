"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import type { DropdownItem } from "@/lib/nav-data";

type NavDropdownProps = {
  label: string;
  items: DropdownItem[];
  viewAllHref: string;
  viewAllLabel: string;
};

/**
 * Hover/focus-triggered nav dropdown (desktop). Opens on pointer-enter or
 * keyboard focus within, closes on pointer-leave, Escape, or item click.
 */
export function NavDropdown({ label, items, viewAllHref, viewAllLabel }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const closeTimer = useRef<number | null>(null);

  function show() {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpen(true);
  }

  function scheduleHide() {
    closeTimer.current = window.setTimeout(() => setOpen(false), 120);
  }

  return (
    <div
      className="relative"
      onPointerEnter={show}
      onPointerLeave={scheduleHide}
      onFocus={show}
      onBlur={(event) => {
        // Close only when focus leaves the trigger AND the panel.
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-muted transition hover:text-brand-glow-text"
      >
        {label}
        <ChevronDown className={`size-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={panelId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 top-full z-50 w-[300px] pt-3"
          >
            <div className="overflow-hidden rounded-xl border border-border-subtle bg-bg-elevated/98 shadow-[0_12px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl">
              <ul className="py-2">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-baseline gap-3 px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-[#f5f5f5] hover:text-brand-glow-text"
                    >
                      <span className="text-xs font-medium tabular-nums text-muted">
                        {item.number} ·
                      </span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="border-t border-border-subtle">
                <Link
                  href={viewAllHref}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-5 py-3.5 text-xs font-bold uppercase tracking-[.15em] text-muted transition hover:text-brand-glow-text"
                >
                  {viewAllLabel}
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
