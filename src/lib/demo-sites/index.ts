import { dentalSite } from "./dental";
import { realEstateSite } from "./real-estate";
import { physioSite } from "./physio";
import type { DemoSite } from "./types";

export type { DemoSite, DemoProperty, DemoImageRef } from "./types";

/**
 * Registry of live demo sites. This doubles as the allowlist for the demo chat
 * route — an industry that isn't here gets a 404 rather than a free LLM.
 */
const SITES: Record<string, DemoSite> = {
  [dentalSite.slug]: dentalSite,
  [realEstateSite.slug]: realEstateSite,
  [physioSite.slug]: physioSite,
};

export function getDemoSite(slug: string): DemoSite | null {
  return SITES[slug] ?? null;
}

export function demoSiteSlugs() {
  return Object.keys(SITES);
}
