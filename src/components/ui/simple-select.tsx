"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

interface SimpleSelectProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  options: { value: string; label: string }[]
  className?: string
  id?: string
  disabled?: boolean
}

export function SimpleSelect({
  value,
  onValueChange,
  placeholder = "Select an option",
  options,
  className = "",
  id,
  disabled = false
}: SimpleSelectProps) {
  const [open, setOpen] = React.useState(false)
  const selectRef = React.useRef<HTMLDivElement>(null)

  // Close the select when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Find the selected option label
  const selectedOption = options.find(option => option.value === value)
  const displayValue = selectedOption ? selectedOption.label : placeholder

  return (
    <div 
      className={`relative w-full ${className}`}
      ref={selectRef}
      id={id}
    >
      <button
        type="button"
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => !disabled && setOpen(!open)}
        aria-expanded={open}
        disabled={disabled}
      >
        <span className="block truncate">{displayValue}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>

      {open && (
        <div className="absolute z-50 min-w-[8rem] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md mt-1">
          <div className="w-full p-1">
            {options.map((option) => (
              <div
                key={option.value}
                className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${value === option.value ? "bg-accent text-accent-foreground" : ""}`}
                onClick={() => {
                  onValueChange(option.value)
                  setOpen(false)
                }}
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
