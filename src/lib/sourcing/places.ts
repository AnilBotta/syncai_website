import type { ProspectCandidate, SourcingResult } from "@/lib/sourcing/types";

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";

type PlacesResponse = {
  places?: Array<{
    displayName?: { text?: string };
    formattedAddress?: string;
    websiteUri?: string;
    nationalPhoneNumber?: string;
    internationalPhoneNumber?: string;
  }>;
};

function domainFromUrl(url?: string): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * Finds local businesses via the Google Places API (New) Text Search.
 * Great for local-service niches (clinics, law firms, restaurants). Returns
 * company + website + phone — Places does not expose email addresses.
 * Degrades to an empty result with a note when no API key is set.
 */
export async function searchPlaces(query: string, limit = 20): Promise<SourcingResult> {
  if (!API_KEY) {
    return { candidates: [], note: "Google Places is not configured (no GOOGLE_PLACES_API_KEY)." };
  }

  try {
    const response = await fetch(SEARCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask":
          "places.displayName,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber,places.internationalPhoneNumber",
      },
      body: JSON.stringify({ textQuery: query, maxResultCount: Math.min(limit, 20) }),
    });

    if (!response.ok) {
      return { candidates: [], note: `Places API error (${response.status}).` };
    }

    const data = (await response.json()) as PlacesResponse;
    const candidates: ProspectCandidate[] = (data.places || [])
      .filter((p) => p.displayName?.text)
      .map((p) => ({
        company: p.displayName!.text!,
        domain: domainFromUrl(p.websiteUri),
        contactName: null,
        email: null,
        phone: p.nationalPhoneNumber || p.internationalPhoneNumber || null,
        source: "places" as const,
        enrichment: {
          address: p.formattedAddress || null,
          website: p.websiteUri || null,
        },
      }));

    return { candidates };
  } catch (error) {
    return {
      candidates: [],
      note: error instanceof Error ? `Places request failed: ${error.message}` : "Places request failed.",
    };
  }
}
