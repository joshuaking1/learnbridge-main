"use client";

import { UserProfile } from "@/components/auth/UserProfile";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Your Profile</h1>
        <UserProfile />
      </div>
    </div>
  );
}
