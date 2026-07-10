import type { SupabaseClient } from "@supabase/supabase-js";
import type { Icp } from "@/lib/supabase";
import { searchApify } from "@/lib/sourcing/apify";
import { searchPlaces } from "@/lib/sourcing/places";
import { searchApollo } from "@/lib/sourcing/apollo";
import type { ProspectCandidate } from "@/lib/sourcing/types";

const MAX_PER_RUN = 25;

/**
 * Finds prospects for one active ICP. Tries the configured sourcing providers in
 * priority order and uses the FIRST that returns results — Apify (Google Maps,
 * can include emails) → Google Places (Maps, no emails) → Apollo (company
 * search). De-dupes and inserts as `found` prospects. Never emails anyone.
 */
export async function runScraper(supabase: SupabaseClient, icpId: string) {
  const { data: icp } = await supabase.from("icps").select("*").eq("id", icpId).single<Icp>();
  if (!icp) return { ok: false as const, error: "ICP not found." };

  const notes: string[] = [];
  const candidates: ProspectCandidate[] = [];

  // Search string for Maps-style providers: "<industry/keywords> in <location>".
  const placesQuery = [icp.keywords || icp.industry, icp.location ? `in ${icp.location}` : ""]
    .filter(Boolean)
    .join(" ")
    .trim();

  // Priority order — first provider that returns candidates wins. Each provider
  // self-checks its own key and returns an empty result + note when unconfigured.
  const providers: Array<{ name: string; run: () => Promise<{ candidates: ProspectCandidate[]; note?: string }> }> = [
    { name: "apify", run: () => searchApify(placesQuery, MAX_PER_RUN) },
    { name: "places", run: () => searchPlaces(placesQuery, MAX_PER_RUN) },
    {
      name: "apollo",
      run: () => searchApollo({ industry: icp.industry, location: icp.location, keywords: icp.keywords }, MAX_PER_RUN),
    },
  ];

  for (const provider of providers) {
    const result = await provider.run();
    if (result.note) notes.push(`${provider.name}: ${result.note}`);
    if (result.candidates.length) {
      candidates.push(...result.candidates);
      break;
    }
  }

  const { data: run } = await supabase
    .from("agent_runs")
    .insert({
      agent: "scraper",
      status: "running",
      input: { icpId, query: placesQuery },
      cost_usd: 0,
    })
    .select("id")
    .single();
  const runId: string | null = run?.id ?? null;

  // Skip candidates whose email already exists as a lead.
  const emails = candidates.map((c) => c.email).filter(Boolean) as string[];
  const existingEmails = new Set<string>();
  if (emails.length) {
    const { data: existing } = await supabase.from("leads").select("email").in("email", emails);
    for (const row of existing || []) existingEmails.add((row.email || "").toLowerCase());
  }

  const seenDomains = new Set<string>();
  const rows = candidates
    .filter((c) => {
      if (c.email && existingEmails.has(c.email.toLowerCase())) return false;
      if (c.domain) {
        if (seenDomains.has(c.domain)) return false;
        seenDomains.add(c.domain);
      }
      return true;
    })
    .slice(0, MAX_PER_RUN)
    .map((c) => ({
      icp_id: icpId,
      company: c.company,
      domain: c.domain ?? null,
      contact_name: c.contactName ?? null,
      email: c.email ?? null,
      phone: c.phone ?? null,
      source: c.source,
      enrichment: c.enrichment,
      status: "found" as const,
    }));

  let inserted = 0;
  if (rows.length) {
    // Ignore rows that collide with the (icp_id, domain) unique index from prior runs.
    const { data, error } = await supabase
      .from("prospects")
      .upsert(rows, { onConflict: "icp_id,domain", ignoreDuplicates: true })
      .select("id");
    if (error) {
      if (runId) {
        await supabase
          .from("agent_runs")
          .update({ status: "failed", finished_at: new Date().toISOString(), error: error.message })
          .eq("id", runId);
      }
      return { ok: false as const, error: error.message };
    }
    inserted = data?.length ?? 0;
  }

  if (runId) {
    await supabase
      .from("agent_runs")
      .update({
        status: "succeeded",
        finished_at: new Date().toISOString(),
        output: { inserted, found: candidates.length, notes },
      })
      .eq("id", runId);
  }

  const summary =
    inserted > 0
      ? `Found ${inserted} new prospect(s) for "${icp.name}".`
      : `No new prospects added for "${icp.name}".${notes.length ? " " + notes.join(" ") : ""}`;

  return { ok: true as const, inserted, found: candidates.length, notes, summary, runId };
}
