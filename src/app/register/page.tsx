// frontend/src/app/register/page.tsx
"use client"; // Required for client-side navigation

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// This page now redirects to the Clerk sign-up page

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the Clerk sign-up page
    router.push("/sign-up");
  }, [router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-brand-darkblue to-brand-midblue">
      <div className="text-white text-center">
        <h1 className="text-2xl font-bold mb-2">Redirecting to sign-up...</h1>
        <p>Please wait while we redirect you to our new sign-up page.</p>
      </div>
    </div>
  );
}
