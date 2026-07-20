/**
 * One-off data cleanup: normalize the spoken-form emails that voice bookings
 * stored before the normalizeSpokenEmail fix. Reuses the exact same function
 * the live routes now use, so the repair matches the fix.
 *
 * Read-only by default. Pass --apply to actually write.
 *   npx tsx scripts/cleanup-spoken-emails.ts          (dry run)
 *   npx tsx scripts/cleanup-spoken-emails.ts --apply  (writes)
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { normalizeSpokenEmail, looksLikeEmail } from "@/lib/voice/normalize-email";

const APPLY = process.argv.includes("--apply");

// Pull Supabase creds straight from .env.local (not committed).
const env: Record<string, string> = {};
for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Missing Supabase creds in .env.local");

const supabase = createClient(url, key, { auth: { persistSession: false } });

type Row = { id: string; name: string | null; email: string };

async function fixTable(table: "leads" | "appointments") {
  // A real email never contains a space — that's the malformed-row filter.
  const { data, error } = await supabase.from(table).select("id, name, email").like("email", "% %");
  if (error) throw error;
  const rows = (data ?? []) as Row[];
  console.log(`\n== ${table}: ${rows.length} malformed ==`);

  for (const row of rows) {
    const fixed = normalizeSpokenEmail(row.email);
    const ok = looksLikeEmail(fixed);
    console.log(`  ${row.name ?? "?"}: ${JSON.stringify(row.email)} -> ${JSON.stringify(fixed)}${ok ? "" : "  [!! still not email — SKIP]"}`);
    if (!ok || fixed === row.email) continue;
    if (APPLY) {
      const { error: upErr } = await supabase.from(table).update({ email: fixed }).eq("id", row.id);
      if (upErr) console.log(`     update failed: ${upErr.message}`);
      else console.log(`     updated`);
    }
  }
}

async function main() {
  await fixTable("leads");
  await fixTable("appointments");
  console.log(APPLY ? "\nDONE (applied)" : "\nDRY RUN — re-run with --apply to write");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
