// src/app/page.tsx
import Link from "next/link";

export default function Landing() {
  return (
    <div className="flex items-center justify-center p-8 min-h-full">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
        <h1 className="text-2xl font-semibold text-black mb-4">
          Workout without complications
        </h1>
        <p className="text-gray-600 mb-8">Simple plans, tailored to you.</p>
        <div className="space-y-3">
          <Link
            href="/auth/login"
            className="block w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/auth/signup"
            className="block w-full py-3 border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
