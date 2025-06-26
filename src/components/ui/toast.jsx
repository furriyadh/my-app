import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva } from "class-variance-authority"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
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

const Toast = React.forwardRef(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-transparent px-3 text-sm font-medium ring-offset-white transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-red-300 group-[.destructive]:hover:border-red-400 group-[.destructive]:hover:bg-red-100 group-[.destructive]:focus:ring-red-500",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute left-2 top-2 rounded-md p-1 text-gray-500 opacity-0 transition-opacity hover:text-gray-900 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

// Toast Hook
const useToast = () => {
  const [toasts, setToasts] = React.useState([])

  const addToast = React.useCallback((toast) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    
    setToasts((prev) => [...prev, newToast])

    // Auto remove after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, toast.duration || 5000)
    }

    return id
  }, [])

  const removeToast = React.useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const removeAllToasts = React.useCallback(() => {
    setToasts([])
  }, [])

  return {
    toasts,
    addToast,
    removeToast,
    removeAllToasts,
  }
}

// Toast Context
const ToastContext = React.createContext(null)

const ToastContextProvider = ({ children }) => {
  const toast = useToast()
  return (
    <ToastContext.Provider value={toast}>
      {children}
    </ToastContext.Provider>
  )
}

const useToastContext = () => {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToastContext must be used within ToastContextProvider")
  }
  return context
}

