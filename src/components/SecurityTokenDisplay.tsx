'use client';

import { useState, useEffect } from 'react';

interface SecurityTokenDisplayProps {
  className?: string;
}

export default function SecurityTokenDisplay({ className = '' }: SecurityTokenDisplayProps) {
  const [token, setToken] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSecurityToken();
  }, []);

  const fetchSecurityToken = async () => {
    try {
      const response = await fetch('/api/auth/security-token');
      const result = await response.json();

      if (response.ok) {
        setToken(result.securityToken);
      } else {
        // Handle specific error cases
        if (response.status === 503) {
          setError('Security token feature is temporarily unavailable while we update the system.');
        } else {
          setError(result.error || 'Failed to fetch security token');
        }
      }
    } catch (error) {
      setError('Network error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(token);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const displayValue = isVisible ? token : '••••••••••';

  if (isLoading) {
    return (
      <div className={`bg-gray-50 rounded-xl p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 rounded-xl p-4 ${className}`}>
        <h3 className="font-medium text-red-800 mb-1">Security Token</h3>
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={fetchSecurityToken}
          className="text-sm text-red-700 underline hover:no-underline mt-1"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 rounded-xl p-4 ${className}`}>
      <h3 className="font-medium text-black mb-2">Security Token</h3>
      <p className="text-sm text-gray-600 mb-3">
        This 10-digit code is required for password changes and resets. Keep it secure.
      </p>
      
      <div className="relative">
        <input
          type="text"
          value={displayValue}
          readOnly
          className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-20 bg-white font-mono text-center tracking-wider"
        />
        
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
          {/* Copy Button */}
          <button
            onClick={copyToClipboard}
            className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
            title={isCopied ? 'Copied!' : 'Copy to clipboard'}
          >
            {isCopied ? (
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>

          {/* Show/Hide Button */}
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
            title={isVisible ? 'Hide token' : 'Show token'}
          >
            {isVisible ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.05 8.05M14.12 14.12l1.829 1.829" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {isCopied && (
        <p className="text-sm text-green-600 mt-1">Token copied to clipboard!</p>
      )}
    </div>
  );
}