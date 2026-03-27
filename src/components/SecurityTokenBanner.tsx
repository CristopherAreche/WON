"use client";

import { useState, useEffect } from "react";
import {
  clearOneTimeSecurityToken,
  readOneTimeSecurityToken,
} from "@/lib/security-token";

export default function SecurityTokenBanner() {
  const [token, setToken] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const stored = readOneTimeSecurityToken();
    if (stored) {
      setToken(stored);
    }
  }, []);

  const handleCopy = async () => {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select the input text
    }
  };

  const handleDismiss = () => {
    clearOneTimeSecurityToken();
    setDismissed(true);
  };

  if (!token || dismissed) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-5">
        <div className="text-center">
          <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-amber-500 text-3xl">shield</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">Save Your Security Token</h2>
          <p className="text-sm text-slate-500">
            This 10-digit code is required for password changes and resets. Keep it safe.
          </p>
        </div>

        <div className="relative">
          <input
            type="text"
            value={showToken ? token : "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
            readOnly
            className="w-full rounded-xl px-4 py-3 pr-20 bg-slate-50 border border-slate-200 font-mono text-center tracking-wider text-slate-800 focus:outline-none"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <button
              onClick={handleCopy}
              className="p-2 text-slate-400 hover:text-amber-600 transition-colors"
              title={copied ? "Copied!" : "Copy"}
            >
              <span className="material-symbols-outlined text-[20px]">
                {copied ? "check" : "content_copy"}
              </span>
            </button>
            <button
              onClick={() => setShowToken(!showToken)}
              className="p-2 text-slate-400 hover:text-amber-600 transition-colors"
              title={showToken ? "Hide" : "Show"}
            >
              <span className="material-symbols-outlined text-[20px]">
                {showToken ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
        </div>

        {copied && (
          <p className="text-sm text-emerald-600 text-center font-medium">Token copied!</p>
        )}

        <button
          onClick={handleDismiss}
          className="w-full py-3.5 rounded-2xl bg-slate-900 text-white font-semibold transition-all active:scale-[0.98]"
        >
          I&apos;ve Saved It
        </button>

        <p className="text-xs text-slate-400 text-center">
          This is only shown once. Save it now.
        </p>
      </div>
    </div>
  );
}
