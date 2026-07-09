import type { ProspectCandidate, SourcingResult } from "@/lib/sourcing/types";

const API_KEY = process.env.APOLLO_API_KEY;
const SEARCH_URL = "https://api.apollo.io/api/v1/mixed_people/search";

type ApolloPerson = {
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string | null;
  organization?: { name?: string; website_url?: string; primary_domain?: string; phone?: string };
  account?: { name?: string; domain?: string };
  title?: string;
};

type ApolloResponse = { people?: ApolloPerson[] };

/**
 * Finds B2B contacts via Apollo's people search. Apollo provides verified
 * business emails (subject to plan credits). Degrades to an empty result with
 * a note when no API key is set or the request fails.
 *
 * `personTitles` narrows to decision-makers (owner, manager, director…).
 */
export async function searchApollo(
  params: { industry?: string | null; location?: string | null; keywords?: string | null; personTitles?: string[] },
  limit = 20,
): Promise<SourcingResult> {
  if (!API_KEY) {
    return { candidates: [], note: "Apollo is not configured (no APOLLO_API_KEY)." };
  }

  const body: Record<string, unknown> = {
    page: 1,
    per_page: Math.min(limit, 25),
  };
  if (params.location) body.person_locations = [params.location];
  if (params.keywords || params.industry) {
    body.q_keywords = [params.keywords, params.industry].filter(Boolean).join(" ");
  }
  body.person_titles = params.personTitles?.length
    ? params.personTitles
    : ["owner", "founder", "ceo", "managing director", "director", "manager"];

  try {
    const response = await fetch(SEARCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "X-Api-Key": API_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return { candidates: [], note: `Apollo API error (${response.status}).` };
    }

    const data = (await response.json()) as ApolloResponse;
    const candidates: ProspectCandidate[] = [];
    for (const p of data.people || []) {
      const company = p.organization?.name || p.account?.name;
      if (!company) continue;
      const name = p.name || [p.first_name, p.last_name].filter(Boolean).join(" ") || null;
      candidates.push({
        company,
        domain: p.organization?.primary_domain || p.account?.domain || null,
        contactName: name,
        // Apollo often masks the email until "revealed"; keep whatever it returns.
        email: p.email && !p.email.includes("email_not_unlocked") ? p.email : null,
        phone: p.organization?.phone || null,
        source: "apollo",
        enrichment: { title: p.title || null, website: p.organization?.website_url || null },
      });
    }

    return { candidates };
  } catch (error) {
    return {
      candidates: [],
      note: error instanceof Error ? `Apollo request failed: ${error.message}` : "Apollo request failed.",
    };
  }
}
