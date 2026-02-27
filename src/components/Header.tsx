"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const NotificationIcon = () => (
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
      d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0"
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
  const [hasUnreadNotification] = useState(true);
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

  // Show notifications icon when logged in and on app routes or onboarding
  const isAppRoute = pathname?.startsWith('/app/');
  const showNotifications = session?.user && (isAppRoute || isOnboardingPage);

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
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
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
            {showNotifications && (
              <div className="relative">
                <button
                  type="button"
                  aria-label="Notifications"
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                >
                  <NotificationIcon />
                </button>
                {hasUnreadNotification && (
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border border-white"></span>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
