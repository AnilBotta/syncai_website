/**
 * Turns a spoken-out email into a real address.
 *
 * Voice callers spell their email aloud ("anil dot botta at the rate g mail
 * dot com"), and the tool-calling model passes that transcription straight
 * through. Stored verbatim it's undeliverable — the confirmation email bounces
 * and the address can't dedupe against the same person's other records. This
 * converts the spoken markers back into an address before we save it.
 *
 * Conservative: if the input already looks like a normal address it's returned
 * essentially untouched (just trimmed + lowercased), and if normalization can't
 * produce something email-shaped the best-effort result is returned anyway —
 * it's never worse than the spoken form.
 */
export function normalizeSpokenEmail(raw: string | null | undefined): string {
  if (!raw) return "";
  let s = raw.trim().toLowerCase();

  // Spoken "@". Only when there's no real "@" yet, so a clean address is left
  // alone. Longest phrasings first.
  if (!s.includes("@")) {
    s = s
      .replace(/\s+at\s+the\s+rate\s+(of\s+)?/g, "@")
      .replace(/\s+at\s+rate\s+/g, "@")
      .replace(/\s+at\s+/g, "@");
  }

  s = s
    .replace(/\s+dot\s+/g, ".")
    .replace(/\s+underscore\s+/g, "_")
    .replace(/\s+(dash|hyphen)\s+/g, "-")
    .replace(/\s+plus\s+/g, "+");

  // Providers people say as two words: "g mail" / "g-mail" -> "gmail", etc.
  s = s
    .replace(/@\s*g[\s-]?mail\s*\./, "@gmail.")
    .replace(/@\s*hot[\s-]?mail\s*\./, "@hotmail.")
    .replace(/@\s*out[\s-]?look\s*\./, "@outlook.")
    .replace(/@\s*y[\s-]?mail\s*\./, "@ymail.")
    .replace(/@\s*i[\s-]?cloud\s*\./, "@icloud.")
    .replace(/@\s*proton[\s-]?mail\s*\./, "@protonmail.");

  // Drop any remaining whitespace and trailing sentence punctuation.
  s = s.replace(/\s+/g, "").replace(/[.,;:!?]+$/, "");

  return s;
}

/** Whether a string is a plausibly-deliverable email address. */
export function looksLikeEmail(value: string | null | undefined): boolean {
  if (!value) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}
