"use client";

import { UserProfile as ClerkUserProfile } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function UserProfile() {
  const router = useRouter();

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <ClerkUserProfile
        appearance={{
          elements: {
            card: "shadow-none",
            navbar: "hidden",
            navbarMobileMenuButton: "hidden",
            rootBox: "w-full",
            pageScrollBox: "w-full",
            profilePage: "w-full",
            profileSection__danger: "hidden", // Hide danger zone
            profileSection__activeDevices: "hidden", // Hide active devices
            profileSection__connectedAccounts: "hidden", // Hide connected accounts
          },
        }}
        routing="path"
        path="/profile"
      />
    </div>
  );
}
