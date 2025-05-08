"use client";

import { cn } from "@/lib/utils";

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
      <div className="absolute top-0 w-10 h-10 border-4 border-brand-lightblue border-b-transparent rounded-full animate-pulse opacity-75"></div>
    </div>
  );
}