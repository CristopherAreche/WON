import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import WorkoutDetailsClient from "./WorkoutDetailsClient";

interface PlanDay {
  id?: string;
  title?: string;
  focus?: string;
  estimatedDuration?: number;
  blocks?: Array<{
    exerciseId?: string;
    name?: string;
    sets?: number;
    reps?: string;
    rest?: string;
    notes?: string;
  }>;
}

interface WorkoutPlan {
  id: string;
  summary: {
    daysPerWeek: number;
    minutes: number;
    goal: string;
  };
  days: PlanDay[];
  schedule: string[];
  weeks: number;
  createdAt: Date;
}

export default async function WorkoutDetailsPage({
  params,
  searchParams,
}: {
  params: { planId: string };
  searchParams: { day?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, email: true },
  });
  if (!user) redirect("/auth/login");

  const workoutPlan = await prisma.workoutPlan.findFirst({
    where: { 
      id: params.planId,
      userId: user.id 
    },
  });

  if (!workoutPlan) {
    redirect("/app/home");
  }

  // Cast the Prisma result to our WorkoutPlan type
  const plan: WorkoutPlan = {
    id: workoutPlan.id,
    summary: workoutPlan.summary as { daysPerWeek: number; minutes: number; goal: string },
    days: workoutPlan.days as PlanDay[],
    schedule: workoutPlan.schedule as string[],
    weeks: workoutPlan.weeks,
    createdAt: workoutPlan.createdAt,
  };

  const selectedDay = searchParams.day ? parseInt(searchParams.day) : 0;

  return (
    <WorkoutDetailsClient 
      plan={plan}
      selectedDay={selectedDay}
    />
  );
}