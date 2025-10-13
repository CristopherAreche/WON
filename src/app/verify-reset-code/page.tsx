import { Suspense } from "react";
import VerifyResetCodeForm from "./VerifyResetCodeForm";

// Loading component for Suspense fallback
function VerifyCodeLoading() {
  return (
    <div className="flex items-center justify-center p-8 min-h-full">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-lg">
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold text-black mb-6 text-center">
            Enter verification code
          </h1>
          <div className="animate-pulse">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyResetCodePage() {
  return (
    <Suspense fallback={<VerifyCodeLoading />}>
      <VerifyResetCodeForm />
    </Suspense>
  );
}