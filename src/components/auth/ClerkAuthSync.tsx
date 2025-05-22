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
      // Check for pending user data from localStorage (from role selection form)
      const pendingRole = localStorage.getItem('pendingUserRole');
      const pendingSchool = localStorage.getItem('pendingUserSchool');
      const pendingLocation = localStorage.getItem('pendingUserLocation');
      
      // Get the role from Clerk's public metadata - force to lowercase for consistency
      let clerkRole = (user.publicMetadata?.role as string) || '';
      
      // If we have a pending role from localStorage, use that
      if (pendingRole && ['student', 'teacher'].includes(pendingRole)) {
        console.log('ClerkAuthSync: Found pending role in localStorage:', pendingRole);
        clerkRole = pendingRole;
        
        // Now that we've used these values, clear them from localStorage
        localStorage.removeItem('pendingUserRole');
        localStorage.removeItem('pendingUserSchool');
        localStorage.removeItem('pendingUserLocation');
      }
      
      // If still no role found, default to student but continue with auth
      const role = ['student', 'teacher', 'admin'].includes(clerkRole.toLowerCase()) 
        ? clerkRole.toLowerCase() 
        : 'student';
      
      console.log('ClerkAuthSync: Using role:', role);
      console.log('ClerkAuthSync: School:', pendingSchool || 'Not provided');
      console.log('ClerkAuthSync: Location:', pendingLocation || 'Not provided');
      
      // Create a user object for our internal auth store
      const userData = {
        id: parseInt(user.id) || 0,
        email: user.emailAddresses[0]?.emailAddress || '',
        firstName: user.firstName || '',
        surname: user.lastName || '',
        role: role, // Use the normalized role
        profile_image_url: user.imageUrl || '',
        school: pendingSchool || (user.publicMetadata?.school as string) || '',
        location: pendingLocation || (user.publicMetadata?.location as string) || ''
      };
      
      console.log('ClerkAuthSync: Final user data being set:', userData);

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
