import { requireWonUser } from "@/lib/won-api-server";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireWonUser();
  return children;
}
