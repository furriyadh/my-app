"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Loader2 } from "lucide-react"
import { cn } from "../../lib/utils"

// Type definitions
interface ToastData {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success" | "warning" | "info"
  duration?: number
  component?: React.ComponentType<any>
  action?: React.ReactNode
  icon?: React.ReactNode
  showIcon?: boolean
  progress?: number
  campaign?: {
    name: string
    [key: string]: any
  }
  [key: string]: any
}

interface ToastContextType {
  toasts: ToastData[]
  addToast: (toast: Omit<ToastData, 'id'>) => string
  removeToast: (id: string) => void
  removeAllToasts: () => void
}

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => 
  React.createElement(ToastPrimitives.Viewport, {
    ref,
    className: cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    ),
    ...props
  })
)
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border border-gray-200 bg-white p-4 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border-gray-200 bg-white text-gray-950",
        destructive: "destructive border-red-200 bg-red-50 text-red-900 [&>svg]:text-red-600",
        success: "border-green-200 bg-green-50 text-green-900 [&>svg]:text-green-600",
        warning: "border-yellow-200 bg-yellow-50 text-yellow-900 [&>svg]:text-yellow-600",
        info: "border-blue-200 bg-blue-50 text-blue-900 [&>svg]:text-blue-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface ToastProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>,
    VariantProps<typeof toastVariants> {}

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  ToastProps
>(({ className, variant, ...props }, ref) => {
  return React.createElement(ToastPrimitives.Root, {
    ref,
    className: cn(toastVariants({ variant }), className),
    ...props
  })
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => 
  React.createElement(ToastPrimitives.Action, {
    ref,
    className: cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-transparent px-3 text-sm font-medium ring-offset-white transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-red-300 group-[.destructive]:hover:border-red-400 group-[.destructive]:hover:bg-red-100 group-[.destructive]:focus:ring-red-500",
      className
    ),
    ...props
  })
)
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => 
  React.createElement(ToastPrimitives.Close, {
    ref,
    className: cn(
      "absolute left-2 top-2 rounded-md p-1 text-gray-500 opacity-0 transition-opacity hover:text-gray-900 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    ),
    ...props
  }, React.createElement(X, { className: "h-4 w-4" }))
)
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => 
  React.createElement(ToastPrimitives.Title, {
    ref,
    className: cn("text-sm font-semibold", className),
    ...props
  })
)
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => 
  React.createElement(ToastPrimitives.Description, {
    ref,
    className: cn("text-sm opacity-90", className),
    ...props
  })
)
ToastDescription.displayName = ToastPrimitives.Description.displayName

// Toast Context
const ToastContext = React.createContext<ToastContextType | null>(null)

const ToastContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<ToastData[]>([])

  const addToast = React.useCallback((toast: Omit<ToastData, 'id'>): string => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastData = { ...toast, id }
    
    setToasts((prev) => [...prev, newToast])

    // Auto remove after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, toast.duration || 5000)
    }

    return id
  }, [])

  const removeToast = React.useCallback((id: string): void => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const removeAllToasts = React.useCallback((): void => {
    setToasts([])
  }, [])

  const contextValue: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    removeAllToasts,
  }

  return React.createElement(
    ToastContext.Provider,
    { value: contextValue },
    children
  )
}

const useToastContext = (): ToastContextType => {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToastContext must be used within ToastContextProvider")
  }
  return context
}

// Enhanced Toast Component with Icons
export interface EnhancedToastProps extends ToastProps {
  title?: string
  description?: string
  action?: React.ReactNode
  icon?: React.ReactNode
  showIcon?: boolean
}

const EnhancedToast = React.forwardRef<
  React.ElementRef<typeof Toast>,
  EnhancedToastProps
>(({ 
  variant = "default", 
  title, 
  description, 
  action,
  icon,
  showIcon = true,
  className,
  ...props 
}, ref) => {
  const getIcon = React.useCallback((): React.ReactNode => {
    if (icon) return icon
    
    switch (variant) {
      case "success":
        return React.createElement(CheckCircle, { className: "h-5 w-5" })
      case "destructive":
        return React.createElement(AlertCircle, { className: "h-5 w-5" })
      case "warning":
        return React.createElement(AlertTriangle, { className: "h-5 w-5" })
      case "info":
        return React.createElement(Info, { className: "h-5 w-5" })
      default:
        return React.createElement(Info, { className: "h-5 w-5" })
    }
  }, [icon, variant])

  return React.createElement(
    Toast,
    { ref, variant, className, ...props },
    React.createElement(
      "div",
      { className: "flex items-start gap-3 w-full" },
      showIcon && React.createElement(
        "div",
        { className: "flex-shrink-0 mt-0.5" },
        getIcon()
      ),
      React.createElement(
        "div",
        { className: "flex-1 min-w-0" },
        title && React.createElement(ToastTitle, null, title),
        description && React.createElement(
          ToastDescription,
          { className: "mt-1" },
          description
        )
      ),
      action && React.createElement(ToastAction, { 
        altText: "إجراء Toast",
        asChild: true 
      }, action)
    ),
    React.createElement(ToastClose)
  )
})
EnhancedToast.displayName = "EnhancedToast"

