export const runtime = "nodejs";

import { proxyWonApiRequest } from "@/lib/won-api-session";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  const { planId } = await params;

  return proxyWonApiRequest(request, {
    path: `/api/workout/${planId}`,
    auth: true,
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  const { planId } = await params;

  return proxyWonApiRequest(request, {
    path: `/api/workout/${planId}`,
    auth: true,
  });
}
