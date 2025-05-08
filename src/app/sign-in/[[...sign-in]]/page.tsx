"use client";

import { SignIn } from "@clerk/nextjs";
import Image from "next/image";

export default function SignInPage() {
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
        {/* Authentication Banner */}
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded shadow-md">
          <h3 className="font-bold">Important Notice</h3>
          <p className="text-sm">
            We've upgraded our authentication system for better security.
          </p>
          <p className="text-sm mt-1">
            <strong>First time logging in?</strong> Click "Forgot Password"
            below to set your password.
          </p>
        </div>

        <SignIn
          appearance={{
            elements: {
              formButtonPrimary: "bg-brand-orange hover:bg-brand-orange/90",
              footerActionLink: "text-brand-orange hover:text-brand-orange/90",
              formButtonReset:
                "text-brand-orange hover:text-brand-orange/90 font-bold",
              // Make the forgot password link more prominent
              footerAction: "text-center mt-4",
            },
          }}
          routing="path"
          path="/sign-in"
        />
      </div>
    </div>
  );
}
