import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import HomePageClient from "./HomePageClient";
import { cache } from "react";

// Cache the DB queries per request to avoid redundant calls during hydration/navigation
const getUser = cache(async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
});

const getWorkoutPlans = cache(async (userId: string) => {
  return await prisma.workoutPlan.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 12,
    select: {
      id: true,
      summary: true,
      days: true,
      createdAt: true,
      onboarding: true,
    },
  });
});

const getOnboardingBase = cache(async (userId: string) => {
  return await prisma.onboardingAnswers.findUnique({
    where: { userId },
    select: {
      goal: true,
      daysPerWeek: true,
      minutesPerSession: true,
      equipment: true,
      location: true,
      injuries: true,
    },
  });
});

interface PlanSummary {
  goal?: string;
  daysPerWeek?: number;
  minutes?: number;
}

interface Exercise {
  name: string;
  equipment: "bodyweight" | "bands" | "dumbbells" | "barbell" | "machines";
  sets: number;
  reps: number[];
  notes?: string;
  reference?: string;
}

interface WorkoutSession {
  dayOfWeek: number;
  title: string;
  estMinutes: number;
  items: Exercise[];
}

interface WorkoutPlanData {
  description: string;
  split: string;
  sessions: WorkoutSession[];
  constraints: {
    minutesPerSession: number;
    injuryNotes?: string;
  };
  meta: {
    goal: string;
    experience: string;
    location: string;
    equipment: string[];
  };
}

interface OnboardingData {
  goal: string;
  experience: string;
  daysPerWeek: number;
  minutesPerSession: number;
  equipment: string[];
  location: string | string[];
  injuries?: string;
  dateOfBirth?: string;
  age?: number;
}

interface Plan {
  id: string;
  summary: PlanSummary;
  days: WorkoutPlanData;
  createdAt: Date;
  onboarding?: OnboardingData;
}

interface OnboardingBase {
  goal: "fat_loss" | "hypertrophy" | "strength" | "returning" | "general_health";
  daysPerWeek: number;
  minutesPerSession: number;
  equipment: Array<"bodyweight" | "bands" | "dumbbells" | "barbell" | "machines">;
  location: "home" | "gym" | "park";
  injuries?: string | null;
}

export default async function HomeApp() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/login");

  const user = await getUser(session.user.email);
  if (!user) redirect("/auth/login");

  const [workoutPlans, onboardingBase] = await Promise.all([
    getWorkoutPlans(user.id),
    getOnboardingBase(user.id),
  ]);

  const plans: Plan[] = workoutPlans.map((workoutPlan) => ({
    id: workoutPlan.id,
    summary: workoutPlan.summary as PlanSummary,
    days: workoutPlan.days as unknown as WorkoutPlanData,
    createdAt: workoutPlan.createdAt,
    onboarding: (workoutPlan.onboarding as OnboardingData | null) || undefined,
  }));

  const onboardingDefaults: OnboardingBase | null = onboardingBase
    ? {
        goal: onboardingBase.goal,
        daysPerWeek: onboardingBase.daysPerWeek,
        minutesPerSession: onboardingBase.minutesPerSession,
        equipment: onboardingBase.equipment as OnboardingBase["equipment"],
        location: onboardingBase.location as OnboardingBase["location"],
        injuries: onboardingBase.injuries,
      }
    : null;

  return <HomePageClient plans={plans} onboardingBase={onboardingDefaults} />;
}
