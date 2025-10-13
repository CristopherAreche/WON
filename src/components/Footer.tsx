"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";

// Custom SVG Icons
const HomeIcon = () => (
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
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);

const CalendarIcon = () => (
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
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const PlusIcon = () => (
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
      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
    />
  </svg>
);

const ChartIcon = () => (
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
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);

export default function Footer() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Show navigation icons only for logged-in users on app pages
  const isAppPage = pathname?.startsWith("/app/");
  const showNavigation = session?.user && isAppPage;

  if (!showNavigation) {
    // Show simple footer with name for non-logged-in users or auth pages
    return (
      <footer className="w-full py-4 bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-sm text-gray-500">
            Created by Cristopher Areche © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    );
  }

  // Show navigation icons for logged-in users
  return (
    <footer className="w-full py-1 bg-white border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-center space-x-8">
          <div className="flex flex-col items-center space-y-1 p-2 rounded-lg text-gray-400 cursor-not-allowed">
            <CalendarIcon />
            <span className="text-xs">Workouts</span>
          </div>

          <button className="flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-black">
            <PlusIcon />
            <span className="text-xs">Add</span>
          </button>

          <div className="flex flex-col items-center space-y-1 p-2 rounded-lg text-gray-400 cursor-not-allowed">
            <ChartIcon />
            <span className="text-xs">Progress</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
