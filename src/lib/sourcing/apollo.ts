import type { ProspectCandidate, SourcingResult } from "@/lib/sourcing/types";

const API_KEY = process.env.APOLLO_API_KEY;
// Organization (company) search — available on Apollo's free API tier.
// People search (mixed_people/api_search), which returns verified personal
// emails, is gated to paid plans. So we discover companies here; contact emails
// come from a paid Apollo plan, Google Places phone numbers, or inbound leads.
const SEARCH_URL = "https://api.apollo.io/api/v1/organizations/search";

type ApolloOrg = {
  name?: string;
  website_url?: string;
  primary_domain?: string;
  phone?: string;
  primary_phone?: { number?: string };
};

type ApolloResponse = { organizations?: ApolloOrg[]; accounts?: ApolloOrg[] };

/**
 * Finds companies via Apollo's organization search (free-tier accessible).
 * Returns company + domain + phone; no personal emails (that needs a paid plan).
 * Degrades to an empty result with a note when unconfigured or on error.
 */
export async function searchApollo(
  params: { industry?: string | null; location?: string | null; keywords?: string | null },
  limit = 20,
): Promise<SourcingResult> {
  if (!API_KEY) {
    return { candidates: [], note: "Apollo is not configured (no APOLLO_API_KEY)." };
  }

  const body: Record<string, unknown> = { page: 1, per_page: Math.min(limit, 25) };
  if (params.location) body.organization_locations = [params.location];
  const keywords = [params.keywords, params.industry].filter(Boolean).join(" ").trim();
  if (keywords) body.q_organization_keyword_tags = [keywords];

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
      return {
        candidates: [],
        note:
          response.status === 403
            ? "Apollo rejected the request (403) — company search may need a paid plan or you're out of credits."
            : `Apollo API error (${response.status}).`,
      };
    }

    const data = (await response.json()) as ApolloResponse;
    const orgs = data.organizations || data.accounts || [];
    const candidates: ProspectCandidate[] = [];
    for (const o of orgs) {
      if (!o.name) continue;
      candidates.push({
        company: o.name,
        domain: o.primary_domain || null,
        contactName: null,
        email: null,
        phone: o.phone || o.primary_phone?.number || null,
        source: "apollo",
        enrichment: { website: o.website_url || null },
      });
    }

    return { candidates, note: candidates.length ? undefined : "Apollo returned no companies for this search." };
  } catch (error) {
    return {
      candidates: [],
      note: error instanceof Error ? `Apollo request failed: ${error.message}` : "Apollo request failed.",
    };
  }
}
