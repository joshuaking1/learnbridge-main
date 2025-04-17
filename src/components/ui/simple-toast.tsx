"use client"

import * as React from "react"
import { X } from "lucide-react"

interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "destructive"
  onClose?: () => void
}

export function SimpleToast({
  title,
  description,
  variant = "default",
  onClose,
}: ToastProps) {
  return (
    <div
      className={`group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all ${
        variant === "destructive"
          ? "border-red-200 bg-red-50 text-red-900"
          : "border-gray-200 bg-white text-gray-900"
      }`}
    >
      <div className="flex flex-col gap-1">
        {title && <div className="text-sm font-semibold">{title}</div>}
        {description && (
          <div className="text-sm opacity-90">{description}</div>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-2 top-2 rounded-md p-1 text-gray-500 opacity-0 transition-opacity hover:text-gray-900 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

interface ToastProviderProps {
  children: React.ReactNode
}

interface Toast extends ToastProps {
  id: string
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function SimpleToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substring(2, 9)
      setToasts((prev) => [...prev, { ...toast, id }])

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 5000)
    },
    []
  )

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-4 md:max-w-[420px]">
        {toasts.map((toast) => (
          <SimpleToast
            key={toast.id}
            title={toast.title}
            description={toast.description}
            variant={toast.variant}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useSimpleToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useSimpleToast must be used within a SimpleToastProvider")
  }
  return {
    toast: context.addToast,
  }
}
