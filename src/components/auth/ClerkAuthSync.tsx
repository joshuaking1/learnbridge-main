"use client";

import { useEffect } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useAuthStore } from "@/stores/useAuthStore";

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
      // Get the role from Clerk's public metadata first (this is the source of truth)
      let clerkRole = (user.publicMetadata?.role as string) || "";
      let clerkSchool = (user.publicMetadata?.school as string) || "";
      let clerkLocation = (user.publicMetadata?.location as string) || "";

      // Check for pending user data from localStorage (fallback only)
      const pendingRole = localStorage.getItem("pendingUserRole");
      const pendingSchool = localStorage.getItem("pendingUserSchool");
      const pendingLocation = localStorage.getItem("pendingUserLocation");

      // Use Clerk metadata if available, otherwise fall back to localStorage
      const finalRole = clerkRole || pendingRole || "student";
      const finalSchool = clerkSchool || pendingSchool || "";
      const finalLocation = clerkLocation || pendingLocation || "";

      // If we used localStorage data, clear it now
      if (pendingRole || pendingSchool || pendingLocation) {
        console.log("ClerkAuthSync: Using fallback data from localStorage");
        localStorage.removeItem("pendingUserRole");
        localStorage.removeItem("pendingUserSchool");
        localStorage.removeItem("pendingUserLocation");
      }

      // Normalize the role
      const role = ["student", "teacher", "admin"].includes(
        finalRole.toLowerCase()
      )
        ? finalRole.toLowerCase()
        : "student";

      console.log("ClerkAuthSync: Using role:", role);
      console.log("ClerkAuthSync: School:", finalSchool || "Not provided");
      console.log("ClerkAuthSync: Location:", finalLocation || "Not provided");
      console.log("ClerkAuthSync: Source - Clerk metadata:", {
        role: clerkRole,
        school: clerkSchool,
        location: clerkLocation,
      });

      // Create a user object for our internal auth store
      const userData = {
        id: parseInt(user.id) || 0,
        email: user.emailAddresses[0]?.emailAddress || "",
        firstName: user.firstName || "",
        surname: user.lastName || "",
        role: role, // Use the normalized role
        profile_image_url: user.imageUrl || "",
        school: finalSchool,
        location: finalLocation,
      };

      console.log("ClerkAuthSync: Final user data being set:", userData);

      // Get the actual JWT token from Clerk and set it in our auth store
      getToken()
        .then((token) => {
          console.log(
            "ClerkAuthSync: Got Clerk JWT token, length:",
            token?.length || 0
          );
          if (token) {
            setUserAndToken(userData, token);
          } else {
            console.error("ClerkAuthSync: Failed to get Clerk JWT token");
          }
        })
        .catch((error) => {
          console.error("ClerkAuthSync: Error getting Clerk JWT token:", error);
        });
    }
  }, [isLoaded, user, setUserAndToken]);

  // This component doesn't render anything
  return null;
}
