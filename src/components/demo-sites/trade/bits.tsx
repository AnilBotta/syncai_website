import type { ReactNode } from "react";
import {
  Check,
  ClipboardCheck,
  Droplets,
  Flame,
  ShowerHead,
  Siren,
  Star,
  Thermometer,
} from "lucide-react";
import type { TradeIcon } from "@/lib/demo-sites/trade";

/**
 * Small shared pieces for the bespoke trade site.
 *
 * Everything here paints CHARCOAL type on amber, never white. `--trade-amber`
 * is a high-vis signal colour (#f0a013): white on it measures about 1.7:1,
 * charcoal about 11:1.
 */

const ICONS: Record<TradeIcon, typeof Flame> = {
  siren: Siren,
  flame: Flame,
  droplets: Droplets,
  shower: ShowerHead,
  thermometer: Thermometer,
  clipboard: ClipboardCheck,
};

export function ServiceIcon({ name, className = "" }: { name: TradeIcon; className?: string }) {
  const Icon = ICONS[name];
  return <Icon className={className} aria-hidden />;
}

/** Filled amber stars out of five, with the count exposed to screen readers. */
export function StarRating({ value, className = "" }: { value: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      <span className="sr-only">{value} out of 5 stars</span>
      {[1, 2, 3, 4, 5].map((step) => (
        <Star
          key={step}
          aria-hidden
          className={
            step <= value
              ? "size-4 fill-[color:var(--trade-amber)] text-[color:var(--trade-amber)]"
              : "size-4 fill-transparent text-black/25"
          }
        />
      ))}
    </span>
  );
}

/** Amber tick against a line of copy. `light` for use on the charcoal panels. */
export function Tick({ children, light = false }: { children: string; light?: boolean }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-sm bg-[color:var(--trade-amber)]">
        <Check className="size-3.5 text-[color:var(--trade-ink)]" strokeWidth={3} aria-hidden />
      </span>
      <span className={`text-sm leading-6 ${light ? "text-white/80" : "text-muted"}`}>
        {children}
      </span>
    </li>
  );
}

/**
 * The phone number, set as the loudest thing available.
 *
 * This is the one piece of type on the whole site that outranks the headline,
 * which is exactly how real trade sites are built: the visitor's question is
 * "can someone come today", and the answer is a number they can press.
 */
export function PhoneNumber({
  phone,
  className = "",
  label,
}: {
  phone: string;
  className?: string;
  label?: string;
}) {
  return (
    <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className={`group block ${className}`}>
      {label ? (
        <span className="block text-[0.6875rem] font-bold uppercase tracking-[0.18em] opacity-70">
          {label}
        </span>
      ) : null}
      <span className="font-serif text-3xl leading-none tracking-tight transition group-hover:opacity-80 lg:text-[2.25rem]">
        {phone}
      </span>
    </a>
  );
}

/** Solid amber button, charcoal type. The primary action everywhere on the site. */
export function AmberButton({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`inline-flex h-12 items-center justify-center gap-2 bg-[color:var(--trade-amber)] px-6 text-sm font-bold uppercase tracking-[0.08em] text-[color:var(--trade-ink)] transition hover:bg-[color:var(--trade-amber-hot)] ${className}`}
    >
      {children}
    </a>
  );
}
