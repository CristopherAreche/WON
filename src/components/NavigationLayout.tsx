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
  const isFocusedRoute = pathname.startsWith("/app/generate") || pathname.startsWith("/app/profile") || pathname.startsWith("/app/change-password");
  const contentClassName = `flex-1 w-full min-w-0 mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-2 ${isFocusedRoute ? "max-w-3xl" : "max-w-6xl"}`;

  return (
    <div className="font-sans bg-background-light min-h-dvh relative flex flex-col">
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
