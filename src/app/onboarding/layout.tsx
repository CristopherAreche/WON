import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import NavigationLayout from "@/components/NavigationLayout";
import { prisma } from "@/lib/db";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  // Get user details, including name and image if available
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
    }
  });

  if (!dbUser) {
    redirect("/auth/login");
  }

  return (
    <NavigationLayout user={{ ...dbUser, image: session.user.image }}>
      {children}
    </NavigationLayout>
  );
}
