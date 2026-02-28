import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import ProfileClient from "./ProfileClient";

function calculateAge(dateOfBirth: Date) {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age -= 1;
  }

  return Math.max(age, 0);
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      profileImageDataUrl: true,
    },
  });

  if (!user) redirect("/auth/login");

  const onboardingAnswers = await prisma.onboardingAnswers.findUnique({
    where: { userId: user.id },
    select: {
      dateOfBirth: true,
      height: true,
      currentWeight: true,
    },
  });

  const age = onboardingAnswers ? calculateAge(onboardingAnswers.dateOfBirth) : null;
  const weightKg = onboardingAnswers ? Math.round(onboardingAnswers.currentWeight * 0.45359237) : null;
  const heightCm = onboardingAnswers ? Math.round(onboardingAnswers.height * 30.48) : null;

  return (
    <ProfileClient
      userName={user.name}
      userEmail={user.email}
      userCreatedAt={user.createdAt.toISOString()}
      userIdentityLabel={user.name || user.email}
      profileImageDataUrl={user.profileImageDataUrl}
      fallbackAvatarUrl={session.user.image || null}
      age={age}
      weightKg={weightKg}
      heightCm={heightCm}
      dateOfBirth={onboardingAnswers ? onboardingAnswers.dateOfBirth.toISOString() : null}
    />
  );
}
