import { proxyWonApiRequest } from "@/lib/won-api-session";

export async function GET(request: Request) {
  return proxyWonApiRequest(request, {
    path: "/api/health/db",
  });
}
