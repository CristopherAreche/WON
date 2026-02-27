// src/app/page.tsx
import Link from "next/link";

export default function Landing() {
  return (
    <div className="relative flex min-h-full w-full flex-col max-w-md mx-auto shadow-2xl overflow-hidden bg-white font-display">
      {/* Background Blurs */}
      <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[50%] bg-accent-periwinkle/60 rounded-full blur-[80px] pointer-events-none opacity-60"></div>
      <div className="absolute top-[20%] right-[-10%] w-[60%] h-[40%] bg-accent-lemon/70 rounded-full blur-[60px] pointer-events-none opacity-50"></div>

      {/* Internal Navigation Header */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-6 pb-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-900">fitness_center</span>
          <h2 className="text-slate-900 text-xl font-bold tracking-tight">WON</h2>
        </div>
        <Link
          href="/auth/login"
          className="bg-primary hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-full shadow-sm text-sm transition-colors"
        >
          Login
        </Link>
      </header>

      <main className="flex-1 flex flex-col relative z-10 w-full">
        <div className="flex flex-col items-center justify-center px-6 pt-8 pb-8 text-center">
          <h1 className="text-slate-900 text-[34px] font-light leading-[1.15] tracking-tight mb-8">
            Your body, <br />
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">engineered by AI.</span>
          </h1>

          {/* Floating Card UI */}
          <div className="animate-float relative w-full aspect-[4/5] max-h-[380px] rounded-2xl overflow-hidden shadow-glass backdrop-blur-md border border-white/40 bg-white/30 flex flex-col p-1">
            <div className="flex-1 rounded-[1.25rem] bg-white/40 relative overflow-hidden flex flex-col justify-between p-6 group">
              <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[conic-gradient(at_center,_var(--tw-gradient-stops))] from-accent-periwinkle via-white to-accent-seafoam opacity-60 blur-xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-[12px] border-white/60 shadow-lg flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full border-[8px] border-primary/20 flex items-center justify-center animate-pulse">
                    <span className="material-symbols-outlined text-primary text-4xl">fitness_center</span>
                  </div>
                </div>
              </div>
              <div className="relative z-10 flex justify-between items-start">
                <div className="text-left">
                  <p className="text-xs uppercase tracking-widest font-semibold text-slate-500 mb-1">Today&apos;s Focus</p>
                  <h3 className="text-xl font-bold text-slate-900">Strength &amp; Mobility</h3>
                </div>
                <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-primary shadow-sm">
                  45 min
                </div>
              </div>
              <div className="relative z-10 mt-auto pt-8 text-left">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-1 flex-1 bg-white/50 rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-primary rounded-full"></div>
                  </div>
                  <span className="text-xs font-medium text-slate-600">33%</span>
                </div>
                <p className="text-sm text-slate-600">AI adjusted intensity based on yesterday&apos;s recovery.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="px-6 pb-6 w-full">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Intelligence</h2>
            <span className="text-xs font-medium text-primary">Learn more</span>
          </div>
          <div className="flex overflow-x-auto scrollbar-hide gap-4 pb-4 -mx-6 px-6 snap-x">
            <div className="snap-center shrink-0 w-[240px] p-5 rounded-2xl bg-accent-periwinkle/30 backdrop-blur-sm border border-white/50 shadow-sm text-left">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm text-primary">
                <span className="material-symbols-outlined">auto_fix_high</span>
              </div>
              <h3 className="text-slate-900 font-semibold text-base mb-1">AI Personalization</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Tailored to your biometrics and daily inputs.</p>
            </div>
            <div className="snap-center shrink-0 w-[240px] p-5 rounded-2xl bg-accent-lemon/40 backdrop-blur-sm border border-white/50 shadow-sm text-left">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm text-yellow-600">
                <span className="material-symbols-outlined">ecg_heart</span>
              </div>
              <h3 className="text-slate-900 font-semibold text-base mb-1">Real-time Progress</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Live adjustments as you move and breathe.</p>
            </div>
            <div className="snap-center shrink-0 w-[240px] p-5 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm opacity-60 text-left">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm text-slate-400">
                <span className="material-symbols-outlined">bar_chart</span>
              </div>
              <h3 className="text-slate-900 font-semibold text-base mb-1">Analytics</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Deep dive into your performance data.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-20 bg-accent-seafoam px-6 py-8 mt-auto rounded-t-[2.5rem]">
        <div className="flex flex-col items-center text-center gap-6">
          <div>
            <h2 className="text-slate-900 text-2xl font-bold tracking-tight mb-2">Ready to begin?</h2>
            <p className="text-slate-600 text-sm">Create an account or login to access WON.</p>
          </div>

          <div className="w-full max-w-sm flex flex-col gap-3">
            <Link
              href="/auth/signup"
              className="w-full bg-primary hover:bg-blue-700 text-white font-medium text-lg py-4 rounded-full shadow-lg shadow-primary/20 transform active:scale-95 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Get Started</span>
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-[20px]">arrow_forward</span>
            </Link>

            <Link
              href="/auth/login"
              className="w-full bg-white text-slate-900 border border-slate-200 font-medium text-lg py-4 rounded-full shadow-sm transform active:scale-95 transition-all flex items-center justify-center hover:bg-slate-50"
            >
              <span>Login</span>
            </Link>
          </div>
          <p className="text-xs text-slate-400 font-medium">No credit card required for 14 days.</p>
        </div>
      </footer>
    </div>
  );
}
