export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const goalSchema = z.enum([
  "fat_loss",
  "hypertrophy",
  "strength",
  "returning",
  "general_health",
]);

const experienceSchema = z.enum([
  "beginner",
  "three_to_twelve_months",
  "one_to_three_years",
  "three_years_plus",
]);

const equipmentSchema = z.enum([
  "bodyweight",
  "bands",
  "dumbbells",
  "barbell",
  "machines",
]);

const locationSchema = z.enum(["home", "gym", "park"]);

const onboardingSchema = z.object({
  userId: z.string().min(1).optional(),
  fullName: z
    .string()
    .min(2, "fullName is required")
    .max(50, "fullName must be <= 50 chars"),
  dateOfBirth: z.coerce
    .date()
    .refine((date) => !Number.isNaN(date.getTime()), "Invalid dateOfBirth")
    .refine((date) => date <= new Date(), "dateOfBirth cannot be in the future"),
  height: z.number().min(2).max(9.917),
  currentWeight: z.number().min(1).max(1400),
  goal: goalSchema,
  experience: experienceSchema,
  daysPerWeek: z.number().int().min(1).max(7),
  minutesPerSession: z.number().int().min(30).max(180),
  equipment: z.array(equipmentSchema).min(1, "Select at least one equipment"),
  location: z.union([z.array(locationSchema).min(1), locationSchema]),
  injuries: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const sessionUserId = (session?.user as { id?: string } | undefined)?.id;
    const sessionEmail = session?.user?.email ?? null;
    if (!sessionEmail && !sessionUserId) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = onboardingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "INVALID_INPUT" },
        { status: 400 }
      );
    }

    const {
      userId: requestedUserId,
      fullName,
      dateOfBirth,
      height,
      currentWeight,
      goal,
      experience,
      daysPerWeek,
      minutesPerSession,
      equipment,
      location,
      injuries,
    } = parsed.data;

    let userId = sessionUserId;
    if (!userId) {
      if (!sessionEmail) {
        return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
      }

      const user = await prisma.user.findUnique({
        where: { email: sessionEmail },
        select: { id: true },
      });

      if (!user) {
        return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
      }
      userId = user.id;
    }

    if (requestedUserId && requestedUserId !== userId) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    const onboardingRateLimit = rateLimit(`onboarding:user:${userId}`, {
      windowMs: 15 * 60 * 1000,
      maxRequests: 10,
    });
    if (!onboardingRateLimit.allowed) {
      return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });
    }

    const normalizedName = fullName.trim().replace(/\s+/g, " ");
    const primaryLocation = Array.isArray(location) ? location[0] : location;
    const normalizedInjuries = injuries?.trim() || null;

    const [, savedOnboarding] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { name: normalizedName },
      }),
      prisma.onboardingAnswers.upsert({
        where: { userId },
        update: {
          goal,
          experience,
          daysPerWeek,
          minutesPerSession,
          equipment,
          injuries: normalizedInjuries,
          location: primaryLocation,
          currentWeight,
          height,
          dateOfBirth,
        },
        create: {
          userId,
          goal,
          experience,
          daysPerWeek,
          minutesPerSession,
          equipment,
          injuries: normalizedInjuries,
          location: primaryLocation,
          currentWeight,
          height,
          dateOfBirth,
        },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      onboardingId: savedOnboarding.userId,
    });
  } catch (error) {
    console.error("[onboarding] Failed to persist onboarding", error);
    return NextResponse.json({ error: "ONBOARDING_SAVE_FAILED" }, { status: 500 });
  }
}
