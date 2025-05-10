'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/shared';
import { useRouter } from 'next/navigation';
import { useAuth as useClerkAuth } from '@clerk/nextjs';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  refreshToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getToken } = useClerkAuth();

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (error) {
      console.error('Error restoring auth state:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (user: User, token: string) => {
    setUser(user);
    setToken(token);
    
    // Store in localStorage
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Redirect to login
    router.push('/login');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Helper to check if token is about to expire (within 2 minutes)
  const isTokenNearExpiry = (token: string): boolean => {
    try {
      // Simple JWT expiry check - decode the JWT payload
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.exp) return true; // If no expiry, assume it needs refresh
      
      // Check if token expires in less than 2 minutes
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilExpiry = expiryTime - currentTime;
      
      return timeUntilExpiry < 2 * 60 * 1000; // Less than 2 minutes until expiry
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return true; // If we can't check, assume it needs refresh
    }
  };

  // Function to refresh the token using Clerk
  const refreshToken = async (): Promise<string | null> => {
    try {
      // Get a fresh token from Clerk
      const freshToken = await getToken();
      
      if (freshToken) {
        // Log token information for debugging
        try {
          const payload = JSON.parse(atob(freshToken.split('.')[1]));
          const expiryDate = new Date(payload.exp * 1000).toISOString();
          console.log(`New token acquired. Expires at: ${expiryDate}`);
        } catch (e) {
          console.log('Unable to parse token expiry time');
        }
        
        setToken(freshToken);
        localStorage.setItem('token', freshToken);
        return freshToken;
      }
      return null;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return null;
    }
  };

  // Set up token refresh at regular intervals (every 3 minutes)
  useEffect(() => {
    if (!token) return;

    const refreshInterval = setInterval(async () => {
      console.log('Executing scheduled token refresh');
      await refreshToken();
    }, 3 * 60 * 1000); // Refresh every 3 minutes instead of 5

    return () => clearInterval(refreshInterval);
  }, [token]);

  // Setup automatic token refresh before API calls
  useEffect(() => {
    if (!token) return;
    
    // Create interceptor for fetch calls
    const originalFetch = window.fetch;
    window.fetch = async (input, init) => {
      if (input.toString().includes('/api/')) {
        // This is an API call, check if we need to refresh the token
        try {
          // Check if current token is about to expire
          let freshToken = token;
          const needsRefresh = isTokenNearExpiry(token);
          
          if (needsRefresh) {
            console.log('Token is near expiry, refreshing before API call');
            // Get fresh token before making API call
            const newToken = await refreshToken();
            if (newToken) {
              freshToken = newToken;
            } else {
              console.warn('Failed to refresh token before API call');
            }
          }
          
          // Always update the Authorization header with the latest token
          if (init) {
            // Ensure headers object exists
            init.headers = init.headers || {};
            // Set the Authorization header
            init.headers = {
              ...init.headers,
              'Authorization': `Bearer ${freshToken}`
            };
          }
          
          // Log the token length for debugging
          console.log(`Using token with length: ${freshToken.length}`);
        } catch (error) {
          console.error('Error in fetch interceptor:', error);
        }
      }
      return originalFetch(input, init);
    };

    return () => {
      // Restore original fetch when component unmounts
      window.fetch = originalFetch;
    };
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
        updateUser,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Custom hook for protected routes
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  return { isLoading };
}