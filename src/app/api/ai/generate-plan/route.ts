export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { aiWorkoutGenerator } from "@/lib/ai-workout-generator";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const goalSchema = z.enum([
  "fat_loss",
  "hypertrophy",
  "strength",
  "returning",
  "general_health",
]);

const equipmentSchema = z.enum([
  "bodyweight",
  "bands",
  "dumbbells",
  "barbell",
  "machines",
]);

const locationSchema = z.enum(["home", "gym", "park"]);

const generatePlanSchema = z.object({
  userId: z.string().min(1).optional(),
  goal: goalSchema.optional(),
  daysPerWeek: z.number().int().min(1).max(7).optional(),
  minutesPerSession: z.number().int().min(30).max(180).optional(),
  equipment: z.array(equipmentSchema).min(1).optional(),
  location: z.union([z.array(locationSchema).min(1), locationSchema]).optional(),
  injuries: z.string().max(500).optional(),
});

type EffectiveProfile = {
  goal: z.infer<typeof goalSchema>;
  experience:
    | "beginner"
    | "three_to_twelve_months"
    | "one_to_three_years"
    | "three_years_plus";
  daysPerWeek: number;
  minutesPerSession: number;
  equipment: Array<"bodyweight" | "bands" | "dumbbells" | "barbell" | "machines">;
  injuries?: string;
  location: Array<"home" | "gym" | "park">;
  currentWeight: number;
  height: number;
  age: number;
};

function toLocationArray(
  value: z.infer<typeof locationSchema> | Array<z.infer<typeof locationSchema>> | undefined,
  fallback: "home" | "gym" | "park"
): Array<"home" | "gym" | "park"> {
  if (!value) return [fallback];
  return Array.isArray(value) ? value : [value];
}

function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())
  ) {
    age -= 1;
  }

  return Math.max(age, 15);
}

function buildEffectiveProfile(
  onboarding: {
    goal: z.infer<typeof goalSchema>;
    experience:
      | "beginner"
      | "three_to_twelve_months"
      | "one_to_three_years"
      | "three_years_plus";
    daysPerWeek: number;
    minutesPerSession: number;
    equipment: Array<"bodyweight" | "bands" | "dumbbells" | "barbell" | "machines">;
    injuries: string | null;
    location: "home" | "gym" | "park";
    currentWeight: number;
    height: number;
    dateOfBirth: Date;
  },
  overrides: z.infer<typeof generatePlanSchema>
): EffectiveProfile {
  const effectiveInjuries =
    overrides.injuries !== undefined
      ? overrides.injuries.trim() || undefined
      : onboarding.injuries || undefined;

  return {
    goal: overrides.goal ?? onboarding.goal,
    experience: onboarding.experience,
    daysPerWeek: overrides.daysPerWeek ?? onboarding.daysPerWeek,
    minutesPerSession: overrides.minutesPerSession ?? onboarding.minutesPerSession,
    equipment: (overrides.equipment ?? onboarding.equipment) as EffectiveProfile["equipment"],
    injuries: effectiveInjuries,
    location: toLocationArray(overrides.location, onboarding.location),
    currentWeight: onboarding.currentWeight,
    height: onboarding.height,
    age: calculateAge(onboarding.dateOfBirth),
  };
}

function buildSummary(profile: EffectiveProfile, plan: { split: string; description: string }) {
  return {
    daysPerWeek: profile.daysPerWeek,
    minutes: profile.minutesPerSession,
    goal: profile.goal,
    split: plan.split,
    description: plan.description,
  } as Prisma.InputJsonValue;
}

function buildSnapshot(profile: EffectiveProfile, dateOfBirth: Date): Prisma.InputJsonValue {
  return {
    ...profile,
    dateOfBirth: dateOfBirth.toISOString(),
  } as Prisma.InputJsonValue;
}

