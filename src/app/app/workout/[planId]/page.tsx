import { redirect } from "next/navigation";
import WorkoutDetailsClient from "./WorkoutDetailsClient";
import { fetchWonApiServerJson, type WonPlan } from "@/lib/won-api-server";

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

interface PlanSummary {
  goal?: string;
  daysPerWeek?: number;
  minutes?: number;
  split?: string;
  description?: string;
}

interface WorkoutPlan {
  id: string;
  summary: PlanSummary;
  days: WorkoutPlanData;
  schedule: number[];
  weeks: number;
  createdAt: Date;
}

export default async function WorkoutDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ planId: string }>;
  searchParams: Promise<{ day?: string }>;
}) {
  const { planId } = await params;
  const { day } = await searchParams;

  let workoutPlan: WonPlan | null = null;

  try {
    workoutPlan = await fetchWonApiServerJson<WonPlan>(`/api/plans/${planId}`);
  } catch {
    workoutPlan = null;
  }

  if (!workoutPlan) {
    redirect("/app/home");
  }

  const sessions =
    (workoutPlan.days as { sessions?: Array<{ dayOfWeek: number }> }).sessions || [];

  const plan: WorkoutPlan = {
    id: workoutPlan.id,
    summary: workoutPlan.summary as PlanSummary,
    days: workoutPlan.days as unknown as WorkoutPlanData,
    schedule: sessions.map((session) => session.dayOfWeek),
    weeks: 4,
    createdAt: new Date(workoutPlan.createdAt),
  };

  const selectedDay = day ? parseInt(day, 10) : 0;

  return <WorkoutDetailsClient plan={plan} selectedDay={selectedDay} />;
}
