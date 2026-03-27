import { Suspense } from "react";
import SignupForm from "./SignupForm";

function SignupLoading() {
  return (
    <div className="relative flex min-h-screen w-full max-w-md flex-col justify-center overflow-hidden bg-white font-display shadow-2xl mx-auto">
      <div className="pointer-events-none absolute top-[-15%] right-[-15%] h-[40%] w-[70%] rounded-full bg-accent-mint/60 blur-[80px] opacity-80" />
      <div className="pointer-events-none absolute bottom-[-10%] left-[-20%] h-[40%] w-[80%] rounded-full bg-lavender-start/20 blur-[90px]" />

      <div className="relative z-10 mx-auto flex w-full max-w-sm flex-col items-center px-8 animate-pulse">
        <div className="mb-10 flex flex-col items-center gap-3">
          <div className="h-12 w-20 rounded bg-slate-200" />
          <div className="h-8 w-52 rounded bg-slate-200" />
          <div className="h-4 w-40 rounded bg-slate-200" />
        </div>

        <div className="mb-6 w-full space-y-4">
          <div className="h-14 rounded-2xl bg-white shadow-sm" />
          <div className="h-4 rounded bg-slate-200" />
        </div>

        <div className="w-full space-y-5">
          <div className="h-14 rounded-2xl bg-white shadow-sm" />
          <div className="h-14 rounded-2xl bg-white shadow-sm" />
          <div className="h-14 rounded-2xl bg-white shadow-sm" />
          <div className="h-14 rounded-2xl bg-white shadow-sm" />
          <div className="h-5 w-3/4 rounded bg-slate-200" />
          <div className="h-14 rounded-2xl bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupLoading />}>
      <SignupForm />
    </Suspense>
  );
}
