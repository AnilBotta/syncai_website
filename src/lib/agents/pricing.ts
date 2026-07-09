/**
 * Approximate OpenAI prices in USD per 1M tokens, used only to estimate agent
 * run cost for the daily budget guard and the spend indicator — not for billing.
 * Update these if OpenAI changes pricing; unknown models fall back to gpt-4.1-mini.
 */
const PRICES: Record<string, { in: number; out: number }> = {
  "gpt-4.1-mini": { in: 0.4, out: 1.6 },
  "gpt-4.1": { in: 2.0, out: 8.0 },
  "gpt-4.1-nano": { in: 0.1, out: 0.4 },
  "gpt-4o-mini": { in: 0.15, out: 0.6 },
  "gpt-4o": { in: 2.5, out: 10.0 },
};

const FALLBACK = PRICES["gpt-4.1-mini"];

/** Estimated USD cost for a run, given the model and token counts. */
export function estimateCost(model: string, tokensIn: number, tokensOut: number): number {
  const price = PRICES[model] ?? FALLBACK;
  const cost = (tokensIn / 1_000_000) * price.in + (tokensOut / 1_000_000) * price.out;
  // Round to 4 decimals to match the numeric(10,4) column.
  return Math.round(cost * 10_000) / 10_000;
}
