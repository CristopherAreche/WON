"use client";

import { usePathname } from "next/navigation";
import GlobalAppHeader from "./GlobalAppHeader";
import BottomNavbar from "./BottomNavbar";

interface NavigationLayoutProps {
  children: React.ReactNode;
  user: {
    id: string;
    name: string | null;
    email: string;
    profileImageDataUrl?: string | null;
    fallbackImage?: string | null;
  };
}

export default function NavigationLayout({ children, user }: NavigationLayoutProps) {
  const pathname = usePathname();
  const isGenerateRoute = pathname.startsWith("/app/generate");
  const isWorkoutsRoute = pathname === "/app/workouts";

  const contentClassName = isGenerateRoute
    ? "flex-1 w-full px-4 sm:px-5 pb-28 pt-2 overflow-y-auto"
    : isWorkoutsRoute
      ? "flex-1 w-full max-w-4xl mx-auto px-6 pt-2 overflow-hidden"
      : "flex-1 w-full max-w-4xl mx-auto px-6 pb-28 pt-2 overflow-y-auto";

  return (
    <div className="font-sans bg-background-light min-h-screen relative flex flex-col">
      {/* Fixed Header */}
      <GlobalAppHeader
        userName={user.name}
        profileImageDataUrl={user.profileImageDataUrl || undefined}
        fallbackAvatarUrl={user.fallbackImage || undefined}
      />

      {/* Main Content Area */}
      <div className={contentClassName}>
        {children}
      </div>

      {/* Fixed Global Elements */}
      <BottomNavbar />
    </div>
  );
}
