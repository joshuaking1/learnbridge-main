"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function AuthChangeBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [hasSeenBanner, setHasSeenBanner] = useState(false);

  // Check if the user has already seen the banner
  useEffect(() => {
    const bannerSeen = localStorage.getItem("auth_change_banner_seen");
    if (bannerSeen) {
      setHasSeenBanner(true);
      setIsVisible(false);
    }
  }, []);

  const dismissBanner = () => {
    setIsVisible(false);
    localStorage.setItem("auth_change_banner_seen", "true");
    setHasSeenBanner(true);
  };

  if (!isVisible) return null;

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded shadow-md relative">
      <button
        onClick={dismissBanner}
        className="absolute top-2 right-2 text-yellow-700 hover:text-yellow-900"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
      
      <h3 className="font-bold">Authentication System Upgrade</h3>
      <p className="text-sm mt-1">
        We've upgraded our authentication system for better security. If you're having trouble logging in, please use the "Forgot Password" feature to reset your password.
      </p>
      
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href="/reset-password">
          <Button size="sm" variant="default" className="bg-yellow-600 hover:bg-yellow-700">
            Reset Password
          </Button>
        </Link>
        
        <Button size="sm" variant="outline" className="border-yellow-600 text-yellow-700" onClick={dismissBanner}>
          Dismiss
        </Button>
      </div>
    </div>
  );
}
