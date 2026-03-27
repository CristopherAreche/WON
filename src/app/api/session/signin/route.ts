import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "USE_SUPABASE_AUTH",
      message: "Sign in with Supabase from the web client and bootstrap won-api after auth.",
    },
    { status: 409 }
  );
}
