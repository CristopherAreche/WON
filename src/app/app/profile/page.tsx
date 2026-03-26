import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";
import {
  fetchWonApiServerJson,
  type WonProfilePayload,
} from "@/lib/won-api-server";

function calculateAge(dateOfBirthISO: string) {
  const dateOfBirth = new Date(dateOfBirthISO);
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())
  ) {
    age -= 1;
  }

  return Math.max(age, 0);
}

export default async function ProfilePage() {
  const profile = await fetchWonApiServerJson<WonProfilePayload>("/api/user/profile");

  if (!profile) {
    redirect("/auth/login");
  }

  const dateOfBirth = profile.onboarding?.dateOfBirth || null;
  const age = dateOfBirth ? calculateAge(dateOfBirth) : null;
  const weightKg = profile.onboarding
    ? Math.round(profile.onboarding.currentWeight * 0.45359237)
    : null;
  const heightCm = profile.onboarding
    ? Math.round(profile.onboarding.height * 30.48)
    : null;

  return (
    <ProfileClient
      userName={profile.user.name}
      userEmail={profile.user.email}
      userCreatedAt={profile.user.createdAt}
      userIdentityLabel={profile.user.name || profile.user.email}
      profileImageDataUrl={profile.user.profileImageUri || null}
      fallbackAvatarUrl={null}
      age={age}
      weightKg={weightKg}
      heightCm={heightCm}
      dateOfBirth={dateOfBirth}
    />
  );
}
