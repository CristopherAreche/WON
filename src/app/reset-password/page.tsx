'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

// Utility function to prevent emoji input
const preventEmojiInput = (e: React.KeyboardEvent) => {
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
  if (emojiRegex.test(e.key)) {
    e.preventDefault();
  }
};

const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one symbol')
    .refine(
      (val) => !/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(val),
      "Emojis are not allowed"
    ),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    feedback: string[];
  }>({ score: 0, feedback: [] });

  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const newPassword = watch('newPassword');

  useEffect(() => {
    const urlToken = searchParams.get('token');
    const urlCode = searchParams.get('code');
    
    if (!urlToken || !urlCode) {
      router.push('/auth/forgot-password');
      return;
    }
    
    setToken(urlToken);
    setCode(urlCode);
  }, [searchParams, router]);

  useEffect(() => {
    if (newPassword) {
      calculatePasswordStrength(newPassword);
    }
  }, [newPassword]);

  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 12) score += 1;
    else feedback.push('At least 12 characters');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('One uppercase letter');

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('One lowercase letter');

    if (/\d/.test(password)) score += 1;
    else feedback.push('One number');

    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    else feedback.push('One symbol');

    if (password.length >= 16) score += 1;

    setPasswordStrength({ score, feedback });
  };

  const getStrengthColor = (score: number) => {
    if (score <= 2) return 'bg-red-500';
    if (score <= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = (score: number) => {
    if (score <= 2) return 'Weak';
    if (score <= 4) return 'Good';
    return 'Strong';
  };

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token || !code) {
      setError('Invalid reset session. Please request a new password reset.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          code,
          newPassword: data.newPassword,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Password reset successful
        if (result.autoSignin) {
          // Attempt to sign in automatically
          try {
            const signInResult = await signIn('credentials', {
              email: '', // We don't have the email here, but the backend handled the reset
              password: data.newPassword,
              redirect: false,
            });

            if (signInResult?.ok) {
              router.push('/dashboard');
            } else {
              // Auto-signin failed, redirect to login with success message
              router.push('/auth/login?message=Password reset successful. Please sign in with your new password.');
            }
          } catch (signInError) {
            // Auto-signin failed, redirect to login with success message
            router.push('/auth/login?message=Password reset successful. Please sign in with your new password.');
          }
        } else {
          // No auto-signin, redirect to login with success message
          router.push('/auth/login?message=Password reset successful. Please sign in with your new password.');
        }
      } else {
        if (result.error === 'WEAK_PASSWORD') {
          setError('Password does not meet security requirements.');
        } else if (result.error === 'INVALID_TOKEN_OR_CODE') {
          setError('Reset session expired. Please request a new password reset.');
        } else if (result.error === 'TOKEN_EXPIRED_OR_USED') {
          setError('Reset link has expired or already been used. Please request a new password reset.');
        } else {
          setError(result.error || 'Failed to reset password. Please try again.');
        }
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-8 min-h-full">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <h1 className="text-2xl font-semibold text-black mb-6 text-center">
            Create new password
          </h1>
          <p className="text-center text-sm text-gray-600 mb-6">
            Enter a strong password for your account.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New password
            </label>
            <div className="relative">
              <input
                {...register('newPassword')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                onKeyDown={preventEmojiInput}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Enter your new password"
                aria-invalid={errors.newPassword ? 'true' : 'false'}
                aria-describedby={errors.newPassword ? 'newPassword-error' : undefined}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.05 8.05M14.12 14.12l1.829 1.829" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            
            {newPassword && (
              <div className="mt-2">
                <div className="flex justify-between text-xs">
                  <span>Password strength:</span>
                  <span className={passwordStrength.score >= 4 ? 'text-green-600' : 'text-gray-600'}>
                    {getStrengthText(passwordStrength.score)}
                  </span>
                </div>
                <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength.score)}`}
                    style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                  />
                </div>
                {passwordStrength.feedback.length > 0 && (
                  <div className="mt-1 text-xs text-gray-600">
                    Missing: {passwordStrength.feedback.join(', ')}
                  </div>
                )}
              </div>
            )}

            {errors.newPassword && (
              <p className="text-sm text-red-600 mt-1" role="alert">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm password
            </label>
            <div className="relative">
              <input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                onKeyDown={preventEmojiInput}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Confirm your new password"
                aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.05 8.05M14.12 14.12l1.829 1.829" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600 mt-1" role="alert">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4">
              <div className="text-sm text-red-700" role="alert">
                {error}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || passwordStrength.score < 4}
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60"
          >
            {isSubmitting ? 'Resetting password...' : 'Reset password'}
          </button>

          <div className="text-center">
            <Link
              href="/auth/login"
              className="text-sm text-black underline hover:no-underline"
            >
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}