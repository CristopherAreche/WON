export const runtime = "nodejs";

import { proxyWonApiRequest } from "@/lib/won-api-session";

export async function PUT(request: Request) {
  return proxyWonApiRequest(request, {
    path: "/api/user/profile-image",
    auth: true,
  });
}

export async function DELETE(request: Request) {
  return proxyWonApiRequest(request, {
    path: "/api/user/profile-image",
    auth: true,
  });
}