// Enhanced Toast Component with Icons
const EnhancedToast = React.forwardRef(({ 
  variant = "default", 
  title, 
  description, 
  action,
  icon,
  showIcon = true,
  className,
  ...props 
}, ref) => {
  const getIcon = () => {
    if (icon) return icon
    
    switch (variant) {
      case "success":
        return <CheckCircle className="h-5 w-5" />
      case "destructive":
        return <AlertCircle className="h-5 w-5" />
      case "warning":
        return <AlertTriangle className="h-5 w-5" />
      case "info":
        return <Info className="h-5 w-5" />
      default:
        return <Info className="h-5 w-5" />
    }
  }

  return (
    <Toast ref={ref} variant={variant} className={className} {...props}>
      <div className="flex items-start gap-3 w-full">
        {showIcon && (
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          {title && <ToastTitle>{title}</ToastTitle>}
          {description && (
            <ToastDescription className="mt-1">
              {description}
            </ToastDescription>
          )}
        </div>
        {action && <ToastAction>{action}</ToastAction>}
      </div>
      <ToastClose />
    </Toast>
  )
})
EnhancedToast.displayName = "EnhancedToast"

// Loading Toast Component
const LoadingToast = React.forwardRef(({ 
  title = "جاري التحميل...", 
  description,
  className,
  ...props 
}, ref) => {
  return (
    <Toast ref={ref} className={cn("border-blue-200 bg-blue-50", className)} {...props}>
      <div className="flex items-start gap-3 w-full">
        <div className="flex-shrink-0 mt-0.5">
          <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
        </div>
        <div className="flex-1 min-w-0">
          <ToastTitle className="text-blue-900">{title}</ToastTitle>
          {description && (
            <ToastDescription className="mt-1 text-blue-800">
              {description}
            </ToastDescription>
          )}
        </div>
      </div>
    </Toast>
  )
})
LoadingToast.displayName = "LoadingToast"

// Progress Toast Component
const ProgressToast = React.forwardRef(({ 
  title, 
  description,
  progress = 0,
  className,
  ...props 
}, ref) => {
  return (
    <Toast ref={ref} className={cn("border-blue-200 bg-blue-50", className)} {...props}>
      <div className="flex items-start gap-3 w-full">
        <div className="flex-shrink-0 mt-0.5">
          <div className="relative w-5 h-5">
            <svg className="w-5 h-5 transform -rotate-90" viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-blue-200"
              />
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 10}`}
                strokeDashoffset={`${2 * Math.PI * 10 * (1 - progress / 100)}`}
                className="text-blue-600 transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-blue-600">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <ToastTitle className="text-blue-900">{title}</ToastTitle>
          {description && (
            <ToastDescription className="mt-1 text-blue-800">
              {description}
            </ToastDescription>
          )}
          <div className="mt-2 w-full bg-blue-200 rounded-full h-1.5">
            <div 
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
      <ToastClose />
    </Toast>
  )
})
ProgressToast.displayName = "ProgressToast"

// Campaign Toast Component
const CampaignToast = React.forwardRef(({ 
  campaign,
  action = "created", // created, updated, launched, paused, deleted
  className,
  ...props 
}, ref) => {
  const getActionConfig = () => {
    switch (action) {
      case "created":
        return {
          variant: "success",
          title: "تم إنشاء الحملة بنجاح",
          description: `تم إنشاء حملة "${campaign?.name}" وهي جاهزة للإطلاق`,
          icon: <CheckCircle className="h-5 w-5" />
        }
      case "updated":
        return {
          variant: "info",
          title: "تم تحديث الحملة",
          description: `تم حفظ التغييرات على حملة "${campaign?.name}"`,
          icon: <Info className="h-5 w-5" />
        }
      case "launched":
        return {
          variant: "success",
          title: "تم إطلاق الحملة",
          description: `حملة "${campaign?.name}" نشطة الآن وتستقبل الزيارات`,
          icon: <CheckCircle className="h-5 w-5" />
        }
      case "paused":
        return {
          variant: "warning",
          title: "تم إيقاف الحملة مؤقتاً",
          description: `حملة "${campaign?.name}" متوقفة حالياً`,
          icon: <AlertTriangle className="h-5 w-5" />
        }
      case "deleted":
        return {
          variant: "destructive",
          title: "تم حذف الحملة",
          description: `تم حذف حملة "${campaign?.name}" نهائياً`,
          icon: <AlertCircle className="h-5 w-5" />
        }
      default:
        return {
          variant: "default",
          title: "تحديث الحملة",
          description: `تم تحديث حملة "${campaign?.name}"`,
          icon: <Info className="h-5 w-5" />
        }
    }
  }

  const config = getActionConfig()

  return (
    <EnhancedToast
      ref={ref}
      variant={config.variant}
      title={config.title}
      description={config.description}
      icon={config.icon}
      className={className}
      {...props}
    />
  )
})
CampaignToast.displayName = "CampaignToast"

// Toast Container Component
const ToastContainer = () => {
  const { toasts, removeToast } = useToastContext()

  return (
    <ToastProvider>
      {toasts.map((toast) => {
        const ToastComponent = toast.component || EnhancedToast
        return (
          <ToastComponent
            key={toast.id}
            {...toast}
            onOpenChange={(open) => {
              if (!open) removeToast(toast.id)
            }}
          />
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

// Utility functions for common toasts
const createToast = (addToast) => ({
  success: (title, description, options = {}) => {
    return addToast({
      variant: "success",
      title,
      description,
      duration: 5000,
      ...options
    })
  },
  
  error: (title, description, options = {}) => {
    return addToast({
      variant: "destructive",
      title,
      description,
      duration: 7000,
      ...options
    })
  },
  
  warning: (title, description, options = {}) => {
    return addToast({
      variant: "warning",
      title,
      description,
      duration: 6000,
      ...options
    })
  },
  
  info: (title, description, options = {}) => {
    return addToast({
      variant: "info",
      title,
      description,
      duration: 5000,
      ...options
    })
  },
  
  loading: (title, description, options = {}) => {
    return addToast({
      component: LoadingToast,
      title,
      description,
      duration: 0, // Don't auto-remove loading toasts
      ...options
    })
  },
  
  progress: (title, description, progress, options = {}) => {
    return addToast({
      component: ProgressToast,
      title,
      description,
      progress,
      duration: 0,
      ...options
    })
  },
  
  campaign: (campaign, action, options = {}) => {
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
  type ToastProps,
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

