"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-brand-darkblue mb-4">404 - Page Not Found</h1>
        <p className="text-gray-600 mb-8">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <Link href="/">
          <Button className="bg-brand-darkblue hover:bg-brand-blue">
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
