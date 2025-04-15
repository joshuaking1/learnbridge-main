// frontend/src/app/dashboard/layout.tsx
"use client"; // Add "use client" because layout now depends on client-side state

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar"; // Import the Sidebar
import { cn } from "@/lib/utils";

// Create a custom event for sidebar collapse state changes
const SIDEBAR_COLLAPSE_EVENT = "sidebar-collapse-change";

export default function DashboardLayout({
  children, // Will be the page content for routes like /dashboard, /dashboard/my-lessons, etc.
}: {
  children: React.ReactNode;
}) {
  // State to track sidebar collapse status
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Listen for custom events from the Sidebar component
  useEffect(() => {
    const handleSidebarChange = (e: CustomEvent) => {
      setIsSidebarCollapsed(e.detail.isCollapsed);
    };

    // Add event listener with type assertion
    window.addEventListener(SIDEBAR_COLLAPSE_EVENT, handleSidebarChange as EventListener);

    // Clean up event listener
    return () => {
      window.removeEventListener(SIDEBAR_COLLAPSE_EVENT, handleSidebarChange as EventListener);
    };
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Pass the event name to Sidebar so it can dispatch events */}
      <Sidebar collapseEventName={SIDEBAR_COLLAPSE_EVENT} />

      {/* Main content area with dynamic padding based on sidebar state */}
      <main
        className={cn(
          "flex-1 pt-16 md:pt-0 transition-all duration-300 relative z-30",
          isSidebarCollapsed ? "md:pl-16" : "md:pl-64"
        )}
      >
        {children} {/* Render the actual page content here */}
      </main>
    </div>
  );
}