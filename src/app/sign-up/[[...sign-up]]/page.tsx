"use client";

import { SignUp, useSignUp } from "@clerk/nextjs";
import Image from "next/image";
import { RoleSelection } from "@/components/auth/RoleSelection";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function SignUpPage() {
  const { isLoaded, signUp } = useSignUp();
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const searchParams = useSearchParams();
  const stepParam = searchParams.get('step');

  // Check if the user has completed the initial sign-up step
  useEffect(() => {
    // Log current state to debug the issue
    console.log('Sign-up state:', { 
      isLoaded, 
      signUpStatus: signUp?.status, 
      showRoleSelection,
      stepParam
    });
    
    // Show role selection if either condition is met:
    // 1. The step parameter is 'role_selection'
    // 2. The signUp status is 'complete'
    if ((stepParam === 'role_selection') || (isLoaded && signUp?.status === "complete")) {
      console.log('Showing role selection form');
      setShowRoleSelection(true);
    }
  }, [isLoaded, signUp?.status, showRoleSelection, stepParam]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-brand-darkblue to-brand-midblue">
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

      <div className="w-full max-w-md">
        {showRoleSelection ? (
          <RoleSelection />
        ) : (
          <SignUp
            appearance={{
              elements: {
                formButtonPrimary: "bg-brand-orange hover:bg-brand-orange/90",
                footerActionLink:
                  "text-brand-orange hover:text-brand-orange/90",
              },
            }}
            routing="path"
            path="/sign-up"
            afterSignUpUrl="/sign-up?step=role_selection"
            redirectUrl="/sign-up?step=role_selection"
          />
        )}
      </div>
    </div>
  );
}
