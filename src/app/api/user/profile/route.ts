export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const KG_PER_LB = 0.45359237;
const CM_PER_FOOT = 30.48;
const MIN_WEIGHT_KG = 1 * KG_PER_LB;
const MAX_WEIGHT_KG = 1400 * KG_PER_LB;
const MIN_HEIGHT_CM = 2 * CM_PER_FOOT;
const MAX_HEIGHT_CM = 9.917 * CM_PER_FOOT;

const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .refine(
      (val) => /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]{2,50}$/.test(val),
      "Name can only contain letters and spaces"
    ),
  dateOfBirth: z.coerce
    .date()
    .refine((value) => !Number.isNaN(value.getTime()), "Invalid date of birth")
    .refine((value) => value <= new Date(), "Date of birth cannot be in the future"),
  weightKg: z.coerce
    .number()
    .min(MIN_WEIGHT_KG, "Weight is too low")
    .max(MAX_WEIGHT_KG, "Weight is too high"),
  heightCm: z.coerce
    .number()
    .min(MIN_HEIGHT_CM, "Height is too low")
    .max(MAX_HEIGHT_CM, "Height is too high"),
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

export async function PATCH(request: Request) {
  try {
    const userId = await resolveAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    const normalizedName = parsed.data.name.trim().replace(/\s+/g, " ");
    const currentWeight = parsed.data.weightKg / KG_PER_LB;
    const height = parsed.data.heightCm / CM_PER_FOOT;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { name: normalizedName },
      }),
      prisma.onboardingAnswers.update({
        where: { userId },
        data: {
          dateOfBirth: parsed.data.dateOfBirth,
          currentWeight,
          height,
        },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[profile] PATCH failed", error);
    return NextResponse.json({ error: "PROFILE_UPDATE_FAILED" }, { status: 500 });
  }
}
