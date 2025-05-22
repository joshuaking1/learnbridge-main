// SafeAuthWrapper.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SafeAuthWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * A wrapper component that safely handles authentication during both static generation and client-side rendering
 * This prevents the "useAuth must be used within an AuthProvider" error during build
 */
export default function SafeAuthWrapper({ 
  children, 
  fallback = <DefaultLoadingFallback />,
  redirectTo = '/login' 
}: SafeAuthWrapperProps) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const auth = useAuth();

  // Only run client-side to prevent SSG errors
  useEffect(() => {
    setMounted(true);

    // If we're mounted and have auth info but not authenticated, redirect
    if (!auth.isLoading && !auth.isAuthenticated && redirectTo) {
      router.push(redirectTo);
    }
  }, [auth.isLoading, auth.isAuthenticated, redirectTo, router]);

  // During static generation, show fallback
  // During client hydration, show fallback until mounted and auth is ready
  if (!mounted || auth.isLoading) {
    return <>{fallback}</>;
  }

  // If we're authenticated, render the actual component
  if (auth.isAuthenticated) {
    return <>{children}</>;
  }

  // If we're not authenticated and not loading, show fallback
  // (redirection will happen from the useEffect)
  return <>{fallback}</>;
}

function DefaultLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-lg font-medium text-gray-700">Loading...</h2>
        <p className="text-gray-500 mt-2">Please wait while we prepare your content</p>
      </div>
    </div>
  );
}
