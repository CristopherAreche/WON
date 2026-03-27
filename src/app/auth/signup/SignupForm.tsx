"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiError } from "@/api/http";
import GoogleAuthButton from "@/components/GoogleAuthButton";
import { getAuthMessage } from "@/lib/auth-messages";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { storeOneTimeSecurityToken } from "@/lib/security-token";
import { bootstrapWonApiUser } from "@/lib/won-api-auth";

const preventInvalidNameInput = (e: React.KeyboardEvent) => {
  const emojiRegex =
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
  const numberRegex = /[0-9]/;
  const specialCharsRegex = /[!@#$%^&*(),.?":{}|<>]/;

  if (
    emojiRegex.test(e.key) ||
    numberRegex.test(e.key) ||
    specialCharsRegex.test(e.key)
  ) {
    e.preventDefault();
  }
};

const preventEmojiInput = (e: React.KeyboardEvent) => {
  const emojiRegex =
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
  if (emojiRegex.test(e.key)) {
    e.preventDefault();
  }
};

const SignupSchema = z
  .object({
    name: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]{2,50}$/.test(val),
        "Only letters and spaces, 2-50 characters"
      ),
    email: z
      .string()
      .email({ message: "Invalid email" })
      .refine(
        (val) =>
          !/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(
            val
          ),
        "Emojis are not allowed"
      ),
    password: z
      .string()
      .min(10, "Minimum 10 characters")
      .refine(
        (val) =>
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{10,}$/.test(
            val
          ),
        "Must include uppercase, lowercase, number, and special character"
      )
      .refine(
        (val) =>
          !/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(
            val
          ),
        "Emojis are not allowed"
      ),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don&apos;t match",
    path: ["confirmPassword"],
  });

