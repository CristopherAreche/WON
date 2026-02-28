"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  computePlanProgressSummary,
  readCompletionMap,
  readWorkoutCompletedAt,
} from "@/lib/workout-progress";

type Goal = "fat_loss" | "hypertrophy" | "strength" | "returning" | "general_health";
type Equipment = "bodyweight" | "bands" | "dumbbells" | "barbell" | "machines";
type Location = "home" | "gym" | "park";

interface PlanSummary {
  goal?: string;
  daysPerWeek?: number;
  minutes?: number;
  split?: string;
  description?: string;
}

interface Exercise {
  name: string;
  equipment: Equipment;
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

interface OnboardingBase {
  goal: Goal;
  daysPerWeek: number;
  minutesPerSession: number;
  equipment: Equipment[];
  location: Location;
  injuries?: string | null;
}

interface RecommendationCard {
  id: string;
  title: string;
  description: string;
  reason: string;
  href: string;
}

interface HomePageClientProps {
  plans: Plan[];
  onboardingBase: OnboardingBase | null;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function goalLabel(goal?: string) {
  switch (goal) {
    case "fat_loss":
      return "Fat Loss";
    case "hypertrophy":
      return "Muscle Building";
    case "strength":
      return "Strength Building";
    case "returning":
      return "Return to Training";
    case "general_health":
      return "General Health";
    default:
      return "General Fitness";
  }
}

function normalizeGoal(goal?: string): Goal {
  if (
    goal === "fat_loss" ||
    goal === "hypertrophy" ||
    goal === "strength" ||
    goal === "returning" ||
    goal === "general_health"
  ) {
    return goal;
  }

  return "general_health";
}

function normalizeLocation(location?: string): Location {
  const raw = String(location || "").toLowerCase();
  if (raw.includes("gym")) return "gym";
  if (raw.includes("park")) return "park";
  return "home";
}

function normalizeEquipmentList(equipment?: string[]): Equipment[] {
  if (!Array.isArray(equipment)) return [];

  return equipment.filter(
    (item): item is Equipment =>
      item === "bodyweight" ||
      item === "bands" ||
      item === "dumbbells" ||
      item === "barbell" ||
      item === "machines"
  );
}

function formatCompletedDate(isoLike: string) {
  const date = new Date(isoLike);
  if (Number.isNaN(date.getTime())) return "Unknown date";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function buildGenerateHref(input: {
  goal: Goal;
  daysPerWeek: number;
  minutesPerSession: number;
  equipment: Equipment[];
  location: Location[];
  injuries?: string;
}) {
  const params = new URLSearchParams();
  params.set("goal", input.goal);
  params.set("daysPerWeek", String(input.daysPerWeek));
  params.set("minutesPerSession", String(input.minutesPerSession));
  params.set("equipment", input.equipment.join(","));
  params.set("location", input.location.join(","));

  if (input.injuries && input.injuries.trim()) {
    params.set("injuries", input.injuries.trim());
  }

  return `/app/generate?${params.toString()}`;
}

export default function HomePageClient({ plans, onboardingBase }: HomePageClientProps) {
  const [progressRefreshKey, setProgressRefreshKey] = useState(0);

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

  const planProgress = useMemo(() => {
    void progressRefreshKey;
    return plans.map((plan) => {
      const completionMap = readCompletionMap(plan.id);
      const sessions = plan.days?.sessions || [];
      const summary = computePlanProgressSummary(sessions, completionMap);
      const completedAt = readWorkoutCompletedAt(plan.id);

      return {
        plan,
        summary,
        completedAt,
      };
    });
  }, [plans, progressRefreshKey]);

  const metrics = useMemo(() => {
    return planProgress.reduce(
      (acc, entry) => {
        acc.totalExercises += entry.summary.totalExercises;
        acc.completedExercises += entry.summary.completedExercises;
        acc.pendingExercises += entry.summary.pendingExercises;

        if (entry.summary.planState === "completed") {
          acc.completedPlans += 1;
        } else if (entry.summary.planState === "continue") {
          acc.inProgressPlans += 1;
        }

        return acc;
      },
      {
        totalExercises: 0,
        completedExercises: 0,
        pendingExercises: 0,
        completedPlans: 0,
        inProgressPlans: 0,
      }
    );
  }, [planProgress]);

  const completionRatio =
    metrics.totalExercises > 0
      ? metrics.completedExercises / metrics.totalExercises
      : 0;

  const recentlyCompleted = useMemo(() => {
    return planProgress
      .filter((entry) => entry.summary.planState === "completed")
      .map((entry) => {
        const completedAt = entry.completedAt || entry.plan.createdAt.toISOString();
        return {
          planId: entry.plan.id,
          title: `${goalLabel(entry.plan.days?.meta?.goal || entry.plan.summary?.goal)} Plan`,
          completedAt,
          split: entry.plan.days?.split || entry.plan.summary?.split || "Workout",
        };
      })
      .sort(
        (a, b) =>
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      )
      .slice(0, 3);
  }, [planProgress]);

  const recommendations = useMemo<RecommendationCard[]>(() => {
    const latestPlan = plans[0];

    const baseGoal = onboardingBase?.goal || normalizeGoal(latestPlan?.summary?.goal);
    const baseDays = clamp(
      onboardingBase?.daysPerWeek || latestPlan?.summary?.daysPerWeek || 3,
      1,
      7
    );
    const baseMinutes = clamp(
      onboardingBase?.minutesPerSession || latestPlan?.summary?.minutes || 45,
      30,
      180
    );
    const onboardingEquipment = onboardingBase?.equipment || [];
    const latestPlanEquipment = normalizeEquipmentList(latestPlan?.days?.meta?.equipment);
    const baseEquipment =
      onboardingEquipment.length > 0
        ? onboardingEquipment
        : latestPlanEquipment.length > 0
          ? latestPlanEquipment
          : (["bodyweight"] as Equipment[]);
    const baseLocation =
      onboardingBase?.location || normalizeLocation(latestPlan?.days?.meta?.location);
    const baseInjuries = onboardingBase?.injuries?.trim() || "";

    const goalVariationMap: Record<Goal, Goal> = {
      fat_loss: "general_health",
      hypertrophy: "strength",
      strength: "hypertrophy",
      returning: "general_health",
      general_health: "strength",
    };

    const progressiveDays =
      completionRatio >= 0.7 ? clamp(baseDays + 1, 1, 6) : baseDays;

    return [
      {
        id: "goal-continuation",
        title: `${goalLabel(baseGoal)} Progression`,
        description: `Keep your current goal with ${progressiveDays} training days per week.`,
        reason:
          completionRatio >= 0.7
            ? "Based on your completion trend, you can handle a slightly higher weekly load."
            : "Based on your completion trend, this keeps your current workload stable.",
        href: buildGenerateHref({
          goal: baseGoal,
          daysPerWeek: progressiveDays,
          minutesPerSession: baseMinutes,
          equipment: baseEquipment,
          location: [baseLocation],
          injuries: baseInjuries,
        }),
      },
      {
        id: "time-efficient",
        title: "Time-Efficient Block",
        description: "A shorter-session variation to improve consistency and adherence.",
        reason: "Based on your completion trend, shorter sessions can help sustain momentum.",
        href: buildGenerateHref({
          goal: baseGoal,
          daysPerWeek: baseDays,
          minutesPerSession: clamp(baseMinutes - 15, 30, 180),
          equipment: baseEquipment,
          location: [baseLocation],
          injuries: baseInjuries,
        }),
      },
      {
        id: "goal-variation",
        title: `${goalLabel(goalVariationMap[baseGoal])} Variation`,
        description: "A complementary block to diversify your stimulus and reduce plateaus.",
        reason: "Based on your profile, this variation balances your current training direction.",
        href: buildGenerateHref({
          goal: goalVariationMap[baseGoal],
          daysPerWeek: baseDays,
          minutesPerSession: baseMinutes,
          equipment: baseEquipment,
          location: [baseLocation],
          injuries: baseInjuries,
        }),
      },
    ];
  }, [completionRatio, onboardingBase, plans]);

  if (plans.length === 0) {
    return (
      <div className="pb-32 pt-4">
        <section className="bg-surface-light rounded-2xl p-8 shadow-soft border border-slate-100">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-primary">
              <span className="material-icons-round text-3xl">monitoring</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Your dashboard is ready</h1>
              <p className="text-sm text-slate-500">
                Generate your first workout plan to start tracking completion, progress insights,
                and AI recommendations.
              </p>
            </div>
            <Link
              href="/app/generate"
              className="inline-block bg-primary text-white px-8 py-3 rounded-full hover:bg-blue-700 transition-colors font-semibold shadow-lg shadow-blue-500/30"
            >
              Generate First Plan
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="pt-4 pb-32 space-y-6">
      <section>
        <h1 className="font-serif text-3xl md:text-4xl text-slate-900 leading-[1.15] tracking-tight">
          Progress Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Track completed work, pending volume, and choose your next AI-generated block.
        </p>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Progress Overview</h2>
          <Link href="/app/workouts" className="text-sm font-semibold text-primary hover:text-blue-700">
            View all workouts
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Completed</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">{metrics.completedExercises}</p>
            <p className="text-xs text-slate-500 mt-1">Exercises done</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Pending</p>
            <p className="text-3xl font-bold text-amber-500 mt-2">{metrics.pendingExercises}</p>
            <p className="text-xs text-slate-500 mt-1">Exercises remaining</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Completed Plans</p>
            <p className="text-3xl font-bold text-primary mt-2">{metrics.completedPlans}</p>
            <p className="text-xs text-slate-500 mt-1">Fully finished</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">In Progress</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{metrics.inProgressPlans}</p>
            <p className="text-xs text-slate-500 mt-1">Active plans</p>
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-300">Overall completion rate</p>
            <p className="text-sm font-semibold">{Math.round(completionRatio * 100)}%</p>
          </div>
          <div className="h-2 bg-slate-700 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-primary rounded-full transition-all duration-300"
              style={{ width: `${Math.round(completionRatio * 100)}%` }}
            />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">AI Recommendations</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {recommendations.map((item) => (
            <article key={item.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
              <div className="inline-flex items-center text-[11px] font-semibold uppercase tracking-wide text-primary bg-blue-50 px-2 py-1 rounded-full">
                Recommended
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-3">{item.title}</h3>
              <p className="text-sm text-slate-600 mt-2">{item.description}</p>
              <p className="text-xs text-slate-500 mt-3">{item.reason}</p>
              <Link
                href={item.href}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-blue-700"
              >
                Generate this plan
                <span className="material-icons-round text-base">arrow_forward</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Recently Completed Workouts</h2>

        {recentlyCompleted.length > 0 ? (
          <div className="space-y-2">
            {recentlyCompleted.map((entry) => (
              <Link
                key={entry.planId}
                href={`/app/workout/${entry.planId}`}
                className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center justify-between hover:border-slate-300 transition-colors"
              >
                <div>
                  <p className="font-semibold text-slate-900">{entry.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{entry.split}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Completed</p>
                  <p className="text-sm font-medium text-emerald-600 mt-1">
                    {formatCompletedDate(entry.completedAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Finish one full workout plan to populate your recent completions.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
