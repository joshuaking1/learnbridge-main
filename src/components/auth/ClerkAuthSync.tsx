"use client";

import { useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useAuthStore } from '@/stores/useAuthStore';

/**
 * This component syncs the Clerk user data with our internal auth store.
 * It ensures that the user role from Clerk's metadata is properly set in our application.
 */
export function ClerkAuthSync() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { setUserAndToken } = useAuthStore();

  useEffect(() => {
    if (isLoaded && user) {
      // Get the role from Clerk's public metadata - force to lowercase for consistency
      const clerkRole = (user.publicMetadata?.role as string) || '';
      
      // Check if the user has completed role selection (they should have a role in metadata)
      if (!clerkRole) {
        console.log('ClerkAuthSync: No role found in Clerk metadata. User may need to complete role selection.');
        // Don't proceed with setting up the user until they've selected a role
        return;
      }
      
      // Use the role from metadata or default to student if it's invalid
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

      // Get the actual JWT token from Clerk and set it in our auth store
      getToken().then(token => {
        console.log('ClerkAuthSync: Got Clerk JWT token, length:', token?.length || 0);
        if (token) {
          setUserAndToken(userData, token);
        } else {
          console.error('ClerkAuthSync: Failed to get Clerk JWT token');
        }
      }).catch(error => {
        console.error('ClerkAuthSync: Error getting Clerk JWT token:', error);
      });
    }
  }, [isLoaded, user, setUserAndToken]);

  // This component doesn't render anything
  return null;
}
