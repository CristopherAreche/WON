import { NextResponse } from "next/server";
import { z } from "zod";
import { buildWonApiUrl } from "@/lib/won-api-base";
import { writeWonApiSession } from "@/lib/won-api-session";

const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email("INVALID_EMAIL"),
  password: z.string().min(1, "PASSWORD_REQUIRED"),
});

function asRecord(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = signInSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "INVALID_INPUT" },
      { status: 400 }
    );
  }

  const response = await fetch(buildWonApiUrl("/api/auth/signin"), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "user-agent": request.headers.get("user-agent") || "",
      "x-forwarded-for": request.headers.get("x-forwarded-for") || "",
      "x-real-ip": request.headers.get("x-real-ip") || "",
    },
    body: JSON.stringify(parsed.data),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as unknown;
  const data = asRecord(payload);

  if (!response.ok) {
    return NextResponse.json(payload ?? { error: "SIGNIN_FAILED" }, {
      status: response.status,
    });
  }

  const session = asRecord(data?.session);
  if (
    !session ||
    typeof session.accessToken !== "string" ||
    typeof session.refreshToken !== "string"
  ) {
    return NextResponse.json(
      { error: "INVALID_SESSION_PAYLOAD" },
      { status: 502 }
    );
  }

  const nextResponse = NextResponse.json({
    ok: true,
    user: data?.user ?? null,
  });

  writeWonApiSession(nextResponse.cookies, {
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    userId: typeof session.userId === "string" ? session.userId : null,
  });

  return nextResponse;
}
