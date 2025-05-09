"use client";

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useAuthStore } from '@/stores/useAuthStore';

/**
 * This component syncs the Clerk user data with our internal auth store.
 * It ensures that the user role from Clerk's metadata is properly set in our application.
 */
export function ClerkAuthSync() {
  const { user, isLoaded } = useUser();
  const { setUserAndToken } = useAuthStore();

  useEffect(() => {
    if (isLoaded && user) {
      // Get the role from Clerk's public metadata
      const role = (user.publicMetadata?.role as string) || 'student';
      
      // Create a user object for our internal auth store
      const userData = {
        id: parseInt(user.id) || 0,
        email: user.emailAddresses[0]?.emailAddress || '',
        firstName: user.firstName || '',
        surname: user.lastName || '',
        role: role, // Use the role from Clerk metadata
        profile_image_url: user.imageUrl || ''
      };

      // Set the user and token in our auth store
      // For the token, we're using a placeholder as Clerk handles the actual token
      setUserAndToken(userData, 'clerk-managed-token');
    }
  }, [isLoaded, user, setUserAndToken]);

  // This component doesn't render anything
  return null;
}
