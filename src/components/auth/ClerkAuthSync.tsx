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
      // Get the role from Clerk's public metadata - force to lowercase for consistency
      const clerkRole = (user.publicMetadata?.role as string) || '';
      // Default to student if no role is set or if role is invalid
      const role = ['student', 'teacher', 'admin'].includes(clerkRole.toLowerCase()) 
        ? clerkRole.toLowerCase() 
        : 'student';
      
      console.log('ClerkAuthSync: User role from Clerk metadata:', clerkRole);
      console.log('ClerkAuthSync: Normalized role being set:', role);
      
      // Create a user object for our internal auth store
      const userData = {
        id: parseInt(user.id) || 0,
        email: user.emailAddresses[0]?.emailAddress || '',
        firstName: user.firstName || '',
        surname: user.lastName || '',
        role: role, // Use the normalized role
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
