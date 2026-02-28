"use client";

import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import {
  type CompletionMap,
  type PlanProgressState,
  type SessionStatus,
  computePlanProgressState,
  computeSessionStatuses,
  readCompletionMap,
} from "@/lib/workout-progress";

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

interface WorkoutListProps {
  plan: Plan;
  onboarding?: OnboardingData;
  onPlanDeleted?: (planId: string) => void;
  progressRefreshKey: number;
}

interface WorkoutCardProps {
  plan: Plan;
  onboarding?: OnboardingData;
  onPlanDeleted?: (planId: string) => void;
  progressRefreshKey: number;
}

function getStatusCircleClass(status: SessionStatus) {
  switch (status) {
    case "green":
      return "bg-emerald-500";
    case "yellow":
      return "bg-amber-400";
    case "red":
    default:
      return "bg-rose-500";
  }
}

function getCtaConfig(state: PlanProgressState) {
  switch (state) {
    case "completed":
      return {
        label: "Completed",
        className:
          "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/30",
      };
    case "continue":
      return {
        label: "Continue",
        className:
          "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/30",
      };
    case "start":
    default:
      return {
        label: "Start",
        className:
          "bg-primary hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30",
      };
  }
}

function WorkoutCard({
  plan,
  onboarding,
  onPlanDeleted,
  progressRefreshKey,
}: WorkoutCardProps) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [completionMap, setCompletionMap] = useState<CompletionMap>({});

  useEffect(() => {
    setCompletionMap(readCompletionMap(plan.id));
  }, [plan.id, progressRefreshKey]);

  const sessionStatuses = useMemo(
    () => computeSessionStatuses(plan.days?.sessions || [], completionMap),
    [plan.days?.sessions, completionMap]
  );

  const planProgressState = useMemo(
    () => computePlanProgressState(sessionStatuses),
    [sessionStatuses]
  );

  const ctaConfig = getCtaConfig(planProgressState);

  const getGoal = () => {
    const goal = plan.days?.meta?.goal || plan.summary?.goal || onboarding?.goal;

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
    const rawLocation = plan.days?.meta?.location || onboarding?.location;
    const normalized = Array.isArray(rawLocation)
      ? rawLocation.join(", ").toLowerCase()
      : String(rawLocation || "").toLowerCase();

    if (normalized.includes("park")) return "Park Workout";
    if (normalized.includes("gym")) return "Gym Workout";
    if (normalized.includes("home")) return "Home Workout";
    return "Workout";
  };

  const getDuration = () => {
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
    const sessionsCount = plan.days?.sessions?.length;
    const summaryDays = plan.summary?.daysPerWeek;
    const onboardingDays = onboarding?.daysPerWeek;

    const daysPerWeek = sessionsCount || summaryDays || onboardingDays;

    if (daysPerWeek) {
      return `${daysPerWeek} days/week`;
    }
    return "3 days/week";
  };

  const handleDeleteClick = (event: MouseEvent) => {
    event.stopPropagation();
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
        className="w-full bg-surface-light p-5 rounded-2xl shadow-soft relative overflow-hidden cursor-pointer"
        onClick={() => router.push(`/app/workout/${plan.id}`)}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-8 -mt-8 transition-transform"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-primary">
                <span className="material-icons-round">fitness_center</span>
              </div>
              <span className="bg-blue-50 text-primary text-xs font-bold px-2 py-1 rounded-full">
                AI PLAN
              </span>
            </div>

            <button
              onClick={handleDeleteClick}
              className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
              title="Delete plan"
              aria-label="Delete plan"
            >
              <span className="material-icons-round text-sm">close</span>
            </button>
          </div>

          <h3 className="text-xl font-bold text-slate-900 mb-1">{getGoal()} Plan</h3>
          <p className="text-sm text-slate-500 mb-6">
            {getDaysPerWeek()} • {getDuration()} • {getLocation()}
          </p>

          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5 max-w-[180px]">
              {sessionStatuses.map((status, index) => (
                <div
                  key={`${plan.id}-session-status-${index}`}
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-white shadow-sm ${getStatusCircleClass(
                    status
                  )}`}
                  title={`Session ${index + 1}: ${
                    status === "red"
                      ? "Not started"
                      : status === "yellow"
                        ? "In progress"
                        : "Completed"
                  }`}
                />
              ))}
            </div>

            <button
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${ctaConfig.className}`}
              onClick={(event) => {
                event.stopPropagation();
                router.push(`/app/workout/${plan.id}`);
              }}
            >
              {ctaConfig.label}
            </button>
          </div>
        </div>
      </div>

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
  progressRefreshKey,
}: WorkoutListProps) {
  return (
    <WorkoutCard
      plan={plan}
      onboarding={onboarding}
      onPlanDeleted={onPlanDeleted}
      progressRefreshKey={progressRefreshKey}
    />
  );
}
