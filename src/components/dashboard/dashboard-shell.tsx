"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  children: React.ReactNode;
  className?: string;
  [key: string]: any; // Allow for spreading additional props
}

export function DashboardShell({
  children,
  className,
  ...props
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        {children}
      </div>
    </div>
  );
}
