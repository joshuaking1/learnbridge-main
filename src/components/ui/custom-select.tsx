"use client"

import * as React from "react"
// Removed cn import to avoid dependency issues
import { ChevronDown } from "lucide-react"

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  children: React.ReactNode
  className?: string
  id?: string
}

interface SelectContextType {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const SelectContext = React.createContext<SelectContextType | undefined>(undefined)

export function CustomSelect({
  value,
  onValueChange,
  placeholder,
  disabled,
  children,
  className,
  id
}: SelectProps) {
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

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div
        className={`relative w-full ${className || ''}`}
        ref={selectRef}
        id={id}
      >
        {children}
      </div>
    </SelectContext.Provider>
  )
}

export function CustomSelectTrigger({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLButtonElement>) {
  const context = React.useContext(SelectContext)

  if (!context) {
    throw new Error("SelectTrigger must be used within a Select")
  }

  const { open, setOpen, value } = context

  return (
    <button
      type="button"
      className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
      onClick={() => setOpen(!open)}
      aria-expanded={open}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  )
}

export function CustomSelectValue({
  className,
  placeholder,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { placeholder?: string }) {
  const context = React.useContext(SelectContext)

  if (!context) {
    throw new Error("SelectValue must be used within a Select")
  }

  const { value } = context

  return (
    <span
      className={`block truncate ${className || ''}`}
      {...props}
    >
      {value || placeholder}
    </span>
  )
}

export function CustomSelectContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const context = React.useContext(SelectContext)

  if (!context) {
    throw new Error("SelectContent must be used within a Select")
  }

  const { open } = context

  if (!open) return null

  return (
    <div
      className={`absolute z-50 min-w-[8rem] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 mt-1 ${className || ''}`}
      {...props}
    >
      <div className="w-full p-1">
        {children}
      </div>
    </div>
  )
}

export function CustomSelectItem({
  className,
  children,
  value: itemValue,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const context = React.useContext(SelectContext)

  if (!context) {
    throw new Error("SelectItem must be used within a Select")
  }

  const { value, onValueChange, setOpen } = context
  const isSelected = value === itemValue

  return (
    <div
      className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${isSelected ? "bg-accent text-accent-foreground" : ""} ${className || ''}`}
      onClick={() => {
        onValueChange(itemValue)
        setOpen(false)
      }}
      {...props}
    >
      {children}
    </div>
  )
}
