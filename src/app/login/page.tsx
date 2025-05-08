"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the Clerk sign-in page
    router.push("/sign-in");
  }, [router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-brand-darkblue to-brand-midblue">
      <div className="text-white text-center">
        <div className="mb-8">
          <Image
            src="https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvdXBsb2FkZWQvaW1nXzJ3bU1lekFyaElqTklqVWljNVFsNG9EWTVaTCJ9?width=200"
            alt="LearnBridge Logo"
            width={200}
            height={80}
            priority
            className="mx-auto"
          />
        </div>
        <h1 className="text-2xl font-bold mb-2">Redirecting to sign-in...</h1>
        <p>Please wait while we redirect you to our new sign-in page.</p>
      </div>
    </div>
  );
}
