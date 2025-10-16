import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import WorkoutDetailsClient from "./WorkoutDetailsClient";

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
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, email: true },
  });
  if (!user) redirect("/auth/login");

  const { planId } = await params;
  const { day } = await searchParams;

  const workoutPlan = await prisma.workoutPlan.findFirst({
    where: { 
      id: planId,
      userId: user.id 
    },
  });

  if (!workoutPlan) {
    redirect("/app/home");
  }

  // Cast the Prisma result to our WorkoutPlan type
  const plan: WorkoutPlan = {
    id: workoutPlan.id,
    summary: workoutPlan.summary as PlanSummary,
    days: workoutPlan.days as unknown as WorkoutPlanData,
    schedule: workoutPlan.schedule as unknown as number[],
    weeks: workoutPlan.weeks,
    createdAt: workoutPlan.createdAt,
  };

  const selectedDay = day ? parseInt(day) : 0;

  return (
    <WorkoutDetailsClient 
      plan={plan}
      selectedDay={selectedDay}
    />
  );
}