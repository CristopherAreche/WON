import { redirect } from "next/navigation";
import {
  getWonApiSessionFromCookies,
  requestWonApiWithSession,
} from "@/lib/won-api-session";

type JsonRecord = Record<string, unknown>;

export interface WonUserSummary {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  profileImageUri?: string | null;
  securityToken?: string;
  onboardingComplete: boolean;
}

export interface WonPlanSummary {
  goal?: string;
  daysPerWeek?: number;
  minutes?: number;
  split?: string;
  description?: string;
}

export interface WonPlan {
  id: string;
  summary: WonPlanSummary;
  days: Record<string, unknown>;
  createdAt: string;
  onboarding?: Record<string, unknown>;
}

export interface WonOnboardingPayload {
  fullName: string;
  dateOfBirth: string;
  height: number;
  currentWeight: number;
  goal: "fat_loss" | "hypertrophy" | "strength" | "returning" | "general_health";
  experience:
    | "beginner"
    | "three_to_twelve_months"
    | "one_to_three_years"
    | "three_years_plus";
  daysPerWeek: number;
  minutesPerSession: number;
  equipment: Array<"bodyweight" | "bands" | "dumbbells" | "barbell" | "machines">;
  location: Array<"home" | "gym" | "park">;
  injuries?: string;
}

export interface WonHomePayload {
  user: WonUserSummary;
  plans: WonPlan[];
  onboardingBase: WonOnboardingPayload | null;
}

export interface WonProfilePayload {
  user: WonUserSummary;
  onboarding: WonOnboardingPayload | null;
}

function getErrorMessage(path: string, payload: unknown) {
  const data =
    payload && typeof payload === "object" ? (payload as JsonRecord) : null;

  if (typeof data?.message === "string") {
    return `${path}: ${data.message}`;
  }

  if (typeof data?.error === "string") {
    return `${path}: ${data.error}`;
  }

  return `${path}: REQUEST_FAILED`;
}

export async function fetchWonApiServerJson<T>(path: string) {
  const session = await getWonApiSessionFromCookies();

  if (!session) {
    return null;
  }

  const result = await requestWonApiWithSession(path, { session });

  if (result.response.status === 401) {
    return null;
  }

  if (!result.response.ok) {
    throw new Error(getErrorMessage(path, result.data));
  }

  return result.data as T;
}

export async function requireWonUser() {
  const user = await fetchWonApiServerJson<WonUserSummary>("/api/user/me");

  if (!user) {
    redirect("/auth/login");
  }

  return user;
}
