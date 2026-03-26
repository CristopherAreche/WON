import { redirect } from "next/navigation";
import WorkoutsPageClient from "./WorkoutsPageClient";
import { fetchWonApiServerJson, type WonHomePayload } from "@/lib/won-api-server";

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

  return <WorkoutsPageClient plans={plans} />;
}
