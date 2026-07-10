import { NextResponse } from "next/server";
import { createSupabaseAdminClient, hasSupabaseAdminConfig, verifyAdminToken } from "@/lib/supabase";
import { documentCreateSchema, documentUpdateSchema } from "@/lib/validators";
import { runDocument } from "@/lib/agents/document";
import { serverErrorResponse } from "@/lib/api-errors";

// Document generation calls OpenAI; give it room.
export const maxDuration = 120;

export async function GET(request: Request) {
  const user = await verifyAdminToken(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ documents: [], demoMode: true });
  }

  const url = new URL(request.url);
  const leadId = url.searchParams.get("leadId");

  const supabase = createSupabaseAdminClient();
  let query = supabase.from("documents").select("*").order("created_at", { ascending: false }).limit(100);
  if (leadId) query = query.eq("lead_id", leadId);
  const { data, error } = await query;

  if (error) return serverErrorResponse("admin/documents:GET", error);
  return NextResponse.json({ documents: data });
}

export async function POST(request: Request) {
  const user = await verifyAdminToken(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = documentCreateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid document request." }, { status: 400 });

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ ok: true, demoMode: true, message: "Documents are offline in demo mode." });
  }

  const supabase = createSupabaseAdminClient();
  try {
    const result = await runDocument(supabase, {
      leadId: parsed.data.leadId,
      type: parsed.data.type,
      instruction: parsed.data.instruction || undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    return serverErrorResponse("admin/documents:POST", error);
  }
}

export async function PATCH(request: Request) {
  const user = await verifyAdminToken(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = documentUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid document update." }, { status: 400 });

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ ok: true, demoMode: true });
  }

  const supabase = createSupabaseAdminClient();
  // Only draft documents can be edited (before they're sent to the lead).
  const { data: doc } = await supabase
    .from("documents")
    .select("status")
    .eq("id", parsed.data.id)
    .single<{ status: string }>();
  if (!doc) return NextResponse.json({ error: "Document not found." }, { status: 404 });
  if (doc.status !== "draft") {
    return NextResponse.json({ error: "Only draft documents can be edited." }, { status: 409 });
  }

  const update: Record<string, unknown> = {};
  if (typeof parsed.data.title === "string") update.title = parsed.data.title;
  if (typeof parsed.data.contentMd === "string") update.content_md = parsed.data.contentMd;

  const { error } = await supabase.from("documents").update(update).eq("id", parsed.data.id);
  if (error) return serverErrorResponse("admin/documents:PATCH", error);
  return NextResponse.json({ ok: true });
}
