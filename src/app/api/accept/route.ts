import { NextResponse } from "next/server";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase";
import { acceptDocument } from "@/lib/documents";

/** Public endpoint the accept page posts to when a lead clicks "I accept". */
export async function POST(request: Request) {
  let token = "";
  try {
    const body = await request.json();
    token = typeof body?.token === "string" ? body.token : "";
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  if (!token) return NextResponse.json({ error: "Missing token." }, { status: 400 });

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ ok: true, demoMode: true });
  }

  // Best-effort client IP for the signature record.
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : request.headers.get("x-real-ip");

  const supabase = createSupabaseAdminClient();
  const result = await acceptDocument(supabase, token, ip);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, alreadyAccepted: result.alreadyAccepted });
}
