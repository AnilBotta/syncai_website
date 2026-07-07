import { NextResponse } from "next/server";

/**
 * Logs the real error server-side and returns a generic message to the client.
 * Prevents leaking raw database/driver details (table names, constraints, etc.)
 * to the public.
 */
export function serverErrorResponse(context: string, error: unknown) {
  console.error(`[api:${context}]`, error instanceof Error ? error.message : error);
  return NextResponse.json(
    { error: "Something went wrong on our end. Please try again." },
    { status: 500 }
  );
}
