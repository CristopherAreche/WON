"use client";

import { useRouter } from "next/navigation";

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

interface WorkoutListProps {
  plan: Plan;
  onboarding?: OnboardingData;
}

interface WorkoutCardProps {
  plan: Plan;
  onboarding?: OnboardingData;
}

function WorkoutCard({ plan, onboarding }: WorkoutCardProps) {
  const router = useRouter();

  // Get workout image based on goal
  const getWorkoutImage = () => {
    if (!onboarding?.goal) return "🏃‍♂️";

    switch (onboarding.goal) {
      case "fat_loss":
        return "🔥";
      case "hypertrophy":
        return "💪";
      case "strength":
        return "🏋️";
      case "returning":
        return "🔄";
      case "general_health":
        return "❤️";
      default:
        return "🏃‍♂️";
    }
  };

  const getGoal = () => {
    if (onboarding?.goal) {
      switch (onboarding.goal) {
        case "fat_loss":
          return "Fat Loss";
        case "hypertrophy":
          return "Muscle Building";
        case "strength":
          return "Build Strength";
        case "returning":
          return "Get Back in Shape";
        case "general_health":
          return "General Health";
        default:
          return onboarding.goal;
      }
    }
    return "General Fitness";
  };

  const getLocation = () => {
    if (onboarding?.location) {
      return onboarding.location === "gym" ? "Gym Workout" : "Home Workout";
    }
    return "Workout";
  };

  const getDuration = () => {
    if (onboarding?.minutesPerSession) {
      return `${onboarding.minutesPerSession} min`;
    }
    return "45 min";
  };

  const getDaysPerWeek = () => {
    if (onboarding?.daysPerWeek) {
      return `${onboarding.daysPerWeek} days/week`;
    }
    return `${plan.days.length} days/week`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-black to-gray-800 rounded-xl flex items-center justify-center">
            <span className="text-xl">{getWorkoutImage()}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-black">
              {getGoal()} Plan
            </h3>
            <p className="text-sm text-gray-500">
              Created {formatDate(plan.createdAt)}
            </p>
          </div>
        </div>
        <button className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors group">
          <svg
            className="w-5 h-5 text-red-600 group-hover:text-red-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H9a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      {/* Workout Details */}
      <div className="space-y-4 mb-6">
        {/* First Row: Goal and Duration */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Goal</p>
              <p className="font-medium text-gray-900">{getGoal()}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-medium text-gray-900">{getDuration()}</p>
            </div>
          </div>
        </div>

        {/* Second Row: Frequency and Location */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Frequency</p>
              <p className="font-medium text-gray-900">{getDaysPerWeek()}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium text-gray-900">{getLocation()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Start Workout Button */}
      <button
        onClick={() => router.push(`/app/workout/${plan.id}`)}
        className="w-full bg-black text-white py-3 px-4 rounded-xl hover:bg-gray-800 transition-colors font-medium"
      >
        Start Workout
      </button>
    </div>
  );
}

export default function WorkoutList({ plan, onboarding }: WorkoutListProps) {
  return (
    <div>
      <WorkoutCard plan={plan} onboarding={onboarding} />
    </div>
  );
}
