// src/app/app/home/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import HomePageClient from "./HomePageClient";

interface PlanSummary {
  goal?: string;
  daysPerWeek?: number;
  minutes?: number;
}

interface PlanDay {
  title?: string;
  blocks?: Array<{
    exerciseId?: string;
    sets?: number;
    reps?: string;
  }>;
}

interface Plan {
  id: string;
  summary: PlanSummary;
  days: PlanDay[];
  createdAt: Date;
}


export default async function HomeApp() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, email: true },
  });
  if (!user) redirect("/auth/login");

  const workoutPlan = await prisma.workoutPlan.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  // Cast the Prisma result to our Plan type
  const plan: Plan | null = workoutPlan ? {
    id: workoutPlan.id,
    summary: workoutPlan.summary as PlanSummary,
    days: workoutPlan.days as PlanDay[],
    createdAt: workoutPlan.createdAt,
  } : null;

  return (
    <HomePageClient 
      user={user}
      plan={plan}
    />
  );
}