export default function SignupForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const authMessage = getAuthMessage(search.get("message"));

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof SignupSchema>>({
    resolver: zodResolver(SignupSchema),
  });

  async function onSubmit(values: z.infer<typeof SignupSchema>) {
    setFieldErrors({});
    try {
      const supabase = getSupabaseBrowserClient();
      const normalizedName = values.name?.trim() || undefined;
      const { data, error } = await supabase.auth.signUp({
        email: values.email.trim().toLowerCase(),
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
          data: normalizedName
            ? {
                name: normalizedName,
                full_name: normalizedName,
              }
            : undefined,
        },
      });

      if (error) {
        throw error;
      }

      const accessToken = data.session?.access_token;
      if (!accessToken) {
        router.push("/auth/login?message=check-email");
        router.refresh();
        return;
      }

      let bootstrap;
      try {
        bootstrap = await bootstrapWonApiUser(accessToken, {
          name: normalizedName,
        });
      } catch (bootstrapError) {
        await supabase.auth.signOut();
        throw bootstrapError;
      }

      if (bootstrap.securityToken) {
        storeOneTimeSecurityToken(bootstrap.securityToken);
      }

      router.push("/onboarding");
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        setFieldErrors({
          general:
            "Your account was created in Supabase, but WON could not finish setup. Please sign in and try again.",
        });
        return;
      }

      const message =
        error instanceof Error ? error.message : "Could not create account";

      if (message.includes("email") || message.includes("Email")) {
        setFieldErrors({ email: message });
      } else if (message.includes("password") || message.includes("Password")) {
        setFieldErrors({ password: message });
      } else if (message.includes("name") || message.includes("Name")) {
        setFieldErrors({ name: message });
      } else {
        setFieldErrors({ general: message });
      }
    }
  }

  return (
    <div className="relative flex h-full min-h-screen w-full max-w-md flex-col overflow-hidden bg-white font-display text-slate-900 shadow-2xl mx-auto">
      <div className="pointer-events-none absolute top-[-15%] right-[-15%] h-[40%] w-[70%] rounded-full bg-accent-mint/60 blur-[80px] opacity-80" />
      <div className="pointer-events-none absolute bottom-[-10%] left-[-20%] h-[40%] w-[80%] rounded-full bg-lavender-start/20 blur-[90px]" />

      <header className="relative z-10 flex items-center justify-center px-6 pt-10 pb-4">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-slate-900"
            style={{ fontSize: "28px" }}
          >
            fitness_center
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            WON
          </h2>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex max-w-sm flex-1 flex-col justify-center px-8 w-full">
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-[32px] font-semibold tracking-tight text-slate-900">
            Create Account
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Start your journey to a better you.
          </p>
        </div>

        <div className="mb-6 space-y-4">
          <GoogleAuthButton
            next="/onboarding"
            source="signup"
            onError={(message) =>
              setFieldErrors((current) => ({
                ...current,
                general: message || undefined,
              }))
            }
          />
          <div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.24em] text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            <span>or continue with email</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="group">
            <div className="relative">
              <input
                className={`block w-full rounded-2xl bg-gray-50 px-6 py-4 text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:ring-2 ${
                  errors.name || fieldErrors.name
                    ? "border border-red-500 focus:ring-red-500/20"
                    : "border-0 border-transparent focus:ring-lavender-end"
                }`}
                id="name"
                placeholder="Full Name (optional)"
                type="text"
                onKeyDown={preventInvalidNameInput}
                {...register("name")}
              />
            </div>
            {(errors.name || fieldErrors.name) && (
              <p className="mt-1 px-2 text-sm text-red-500">
                {errors.name?.message || fieldErrors.name}
              </p>
            )}
          </div>

          <div className="group">
            <div className="relative">
              <input
                className={`block w-full rounded-2xl bg-gray-50 px-6 py-4 text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:ring-2 ${
                  errors.email || fieldErrors.email
                    ? "border border-red-500 focus:ring-red-500/20"
                    : "border-0 border-transparent focus:ring-lavender-end"
                }`}
                id="email"
                placeholder="Email Address"
                type="email"
                onKeyDown={preventEmojiInput}
                {...register("email")}
              />
            </div>
            {(errors.email || fieldErrors.email) && (
              <p className="mt-1 px-2 text-sm text-red-500">
                {errors.email?.message || fieldErrors.email}
              </p>
            )}
          </div>

          <div className="group">
            <div className="relative flex items-center">
              <input
                className={`block w-full rounded-2xl bg-gray-50 px-6 py-4 pr-12 text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:ring-2 ${
                  errors.password || fieldErrors.password
                    ? "border border-red-500 focus:ring-red-500/20"
                    : "border-0 border-transparent focus:ring-lavender-end"
                }`}
                id="password"
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                onKeyDown={preventEmojiInput}
                {...register("password")}
              />
              <button
                type="button"
                className="absolute right-4 text-slate-400 transition-colors hover:text-slate-600 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            {(errors.password || fieldErrors.password) && (
              <p className="mt-1 px-2 text-sm text-red-500">
                {errors.password?.message || fieldErrors.password}
              </p>
            )}
          </div>

          <div className="group">
            <div className="relative flex items-center">
              <input
                className={`block w-full rounded-2xl bg-gray-50 px-6 py-4 pr-12 text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:ring-2 ${
                  errors.confirmPassword || fieldErrors.confirmPassword
                    ? "border border-red-500 focus:ring-red-500/20"
                    : "border-0 border-transparent focus:ring-lavender-end"
                }`}
                id="confirmPassword"
                placeholder="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                onKeyDown={preventEmojiInput}
                {...register("confirmPassword")}
              />
              <button
                type="button"
                className="absolute right-4 text-slate-400 transition-colors hover:text-slate-600 focus:outline-none"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showConfirmPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            {(errors.confirmPassword || fieldErrors.confirmPassword) && (
              <p className="mt-1 px-2 text-sm text-red-500">
                {errors.confirmPassword?.message ||
                  fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          {authMessage && (
            <div
              className={`mt-2 rounded-2xl border px-4 py-3 text-center text-sm ${
                authMessage.tone === "info"
                  ? "border-blue-100 bg-blue-50 text-blue-700"
                  : "border-red-100 bg-red-50 text-red-500"
              }`}
            >
              {authMessage.text}
            </div>
          )}

          {fieldErrors.general && (
            <div className="mt-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-center text-sm text-red-500">
              {fieldErrors.general}
            </div>
          )}

          <div className="flex items-start px-2 pt-2">
            <div className="flex h-5 items-center">
              <input
                className="h-5 w-5 rounded border-0 border-gray-300 bg-gray-50 text-lavender-end focus:ring-lavender-end"
                id="terms"
                name="terms"
                type="checkbox"
                required
              />
            </div>
            <div className="ml-3 text-sm">
              <label className="font-medium text-slate-500" htmlFor="terms">
                I agree to the{" "}
                <a className="text-slate-800 hover:underline" href="#">
                  Terms
                </a>{" "}
                and{" "}
                <a className="text-slate-800 hover:underline" href="#">
                  Privacy Policy
                </a>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-lavender-start to-lavender-end px-6 py-5 text-lg font-semibold text-white shadow-lg shadow-indigo-200 transition-transform hover:from-indigo-300 hover:to-indigo-400 active:scale-[0.98] disabled:opacity-70 disabled:hover:from-lavender-start disabled:hover:to-lavender-end disabled:active:scale-100"
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
            <span className="material-symbols-outlined text-[20px]">
              arrow_forward
            </span>
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Already have an account?
            <Link
              className="ml-1 inline-flex items-center gap-1 font-semibold text-slate-900 transition-colors hover:text-lavender-end"
              href="/auth/login"
            >
              Log in
            </Link>
          </p>
        </div>
      </main>

      <footer className="relative z-10 py-6 text-center">
        <Link
          href="/auth/login"
          className="group flex items-center justify-center gap-1 text-xs text-slate-400 transition-colors hover:text-slate-600"
        >
          <span className="material-symbols-outlined text-[16px] transition-transform group-hover:-translate-x-1">
            arrow_back
          </span>
          Back to Login
        </Link>
      </footer>
    </div>
  );
}
