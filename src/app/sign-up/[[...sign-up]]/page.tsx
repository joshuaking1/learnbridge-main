"use client";

import { SignUp, useSignUp } from "@clerk/nextjs";
import Image from "next/image";
import { RoleSelection } from "@/components/auth/RoleSelection";
import { useState, useEffect } from "react";

export default function SignUpPage() {
  const { isLoaded, signUp } = useSignUp();
  const [showRoleSelection, setShowRoleSelection] = useState(false);

  // Check if the user has completed the initial sign-up step
  useEffect(() => {
    if (isLoaded && signUp?.status === "complete") {
      setShowRoleSelection(true);
    }
  }, [isLoaded, signUp?.status]);

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
          />
        )}
      </div>
    </div>
  );
}
