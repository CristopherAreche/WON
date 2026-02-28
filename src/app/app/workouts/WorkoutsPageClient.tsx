"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import WorkoutList from "@/components/WorkoutList";

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

interface WorkoutsPageClientProps {
  plans: Plan[];
}

export default function WorkoutsPageClient({ plans: initialPlans }: WorkoutsPageClientProps) {
  const [plans, setPlans] = useState(initialPlans);
  const [progressRefreshKey, setProgressRefreshKey] = useState(0);

  const handlePlanDeleted = (planId: string) => {
    setPlans((prevPlans) => prevPlans.filter((plan) => plan.id !== planId));
  };

  useEffect(() => {
    const refreshProgress = () => setProgressRefreshKey((prev) => prev + 1);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshProgress();
      }
    };

    refreshProgress();
    window.addEventListener("focus", refreshProgress);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", refreshProgress);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const shouldScrollList = plans.length > 2;

  return (
    <div className="h-full min-h-0 flex flex-col">
      <section className="mt-4 mb-4 shrink-0">
        <h1 className="font-serif text-3xl md:text-4xl text-slate-900 leading-[1.15] tracking-tight">
          My Workouts
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Review your generated plans, continue active blocks, or remove old ones.
        </p>
      </section>

      {plans.length > 0 ? (
        <section className="flex-1 min-h-0 mt-2 rounded-2xl bg-slate-50/60 border border-slate-200/60 shadow-sm">
          <main
            className={`h-full px-3 pt-3 pb-32 ${
              shouldScrollList ? "overflow-y-auto" : "overflow-visible"
            }`}
          >
            <div className="grid grid-cols-1 gap-4">
              {plans.map((plan) => (
                <WorkoutList
                  key={plan.id}
                  plan={plan}
                  onboarding={plan.onboarding}
                  onPlanDeleted={handlePlanDeleted}
                  progressRefreshKey={progressRefreshKey}
                />
              ))}
            </div>
          </main>
        </section>
      ) : (
        <main className="pb-32 mt-2">
          <div className="bg-surface-light rounded-2xl p-8 shadow-soft relative overflow-hidden border border-slate-100">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-primary">
                <span className="material-icons-round text-3xl">fitness_center</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No workout plans yet</h3>
                <p className="text-sm text-slate-500 mb-6">
                  Generate your first AI plan to populate this section.
                </p>
              </div>
              <Link
                href="/app/generate"
                className="inline-block bg-primary text-white px-8 py-3 rounded-full hover:bg-blue-700 transition-colors font-semibold shadow-lg shadow-blue-500/30"
              >
                Generate Workout
              </Link>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
