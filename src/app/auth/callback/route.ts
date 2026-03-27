import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { bootstrapWonApiUser } from "@/lib/won-api-auth";
import { WON_SECURITY_TOKEN_COOKIE } from "@/lib/security-token";

type AuthSource = "login" | "signup";

function getSafeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/app/home";
  }

  return value;
}

function getSafeSource(value: string | null): AuthSource {
  return value === "signup" ? "signup" : "login";
}

function buildReturnUrl(requestUrl: URL, source: AuthSource, next: string, message: string) {
  const pathname = source === "signup" ? "/auth/signup" : "/auth/login";
  const url = new URL(pathname, requestUrl.origin);
  url.searchParams.set("message", message);

  if (source === "login" && next !== "/app/home") {
    url.searchParams.set("callbackUrl", next);
  }

  return url;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = getSafeNext(requestUrl.searchParams.get("next"));
  const source = getSafeSource(requestUrl.searchParams.get("source"));
  const providerError = requestUrl.searchParams.get("error");

  if (providerError) {
    const message = providerError === "access_denied" ? "google-auth-cancelled" : "google-auth-failed";
    return NextResponse.redirect(buildReturnUrl(requestUrl, source, next, message));
  }

  if (!code) {
    return NextResponse.redirect(buildReturnUrl(requestUrl, source, next, "missing-auth-code"));
  }

  const supabase = await createSupabaseServerClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    await supabase.auth.signOut();
    return NextResponse.redirect(buildReturnUrl(requestUrl, source, next, "google-auth-failed"));
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const accessToken = session?.access_token;
  if (!accessToken) {
    await supabase.auth.signOut();
    return NextResponse.redirect(buildReturnUrl(requestUrl, source, next, "missing-auth-code"));
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
    return NextResponse.redirect(buildReturnUrl(requestUrl, source, next, "link-account-error"));
  }
}
