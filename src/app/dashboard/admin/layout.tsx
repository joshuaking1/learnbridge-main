"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is authenticated and is an admin
    if (!isLoading && (!isAuthenticated || (user && user.role !== 'admin'))) {
      toast({
        title: "Access Denied",
        description: "You must be an admin to access this page.",
        variant: "destructive",
      });
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, user, router, toast]);

  // Show loading state while checking authentication
  if (isLoading || !isAuthenticated || (user && user.role !== 'admin')) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
      </div>
    );
  }

  // Render children if user is authenticated and is an admin
  return <>{children}</>;
}
