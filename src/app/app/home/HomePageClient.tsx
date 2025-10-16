"use client";

import React, { useState } from "react";
import WelcomeHeader from "@/components/WelcomeHeader";
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
  days: WorkoutPlanData; // Now contains the complete workout plan structure
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

  // Console log the workout data when component loads
  React.useEffect(() => {
    console.log("🏠 [Home] User data:", user);
    console.log("🏠 [Home] Initial workout plans loaded:", initialPlans.length);
    
    if (initialPlans.length > 0) {
      console.log("🏠 [Home] Complete workout plans data:", JSON.stringify(initialPlans, null, 2));
      
      initialPlans.forEach((plan, index) => {
        console.log(`🏠 [Home] Plan ${index + 1} - ID: ${plan.id}`);
        console.log(`🏠 [Home] Plan ${index + 1} - Summary:`, plan.summary);
        console.log(`🏠 [Home] Plan ${index + 1} - Workout Data:`, plan.days);
        console.log(`🏠 [Home] Plan ${index + 1} - Sessions:`, plan.days.sessions);
        
        if (plan.days.sessions) {
          plan.days.sessions.forEach((session, sessionIndex) => {
            console.log(`🏠 [Home] Plan ${index + 1} - Session ${sessionIndex + 1}:`, session.title);
            console.log(`🏠 [Home] Plan ${index + 1} - Session ${sessionIndex + 1} - Exercises:`, session.items);
          });
        }
        
        if (plan.onboarding) {
          console.log(`🏠 [Home] Plan ${index + 1} - Onboarding Data:`, plan.onboarding);
        }
      });
    } else {
      console.log("🏠 [Home] No workout plans found");
    }
  }, [user, initialPlans]);

  const handlePlanDeleted = (planId: string) => {
    console.log("🏠 [Home] Deleting plan:", planId);
    setPlans(prevPlans => prevPlans.filter(plan => plan.id !== planId));
  };

  return (
    <div className="p-4 pb-20">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Welcome Header */}
        <WelcomeHeader userName={user.name} />
        {/* Main Content */}
        {plans && plans.length > 0 ? (
          <div className="space-y-6">
            {plans.map((plan) => (
              <WorkoutList 
                key={plan.id} 
                plan={plan} 
                onboarding={plan.onboarding}
                onPlanDeleted={handlePlanDeleted}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-black mb-2">
                  No workout plan yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Create your personalized workout plan to get started with your
                  fitness journey.
                </p>
              </div>
              <a
                href="/onboarding"
                className="inline-block bg-black text-white px-8 py-3 rounded-2xl hover:bg-gray-800 transition-colors font-medium"
              >
                Create My Plan
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
