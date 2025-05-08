"use client";

import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-brand-darkblue to-brand-midblue">
      <div className="mb-8">
        <Image
          src="/logo.png"
          alt="LearnBridge Logo"
          width={200}
          height={80}
          priority
          className="mx-auto"
        />
      </div>
      
      <div className="w-full max-w-md">
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h1 className="text-2xl font-bold text-center mb-4">Reset Your Password</h1>
          <p className="text-gray-600 mb-6">
            Enter your email address below and we'll send you a link to reset your password.
          </p>
          
          <SignIn 
            appearance={{
              elements: {
                formButtonPrimary: "bg-brand-orange hover:bg-brand-orange/90",
                footerActionLink: "text-brand-orange hover:text-brand-orange/90",
              }
            }}
            routing="path"
            path="/reset-password"
          />
          
          <div className="mt-6 text-center">
            <Link href="/sign-in">
              <Button variant="link" className="text-brand-orange">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded shadow-md">
          <h3 className="font-bold">Need Help?</h3>
          <p className="text-sm">
            If you're having trouble accessing your account, please contact our support team at{" "}
            <a href="mailto:support@learnbridgedu.com" className="underline">
              support@learnbridgedu.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
