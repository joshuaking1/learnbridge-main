import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// Hook to protect routes that require authentication
export function useProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== '/login') {
      // Store the intended destination for post-login redirect
      sessionStorage.setItem('redirectAfterLogin', pathname || '/dashboard');
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  return { isLoading };
}

// Hook to redirect authenticated users away from auth pages
export function useRedirectAuthenticated(redirectTo: string = '/dashboard') {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isLoading };
}