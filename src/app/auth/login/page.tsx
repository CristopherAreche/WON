import { Suspense } from "react";
import LoginForm from "./LoginForm";

// Loading component for Suspense fallback
function LoginLoading() {
  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto overflow-hidden bg-[#F9FAFB] justify-center font-display">
      <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[40%] bg-accent-periwinkle/60 rounded-full blur-[80px] pointer-events-none opacity-80"></div>
      <div className="absolute bottom-[-10%] left-[-20%] w-[60%] h-[40%] bg-accent-seafoam/40 rounded-full blur-[70px] pointer-events-none opacity-50"></div>

      <div className="relative z-10 w-full px-8 flex flex-col items-center animate-pulse">
        <div className="mb-12 flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm"></div>
          <div className="h-6 bg-slate-200 rounded w-20"></div>
        </div>

        <div className="w-full flex flex-col items-center mb-10 gap-2">
          <div className="h-8 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        </div>

        <div className="w-full space-y-5">
          <div className="h-14 bg-white rounded-xl shadow-sm"></div>
          <div className="h-14 bg-white rounded-xl shadow-sm"></div>
          <div className="flex justify-end pt-1">
            <div className="h-4 bg-slate-200 rounded w-1/3"></div>
          </div>
          <div className="h-14 bg-slate-200 rounded-xl mt-4"></div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}