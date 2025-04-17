"use client"

import * as React from "react"
// Removed cn import to avoid dependency issues

interface TabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  children: React.ReactNode
}

interface TabsContextType {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined)

export function CustomTabs({
  defaultValue,
  value,
  onValueChange,
  className,
  children,
  ...props
}: TabsProps & React.HTMLAttributes<HTMLDivElement>) {
  const [tabValue, setTabValue] = React.useState(value || defaultValue || "")

  const handleValueChange = React.useCallback((newValue: string) => {
    setTabValue(newValue)
    onValueChange?.(newValue)
  }, [onValueChange])

  React.useEffect(() => {
    if (value !== undefined) {
      setTabValue(value)
    }
  }, [value])

  return (
    <TabsContext.Provider value={{ value: tabValue, onValueChange: handleValueChange }}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export function CustomTabsList({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CustomTabsTrigger({
  className,
  value,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
  const context = React.useContext(TabsContext)

  if (!context) {
    throw new Error("TabsTrigger must be used within a Tabs component")
  }

  const { value: selectedValue, onValueChange } = context
  const isSelected = selectedValue === value

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isSelected
          ? "bg-background text-foreground shadow-sm"
          : "hover:bg-background/50 hover:text-foreground",
        className
      )}
      onClick={() => onValueChange(value)}
      {...props}
    >
      {children}
    </button>
  )
}

export function CustomTabsContent({
  className,
  value,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const context = React.useContext(TabsContext)

  if (!context) {
    throw new Error("TabsContent must be used within a Tabs component")
  }

  const { value: selectedValue } = context

  if (selectedValue !== value) {
    return null
  }

  return (
    <div
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
