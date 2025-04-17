"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children: React.ReactNode
}

export function CustomScrollArea({
  className,
  children,
  ...props
}: ScrollAreaProps) {
  return (
    <div
      className={cn("relative overflow-auto", className)}
      {...props}
    >
      <div className="h-full w-full">
        {children}
      </div>
    </div>
  )
}