// Loading Toast Component
export interface LoadingToastProps extends ToastProps {
  title?: string
  description?: string
}

const LoadingToast = React.forwardRef<
  React.ElementRef<typeof Toast>,
  LoadingToastProps
>(({ 
  title = "جاري التحميل...", 
  description,
  className,
  ...props 
}, ref) => {
  return React.createElement(
    Toast,
    { ref, className: cn("border-blue-200 bg-blue-50", className), ...props },
    React.createElement(
      "div",
      { className: "flex items-start gap-3 w-full" },
      React.createElement(
        "div",
        { className: "flex-shrink-0 mt-0.5" },
        React.createElement(Loader2, { className: "h-5 w-5 text-blue-600 animate-spin" })
      ),
      React.createElement(
        "div",
        { className: "flex-1 min-w-0" },
        React.createElement(ToastTitle, { className: "text-blue-900" }, title),
        description && React.createElement(
          ToastDescription,
          { className: "mt-1 text-blue-800" },
          description
        )
      )
    )
  )
})
LoadingToast.displayName = "LoadingToast"

// Progress Toast Component
export interface ProgressToastProps extends ToastProps {
  title?: string
  description?: string
  progress?: number
}

const ProgressToast = React.forwardRef<
  React.ElementRef<typeof Toast>,
  ProgressToastProps
>(({ 
  title, 
  description,
  progress = 0,
  className,
  ...props 
}, ref) => {
  const progressCircle = React.createElement(
    "div",
    { className: "relative w-5 h-5" },
    React.createElement(
      "svg",
      { className: "w-5 h-5 transform -rotate-90", viewBox: "0 0 24 24" },
      React.createElement("circle", {
        cx: "12",
        cy: "12",
        r: "10",
        stroke: "currentColor",
        strokeWidth: "2",
        fill: "none",
        className: "text-blue-200"
      }),
      React.createElement("circle", {
        cx: "12",
        cy: "12",
        r: "10",
        stroke: "currentColor",
        strokeWidth: "2",
        fill: "none",
        strokeDasharray: `${2 * Math.PI * 10}`,
        strokeDashoffset: `${2 * Math.PI * 10 * (1 - progress / 100)}`,
        className: "text-blue-600 transition-all duration-300"
      })
    ),
    React.createElement(
      "div",
      { className: "absolute inset-0 flex items-center justify-center" },
      React.createElement(
        "span",
        { className: "text-xs font-medium text-blue-600" },
        `${Math.round(progress)}%`
      )
    )
  )

  const progressBar = React.createElement(
    "div",
    { className: "mt-2 w-full bg-blue-200 rounded-full h-1.5" },
    React.createElement("div", {
      className: "bg-blue-600 h-1.5 rounded-full transition-all duration-300",
      style: { width: `${progress}%` }
    })
  )

  return React.createElement(
    Toast,
    { ref, className: cn("border-blue-200 bg-blue-50", className), ...props },
    React.createElement(
      "div",
      { className: "flex items-start gap-3 w-full" },
      React.createElement(
        "div",
        { className: "flex-shrink-0 mt-0.5" },
        progressCircle
      ),
      React.createElement(
        "div",
        { className: "flex-1 min-w-0" },
        title && React.createElement(ToastTitle, { className: "text-blue-900" }, title),
        description && React.createElement(
          ToastDescription,
          { className: "mt-1 text-blue-800" },
          description
        ),
        progressBar
      )
    ),
    React.createElement(ToastClose)
  )
})
ProgressToast.displayName = "ProgressToast"

// Campaign Toast Component
export interface CampaignToastProps extends ToastProps {
  campaign?: {
    name: string
    [key: string]: any
  }
  action?: "created" | "updated" | "launched" | "paused" | "deleted"
}

const CampaignToast = React.forwardRef<
  React.ElementRef<typeof EnhancedToast>,
  CampaignToastProps
