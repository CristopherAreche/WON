"use client";

import { usePathname, useRouter } from "next/navigation";

interface GlobalAppHeaderProps {
  userName?: string | null;
  profileImageDataUrl?: string;
  fallbackAvatarUrl?: string;
}

export default function GlobalAppHeader({
  userName,
  profileImageDataUrl,
  fallbackAvatarUrl,
}: GlobalAppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const avatarSrc = profileImageDataUrl || fallbackAvatarUrl;

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  // Determine variant based on route
  const isHome = pathname === '/app/home';

  // Map routes to page titles
  const getPageTitle = (path: string) => {
    if (path.includes('/app/workouts') || path.includes('/app/workout')) return "Workouts";
    if (path.includes('/app/metrics') || path.includes('/app/progress')) return "Progress";
    if (path.includes('/app/profile')) return "Profile";
    if (path.includes('/app/generate')) return "Generate Workout";
    if (path.includes('/onboarding')) return "Onboarding";
    return "";
  };

  return (
    <header className="px-6 py-4 flex items-center justify-between w-full relative z-10 transition-all duration-300">
      {isHome ? (
        // Home Variant
        <>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full border-2 border-slate-200 p-0.5">
              <div className="h-full w-full rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold shadow-sm overflow-hidden">
                {avatarSrc ? (
                  <img alt="User Avatar" className="h-full w-full object-cover" src={avatarSrc} />
                ) : (
                  getInitials(userName)
                )}
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-0.5">Welcome back</p>
              <p className="text-xl font-bold text-slate-900 font-sans">
                {userName ? userName.split(' ')[0] : 'Coach'}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Notifications"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md transition-shadow relative"
          >
            <span className="material-icons-round text-slate-600">notifications_none</span>
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border border-white"></span>
          </button>
        </>
      ) : (
        // Sub-page Variant
        <>
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md transition-shadow text-slate-600 relative z-20"
          >
            <span className="material-icons-round">arrow_back</span>
          </button>

          {/* Center Title */}
          <h2 className="text-xl font-bold text-slate-900 absolute left-1/2 transform -translate-x-1/2 z-10 w-full text-center pointer-events-none">
            {getPageTitle(pathname)}
          </h2>

          <button
            type="button"
            aria-label="Notifications"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md transition-shadow relative z-20"
          >
            <span className="material-icons-round text-slate-600">notifications_none</span>
          </button>
        </>
      )}
    </header>
  );
}
