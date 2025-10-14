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

interface OnboardingData {
  goal: string;
  experience: string;
  daysPerWeek: number;
  minutesPerSession: number;
  equipment: string[];
  location: string;
}

interface Plan {
  id: string;
  summary: PlanSummary;
  days: PlanDay[];
  createdAt: Date;
  onboarding?: OnboardingData;
}


export default async function HomeApp() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { 
      id: true, 
      name: true, 
      email: true,
      onboarding: true
    },
  });
  if (!user) redirect("/auth/login");

  const workoutPlans = await prisma.workoutPlan.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  // Cast the Prisma results to our Plan type
  const plans: Plan[] = workoutPlans.map((workoutPlan, index) => {
    // Temporary mock onboarding data until Prisma client is fixed
    const mockOnboardingData: OnboardingData[] = [
      {
        goal: 'fat_loss',
        experience: 'beginner',
        daysPerWeek: 3,
        minutesPerSession: 45,
        equipment: ['dumbbells', 'bands'],
        location: 'home'
      },
      {
        goal: 'hypertrophy',
        experience: 'one_to_three_years',
        daysPerWeek: 4,
        minutesPerSession: 60,
        equipment: ['barbell', 'dumbbells', 'machines'],
        location: 'gym'
      },
      {
        goal: 'strength',
        experience: 'three_years_plus',
        daysPerWeek: 5,
        minutesPerSession: 75,
        equipment: ['barbell', 'dumbbells', 'machines'],
        location: 'gym'
      },
      {
        goal: 'general_health',
        experience: 'beginner',
        daysPerWeek: 3,
        minutesPerSession: 30,
        equipment: ['bodyweight'],
        location: 'home'
      }
    ];

    return {
      id: workoutPlan.id,
      summary: workoutPlan.summary as PlanSummary,
      days: workoutPlan.days as PlanDay[],
      createdAt: workoutPlan.createdAt,
      onboarding: mockOnboardingData[index % mockOnboardingData.length],
    };
  });

  return (
    <HomePageClient 
      user={user}
      plans={plans}
    />
  );
}
