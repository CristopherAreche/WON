export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

const MAX_IMAGE_DATA_URL_LENGTH = 1_600_000;

const updateProfileImageSchema = z.object({
  imageDataUrl: z
    .string()
    .max(MAX_IMAGE_DATA_URL_LENGTH, "PAYLOAD_TOO_LARGE")
    .regex(
      /^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/i,
      "INVALID_IMAGE"
    ),
});

async function resolveAuthenticatedUserId() {
  const session = await getServerSession(authOptions);
  const sessionUserId = (session?.user as { id?: string } | undefined)?.id;
  const sessionEmail = session?.user?.email ?? null;

  if (!sessionEmail && !sessionUserId) {
    return null;
  }

  if (sessionUserId) {
    return sessionUserId;
  }

  if (!sessionEmail) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: sessionEmail },
    select: { id: true },
  });

  return user?.id || null;
}

export async function PUT(request: Request) {
  try {
    const userId = await resolveAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const uploadRateLimit = rateLimit(`profile-image:user:${userId}`, {
      windowMs: 15 * 60 * 1000,
      maxRequests: 20,
    });

    if (!uploadRateLimit.allowed) {
      return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });
    }

    const body = await request.json();
    const parsed = updateProfileImageSchema.safeParse(body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0]?.message;
      const status = issue === "PAYLOAD_TOO_LARGE" ? 413 : 400;
      return NextResponse.json({ error: issue || "INVALID_IMAGE" }, { status });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        profileImageDataUrl: parsed.data.imageDataUrl,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[profile-image] PUT failed", error);
    return NextResponse.json({ error: "UPDATE_FAILED" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const userId = await resolveAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        profileImageDataUrl: null,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[profile-image] DELETE failed", error);
    return NextResponse.json({ error: "UPDATE_FAILED" }, { status: 500 });
  }
}
