/** A normalized prospect candidate returned by any sourcing provider. */
export type ProspectCandidate = {
  company: string;
  domain?: string | null;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  source: "apollo" | "places";
  enrichment: Record<string, unknown>;
};

export type SourcingResult = {
  candidates: ProspectCandidate[];
  note?: string;
};
