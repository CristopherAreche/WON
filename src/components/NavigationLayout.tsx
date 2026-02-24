"use client";

import { useState } from "react";
import GlobalAppHeader from "./GlobalAppHeader";
import Sidebar from "./Sidebar";
import BottomNavbar from "./BottomNavbar";

interface NavigationLayoutProps {
  children: React.ReactNode;
  user: {
    id: string;
    name: string | null;
    email: string;
    image?: string | null;
  };
}

export default function NavigationLayout({ children, user }: NavigationLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="font-sans bg-background-light min-h-screen relative flex flex-col">
      {/* Fixed Header */}
      <GlobalAppHeader
        userName={user.name}
        avatarUrl={user.image || undefined}
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-4xl mx-auto px-6 pb-28 pt-2 overflow-y-auto">
        {children}
      </div>

      {/* Fixed Global Elements */}
      <BottomNavbar />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </div>
  );
}
