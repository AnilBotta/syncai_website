import { NextResponse } from "next/server";
import { getAvailableSlots, getBookableDays } from "@/lib/booking";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase";
import { availabilityQuerySchema } from "@/lib/validators";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ days: getBookableDays() });
  }

  const parsed = availabilityQuerySchema.safeParse({ date });

  if (!parsed.success) {
    return NextResponse.json({ error: "Provide a date as YYYY-MM-DD." }, { status: 400 });
  }

  try {
    const supabase = hasSupabaseAdminConfig() ? createSupabaseAdminClient() : null;
    const { slots, demoMode } = await getAvailableSlots(supabase, parsed.data.date);

    return NextResponse.json({
      date: parsed.data.date,
      slots,
      ...(demoMode ? { demoMode: true } : {}),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load availability." },
      { status: 500 }
    );
  }
}
