"use client";

import React, { useState } from "react";
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

interface User {
  id: string;
  name: string | null;
  email: string;
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
  days: WorkoutPlanData;
  createdAt: Date;
  onboarding?: OnboardingData;
}

interface HomePageClientProps {
  user: User;
  plans: Plan[];
}

export default function HomePageClient({
  user,
  plans: initialPlans,
}: HomePageClientProps) {
  const [plans, setPlans] = useState(initialPlans);

  React.useEffect(() => {
    console.log("🏠 [Home] Complete workout plans initialized");
  }, [initialPlans]);

  const handlePlanDeleted = (planId: string) => {
    setPlans(prevPlans => prevPlans.filter(plan => plan.id !== planId));
  };

  return (
    <>
      {/* Intro Section */}
      <section className="mb-8 mt-2">
        <h1 className="font-serif text-3xl md:text-4xl text-slate-900 leading-tight">
          Ready for today,<br/>
          <span className="text-primary">{user.name ? user.name.split(' ')[0] : 'Entrenador'}?</span>
        </h1>
      </section>

      {/* Main Content */}
      {plans && plans.length > 0 ? (
        <main className="grid grid-cols-2 gap-4">
          {plans.map((plan) => (
            <WorkoutList
              key={plan.id}
              plan={plan}
              onboarding={plan.onboarding}
              onPlanDeleted={handlePlanDeleted}
            />
          ))}
        </main>
      ) : (
        <main className="col-span-2">
          <div className="bg-surface-light rounded-2xl p-8 shadow-soft relative overflow-hidden">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-primary">
                <span className="material-icons-round text-3xl">fitness_center</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  No workout plan yet
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                  Create your personalized workout plan to get started with your fitness journey.
                </p>
              </div>
              <a
                href="/onboarding"
                className="inline-block bg-primary text-white px-8 py-3 rounded-full hover:bg-blue-700 transition-colors font-semibold shadow-lg shadow-blue-500/30"
              >
                Create My Plan
              </a>
            </div>
          </div>
        </main>
      )}
    </>
  );
}
