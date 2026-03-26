import { redirect } from "next/navigation";
import { requireWonUser } from "@/lib/won-api-server";
import OnboardingClient from "./_client";

export default async function OnboardingPage() {
  const user = await requireWonUser();

  if (user.onboardingComplete) {
    redirect("/app/home");
  }

  return <OnboardingClient userName={user.name ?? user.email} />;
}
