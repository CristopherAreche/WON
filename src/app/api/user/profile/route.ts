export const runtime = "nodejs";

import { proxyWonApiRequest } from "@/lib/won-api-session";

export async function PATCH(request: Request) {
  return proxyWonApiRequest(request, {
    path: "/api/user/profile",
    auth: true,
  });
}
