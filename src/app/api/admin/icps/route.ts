import { NextResponse } from "next/server";
import {
  createSupabaseAdminClient,
  hasSupabaseAdminConfig,
  type Icp,
  verifyAdminToken,
} from "@/lib/supabase";
import { icpCreateSchema, icpUpdateSchema } from "@/lib/validators";
import { serverErrorResponse } from "@/lib/api-errors";

const demoIcps: Icp[] = [
  {
    id: "demo-icp-1",
    created_at: new Date().toISOString(),
    name: "Dental clinics — Mississauga",
    industry: "Dental clinic",
    location: "Mississauga, ON",
    company_size: "5-50",
    keywords: "dental clinic",
    status: "active",
    source: "ceo",
    rationale: null,
  },
];

export async function GET(request: Request) {
  const user = await verifyAdminToken(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ icps: demoIcps, demoMode: true });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("icps").select("*").order("created_at", { ascending: false });
  if (error) return serverErrorResponse("admin/icps:GET", error);
  return NextResponse.json({ icps: data });
}

export async function POST(request: Request) {
  const user = await verifyAdminToken(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = icpCreateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid ICP." }, { status: 400 });

  if (!hasSupabaseAdminConfig()) return NextResponse.json({ ok: true, demoMode: true });

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("icps")
    .insert({
      name: parsed.data.name,
      industry: parsed.data.industry || null,
      location: parsed.data.location || null,
      company_size: parsed.data.companySize || null,
      keywords: parsed.data.keywords || null,
      status: parsed.data.status,
      source: "ceo",
    })
    .select()
    .single();
  if (error) return serverErrorResponse("admin/icps:POST", error);
  return NextResponse.json({ icp: data });
}

export async function PATCH(request: Request) {
  const user = await verifyAdminToken(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = icpUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid ICP update." }, { status: 400 });

  if (!hasSupabaseAdminConfig()) return NextResponse.json({ ok: true, demoMode: true });

  const update: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) update.name = parsed.data.name;
  if (parsed.data.industry !== undefined) update.industry = parsed.data.industry || null;
  if (parsed.data.location !== undefined) update.location = parsed.data.location || null;
  if (parsed.data.companySize !== undefined) update.company_size = parsed.data.companySize || null;
  if (parsed.data.keywords !== undefined) update.keywords = parsed.data.keywords || null;
  if (parsed.data.status !== undefined) update.status = parsed.data.status;

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("icps").update(update).eq("id", parsed.data.id);
  if (error) return serverErrorResponse("admin/icps:PATCH", error);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const user = await verifyAdminToken(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  if (!hasSupabaseAdminConfig()) return NextResponse.json({ ok: true, demoMode: true });

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("icps").delete().eq("id", id);
  if (error) return serverErrorResponse("admin/icps:DELETE", error);
  return NextResponse.json({ ok: true });
}
