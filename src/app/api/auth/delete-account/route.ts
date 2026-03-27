export const runtime = "nodejs";

import { NextResponse } from "next/server";
import {
  requestWonApiWithSession,
} from "@/lib/won-api-session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getWonApiConfigErrorDetails } from "@/lib/won-api-base";

export async function POST(request: Request) {
  let result;

  try {
    result = await requestWonApiWithSession("/api/auth/delete-account", {
      method: "DELETE",
      body: await request.text(),
      headers: request.headers,
      requestUrl: request.url,
    });
  } catch (error) {
    const configError = getWonApiConfigErrorDetails(error);
    if (configError) {
      return NextResponse.json(configError.body, { status: configError.status });
    }

    throw error;
  }

  if (result.response.ok) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  return NextResponse.json(
    result.data ?? (result.response.ok ? { ok: true } : { error: "DELETE_ACCOUNT_FAILED" }),
    { status: result.response.status }
  );
}
