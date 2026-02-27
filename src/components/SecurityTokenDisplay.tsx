'use client';

import { useState, useEffect } from 'react';

interface SecurityTokenDisplayProps {
  className?: string;
}

export default function SecurityTokenDisplay({ className = '' }: SecurityTokenDisplayProps) {
  const [tokenMasked, setTokenMasked] = useState<string>('');
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
        setTokenMasked(result.securityTokenMasked);
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
        This code is required for password changes and resets. For safety, only a masked value is shown here.
      </p>
      
      <div className="relative">
        <input
          type="text"
          value={tokenMasked}
          readOnly
          className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white font-mono text-center tracking-wider"
        />
      </div>
    </div>
  );
}
