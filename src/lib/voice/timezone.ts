import { isValidTimezone } from "@/lib/booking";

/**
 * Maps a timezone the way a caller says it ("India", "Pacific time", "IST")
 * to an IANA identifier the booking code can actually use.
 *
 * Voice bookings default to Eastern; this only matters when a caller
 * volunteers that they're somewhere else. Deliberately keyed on how people
 * name zones out loud — cities, countries, and the common North-American
 * abbreviations — not on fixed-offset codes, so daylight saving still works.
 * Returns null when it can't confidently resolve one, so the caller falls
 * back to the business default rather than a wrong zone.
 */
export function spokenTimezoneToIana(input: string | null | undefined): string | null {
  if (!input) return null;

  // Compute the normalized form up front — the isValidTimezone type guard
  // narrows `input` to never on its false branch, so anything derived from it
  // afterward must already exist.
  const s = input.trim().toLowerCase().replace(/[.,]/g, "");

  // Already a valid IANA name ("America/Los_Angeles")? Trust it.
  if (isValidTimezone(input)) return input;

  // Whole-word / whole-phrase match, so a short code like "ast" can't fire on
  // "co-ast" or "e-ast-ern".
  const has = (p: string) => new RegExp(`\\b${p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(s);

  for (const [zone, patterns] of ZONES) {
    if (patterns.some(has)) return zone;
  }
  return null;
}

// Order matters: more specific phrases first (e.g. "central europe" before
// anything that could match "central"). Each entry is matched whole-word.
const ZONES: Array<[string, string[]]> = [
  ["America/Halifax", ["atlantic", "halifax", "ast", "adt"]],
  ["America/Toronto", ["eastern", "new york", "toronto", "ontario", "est", "edt", "et", "east coast"]],
  ["America/Chicago", ["central time", "central us", "chicago", "texas", "cst", "cdt", "ct"]],
  ["America/Denver", ["mountain", "denver", "colorado", "mst", "mdt"]],
  ["America/Phoenix", ["arizona", "phoenix"]],
  ["America/Los_Angeles", ["pacific", "los angeles", "california", "vancouver", "seattle", "san francisco", "pst", "pdt", "pt", "west coast"]],
  ["America/Anchorage", ["alaska", "anchorage"]],
  ["Pacific/Honolulu", ["hawaii", "honolulu"]],
  ["Europe/London", ["london", "britain", "england", "united kingdom", "uk", "gmt", "bst"]],
  ["Europe/Dublin", ["ireland", "dublin"]],
  ["Europe/Paris", ["central europe", "paris", "france", "berlin", "germany", "madrid", "spain", "rome", "italy", "amsterdam", "cet", "cest"]],
  ["Asia/Dubai", ["dubai", "abu dhabi", "uae", "emirates", "gulf", "gst"]],
  ["Asia/Karachi", ["pakistan", "karachi", "lahore", "islamabad", "pkt"]],
  ["Asia/Kolkata", ["india", "indian", "kolkata", "calcutta", "mumbai", "delhi", "bangalore", "bengaluru", "hyderabad", "chennai", "pune", "ist"]],
  ["Asia/Singapore", ["singapore"]],
  ["Asia/Manila", ["philippines", "manila"]],
  ["Asia/Tokyo", ["japan", "tokyo", "jst"]],
  ["Australia/Sydney", ["sydney", "melbourne", "australia eastern", "aest", "aedt"]],
];
