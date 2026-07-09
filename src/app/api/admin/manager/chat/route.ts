import { NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/supabase";
import { managerChatSchema } from "@/lib/validators";
import { runManager } from "@/lib/agents/manager";
import { serverErrorResponse } from "@/lib/api-errors";

// Agent runs can chain several tool calls; give it room.
export const maxDuration = 120;

export async function POST(request: Request) {
  const user = await verifyAdminToken(request.headers.get("authorization"));

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = managerChatSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid chat request." }, { status: 400 });
  }

  try {
    const result = await runManager(parsed.data.messages, { threadKey: "dashboard" });
    return NextResponse.json(result);
  } catch (error) {
    return serverErrorResponse("admin/manager/chat:POST", error);
  }
}
