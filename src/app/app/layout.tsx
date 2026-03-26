import { redirect } from "next/navigation";
import NavigationLayout from "@/components/NavigationLayout";
import { requireWonUser } from "@/lib/won-api-server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireWonUser();

  if (!user.onboardingComplete) {
    redirect("/onboarding");
  }

  return (
    <NavigationLayout
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        profileImageDataUrl: user.profileImageUri || null,
        fallbackImage: null,
      }}
    >
      {children}
    </NavigationLayout>
  );
}
