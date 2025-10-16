export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { aiWorkoutGenerator } from "@/lib/ai-workout-generator";

export async function POST(req: Request) {
  let userId: string | null = null;
  try {
    const body = await req.json();
    userId = body.userId;
    if (!userId)
      return NextResponse.json({ error: "MISSING_USER" }, { status: 400 });

    const ob = await prisma.onboardingAnswers.findUnique({ where: { userId } });
    if (!ob)
      return NextResponse.json(
        { error: "ONBOARDING_REQUIRED" },
        { status: 400 }
      );

    // Generate AI-powered workout plan
    const userProfile = {
      goal: ob.goal,
      experience: ob.experience,
      daysPerWeek: ob.daysPerWeek,
      minutesPerSession: ob.minutesPerSession,
      equipment: ob.equipment as Array<
        "bodyweight" | "bands" | "dumbbells" | "barbell" | "machines"
      >,
      injuries: ob.injuries || undefined,
      // Handle location as array (new format) or single value (current database)
      location: Array.isArray(ob.location) ? ob.location : [ob.location],
      // Provide default values for new fields until migration is complete
      currentWeight: (ob as any).currentWeight || 150,
      height: (ob as any).height || 5.5,
      age: (ob as any).age || 25,
    };

    console.log("🔵 Generating workout plan with user profile:", JSON.stringify(userProfile, null, 2));
    console.log("🔵 [DEBUG] UserProfile type check - location:", typeof userProfile.location, userProfile.location);
    console.log("🔵 [DEBUG] UserProfile physical data - weight:", userProfile.currentWeight, "height:", userProfile.height, "age:", userProfile.age);
    
    const plan = await aiWorkoutGenerator.generateWorkoutPlan(userProfile);
    console.log("🟢 Generated workout plan from OpenRouter API:", JSON.stringify(plan, null, 2));

    console.log("💾 Saving workout plan to database...");
    const saved = await prisma.workoutPlan.create({
      data: {
        userId,
        summary: {
          daysPerWeek: userProfile.daysPerWeek,
          minutes: userProfile.minutesPerSession,
          goal: userProfile.goal,
          split: plan.split,
          description: plan.description
        } as Prisma.InputJsonValue,
        weeks: 4, // Default weeks for new structure
        schedule: plan.sessions.map(s => s.dayOfWeek) as Prisma.InputJsonValue,
        days: plan as unknown as Prisma.InputJsonValue, // Store entire plan structure
        onboarding: userProfile as Prisma.InputJsonValue,
        source: "ai",
        model: "openai/gpt-4o-mini",
      },
    });
    console.log("✅ Workout plan saved to database with ID:", saved.id);

    return NextResponse.json({ ok: true, planId: saved.id });
  } catch (e) {
    console.error("🔴 Main generation failed:", e);
    // Fallback determinista si "IA" falla
    if (!userId)
      return NextResponse.json({ error: "FALLBACK_FAILED" }, { status: 500 });

    // Get the user's onboarding for fallback
    const ob = await prisma.onboardingAnswers.findUnique({ where: { userId } });
    const fallbackOnboarding = ob ? {
      goal: ob.goal,
      experience: ob.experience,
      daysPerWeek: ob.daysPerWeek,
      minutesPerSession: ob.minutesPerSession,
      equipment: ob.equipment,
      location: ob.location,
    } : {
      goal: "general_health",
      experience: "beginner",
      daysPerWeek: 3,
      minutesPerSession: 30,
      equipment: ["bodyweight"],
      location: "home",
    };

    // Generate fallback plan using the same generator
    const fallbackUserProfile = {
      goal: fallbackOnboarding.goal as "fat_loss" | "hypertrophy" | "strength" | "returning" | "general_health",
      experience: fallbackOnboarding.experience as "beginner" | "three_to_twelve_months" | "one_to_three_years" | "three_years_plus",
      daysPerWeek: fallbackOnboarding.daysPerWeek,
      minutesPerSession: fallbackOnboarding.minutesPerSession,
      equipment: fallbackOnboarding.equipment as Array<"bodyweight" | "bands" | "dumbbells" | "barbell" | "machines">,
      // Handle location as array for consistency with new format
      location: Array.isArray(fallbackOnboarding.location) ? fallbackOnboarding.location : [fallbackOnboarding.location as "home" | "gym"],
      // Provide default values for new fields
      currentWeight: 150,
      height: 5.5,
      age: 25,
    };

    console.log("🟡 Fallback: Generating workout plan with profile:", JSON.stringify(fallbackUserProfile, null, 2));
    const fallbackPlan = await aiWorkoutGenerator.generateWorkoutPlan(fallbackUserProfile);
    console.log("🟠 Fallback: Generated workout plan:", JSON.stringify(fallbackPlan, null, 2));

    const fallback = await prisma.workoutPlan.create({
      data: {
        userId,
        summary: {
          daysPerWeek: fallbackOnboarding.daysPerWeek,
          minutes: fallbackOnboarding.minutesPerSession,
          goal: fallbackOnboarding.goal,
          split: fallbackPlan.split,
          description: fallbackPlan.description
        } as Prisma.InputJsonValue,
        weeks: 4,
        schedule: fallbackPlan.sessions.map(s => s.dayOfWeek) as Prisma.InputJsonValue,
        days: fallbackPlan as unknown as Prisma.InputJsonValue,
        onboarding: fallbackOnboarding as Prisma.InputJsonValue,
        source: "fallback",
        model: "fallback",
      },
    });

    return NextResponse.json({
      ok: true,
      planId: fallback.id,
      source: "fallback",
    });
  }
}
