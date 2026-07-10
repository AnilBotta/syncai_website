/**
 * Normalizes a human-entered phone number to E.164 (e.g. "+14165551234"), which
 * is what voice providers (Retell/Vapi) require. Focused on North American
 * numbers since the business is in Ontario, but preserves any number the user
 * already entered with a "+" country code.
 *
 * Returns null when the input can't be confidently turned into a valid number,
 * so callers can refuse the call with a clear message instead of dialing garbage.
 */
export function normalizePhoneE164(raw: string | null | undefined): string | null {
  if (!raw) return null;

  const trimmed = raw.trim();
  const hadPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");

  if (!digits) return null;

  // Already international (user typed a +). Trust the country code they gave.
  if (hadPlus) {
    // E.164 allows up to 15 digits; a country code makes the minimum ~8.
    if (digits.length < 8 || digits.length > 15) return null;
    return `+${digits}`;
  }

  // North American Numbering Plan: 10 digits -> add +1.
  if (digits.length === 10) {
    return `+1${digits}`;
  }

  // 11 digits starting with 1 -> already has the country code, just add +.
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  // Other lengths without a country code are ambiguous — refuse rather than guess.
  return null;
}

/** True if the number can be normalized to a dialable E.164 number. */
export function isDialable(raw: string | null | undefined): boolean {
  return normalizePhoneE164(raw) !== null;
}
