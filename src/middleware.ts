import { NextResponse, type NextRequest } from "next/server";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

function isProtectedRoute(pathname: string) {
  return pathname.startsWith("/app") || pathname.startsWith("/onboarding");
}

function isApiRoute(pathname: string) {
  return pathname.startsWith("/api/");
}

export default async function middleware(request: NextRequest) {
  const { response, user } = await updateSupabaseSession(request);

  if (isApiRoute(request.nextUrl.pathname)) {
    return response;
  }

  if (!isProtectedRoute(request.nextUrl.pathname)) {
    return response;
  }

  if (user) {
    return response;
  }

  const url = new URL("/auth/login", request.nextUrl.origin);
  url.searchParams.set("callbackUrl", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/app/:path*",
    "/onboarding/:path*",
    "/api/:path*",
  ],
};
