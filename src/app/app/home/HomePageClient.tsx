"use client";

import WelcomeHeader from "@/components/WelcomeHeader";
import WorkoutList from "@/components/WorkoutList";

interface PlanSummary {
  goal?: string;
  daysPerWeek?: number;
  minutes?: number;
}

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
  days: PlanDay[];
  createdAt: Date;
  onboarding?: OnboardingData;
}

interface HomePageClientProps {
  user: User;
  plans: Plan[];
}

export default function HomePageClient({
  user,
  plans,
}: HomePageClientProps) {

  return (
    <div className="p-4 pb-20">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Welcome Header */}
        <WelcomeHeader userName={user.name} />
        {/* Main Content */}
        {plans && plans.length > 0 ? (
          <div className="space-y-6">
            {plans.map((plan) => (
              <WorkoutList key={plan.id} plan={plan} onboarding={plan.onboarding} />
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
