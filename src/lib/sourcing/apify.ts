import type { ProspectCandidate, SourcingResult } from "@/lib/sourcing/types";

const TOKEN = process.env.APIFY_TOKEN;
// Which Apify actor to run. Default is the fast, reliable Google Maps scraper
// (company + phone + website, no emails). For emails, set APIFY_ACTOR_ID to a
// contact-details actor like "lukaskrivka~google-maps-with-contact-details"
// (slower — it visits each website to extract emails).
const ACTOR_ID = process.env.APIFY_ACTOR_ID || "compass~crawler-google-places";
// Bound the run so it fits inside the serverless request budget.
const RUN_TIMEOUT_SECS = 100;

type ApifyItem = {
  title?: string;
  name?: string;
  website?: string;
  url?: string;
  domain?: string;
  phone?: string;
  phoneUnformatted?: string;
  email?: string;
  emails?: string[];
  address?: string;
  city?: string;
};

function domainFromUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * Runs an Apify Google Maps actor synchronously and maps the results to prospect
 * candidates. Labeled source "places" (it is Google Maps data). Emails are
 * included only when the configured actor extracts them. Degrades to an empty
 * result with a note when unconfigured or on error.
 */
export async function searchApify(query: string, limit = 15): Promise<SourcingResult> {
  if (!TOKEN) {
    return { candidates: [], note: "Apify is not configured (no APIFY_TOKEN)." };
  }
  if (!query) {
    return { candidates: [], note: "Apify needs an industry/keywords + location to search." };
  }

  const input = {
    searchStringsArray: [query],
    maxCrawledPlacesPerSearch: Math.min(limit, 10),
    language: "en",
    // Honored by contact-detail actors; ignored by the base Maps actor.
    scrapeContacts: true,
  };

  const url =
    `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items` +
    `?token=${TOKEN}&timeout=${RUN_TIMEOUT_SECS}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      return {
        candidates: [],
        note:
          response.status === 402
            ? "Apify rejected the run (402) — out of monthly credits."
            : `Apify error (${response.status}).`,
      };
    }

    const items = (await response.json()) as ApifyItem[];
    const candidates: ProspectCandidate[] = [];
    for (const it of items || []) {
      const company = it.title || it.name;
      if (!company) continue;
      const website = it.website || it.url || null;
      const email =
        it.email || (Array.isArray(it.emails) && it.emails.length ? it.emails[0] : null) || null;
      candidates.push({
        company,
        domain: it.domain || domainFromUrl(website),
        contactName: null,
        email,
        phone: it.phone || it.phoneUnformatted || null,
        source: "places",
        enrichment: {
          address: it.address || null,
          website,
          emails: Array.isArray(it.emails) ? it.emails : email ? [email] : [],
          via: "apify",
        },
      });
    }

    return { candidates, note: candidates.length ? undefined : "Apify returned no places for this search." };
  } catch (error) {
    return {
      candidates: [],
      note: error instanceof Error ? `Apify request failed: ${error.message}` : "Apify request failed.",
    };
  }
}
