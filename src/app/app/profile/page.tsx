import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

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
    },
  });

  if (!user) redirect("/auth/login");

  const onboardingAnswers = await prisma.onboardingAnswers.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex items-center justify-center p-8 min-h-full">
      <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-lg">
        <h1 className="text-2xl font-semibold text-black mb-6 text-center">
          My Profile
        </h1>

        <div className="space-y-6">
          {/* User Info */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-medium text-black mb-4">
              Personal Information
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium text-black">
                  {user.name || "Not specified"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium text-black">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Member since:</span>
                <span className="font-medium text-black">
                  {new Date(user.createdAt).toLocaleDateString("en-US")}
                </span>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-medium text-black mb-4">
              Account Settings
            </h2>
            <div className="space-y-3">
              <button className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors">
                Edit Profile
              </button>
              <button className="w-full border border-gray-300 text-black py-3 rounded-lg hover:bg-gray-50 transition-colors">
                Change Password
              </button>
            </div>
          </div>

          {/* App Info */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-medium text-black mb-4">
              App Information
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Version:</span>
                <span className="font-medium text-black">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last update:</span>
                <span className="font-medium text-black">10 Oct 2025</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
