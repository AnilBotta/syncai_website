import { contact } from "@/lib/site-data";

/** Digits-only number for wa.me ("+1 365-777-7336" -> "13657777336"). */
const digits = contact.phonePrimary.replace(/\D/g, "");

/**
 * A wa.me deep link that opens a WhatsApp chat to our number — works on both
 * mobile (opens the app) and desktop (opens WhatsApp Web / desktop app).
 * Optionally prefills the first message.
 */
export function whatsappHref(message?: string): string {
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
