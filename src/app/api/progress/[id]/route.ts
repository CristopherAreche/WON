import { proxyWonApiRequest } from "@/lib/won-api-session";
export const runtime = "nodejs";
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyWonApiRequest(request, { path: `/api/progress/${encodeURIComponent(id)}`, auth: true });
}
