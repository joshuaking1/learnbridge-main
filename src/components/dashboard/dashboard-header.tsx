"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface DashboardHeaderProps {
  heading: string;
  description?: string;
  icon?: LucideIcon;
  children?: React.ReactNode;
  className?: string;
}

export function DashboardHeader({
  heading,
  description,
  icon: Icon,
  children,
  className,
  ...props
}: DashboardHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-1 mb-6", className)} {...props}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-6 w-6 text-brand-orange" />}
        <h1 className="text-2xl font-bold text-gray-800">{heading}</h1>
      </div>
      {description && (
        <p className="text-gray-600">{description}</p>
      )}
      {children}
    </div>
  );
}
