"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({
      redirect: false,
      callbackUrl: "/"
    });
    onClose();
    router.push("/");
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold text-black">Menú</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Menu Items */}
          <div className="space-y-4">
            <button
              onClick={() => {
                router.push('/app/profile');
                onClose();
              }}
              className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-black"
            >
              <UserIcon />
              <span className="font-medium">Perfil</span>
            </button>

            <button
              onClick={() => {
                router.push('/app/settings');
                onClose();
              }}
              className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-black"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium">Configuración</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-100 rounded-lg transition-colors text-red-600 hover:text-red-700"
            >
              <LogoutIcon />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>

          {/* Footer */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-500 text-center">
                WON v1.0.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}