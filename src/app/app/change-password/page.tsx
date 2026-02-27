'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const changePasswordSchema = z.object({
  newPassword: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, 'Use upper, lower, number, and symbol'),
  confirmPassword: z.string().min(12, 'Password must be at least 12 characters'),
  securityToken: z.string().length(10, 'Security token must be exactly 10 digits'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { status } = useSession();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  });

  // Redirect to login if not authenticated
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center p-8 min-h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/login');
    return null;
  }

  const onSubmit = async (data: ChangePasswordForm) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/app/home');
        }, 2000);
      } else {
        setError(result.error || 'Failed to change password. Please try again.');
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center p-8 min-h-full">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-lg">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-black">Password Changed!</h1>
            <p className="text-gray-600">
              Your password has been successfully updated. You will be redirected to the home page shortly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen">
      <div className="flex items-center justify-center p-8 min-h-full">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <h1 className="text-2xl font-semibold text-black mb-6 text-center">
              Change Password
            </h1>
            <p className="text-center text-sm text-gray-600 mb-6">
              Enter your new password and 10-digit security token.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                {...register('newPassword')}
                type="password"
                autoComplete="new-password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Enter new password"
              />
              {errors.newPassword && (
                <p className="text-sm text-red-600 mt-1">{errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                {...register('confirmPassword')}
                type="password"
                autoComplete="new-password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Confirm new password"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Security Token (10 digits)
              </label>
              <input
                {...register('securityToken')}
                type="text"
                maxLength={10}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-mono"
                placeholder="1234567890"
              />
              {errors.securityToken && (
                <p className="text-sm text-red-600 mt-1">{errors.securityToken.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Use the token you saved during account creation.
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60"
            >
              {isSubmitting ? 'Changing Password...' : 'Change Password'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => router.back()}
                className="text-sm text-gray-600 underline hover:no-underline"
              >
                Back to previous page
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
