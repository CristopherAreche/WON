import { NextResponse } from "next/server";
import { clearWonApiSession } from "@/lib/won-api-session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearWonApiSession(response.cookies);
  return response;
}
