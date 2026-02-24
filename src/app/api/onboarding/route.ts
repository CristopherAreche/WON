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
      currentWeight,
      height,
      age,
    } = body;

    console.log("🔵 [API] Received onboarding data:", {
      userId,
      goal,
      experience,
      daysPerWeek,
      minutesPerSession,
      equipment,
      location,
      currentWeight,
      height,
      age,
      injuries
    });

    if (
      !userId ||
      !goal ||
      !experience ||
      !daysPerWeek ||
      !minutesPerSession ||
      !equipment ||
      !location
    ) {
      console.error("🔴 [API] Missing required fields");
      return NextResponse.json({ error: "INVALID_INPUT - Missing required fields" }, { status: 400 });
    }

    // Temporary: Handle missing new fields gracefully until migration is run
    if (currentWeight === undefined || height === undefined || age === undefined) {
      console.log("⚠️ [API] New fields missing - will save with existing schema only");
    }

    try {
      // For now, save with existing schema fields only (temporary compatibility)
      const saved = await prisma.onboardingAnswers.upsert({
        where: { userId },
        update: {
          goal,
          experience,
          daysPerWeek,
          minutesPerSession,
          equipment,
          injuries,
          location: location[0] || "home", // Use first location for now
        },
        create: {
          userId,
          goal,
          experience,
          daysPerWeek,
          minutesPerSession,
          equipment,
          injuries,
          location: location[0] || "home", // Use first location for now
        },
      });

      console.log("🟢 [API] Onboarding saved successfully (with current schema):", saved.userId);
      console.log("⚠️ [API] Note: New fields (currentWeight, height, age, location array) not saved yet - database migration pending");

      return NextResponse.json({
        ok: true,
        onboardingId: saved.userId,
        note: "Saved with current schema - new fields pending migration"
      });
    } catch (dbError) {
      console.error("🔴 [API] Database error:", dbError);
      return NextResponse.json({ error: "DATABASE_ERROR - " + (dbError as Error).message }, { status: 500 });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "ONBOARDING_SAVE_FAILED" },
      { status: 500 }
    );
  }
}
