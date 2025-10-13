export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

interface PlanSummary {
  daysPerWeek: number;
  minutes: number;
  goal: string;
}

interface PlanDay {
  id: string;
  title: string;
  blocks: Array<{
    exerciseId: string;
    sets: number;
    reps: string;
  }>;
}

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId)
      return NextResponse.json({ error: "MISSING_USER" }, { status: 400 });

    const ob = await prisma.onboardingAnswers.findUnique({ where: { userId } });
    if (!ob)
      return NextResponse.json(
        { error: "ONBOARDING_REQUIRED" },
        { status: 400 }
      );

    // MOCK: construye un plan simple a partir de las respuestas
    const plan = {
      userId,
      summary: {
        daysPerWeek: ob.daysPerWeek,
        minutes: ob.minutesPerSession,
        goal: ob.goal,
      },
      weeks: 4,
      schedule:
        ob.daysPerWeek === 3
          ? ["mon", "wed", "fri"]
          : ["mon", "tue", "thu", "sat"],
      days: [
        {
          id: "w1d1",
          title: "Full-Body A",
          blocks: [
            { exerciseId: "ex_goblet_squat", sets: 3, reps: "8-10" },
            { exerciseId: "ex_pushup", sets: 3, reps: "8-12" },
            { exerciseId: "ex_one_arm_row_db", sets: 3, reps: "10/side" },
          ],
        },
      ],
    };

    const saved = await prisma.workoutPlan.create({
      data: {
        userId,
        summary: plan.summary as Prisma.InputJsonValue,
        weeks: plan.weeks,
        schedule: plan.schedule as Prisma.InputJsonValue,
        days: plan.days as Prisma.InputJsonValue,
        source: "ai",
      },
    });

    return NextResponse.json({ ok: true, planId: saved.id });
  } catch (e) {
    console.error(e);
    // Fallback determinista si “IA” falla
    const { userId } = await req.json().catch(() => ({ userId: null }));
    if (!userId)
      return NextResponse.json({ error: "FALLBACK_FAILED" }, { status: 500 });

    const fallback = await prisma.workoutPlan.create({
      data: {
        userId,
        summary: {
          daysPerWeek: 3,
          minutes: 30,
          goal: "general_health",
        } as Prisma.InputJsonValue,
        weeks: 4,
        schedule: ["mon", "wed", "fri"] as Prisma.InputJsonValue,
        days: [
          {
            id: "w1d1",
            title: "Full-Body A",
            blocks: [
              { exerciseId: "ex_goblet_squat", sets: 3, reps: "8-10" },
              { exerciseId: "ex_pushup", sets: 3, reps: "8-12" },
              { exerciseId: "ex_one_arm_row_db", sets: 3, reps: "10/side" },
            ],
          },
        ] as Prisma.InputJsonValue,
        source: "fallback",
      },
    });

    return NextResponse.json({
      ok: true,
      planId: fallback.id,
      source: "fallback",
    });
  }
}
