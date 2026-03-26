import { redirect } from "next/navigation";
import HomePageClient from "./HomePageClient";
import { fetchWonApiServerJson, type WonHomePayload } from "@/lib/won-api-server";

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
  const home = await fetchWonApiServerJson<WonHomePayload>("/api/user/home");

  if (!home) {
    redirect("/auth/login");
  }

  const plans: Plan[] = home.plans.map((plan) => ({
    id: plan.id,
    summary: plan.summary as PlanSummary,
    days: plan.days as unknown as WorkoutPlanData,
    createdAt: new Date(plan.createdAt),
    onboarding: (plan.onboarding as OnboardingData | undefined) || undefined,
  }));

  const onboardingDefaults: OnboardingBase | null = home.onboardingBase
    ? {
        goal: home.onboardingBase.goal,
        daysPerWeek: home.onboardingBase.daysPerWeek,
        minutesPerSession: home.onboardingBase.minutesPerSession,
        equipment: home.onboardingBase.equipment,
        location: home.onboardingBase.location[0] || "home",
        injuries: home.onboardingBase.injuries,
      }
    : null;

  return <HomePageClient plans={plans} onboardingBase={onboardingDefaults} />;
}
