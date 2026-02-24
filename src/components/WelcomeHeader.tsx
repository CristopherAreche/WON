'use client';

interface WelcomeHeaderProps {
  userName?: string | null;
  onOpenSidebar: () => void;
  avatarUrl?: string; // Opt
}

export default function WelcomeHeader({ userName, onOpenSidebar, avatarUrl }: WelcomeHeaderProps) {
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="py-4 flex items-center justify-between w-full">
      <div className="flex items-center gap-4">
        {/* Avatar with Ring */}
        <div className="h-14 w-14 rounded-full border-2 border-slate-200 p-0.5">
          <div className="h-full w-full rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold shadow-sm overflow-hidden">
            {avatarUrl ? (
              <img alt="User Avatar" className="h-full w-full object-cover" src={avatarUrl} />
            ) : (
              getInitials(userName)
            )}
          </div>
        </div>

        {/* Welcome Text */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-0.5">Welcome back</p>
          <p className="text-xl font-bold text-slate-900 font-sans">
            {userName ? userName.split(' ')[0] : 'Entrenador'}
          </p>
        </div>
      </div>

      {/* Button instead of notification bell */}
      <button
        onClick={onOpenSidebar}
        className="p-2 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow relative"
      >
        <span className="material-icons-round text-slate-600">menu</span>
        {/* Optional notification dot for style */}
        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border border-white"></span>
      </button>
    </header>
  );
}