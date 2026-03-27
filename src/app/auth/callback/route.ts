import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { bootstrapWonApiUser } from "@/lib/won-api-auth";
import { WON_SECURITY_TOKEN_COOKIE } from "@/lib/security-token";

function getSafeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/app/home";
  }

  return value;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = getSafeNext(requestUrl.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL("/auth/login", requestUrl.origin));
  }

  const supabase = await createSupabaseServerClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(new URL("/auth/login", requestUrl.origin));
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const accessToken = session?.access_token;
  if (!accessToken) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/auth/login", requestUrl.origin));
  }

  try {
    const bootstrap = await bootstrapWonApiUser(accessToken);
    const response = NextResponse.redirect(new URL(next, requestUrl.origin));

    if (bootstrap.securityToken) {
      response.cookies.set(WON_SECURITY_TOKEN_COOKIE, bootstrap.securityToken, {
        httpOnly: false,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 10 * 60,
      });
    }

    return response;
  } catch {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      new URL("/auth/login?message=link-account-error", requestUrl.origin)
    );
  }
}
