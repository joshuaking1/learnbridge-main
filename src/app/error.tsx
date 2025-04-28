"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-brand-darkblue mb-4">Something went wrong!</h1>
        <p className="text-gray-600 mb-8">
          We apologize for the inconvenience. Please try again or return to the home page.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="bg-brand-darkblue hover:bg-brand-blue text-white px-4 py-2 rounded font-medium"
          >
            Try again
          </button>
          <Link href="/" className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-4 py-2 rounded font-medium">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
