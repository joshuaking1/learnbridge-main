"use client"

import * as React from "react"

interface SimpleTabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  tabs: { value: string; label: string; content: React.ReactNode }[]
}

export function SimpleTabs({
  defaultValue,
  value,
  onValueChange,
  className = "",
  tabs
}: SimpleTabsProps) {
  const [tabValue, setTabValue] = React.useState(value || defaultValue || (tabs.length > 0 ? tabs[0].value : ""))
  
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
    <div className={`w-full ${className}`}>
      <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
              tabValue === tab.value
                ? "bg-background text-foreground shadow-sm"
                : "hover:bg-background/50 hover:text-foreground"
            }`}
            onClick={() => handleValueChange(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <div className="mt-2">
        {tabs.map((tab) => (
          tabValue === tab.value && (
            <div key={tab.value}>
              {tab.content}
            </div>
          )
        ))}
      </div>
    </div>
  )
}
