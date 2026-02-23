"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

// Utility function to prevent emoji input
const preventEmojiInput = (e: React.KeyboardEvent) => {
  const emojiRegex =
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
  if (emojiRegex.test(e.key)) {
    e.preventDefault();
  }
};

const LoginSchema = z.object({
  email: z
    .string()
    .email("Invalid email")
    .refine(
      (val) =>
        !/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(
          val
        ),
      "Emojis are not allowed"
    ),
  password: z
    .string()
    .min(1, "Password is required")
    .refine(
      (val) =>
        !/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(
          val
        ),
      "Emojis are not allowed"
    ),
});

export default function LoginForm() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const search = useSearchParams();
  const callbackUrl = search.get("callbackUrl") ?? "/app/home";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
  });

  async function onSubmit(values: z.infer<typeof LoginSchema>) {
    setErrorMsg(null);
    const result = await signIn("credentials", {
      ...values,
      redirect: false,
    });

    if (result?.ok) {
      router.push(callbackUrl);
    } else {
      setErrorMsg("Invalid email or password. Please try again.");
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto shadow-2xl overflow-hidden bg-[#F9FAFB] justify-center font-display text-slate-900">
      {/* Background Blurs */}
      <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[40%] bg-accent-periwinkle/60 rounded-full blur-[80px] pointer-events-none opacity-80"></div>
      <div className="absolute bottom-[-10%] left-[-20%] w-[60%] h-[40%] bg-accent-seafoam/40 rounded-full blur-[70px] pointer-events-none opacity-50"></div>

      <div className="relative z-10 w-full px-8 flex flex-col items-center">
        <div className="mb-12 flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-primary text-4xl">fitness_center</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">WON</h2>
        </div>

        <div className="w-full text-center mb-10">
          <h1 className="text-3xl font-light text-slate-900 mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 text-sm">Please sign in to continue your journey</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5">
          <div className="space-y-1">
            <label className="sr-only" htmlFor="email">Email</label>
            <div className="relative">
              <input
                id="email"
                type="email"
                className={`w-full px-5 py-4 bg-white border ${errors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-primary/20 focus:border-primary'} rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all shadow-sm text-sm`}
                onKeyDown={preventEmojiInput}
                placeholder="Email"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500 px-1">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="sr-only" htmlFor="password">Password</label>
            <div className="relative flex items-center">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className={`w-full px-5 py-4 bg-white border ${errors.password ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-primary/20 focus:border-primary'} rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all shadow-sm text-sm pr-12`}
                onKeyDown={preventEmojiInput}
                placeholder="Password"
                {...register("password")}
              />
              <button
                type="button"
                className="absolute right-4 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500 px-1">{errors.password.message}</p>
            )}
          </div>

          <div className="flex justify-end pt-1">
            <Link
              className="text-sm font-medium text-slate-500 hover:text-primary transition-colors"
              href="/auth/reset-password-token"
            >
              Forgot Password?
            </Link>
          </div>

          {errorMsg && (
            <div className="bg-red-50 text-red-500 px-4 py-3 rounded-xl text-sm text-center border border-red-100 mt-2">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-blue-700 text-white font-medium text-lg py-4 rounded-xl shadow-lg shadow-primary/20 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:hover:bg-primary disabled:active:scale-100"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            Don&apos;t have an account?
            <Link className="font-semibold text-primary hover:text-blue-700 transition-colors ml-1" href="/auth/signup">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}