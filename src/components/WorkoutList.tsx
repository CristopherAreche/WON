"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

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
  location: string;
}

interface Plan {
  id: string;
  summary: PlanSummary;
  days: WorkoutPlanData; // Now contains the complete workout plan structure
  createdAt: Date;
  onboarding?: OnboardingData;
}

interface WorkoutListProps {
  plan: Plan;
  onboarding?: OnboardingData;
  onPlanDeleted?: (planId: string) => void;
}

interface WorkoutCardProps {
  plan: Plan;
  onboarding?: OnboardingData;
  onPlanDeleted?: (planId: string) => void;
}

function WorkoutCard({ plan, onboarding, onPlanDeleted }: WorkoutCardProps) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Console log workout data when component renders
  React.useEffect(() => {
    console.log("💪 [WorkoutCard] Rendering workout plan:", plan.id);
    console.log("💪 [WorkoutCard] Plan summary:", plan.summary);
    console.log("💪 [WorkoutCard] Plan workout data:", plan.days);
    console.log("💪 [WorkoutCard] Plan onboarding:", onboarding);

    // Log data sources being used for display
    console.log("💪 [WorkoutCard] Data sources used:");
    console.log(
      "  - Goal:",
      plan.days?.meta?.goal || plan.summary?.goal || onboarding?.goal
    );
    console.log(
      "  - Duration:",
      plan.days?.constraints?.minutesPerSession ||
        plan.summary?.minutes ||
        onboarding?.minutesPerSession
    );
    console.log(
      "  - Location:",
      plan.days?.meta?.location || onboarding?.location
    );
    console.log(
      "  - Days/Week:",
      plan.days?.sessions?.length ||
        plan.summary?.daysPerWeek ||
        onboarding?.daysPerWeek
    );
    console.log("  - Created:", plan.createdAt);

    if (plan.days && plan.days.sessions) {
      console.log(
        "💪 [WorkoutCard] Workout sessions:",
        plan.days.sessions.length
      );
      plan.days.sessions.forEach((session, index) => {
        console.log(`💪 [WorkoutCard] Session ${index + 1}: ${session.title}`);
        console.log(
          `💪 [WorkoutCard] Session ${index + 1} exercises:`,
          session.items
        );
      });
    }
  }, [plan, onboarding]);

  // Get workout image based on goal
  const getWorkoutImage = () => {
    // Priority: plan.days.meta.goal > plan.summary.goal > onboarding.goal
    const goal =
      plan.days?.meta?.goal || plan.summary?.goal || onboarding?.goal;

    if (!goal) return "🏃‍♂️";

    switch (goal) {
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
    // Priority: plan.days.meta.goal > plan.summary.goal > onboarding.goal
    const goal =
      plan.days?.meta?.goal || plan.summary?.goal || onboarding?.goal;

    if (goal) {
      switch (goal) {
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
          return goal;
      }
    }
    return "General Fitness";
  };

  const getLocation = () => {
    // Priority: plan.days.meta.location > onboarding.location
    const location = plan.days?.meta?.location || onboarding?.location;

    if (location) {
      return location === "gym" ? "Gym Workout" : "Home Workout";
    }
    return "Workout";
  };

  const getDuration = () => {
    // Priority: plan.days.constraints.minutesPerSession > plan.summary.minutes > onboarding.minutesPerSession
    const duration =
      plan.days?.constraints?.minutesPerSession ||
      plan.summary?.minutes ||
      onboarding?.minutesPerSession;

    if (duration) {
      return `${duration} min`;
    }
    return "45 min";
  };

  const getDaysPerWeek = () => {
    // Priority: actual sessions count > plan.summary.daysPerWeek > onboarding.daysPerWeek
    const sessionsCount = plan.days?.sessions?.length;
    const summaryDays = plan.summary?.daysPerWeek;
    const onboardingDays = onboarding?.daysPerWeek;

    const daysPerWeek = sessionsCount || summaryDays || onboardingDays;

    if (daysPerWeek) {
      return `${daysPerWeek} days/week`;
    }
    return "3 days/week";
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);

      const response = await fetch(`/api/workout/${plan.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete workout plan");
      }

      const result = await response.json();

      if (result.ok) {
        // Call the callback to remove from UI
        onPlanDeleted?.(plan.id);
        setShowDeleteModal(false);
      } else {
        throw new Error(result.error || "Failed to delete workout plan");
      }
    } catch (error) {
      console.error("Error deleting workout plan:", error);
      alert("Failed to delete workout plan. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <div
        className="col-span-2 bg-surface-light p-5 rounded-2xl shadow-soft relative overflow-hidden group cursor-pointer"
        onClick={() => router.push(`/app/workout/${plan.id}`)}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-primary">
              <span className="material-icons-round">fitness_center</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDeleteClick}
                className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Delete Plan"
              >
                <span className="material-icons-round text-sm">delete_outline</span>
              </button>
              <span className="bg-blue-50 text-primary text-xs font-bold px-2 py-1 rounded-full">AI PLAN</span>
            </div>
          </div>

          <h3 className="text-xl font-bold text-slate-900 mb-1">{getGoal()} Plan</h3>
          <p className="text-sm text-slate-500 mb-6">{getDaysPerWeek()} • {getDuration()}</p>

          <div className="flex items-center justify-between">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200"></div>
              <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-300"></div>
              <div className="w-8 h-8 rounded-full border-2 border-white bg-primary flex items-center justify-center text-[10px] text-white font-bold">
                +{plan.days?.sessions?.length || 3}
              </div>
            </div>
            <button
              className="bg-primary hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-semibold shadow-lg shadow-blue-500/30 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/app/workout/${plan.id}`);
              }}
            >
              Start
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Workout Plan"
        message={`Are you sure you want to delete this ${getGoal()} workout plan? This action cannot be undone.`}
        confirmText="Delete Plan"
        cancelText="Cancel"
        isLoading={isDeleting}
        danger={true}
      />
    </>
  );
}

export default function WorkoutList({
  plan,
  onboarding,
  onPlanDeleted,
}: WorkoutListProps) {
  return (
    <div>
      <WorkoutCard
        plan={plan}
        onboarding={onboarding}
        onPlanDeleted={onPlanDeleted}
      />
    </div>
  );
}
