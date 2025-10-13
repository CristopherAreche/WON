'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

// Utility function to prevent emoji input
const preventEmojiInput = (e: React.KeyboardEvent) => {
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
  if (emojiRegex.test(e.key)) {
    e.preventDefault();
  }
};

const verifyCodeSchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits').regex(/^\d{6}$/, 'Code must be numeric'),
});

type VerifyCodeForm = z.infer<typeof verifyCodeSchema>;

export default function VerifyResetCodePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string>('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeInputRef = useRef<HTMLInputElement>(null);

  const email = searchParams.get('email') || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<VerifyCodeForm>({
    resolver: zodResolver(verifyCodeSchema),
  });

  const codeValue = watch('code');

  useEffect(() => {
    // Get token from URL if present (from email link)
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    }
  }, [searchParams]);

  useEffect(() => {
    // Start countdown for resend cooldown
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Auto-focus the input
  useEffect(() => {
    if (codeInputRef.current) {
      codeInputRef.current.focus();
    }
  }, []);

  const onSubmit = async (data: VerifyCodeForm) => {
    if (!token) {
      setError('No reset token found. Please use the link from your email or request a new password reset.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const requestData = {
        token,
        code: data.code,
      };
      
      // Debug logging
      console.log('🔍 FRONTEND VERIFY REQUEST');
      console.log('='.repeat(40));
      console.log('📨 Sending data:', requestData);
      console.log('🔗 Token present:', !!token);
      console.log('🔗 Token length:', token?.length || 0);
      console.log('🔢 Code:', data.code);
      console.log('='.repeat(40));
      
      const response = await fetch('/api/auth/verify-reset-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (response.ok) {
        // Code verified, redirect to reset password page
        router.push(`/reset-password?token=${token}&code=${data.code}`);
      } else {
        if (response.status === 429) {
          setError('Too many failed attempts. Please wait 15 minutes before trying again.');
        } else if (result.error === 'INVALID_TOKEN_OR_CODE') {
          setError('Invalid code. Please check your email and try again.');
        } else {
          setError(result.error || 'Verification failed. Please try again.');
        }
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;

    setResendCooldown(60); // 60 second cooldown
    setError(null);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        // New code sent, clear the current token since it's invalidated
        setToken('');
        alert('A new verification code has been sent to your email.');
      }
    } catch (error) {
      setError('Failed to resend code. Please try again.');
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setValue('code', value);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    setValue('code', paste);
  };

  return (
    <div className="flex items-center justify-center p-8 min-h-full">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <h1 className="text-2xl font-semibold text-black mb-6 text-center">
            Enter verification code
          </h1>
          <p className="text-center text-sm text-gray-600 mb-2">
            We sent a 6-digit code to
          </p>
          {email && (
            <p className="text-center text-sm font-medium text-black mb-4">
              {email}
            </p>
          )}

          {!token && (
            <div className="rounded-lg bg-yellow-50 p-4 mb-4">
              <div className="text-sm text-yellow-700">
                <strong>Important:</strong> Please use the "Reset Password" button from your email to access this page with the proper security token.
                <br />
                <br />
                <strong>Debug info:</strong>
                <br />
                • Current URL: {typeof window !== 'undefined' ? window.location.href : 'Loading...'}
                <br />
                • Token in URL: {searchParams.get('token') ? 'Found' : 'Missing'}
                <br />
                • Email in URL: {searchParams.get('email') || 'Missing'}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verification code
            </label>
            <input
              {...register('code')}
              ref={codeInputRef}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={codeValue || ''}
              onChange={handleCodeChange}
              onPaste={handlePaste}
              onKeyDown={preventEmojiInput}
              className="w-full border border-gray-300 rounded-lg px-3 py-3 text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="000000"
              aria-invalid={errors.code ? 'true' : 'false'}
              aria-describedby={errors.code ? 'code-error' : undefined}
            />
            {errors.code && (
              <p id="code-error" className="text-sm text-red-600 mt-1" role="alert">
                {errors.code.message}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500 text-center">
              Enter the 6-digit code from your email
            </p>
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
            disabled={isSubmitting || !codeValue || codeValue.length !== 6}
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60"
          >
            {isSubmitting ? 'Verifying...' : 'Verify code'}
          </button>

          <div className="flex flex-col space-y-2">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || !email}
              className="text-sm text-black underline hover:no-underline disabled:text-gray-400 disabled:cursor-not-allowed disabled:no-underline"
            >
              {resendCooldown > 0 
                ? `Resend code in ${resendCooldown}s` 
                : 'Resend code'
              }
            </button>

            <div className="text-center">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-gray-600 hover:text-gray-500"
              >
                Use a different email
              </Link>
            </div>
          </div>

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