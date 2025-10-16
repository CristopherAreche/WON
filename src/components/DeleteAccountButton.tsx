'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface DeleteAccountButtonProps {
  userName: string;
}

export default function DeleteAccountButton({ userName }: DeleteAccountButtonProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [confirmationInput, setConfirmationInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(10);
  const router = useRouter();

  const requiredConfirmationText = "I would like to delete my account";

  const handleDeleteClick = () => {
    setShowConfirmModal(true);
    setNameInput('');
    setConfirmationInput('');
    setError(null);
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
    setNameInput('');
    setConfirmationInput('');
    setError(null);
  };

  const isFormValid = () => {
    return nameInput.toLowerCase() === userName.toLowerCase() && 
           confirmationInput === requiredConfirmationText;
  };

  const handleDeleteConfirm = async () => {
    if (!isFormValid()) {
      if (nameInput.toLowerCase() !== userName.toLowerCase()) {
        setError('Name does not match your account name');
      } else if (confirmationInput !== requiredConfirmationText) {
        setError('Confirmation text is incorrect');
      }
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: nameInput,
          confirmationText: confirmationInput,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Close confirmation modal and show success modal
        setShowConfirmModal(false);
        setShowSuccessModal(true);
        
        // Sign out user
        await signOut({ redirect: false });

        // Start countdown
        let timeLeft = 10;
        setCountdown(timeLeft);
        
        const countdownInterval = setInterval(() => {
          timeLeft -= 1;
          setCountdown(timeLeft);
          
          if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            router.push('/auth/login');
          }
        }, 1000);

      } else {
        setError(result.error || 'Failed to delete account. Please try again.');
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={handleDeleteClick}
        className="w-full border border-red-300 text-red-600 py-3 rounded-lg hover:bg-red-50 transition-colors"
      >
        Delete Account
      </button>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-black mb-2">Delete Account</h2>
              <p className="text-gray-600 text-sm">
                Are you sure you want to delete your account? This action cannot be undone.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter your name to confirm
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder={userName || "Your name"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Please type 'I would like to delete my account'
                </label>
                <input
                  type="text"
                  value={confirmationInput}
                  onChange={(e) => setConfirmationInput(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="I would like to delete my account"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 p-3">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleCancel}
                  disabled={isDeleting}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={!isFormValid() || isDeleting}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-black mb-2">Account Deleted</h2>
            <p className="text-gray-600 mb-6">
              Sorry to see you go. Your account has been deleted.
            </p>
            <div className="text-sm text-gray-500">
              Redirecting to login in {countdown} seconds...
            </div>
          </div>
        </div>
      )}
    </>
  );
}