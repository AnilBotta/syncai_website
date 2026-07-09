import { NextResponse } from "next/server";
import {
  createSupabaseAdminClient,
  hasSupabaseAdminConfig,
  type Prospect,
  verifyAdminToken,
} from "@/lib/supabase";
import { prospectUpdateSchema } from "@/lib/validators";
import { serverErrorResponse } from "@/lib/api-errors";

const demoProspects: Prospect[] = [
  {
    id: "demo-prospect-1",
    created_at: new Date().toISOString(),
    icp_id: "demo-icp-1",
    company: "Bright Smile Dental",
    domain: "brightsmile.example",
    contact_name: "Dr. Lee",
    email: null,
    phone: "+1 905-555-0100",
    source: "places",
    enrichment: { address: "Mississauga, ON" },
    status: "found",
    lead_id: null,
  },
];

export async function GET(request: Request) {
  const user = await verifyAdminToken(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ prospects: demoProspects, demoMode: true });
  }

  const url = new URL(request.url);
  const icpId = url.searchParams.get("icpId");

  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("prospects")
    .select("*")
    .neq("status", "discarded")
    .order("created_at", { ascending: false })
    .limit(200);
  if (icpId) query = query.eq("icp_id", icpId);

  const { data, error } = await query;
  if (error) return serverErrorResponse("admin/prospects:GET", error);
  return NextResponse.json({ prospects: data });
}

export async function PATCH(request: Request) {
  const user = await verifyAdminToken(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = prospectUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid prospect update." }, { status: 400 });

  if (!hasSupabaseAdminConfig()) return NextResponse.json({ ok: true, demoMode: true });

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("prospects")
    .update({ status: "discarded" })
    .eq("id", parsed.data.id);
  if (error) return serverErrorResponse("admin/prospects:PATCH", error);
  return NextResponse.json({ ok: true });
}
