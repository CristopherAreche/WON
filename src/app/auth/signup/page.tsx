"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Utility function to prevent emoji and number input in name fields
const preventInvalidNameInput = (e: React.KeyboardEvent) => {
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
  const numberRegex = /[0-9]/;
  const specialCharsRegex = /[!@#$%^&*(),.?":{}|<>]/;

  if (emojiRegex.test(e.key) || numberRegex.test(e.key) || specialCharsRegex.test(e.key)) {
    e.preventDefault();
  }
};

// Utility function to prevent emoji input in email/password
const preventEmojiInput = (e: React.KeyboardEvent) => {
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
  if (emojiRegex.test(e.key)) {
    e.preventDefault();
  }
};

const SignupSchema = z.object({
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
      (val) => !/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(val),
      "Emojis are not allowed"
    ),
  password: z
    .string()
    .min(12, "Minimum 12 characters")
    .refine(
      (val) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{12,}$/.test(val),
      "Must include uppercase, lowercase, number, and special character"
    )
    .refine(
      (val) => !/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(val),
      "Emojis are not allowed"
    ),
  confirmPassword: z
    .string()
    .min(1, "Confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don&apos;t match",
  path: ["confirmPassword"],
});

export default function SignupPage() {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [securityToken, setSecurityToken] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof SignupSchema>>({
    resolver: zodResolver(SignupSchema),
  });

  async function onSubmit(values: z.infer<typeof SignupSchema>) {
    setFieldErrors({});
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));

      // Handle specific field errors
      if (data?.error?.includes("email") || data?.error?.includes("Email")) {
        setFieldErrors({ email: data.error });
      } else if (data?.error?.includes("password") || data?.error?.includes("Password")) {
        setFieldErrors({ password: data.error });
      } else if (data?.error?.includes("name") || data?.error?.includes("Name")) {
        setFieldErrors({ name: data.error });
      } else {
        setFieldErrors({ general: data?.error ?? "Could not create account" });
      }
      return;
    }

    // Get the security token from signup response
    const data = await res.json();
    if (data.securityToken) {
      setSecurityToken(data.securityToken);
      return; // Show token display instead of auto-login
    }

    // auto-login (fallback if no token in response)
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (result?.ok) {
      router.push("/onboarding");
    } else {
      setFieldErrors({ general: "Account created but login failed. Please try logging in manually." });
    }
  }

  const copyToClipboard = async () => {
    if (!securityToken) return;
    try {
      await navigator.clipboard.writeText(securityToken);
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const proceedToLogin = () => {
    // Redirect to login page after user acknowledges security token
    router.push("/auth/login");
  };

  // Show security token success view
  if (securityToken) {
    return (
      <div className="relative flex h-full min-h-screen w-full flex-col max-w-md mx-auto shadow-2xl overflow-hidden bg-white font-display">
        <div className="absolute top-[-15%] right-[-15%] w-[70%] h-[40%] bg-accent-mint/60 rounded-full blur-[80px] pointer-events-none opacity-80"></div>
        <div className="absolute bottom-[-10%] left-[-20%] w-[80%] h-[40%] bg-lavender-start/20 rounded-full blur-[90px] pointer-events-none"></div>

        <header className="relative z-10 flex items-center justify-center px-6 pt-10 pb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-900" style={{ fontSize: '28px' }}>fitness_center</span>
            <h2 className="text-slate-900 text-2xl font-bold tracking-tight">WON</h2>
          </div>
        </header>

        <main className="flex-1 flex flex-col justify-center px-8 relative z-10 w-full max-w-sm mx-auto">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-accent-mint/50 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <span className="material-symbols-outlined text-teal-600 text-3xl">check_circle</span>
            </div>

            <div>
              <h1 className="text-[32px] font-semibold text-slate-900 tracking-tight mb-2">Account Created!</h1>
              <p className="text-slate-500 text-sm font-medium">
                Your account has been successfully created. Please save your security token below.
              </p>
            </div>

            <div className="bg-amber-50/80 border border-amber-200/50 rounded-2xl p-5 shadow-soft">
              <h3 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">warning</span>
                Save Your Security Token
              </h3>
              <p className="text-sm text-amber-700/80 mb-4 leading-relaxed">
                This 10-digit code is required for password changes and resets. Keep it secure and accessible.
              </p>

              <div className="relative">
                <input
                  type="text"
                  value={showToken ? securityToken : '••••••••••'}
                  readOnly
                  className="w-full border-0 rounded-xl px-4 py-3 pr-20 bg-white font-mono text-center tracking-wider text-slate-800 shadow-sm focus:ring-2 focus:ring-amber-200"
                />

                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                  {/* Copy Button */}
                  <button
                    onClick={copyToClipboard}
                    className="p-2 text-slate-400 hover:text-amber-600 transition-colors focus:outline-none"
                    title={tokenCopied ? 'Copied!' : 'Copy to clipboard'}
                  >
                    {tokenCopied ? (
                      <span className="material-symbols-outlined text-emerald-500 text-[20px]">check</span>
                    ) : (
                      <span className="material-symbols-outlined text-[20px]">content_copy</span>
                    )}
                  </button>

                  {/* Show/Hide Button */}
                  <button
                    onClick={() => setShowToken(!showToken)}
                    className="p-2 text-slate-400 hover:text-amber-600 transition-colors focus:outline-none"
                    title={showToken ? 'Hide token' : 'Show token'}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showToken ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {tokenCopied && (
                <p className="text-sm text-emerald-600 mt-3 font-medium">✓ Token copied to clipboard!</p>
              )}
            </div>

            <button
              onClick={proceedToLogin}
              className="w-full mt-4 py-4 px-6 rounded-2xl bg-gradient-to-r from-lavender-start to-lavender-end hover:from-indigo-300 hover:to-indigo-400 text-white font-semibold text-lg shadow-lg shadow-indigo-200 transform transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Continue to Login
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>

            <p className="text-xs text-slate-400 font-medium">
              Save it now. It is only shown in full during account creation.
            </p>
          </div>
        </main>
        <footer className="relative z-10 py-6 text-center"></footer>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col max-w-md mx-auto shadow-2xl overflow-hidden bg-white font-display text-slate-900">
      <div className="absolute top-[-15%] right-[-15%] w-[70%] h-[40%] bg-accent-mint/60 rounded-full blur-[80px] pointer-events-none opacity-80"></div>
      <div className="absolute bottom-[-10%] left-[-20%] w-[80%] h-[40%] bg-lavender-start/20 rounded-full blur-[90px] pointer-events-none"></div>

      <header className="relative z-10 flex items-center justify-center px-6 pt-10 pb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-900" style={{ fontSize: '28px' }}>fitness_center</span>
          <h2 className="text-slate-900 text-2xl font-bold tracking-tight">WON</h2>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center px-8 relative z-10 w-full max-w-sm mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-[32px] font-semibold text-slate-900 tracking-tight mb-3">
            Create Account
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Start your journey to a better you.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="group">
            <div className="relative">
              <input
                className={`block w-full px-6 py-4 bg-gray-50 border ${errors.name || fieldErrors.name ? 'border-red-500 focus:ring-red-500/20' : 'border-0 border-transparent focus:ring-lavender-end'} text-slate-900 placeholder:text-slate-400 focus:ring-2 rounded-2xl transition-all shadow-sm`}
                id="name"
                placeholder="Full Name (optional)"
                type="text"
                onKeyDown={preventInvalidNameInput}
                {...register("name")}
              />
            </div>
            {(errors.name || fieldErrors.name) && (
              <p className="text-sm text-red-500 px-2 mt-1">{errors.name?.message || fieldErrors.name}</p>
            )}
          </div>

          <div className="group">
            <div className="relative">
              <input
                className={`block w-full px-6 py-4 bg-gray-50 border ${errors.email || fieldErrors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-0 border-transparent focus:ring-lavender-end'} text-slate-900 placeholder:text-slate-400 focus:ring-2 rounded-2xl transition-all shadow-sm`}
                id="email"
                placeholder="Email Address"
                type="email"
                onKeyDown={preventEmojiInput}
                {...register("email")}
              />
            </div>
            {(errors.email || fieldErrors.email) && (
              <p className="text-sm text-red-500 px-2 mt-1">{errors.email?.message || fieldErrors.email}</p>
            )}
          </div>

          <div className="group">
            <div className="relative flex items-center">
              <input
                className={`block w-full px-6 py-4 bg-gray-50 border ${errors.password || fieldErrors.password ? 'border-red-500 focus:ring-red-500/20' : 'border-0 border-transparent focus:ring-lavender-end'} text-slate-900 placeholder:text-slate-400 focus:ring-2 rounded-2xl transition-all shadow-sm pr-12`}
                id="password"
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                onKeyDown={preventEmojiInput}
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
            {(errors.password || fieldErrors.password) && (
              <p className="text-sm text-red-500 px-2 mt-1">{errors.password?.message || fieldErrors.password}</p>
            )}
          </div>

          <div className="group">
            <div className="relative flex items-center">
              <input
                className={`block w-full px-6 py-4 bg-gray-50 border ${errors.confirmPassword || fieldErrors.confirmPassword ? 'border-red-500 focus:ring-red-500/20' : 'border-0 border-transparent focus:ring-lavender-end'} text-slate-900 placeholder:text-slate-400 focus:ring-2 rounded-2xl transition-all shadow-sm pr-12`}
                id="confirmPassword"
                placeholder="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                onKeyDown={preventEmojiInput}
                {...register("confirmPassword")}
              />
              <button
                type="button"
                className="absolute right-4 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showConfirmPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            {(errors.confirmPassword || fieldErrors.confirmPassword) && (
              <p className="text-sm text-red-500 px-2 mt-1">{errors.confirmPassword?.message || fieldErrors.confirmPassword}</p>
            )}
          </div>

          {fieldErrors.general && (
            <div className="bg-red-50 text-red-500 px-4 py-3 rounded-2xl text-sm text-center border border-red-100 mt-2">
              {fieldErrors.general}
            </div>
          )}

          <div className="flex items-start pt-2 px-2">
            <div className="flex items-center h-5">
              <input
                className="w-5 h-5 border-gray-300 rounded text-lavender-end focus:ring-lavender-end bg-gray-50 border-0"
                id="terms"
                name="terms"
                type="checkbox"
                required
              />
            </div>
            <div className="ml-3 text-sm">
              <label className="font-medium text-slate-500" htmlFor="terms">
                I agree to the <a className="text-slate-800 hover:underline" href="#">Terms</a> and <a className="text-slate-800 hover:underline" href="#">Privacy Policy</a>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-4 py-5 px-6 rounded-2xl bg-gradient-to-r from-lavender-start to-lavender-end hover:from-indigo-300 hover:to-indigo-400 text-white font-semibold text-lg shadow-lg shadow-indigo-200 transform transition-transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:from-lavender-start disabled:hover:to-lavender-end disabled:active:scale-100"
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            Already have an account?
            <Link className="text-slate-900 font-semibold hover:text-lavender-end transition-colors inline-flex items-center gap-1 ml-1" href="/auth/login">
              Log in
            </Link>
          </p>
        </div>
      </main>

      <footer className="relative z-10 py-6 text-center">
        <Link
          href="/auth/login"
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-1 group"
        >
          <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Back to Login
        </Link>
      </footer>
    </div>
  );
}
