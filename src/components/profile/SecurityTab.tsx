"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useToast } from "@/hooks/use-toast";
import { SecuritySettings } from "@/components/auth/SecuritySettings";
import { authApi } from "@/lib/auth-api";
import { Loader2 } from "lucide-react";

export function SecurityTab() {
  const { token } = useAuthStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  // Fetch 2FA status
  useEffect(() => {
    const fetch2FAStatus = async () => {
      if (!token) return;

      try {
        setIsLoading(true);
        // In a development environment, we might not have the backend services running
        // So we'll use a mock response for now
        try {
          // Use the Next.js API route
          const response = await fetch("/api/auth/2fa/status", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            // If we're in development and the backend is not available,
            // we'll use a mock response
            console.warn("Backend service not available, using mock data");
            // Mock data - assume 2FA is not enabled
            setIs2FAEnabled(false);
            return;
          }

          const data = await response.json();
          setIs2FAEnabled(data.is2FAEnabled);
        } catch (error) {
          // If there's a network error (e.g., backend not running),
          // we'll use a mock response
          console.warn("Network error, using mock data:", error);
          // Mock data - assume 2FA is not enabled
          setIs2FAEnabled(false);
        }
      } catch (error) {
        console.error("Error fetching 2FA status:", error);
        toast({
          title: "Error",
          description: "Failed to fetch security settings. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetch2FAStatus();
  }, [token, toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <SecuritySettings is2FAEnabled={is2FAEnabled} />
    </div>
  );
}
