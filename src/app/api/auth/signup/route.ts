import { NextResponse } from "next/server";
import { buildWonApiUrl } from "@/lib/won-api-base";
import { writeWonApiSession } from "@/lib/won-api-session";

function asRecord(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

export async function POST(request: Request) {
  const body = await request.text();

  const response = await fetch(buildWonApiUrl("/api/auth/signup"), {
    method: "POST",
    headers: {
      "content-type": request.headers.get("content-type") || "application/json",
      "user-agent": request.headers.get("user-agent") || "",
      "x-forwarded-for": request.headers.get("x-forwarded-for") || "",
      "x-real-ip": request.headers.get("x-real-ip") || "",
    },
    body,
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as unknown;
  const data = asRecord(payload);

  if (!response.ok) {
    return NextResponse.json(payload ?? { error: "SIGNUP_FAILED" }, {
      status: response.status,
    });
  }

  const session = asRecord(data?.session);
  const user = asRecord(data?.user);
  const nextResponse = NextResponse.json({
    ok: true,
    userId:
      typeof user?.id === "string"
        ? user.id
        : typeof session?.userId === "string"
          ? session.userId
          : "",
    securityToken:
      typeof data?.securityToken === "string" ? data.securityToken : undefined,
  });

  if (
    session &&
    typeof session.accessToken === "string" &&
    typeof session.refreshToken === "string"
  ) {
    writeWonApiSession(nextResponse.cookies, {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      userId: typeof session.userId === "string" ? session.userId : null,
    });
  }

  return nextResponse;
}
