import { redirect } from "next/navigation";
import { fetchWonApiServerJson, type WonHomePayload } from "@/lib/won-api-server";
import ProgressPageClient, { type ProgressPlan } from "./ProgressPageClient";

export default async function ProgressPage() {
  const home = await fetchWonApiServerJson<WonHomePayload>("/api/user/home");
  if (!home) redirect("/auth/login");

  const plans: ProgressPlan[] = home.plans.map((plan) => ({
    id: plan.id,
    title: plan.summary.split || plan.summary.description || "Training plan",
    daysPerWeek: plan.summary.daysPerWeek,
    createdAt: plan.createdAt,
  }));

  return <ProgressPageClient plans={plans} weeklyGoal={home.onboardingBase?.daysPerWeek ?? null} />;
}
