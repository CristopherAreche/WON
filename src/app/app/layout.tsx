import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import NavigationLayout from "@/components/NavigationLayout";
import { prisma } from "@/lib/db";
import { cache } from "react";

// Cache user fetching across the server-rendering lifecycle
// to prevent duplicate DB hits during navigation
const getUser = cache(async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      profileImageDataUrl: true,
      onboarding: {
        select: { userId: true },
      },
    }
  });
});

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  // Get user details via cache
  const dbUser = await getUser(session.user.email);

  if (!dbUser) {
    redirect("/auth/login");
  }

  if (!dbUser.onboarding) {
    redirect("/onboarding");
  }

  return (
    <NavigationLayout
      user={{
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        profileImageDataUrl: dbUser.profileImageDataUrl,
        fallbackImage: session.user.image,
      }}
    >
      {children}
    </NavigationLayout>
  );
}
