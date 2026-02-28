import { cache } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import WorkoutsPageClient from "./WorkoutsPageClient";

const getUser = cache(async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
    },
  });
});

const getWorkoutPlans = cache(async (userId: string) => {
  return await prisma.workoutPlan.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 24,
    select: {
      id: true,
      summary: true,
      days: true,
      createdAt: true,
      onboarding: true,
    },
  });
});

interface PlanSummary {
  goal?: string;
  daysPerWeek?: number;
  minutes?: number;
  split?: string;
  description?: string;
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

export default async function WorkoutsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/login");

  const user = await getUser(session.user.email);
  if (!user) redirect("/auth/login");

  const workoutPlans = await getWorkoutPlans(user.id);

  const plans: Plan[] = workoutPlans.map((workoutPlan) => ({
    id: workoutPlan.id,
    summary: workoutPlan.summary as PlanSummary,
    days: workoutPlan.days as unknown as WorkoutPlanData,
    createdAt: workoutPlan.createdAt,
    onboarding: (workoutPlan.onboarding as OnboardingData | null) || undefined,
  }));

  return <WorkoutsPageClient plans={plans} />;
}
