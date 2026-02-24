"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNavbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-6 left-6 right-6 bg-surface-light/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 flex items-center justify-around px-2 py-3 z-50">
      <Link href="/app/home" className={`flex flex-col items-center justify-center w-14 h-14 transition-transform active:scale-95 ${pathname === '/app/home' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}>
        <span className="material-icons-round text-2xl">home</span>
        <span className="text-[10px] font-medium mt-1">Inicio</span>
      </Link>

      <Link href="/app/workouts" className={`flex flex-col items-center justify-center w-14 h-14 transition-transform active:scale-95 ${pathname === '/app/workouts' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}>
        <span className="material-icons-round text-2xl">fitness_center</span>
        <span className="text-[10px] font-medium mt-1">Rutinas</span>
      </Link>

      <div className="relative -top-6">
        <Link
          href="/onboarding"
          className="bg-primary text-white h-14 w-14 rounded-2xl shadow-glow flex items-center justify-center transform transition-transform hover:scale-105 active:scale-95 border-4 border-background-light"
        >
          <span className="material-icons-round text-3xl">add</span>
        </Link>
      </div>

      <Link href="/app/calendar" className={`flex flex-col items-center justify-center w-14 h-14 transition-transform active:scale-95 ${pathname === '/app/calendar' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}>
        <span className="material-icons-round text-2xl">calendar_today</span>
        <span className="text-[10px] font-medium mt-1">Calendario</span>
      </Link>

      <Link href="/app/progress" className={`flex flex-col items-center justify-center w-14 h-14 transition-transform active:scale-95 ${pathname === '/app/progress' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}>
        <span className="material-icons-round text-2xl">bar_chart</span>
        <span className="text-[10px] font-medium mt-1">Progreso</span>
      </Link>
    </nav>
  );
}
