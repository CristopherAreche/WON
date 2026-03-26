import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  WON_ACCESS_TOKEN_COOKIE,
  WON_REFRESH_TOKEN_COOKIE,
} from "@/lib/session-constants";

export default function middleware(request: NextRequest) {
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/app") ||
    request.nextUrl.pathname.startsWith("/onboarding");

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const hasSession =
    Boolean(request.cookies.get(WON_ACCESS_TOKEN_COOKIE)?.value) ||
    Boolean(request.cookies.get(WON_REFRESH_TOKEN_COOKIE)?.value);

  if (hasSession) {
    return NextResponse.next();
  }

  const url = new URL("/auth/login", request.nextUrl.origin);
  url.searchParams.set("callbackUrl", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/app/:path*", "/onboarding/:path*"],
};
