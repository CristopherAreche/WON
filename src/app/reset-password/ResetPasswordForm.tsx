'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';

const preventEmojiInput = (e: React.KeyboardEvent) => {
  const emojiRegex =
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
  if (emojiRegex.test(e.key)) {
    e.preventDefault();
  }
};

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(10, 'Password must be at least 10 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/\d/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one symbol')
      .refine(
        (val) =>
          !/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(
            val
          ),
        'Emojis are not allowed'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isRecoveryReady, setIsRecoveryReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    feedback: string[];
  }>({ score: 0, feedback: [] });

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    let active = true;

    async function validateRecoverySession() {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (!active) {
        return;
      }

      if (sessionError) {
        setError(sessionError.message);
        setIsCheckingSession(false);
        return;
      }

      if (!session) {
        setError('This password recovery link is invalid or has expired.');
        setIsCheckingSession(false);
        return;
      }

      setIsRecoveryReady(true);
      setIsCheckingSession(false);
    }

    void validateRecoverySession();

    return () => {
      active = false;
    };
  }, []);

  const newPassword = watch('newPassword');

  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength({ score: 0, feedback: [] });
      return;
    }

    const feedback: string[] = [];
    let score = 0;

    if (newPassword.length >= 10) score++;
    else feedback.push('At least 10 characters');

    if (/[A-Z]/.test(newPassword)) score++;
    else feedback.push('One uppercase letter');

    if (/[a-z]/.test(newPassword)) score++;
    else feedback.push('One lowercase letter');

    if (/\d/.test(newPassword)) score++;
    else feedback.push('One number');

    if (/[^A-Za-z0-9]/.test(newPassword)) score++;
    else feedback.push('One symbol');

    setPasswordStrength({ score, feedback });
  }, [newPassword]);

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!isRecoveryReady) {
      setError('This password recovery link is invalid or has expired.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      await supabase.auth.signOut();
      router.push('/auth/login?message=password-reset-success');
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Network error. Please check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="flex items-center justify-center p-8 min-h-full">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-lg">
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold text-black mb-6 text-center">
              Reset Your Password
            </h1>
            <div className="animate-pulse">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isRecoveryReady) {
    return (
      <div className="flex items-center justify-center p-8 min-h-full">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-lg">
          <div className="space-y-4 text-center">
            <h1 className="text-2xl font-semibold text-black mb-6">
              Invalid Recovery Link
            </h1>
            <p className="text-gray-600">
              {error || 'This password recovery link is invalid or has expired.'}
            </p>
            <Link
              href="/auth/forgot-password"
              className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Request New Recovery Email
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8 min-h-full">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <h1 className="text-2xl font-semibold text-black mb-6 text-center">
            Reset Your Password
          </h1>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                {...register('newPassword')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                onKeyDown={preventEmojiInput}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Enter your new password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-red-600 mt-1">{errors.newPassword.message}</p>
            )}

            {newPassword && (
              <div className="mt-2">
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 flex-1 rounded ${
                        i < passwordStrength.score
                          ? passwordStrength.score === 5
                            ? 'bg-green-500'
                            : passwordStrength.score >= 3
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                {passwordStrength.feedback.length > 0 && (
                  <div className="text-xs text-gray-600">
                    Missing: {passwordStrength.feedback.join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                onKeyDown={preventEmojiInput}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Confirm your new password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || passwordStrength.score < 5}
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60"
          >
            {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
          </button>

          <div className="text-center">
            <Link
              href="/auth/login"
              className="text-sm text-black underline hover:no-underline"
            >
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
