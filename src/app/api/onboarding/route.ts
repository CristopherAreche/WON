export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      goal,
      experience,
      daysPerWeek,
      minutesPerSession,
      equipment,
      injuries,
      location,
    } = body;

    if (
      !userId ||
      !goal ||
      !experience ||
      !daysPerWeek ||
      !minutesPerSession ||
      !equipment ||
      !location
    ) {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    const saved = await prisma.onboardingAnswers.upsert({
      where: { userId },
      update: {
        goal,
        experience,
        daysPerWeek,
        minutesPerSession,
        equipment,
        injuries,
        location,
      },
      create: {
        userId,
        goal,
        experience,
        daysPerWeek,
        minutesPerSession,
        equipment,
        injuries,
        location,
      },
    });

    return NextResponse.json({ ok: true, onboardingId: saved.userId });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "ONBOARDING_SAVE_FAILED" },
      { status: 500 }
    );
  }
}
