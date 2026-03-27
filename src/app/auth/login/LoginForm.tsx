"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { ApiError } from "@/api/http";
import GoogleAuthButton from "@/components/GoogleAuthButton";
import { getAuthMessage } from "@/lib/auth-messages";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { bootstrapWonApiUser } from "@/lib/won-api-auth";

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
  const rawCallbackUrl = search.get("callbackUrl");
  const callbackUrl =
    rawCallbackUrl &&
    rawCallbackUrl.startsWith("/") &&
    !rawCallbackUrl.startsWith("//")
      ? rawCallbackUrl
      : "/app/home";
  const message = search.get("message");
  const authMessage = getAuthMessage(message);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
  });

  async function onSubmit(values: z.infer<typeof LoginSchema>) {
    setErrorMsg(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });

      if (error) {
        throw error;
      }

      const accessToken = data.session?.access_token;
      if (!accessToken) {
        throw new Error("SESSION_NOT_ESTABLISHED");
      }

      try {
        await bootstrapWonApiUser(accessToken);
      } catch (bootstrapError) {
        await supabase.auth.signOut();
        throw bootstrapError;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMsg("We signed you in, but could not finish linking your WON account. Please try again.");
        return;
      }

      if (
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof error.message === "string" &&
        error.message.toLowerCase().includes("email not confirmed")
      ) {
        setErrorMsg("Confirm your email before signing in.");
        return;
      }

      if (
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof error.message === "string" &&
        error.message.toLowerCase().includes("invalid login credentials")
      ) {
        setErrorMsg("Invalid email or password. Please try again.");
        return;
      }

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

        <div className="w-full space-y-4 mb-6">
          <GoogleAuthButton
            next={callbackUrl}
            source="login"
            onError={(message) => setErrorMsg(message)}
          />
          <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            <span>or continue with email</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>
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
              href="/auth/forgot-password"
            >
              Forgot Password?
            </Link>
          </div>

          {authMessage && (
            <div
              className={`px-4 py-3 rounded-xl text-sm text-center border mt-2 ${
                authMessage.tone === "info"
                  ? "bg-blue-50 text-blue-700 border-blue-100"
                  : "bg-red-50 text-red-600 border-red-100"
              }`}
            >
              {authMessage.text}
            </div>
          )}

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
            {isSubmitting && (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {isSubmitting ? "Validating..." : "Sign In"}
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
