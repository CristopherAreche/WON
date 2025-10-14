"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";

const HamburgerIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);

const DumbbellIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M7 21a4 4 0 01-4-4V7a4 4 0 014-4h10a4 4 0 014 4v10a4 4 0 01-4 4H7zM7 8h10M7 12h10M7 16h10"
    />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M15 19l-7-7 7-7"
    />
  </svg>
);

export default function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Show back arrow on all pages except home, plus onboarding when returning user
  const isHomePage = pathname === '/app/home';
  const isOnboardingPage = pathname === '/onboarding';
  const isReturningUser = searchParams?.get('returning') === 'true';
  const showBackButton = session?.user && (
    (!isHomePage && pathname?.startsWith('/app/')) || 
    (isOnboardingPage && isReturningUser)
  );

  const handleBack = () => {
    router.back();
  };

  const handleLogoClick = () => {
    if (session?.user) {
      router.push('/app/home');
    }
  };

  return (
    <>
      <header className="w-full py-2 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <div className="flex-1">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Go back"
              >
                <ArrowLeftIcon />
              </button>
            )}
          </div>
          <button 
            onClick={handleLogoClick}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            disabled={!session?.user}
          >
            <DumbbellIcon />
            <h1 className="text-2xl font-black text-black">WON</h1>
          </button>
          <div className="flex-1 flex justify-end">
            {session?.user && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <HamburgerIcon />
              </button>
            )}
          </div>
        </div>
      </header>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}
