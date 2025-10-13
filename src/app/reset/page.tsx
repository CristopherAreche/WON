import { Suspense } from "react";
import ResetRedirectComponent from "./ResetRedirectComponent";

// Loading component for Suspense fallback
function RedirectLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export default function ResetRedirectPage() {
  return (
    <Suspense fallback={<RedirectLoading />}>
      <ResetRedirectComponent />
    </Suspense>
  );
}