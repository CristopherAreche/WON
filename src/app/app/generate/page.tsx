import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import GenerateClient from "./GenerateClient";

type GenerateDefaults = {
  goal: "fat_loss" | "hypertrophy" | "strength" | "returning" | "general_health";
  daysPerWeek: number;
  minutesPerSession: number;
  equipment: Array<"bodyweight" | "bands" | "dumbbells" | "barbell" | "machines">;
  location: Array<"home" | "gym" | "park">;
  injuries?: string;
};

const GOALS = ["fat_loss", "hypertrophy", "strength", "returning", "general_health"] as const;
const EQUIPMENT = ["bodyweight", "bands", "dumbbells", "barbell", "machines"] as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function normalizeGoal(value: unknown, fallback: GenerateDefaults["goal"]): GenerateDefaults["goal"] {
  return typeof value === "string" && GOALS.includes(value as GenerateDefaults["goal"])
    ? (value as GenerateDefaults["goal"])
    : fallback;
}

function normalizeEquipment(value: unknown, fallback: GenerateDefaults["equipment"]) {
  if (!Array.isArray(value)) return fallback;
  const normalized = value.filter((item): item is GenerateDefaults["equipment"][number] =>
    EQUIPMENT.includes(item as GenerateDefaults["equipment"][number])
  );
  return normalized.length > 0 ? normalized : fallback;
}

function normalizeLocation(value: unknown, fallback: "home" | "gym" | "park") {
  if (Array.isArray(value)) {
    const normalized = value.filter((item): item is "home" | "gym" | "park" =>
      item === "home" || item === "gym" || item === "park"
    );
    return normalized.length > 0 ? normalized : [fallback];
  }

  if (value === "home" || value === "gym" || value === "park") {
    return [value];
  }

  return [fallback];
}

export default async function GeneratePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) redirect("/auth/login");

  const onboarding = await prisma.onboardingAnswers.findUnique({
    where: { userId: user.id },
    select: {
      goal: true,
      daysPerWeek: true,
      minutesPerSession: true,
      equipment: true,
      location: true,
      injuries: true,
    },
  });

  if (!onboarding) {
    redirect("/onboarding");
  }

  const latestPlan = await prisma.workoutPlan.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      onboarding: true,
    },
  });

  const snapshot = (latestPlan?.onboarding || {}) as Record<string, unknown>;

  const defaults: GenerateDefaults = {
    goal: normalizeGoal(snapshot.goal, onboarding.goal),
    daysPerWeek:
      typeof snapshot.daysPerWeek === "number"
        ? clamp(snapshot.daysPerWeek, 1, 7)
        : onboarding.daysPerWeek,
    minutesPerSession:
      typeof snapshot.minutesPerSession === "number"
        ? clamp(snapshot.minutesPerSession, 30, 180)
        : onboarding.minutesPerSession,
    equipment:
      normalizeEquipment(snapshot.equipment, onboarding.equipment as GenerateDefaults["equipment"]),
    location: normalizeLocation(snapshot.location, onboarding.location as "home" | "gym" | "park"),
    injuries:
      typeof snapshot.injuries === "string"
        ? snapshot.injuries
        : onboarding.injuries || "",
  };

  return <GenerateClient defaults={defaults} />;
}