export async function POST(req: Request) {
  let authenticatedUserId: string | null = null;
  let payload: z.infer<typeof generatePlanSchema> | null = null;
  let onboarding:
    | {
        goal: z.infer<typeof goalSchema>;
        experience:
          | "beginner"
          | "three_to_twelve_months"
          | "one_to_three_years"
          | "three_years_plus";
        daysPerWeek: number;
        minutesPerSession: number;
        equipment: Array<"bodyweight" | "bands" | "dumbbells" | "barbell" | "machines">;
        injuries: string | null;
        location: "home" | "gym" | "park";
        currentWeight: number;
        height: number;
        dateOfBirth: Date;
      }
    | null = null;

  try {
    const session = await getServerSession(authOptions);
    const sessionUserId = (session?.user as { id?: string } | undefined)?.id;
    const sessionEmail = session?.user?.email ?? null;
    if (!sessionEmail && !sessionUserId) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = generatePlanSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "INVALID_INPUT" },
        { status: 400 }
      );
    }

    payload = parsed.data;
    if (sessionUserId) {
      authenticatedUserId = sessionUserId;
    } else {
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

      authenticatedUserId = user.id;
    }

    if (payload.userId && payload.userId !== authenticatedUserId) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    const generationRateLimit = rateLimit(`generate:user:${authenticatedUserId}`, {
      windowMs: 60 * 1000,
      maxRequests: 4,
    });

    if (!generationRateLimit.allowed) {
      return NextResponse.json(
        {
          error: "RATE_LIMITED",
          retryAfterMs: generationRateLimit.resetTime - Date.now(),
        },
        { status: 429 }
      );
    }

    onboarding = await prisma.onboardingAnswers.findUnique({
      where: { userId: authenticatedUserId },
      select: {
        goal: true,
        experience: true,
        daysPerWeek: true,
        minutesPerSession: true,
        equipment: true,
        injuries: true,
        location: true,
        currentWeight: true,
        height: true,
        dateOfBirth: true,
      },
    });

    if (!onboarding) {
      return NextResponse.json({ error: "ONBOARDING_REQUIRED" }, { status: 400 });
    }

    const effectiveProfile = buildEffectiveProfile(onboarding, payload);

    const generatedPlan = await aiWorkoutGenerator.generateWorkoutPlan(effectiveProfile);

    const saved = await prisma.workoutPlan.create({
      data: {
        userId: authenticatedUserId,
        summary: buildSummary(effectiveProfile, generatedPlan),
        weeks: 4,
        schedule: generatedPlan.sessions.map((session) => session.dayOfWeek) as Prisma.InputJsonValue,
        days: generatedPlan as unknown as Prisma.InputJsonValue,
        onboarding: buildSnapshot(effectiveProfile, onboarding.dateOfBirth),
        source: "ai",
        model: "openai/gpt-4o-mini",
      },
    });

    return NextResponse.json({ ok: true, planId: saved.id });
  } catch (error) {
    console.error("[generate-plan] AI path failed, trying deterministic fallback", error);

    if (!authenticatedUserId || !payload) {
      return NextResponse.json({ error: "FALLBACK_FAILED" }, { status: 500 });
    }

    if (!onboarding) {
      return NextResponse.json({ error: "ONBOARDING_REQUIRED" }, { status: 400 });
    }

    const fallbackProfile = buildEffectiveProfile(onboarding, payload);
    const fallbackPlan = await aiWorkoutGenerator.generateWorkoutPlan(fallbackProfile);

    const fallbackSaved = await prisma.workoutPlan.create({
      data: {
        userId: authenticatedUserId,
        summary: buildSummary(fallbackProfile, fallbackPlan),
        weeks: 4,
        schedule: fallbackPlan.sessions.map((session) => session.dayOfWeek) as Prisma.InputJsonValue,
        days: fallbackPlan as unknown as Prisma.InputJsonValue,
        onboarding: buildSnapshot(fallbackProfile, onboarding.dateOfBirth),
        source: "fallback",
        model: "fallback",
      },
    });

    return NextResponse.json({
      ok: true,
      planId: fallbackSaved.id,
      source: "fallback",
    });
  }
}
