import { proxyWonApiRequest } from "@/lib/won-api-session";
export const runtime = "nodejs";
export async function GET(request: Request) {
  return proxyWonApiRequest(request, { path: "/api/progress", auth: true });
}
export async function POST(request: Request) {
  return proxyWonApiRequest(request, { path: "/api/progress", auth: true });
}
