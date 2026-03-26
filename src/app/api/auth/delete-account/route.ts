export const runtime = "nodejs";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  clearWonApiSession,
  readWonApiSession,
  requestWonApiWithSession,
} from "@/lib/won-api-session";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = readWonApiSession(cookieStore);
  const result = await requestWonApiWithSession("/api/auth/delete-account", {
    method: "POST",
    body: await request.text(),
    headers: request.headers,
    session,
  });

  const response = NextResponse.json(
    result.data ?? (result.response.ok ? { ok: true } : { error: "DELETE_ACCOUNT_FAILED" }),
    { status: result.response.status }
  );

  if (result.response.ok || result.shouldClearSession) {
    clearWonApiSession(response.cookies);
  }

  return response;
}
