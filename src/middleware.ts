import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    const isApp = req.nextUrl.pathname.startsWith("/app");
    if (isApp && !req.nextauth.token) {
      const url = new URL("/auth/login", req.nextUrl.origin);
      url.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return Response.redirect(url);
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/app/:path*"],
};
