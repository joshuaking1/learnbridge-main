"use client";

import { UserButton as ClerkUserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function UserButton() {
  const router = useRouter();

  return (
    <ClerkUserButton
      appearance={{
        elements: {
          userButtonAvatarBox: "h-8 w-8",
        },
      }}
      afterSignOutUrl="/"
      userProfileUrl="/profile"
    />
  );
}
