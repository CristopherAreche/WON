export const runtime = "nodejs";

import { proxyWonApiRequest } from "@/lib/won-api-session";

export async function POST(request: Request) {
  return proxyWonApiRequest(request, {
    path: "/api/onboarding",
    auth: true,
  });
}
