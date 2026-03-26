import { proxyWonApiRequest } from "@/lib/won-api-session";

export async function POST(request: Request) {
  return proxyWonApiRequest(request, {
    path: "/api/auth/forgot-password",
  });
}
