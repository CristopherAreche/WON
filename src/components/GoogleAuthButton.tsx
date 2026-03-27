"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type GoogleAuthSource = "login" | "signup";

interface GoogleAuthButtonProps {
  next: string;
  source: GoogleAuthSource;
  onError?: (message: string | null) => void;
}

function getSafeNext(next: string, source: GoogleAuthSource) {
  if (!next.startsWith("/") || next.startsWith("//")) {
    return sourceDefaultNext[source];
  }

  return next;
}

const sourceDefaultNext: Record<GoogleAuthSource, string> = {
  login: "/app/home",
  signup: "/onboarding",
};

function buildRedirectUrl(source: GoogleAuthSource, next: string) {
  const url = new URL("/auth/callback", window.location.origin);
  url.searchParams.set("source", source);
  url.searchParams.set("next", getSafeNext(next || sourceDefaultNext[source], source));
  return url.toString();
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
      <path
        d="M21.805 10.023H12v3.955h5.61c-.246 1.288-.984 2.379-2.092 3.112v2.587h3.391c1.986-1.83 3.127-4.526 3.127-7.727 0-.647-.058-1.271-.231-1.927Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.82 0 5.189-.927 6.918-2.323l-3.391-2.587c-.936.635-2.134 1.015-3.527 1.015-2.727 0-5.038-1.842-5.863-4.322H2.653v2.667A10.435 10.435 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.137 13.783A6.27 6.27 0 0 1 5.81 11.9c0-.654.116-1.288.327-1.883V7.35H2.653A10.435 10.435 0 0 0 1.6 11.9c0 1.68.404 3.27 1.053 4.55l3.484-2.667Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.695c1.536 0 2.912.529 3.994 1.568l2.993-2.993C17.187 2.618 14.818 1.6 12 1.6A10.435 10.435 0 0 0 2.653 7.35l3.484 2.667C6.962 7.537 9.273 5.695 12 5.695Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function GoogleAuthButton({
  next,
  source,
  onError,
}: GoogleAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleGoogleAuth() {
    setIsLoading(true);
    onError?.(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: buildRedirectUrl(source, next || sourceDefaultNext[source]),
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });

      if (error) {
        throw error;
      }
    } catch {
      setIsLoading(false);
      onError?.("Google sign-in could not be started. Please try again.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleGoogleAuth}
      disabled={isLoading}
      className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-900 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
    >
      <span className="flex items-center justify-center gap-3 text-sm font-semibold">
        <GoogleMark />
        <span>{isLoading ? "Redirecting to Google..." : "Continue with Google"}</span>
      </span>
    </button>
  );
}
