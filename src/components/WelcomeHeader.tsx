'use client';

interface WelcomeHeaderProps {
  userName?: string | null;
}

export default function WelcomeHeader({ userName }: WelcomeHeaderProps) {

  return (
    <div className="flex items-center justify-between bg-gray-50 rounded-3xl p-6 mb-6">
      {/* Left Icon */}
      <div className="flex items-center">
        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mr-4">
          <svg 
            className="w-6 h-6 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
            />
          </svg>
        </div>
        
        {/* Welcome Text */}
        <div>
          <h1 className="text-xl font-semibold text-black">
            Welcome{userName ? `, ${userName}` : ''}
          </h1>
          <p className="text-sm text-gray-600">Ready to crush your workout?</p>
        </div>
      </div>

    </div>
  );
}