>(({ 
  campaign,
  action = "created",
  className,
  ...props 
}, ref) => {
  const getActionConfig = React.useCallback(() => {
    switch (action) {
      case "created":
        return {
          variant: "success" as const,
          title: "تم إنشاء الحملة بنجاح",
          description: `تم إنشاء حملة "${campaign?.name}" وهي جاهزة للإطلاق`,
          icon: React.createElement(CheckCircle, { className: "h-5 w-5" })
        }
      case "updated":
        return {
          variant: "info" as const,
          title: "تم تحديث الحملة",
          description: `تم حفظ التغييرات على حملة "${campaign?.name}"`,
          icon: React.createElement(Info, { className: "h-5 w-5" })
        }
      case "launched":
        return {
          variant: "success" as const,
          title: "تم إطلاق الحملة",
          description: `حملة "${campaign?.name}" نشطة الآن وتستقبل الزيارات`,
          icon: React.createElement(CheckCircle, { className: "h-5 w-5" })
        }
      case "paused":
        return {
          variant: "warning" as const,
          title: "تم إيقاف الحملة مؤقتاً",
          description: `حملة "${campaign?.name}" متوقفة حالياً`,
          icon: React.createElement(AlertTriangle, { className: "h-5 w-5" })
        }
      case "deleted":
        return {
          variant: "destructive" as const,
          title: "تم حذف الحملة",
          description: `تم حذف حملة "${campaign?.name}" نهائياً`,
          icon: React.createElement(AlertCircle, { className: "h-5 w-5" })
        }
      default:
        return {
          variant: "default" as const,
          title: "تحديث الحملة",
          description: `تم تحديث حملة "${campaign?.name}"`,
          icon: React.createElement(Info, { className: "h-5 w-5" })
        }
    }
  }, [action, campaign?.name])

  const config = getActionConfig()

  return React.createElement(EnhancedToast, {
    ref,
    variant: config.variant,
    title: config.title,
    description: config.description,
    icon: config.icon,
    className,
    ...props
  })
})
CampaignToast.displayName = "CampaignToast"

// Toast Container Component
const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastContext()

  return React.createElement(
    ToastProvider,
    null,
    ...toasts.map((toast) => {
      const ToastComponent = toast.component || EnhancedToast
      return React.createElement(ToastComponent, {
        key: toast.id,
        ...toast,
        onOpenChange: (open: boolean) => {
          if (!open) removeToast(toast.id)
        }
      })
    }),
    React.createElement(ToastViewport)
  )
}

// Hook for using toast
const useToast = () => {
  const [toasts, setToasts] = React.useState<ToastData[]>([])

  const addToast = React.useCallback((toast: Omit<ToastData, 'id'>): string => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastData = { ...toast, id }
    
    setToasts((prev) => [...prev, newToast])

    // Auto remove after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, toast.duration || 5000)
    }

    return id
  }, [])

  const removeToast = React.useCallback((id: string): void => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const removeAllToasts = React.useCallback((): void => {
    setToasts([])
  }, [])

  return {
    toasts,
    addToast,
    removeToast,
    removeAllToasts,
  }
}

// Utility functions for common toasts
interface CreateToastOptions {
  duration?: number
  component?: React.ComponentType<any>
  [key: string]: any
}

const createToast = (addToast: ToastContextType['addToast']) => ({
  success: (title: string, description?: string, options: CreateToastOptions = {}): string => {
    return addToast({
      variant: "success",
      title,
      description,
      duration: 5000,
      ...options
    })
  },
  
  error: (title: string, description?: string, options: CreateToastOptions = {}): string => {
    return addToast({
      variant: "destructive",
      title,
      description,
      duration: 7000,
      ...options
    })
  },
  
  warning: (title: string, description?: string, options: CreateToastOptions = {}): string => {
    return addToast({
      variant: "warning",
      title,
      description,
      duration: 6000,
      ...options
    })
  },
  
  info: (title: string, description?: string, options: CreateToastOptions = {}): string => {
    return addToast({
      variant: "info",
      title,
      description,
      duration: 5000,
      ...options
    })
  },
  
  loading: (title: string = "جاري التحميل...", description?: string, options: CreateToastOptions = {}): string => {
    return addToast({
      component: LoadingToast,
      title,
      description,
      duration: 0, // Don't auto-remove loading toasts
      ...options
    })
  },
  
  progress: (title?: string, description?: string, progress: number = 0, options: CreateToastOptions = {}): string => {
    return addToast({
      component: ProgressToast,
      title,
      description,
      progress,
      duration: 0,
      ...options
    })
  },
  
  campaign: (campaign: { name: string; [key: string]: any }, action: "created" | "updated" | "launched" | "paused" | "deleted", options: CreateToastOptions = {}): string => {
    return addToast({
      component: CampaignToast,
      campaign,
      action,
      duration: 5000,
      ...options
    })
  }
})

export {
  type ToastData,
  type ToastContextType,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  EnhancedToast,
  LoadingToast,
  ProgressToast,
  CampaignToast,
  ToastContainer,
  ToastContextProvider,
  useToast,
  useToastContext,
  createToast,
}

