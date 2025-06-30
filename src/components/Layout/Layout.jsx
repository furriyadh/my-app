import * as React from "react"
import { cn } from "@/lib/utils"
import { Header, MobileHeader, Breadcrumb } from "./Header"
import { Sidebar, MobileSidebar } from "./Sidebar"
import { Footer, MinimalFooter, StickyFooter } from "./Footer"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  AlertCircle, 
  Wifi, 
  WifiOff, 
  Loader2,
  RefreshCw,
  X,
  CheckCircle,
  Info
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

// Layout Context
const LayoutContext = React.createContext(null)

export const useLayout = () => {
  const context = React.useContext(LayoutContext)
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider")
  }
  return context
}

// Layout Provider
const LayoutProvider = ({ children, initialState = {} }) => {
  const [state, setState] = React.useState({
    sidebarCollapsed: false,
    mobileSidebarOpen: false,
    activeItem: "dashboard",
    breadcrumbs: [],
    notifications: [],
    user: null,
    theme: "light",
    isOnline: navigator.onLine,
    isLoading: false,
    ...initialState
  })

  const updateState = (updates) => {
    setState(prev => ({ ...prev, ...updates }))
  }

  const toggleSidebar = () => {
    setState(prev => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }))
  }

  const toggleMobileSidebar = () => {
    setState(prev => ({ ...prev, mobileSidebarOpen: !prev.mobileSidebarOpen }))
  }

  const setActiveItem = (itemId) => {
    setState(prev => ({ ...prev, activeItem: itemId }))
  }

  const setBreadcrumbs = (breadcrumbs) => {
    setState(prev => ({ ...prev, breadcrumbs }))
  }

  const addNotification = (notification) => {
    const id = Date.now().toString()
    const newNotification = { ...notification, id, read: false, time: "الآن" }
    setState(prev => ({ 
      ...prev, 
      notifications: [newNotification, ...prev.notifications] 
    }))
    return id
  }

  const markNotificationAsRead = (id) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
    }))
  }

  const clearNotifications = () => {
    setState(prev => ({ ...prev, notifications: [] }))
  }

  // Online/Offline detection
  React.useEffect(() => {
    const handleOnline = () => updateState({ isOnline: true })
    const handleOffline = () => updateState({ isOnline: false })

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const value = {
    ...state,
    updateState,
    toggleSidebar,
    toggleMobileSidebar,
    setActiveItem,
    setBreadcrumbs,
    addNotification,
    markNotificationAsRead,
    clearNotifications
  }

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  )
}

// Main Layout Component
const Layout = React.forwardRef(({ 
  children,
  variant = "default", // default, minimal, dashboard, auth
  showHeader = true,
  showSidebar = true,
  showFooter = true,
  showBreadcrumbs = true,
  headerProps = {},
  sidebarProps = {},
  footerProps = {},
  className,
  ...props 
}, ref) => {
  const {
    sidebarCollapsed,
    mobileSidebarOpen,
    activeItem,
    breadcrumbs,
    notifications,
    user,
    isOnline,
    isLoading,
    toggleSidebar,
    toggleMobileSidebar,
    setActiveItem
  } = useLayout()

  const handleSidebarItemClick = (item) => {
    setActiveItem(item.id)
    // Handle navigation here
    if (item.href) {
      // Navigate to item.href
      console.log("Navigate to:", item.href)
    }
  }

  const getLayoutClasses = () => {
    switch (variant) {
      case "minimal":
        return "min-h-screen bg-gray-50"
      case "dashboard":
        return "min-h-screen bg-gray-50 flex flex-col"
      case "auth":
        return "min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center"
      default:
        return "min-h-screen bg-gray-50 flex flex-col"
    }
  }

  if (variant === "auth") {
    return (
      <div ref={ref} className={cn(getLayoutClasses(), className)} {...props}>
        {children}
      </div>
    )
  }

  if (variant === "minimal") {
    return (
      <div ref={ref} className={cn(getLayoutClasses(), className)} {...props}>
        {showHeader && (
          <Header
            user={user}
            notifications={notifications}
            onMenuClick={toggleMobileSidebar}
            {...headerProps}
          />
        )}
        
        <main className="flex-1">
          {children}
        </main>
        
        {showFooter && <MinimalFooter {...footerProps} />}
      </div>
    )
  }

  return (
    <div ref={ref} className={cn(getLayoutClasses(), className)} {...props}>
      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-red-600 text-white px-4 py-2 text-center text-sm">
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="h-4 w-4" />
            <span>لا يوجد اتصال بالإنترنت. بعض الميزات قد لا تعمل بشكل صحيح.</span>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-gray-900">جاري التحميل...</span>
          </div>
        </div>
      )}

      {/* Header */}
      {showHeader && (
        <>
          <Header
            user={user}
            notifications={notifications}
            onMenuClick={toggleMobileSidebar}
            className="hidden lg:block"
            {...headerProps}
          />
          <MobileHeader
            user={user}
            notifications={notifications}
            onMenuClick={toggleMobileSidebar}
            className="lg:hidden"
            {...headerProps}
          />
        </>
      )}

      <div className="flex flex-1">
        {/* Sidebar */}
        {showSidebar && (
          <>
            <Sidebar
              isCollapsed={sidebarCollapsed}
              activeItem={activeItem}
              onItemClick={handleSidebarItemClick}
              onToggleCollapse={toggleSidebar}
              className="hidden lg:flex"
              {...sidebarProps}
            />
            <MobileSidebar
              isOpen={mobileSidebarOpen}
              onClose={toggleMobileSidebar}
              activeItem={activeItem}
              onItemClick={handleSidebarItemClick}
              {...sidebarProps}
            />
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Breadcrumbs */}
          {showBreadcrumbs && breadcrumbs.length > 0 && (
            <div className="bg-white border-b border-gray-200 px-6 py-3">
              <Breadcrumb items={breadcrumbs} />
            </div>
          )}

          {/* Page Content */}
          <div className="flex-1 p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      {showFooter && <Footer {...footerProps} />}
    </div>
  )
})
Layout.displayName = "Layout"

// Dashboard Layout Component
const DashboardLayout = React.forwardRef(({ 
  children,
  title,
  description,
  actions,
  tabs,
  className,
  ...props 
}, ref) => {
  return (
    <Layout ref={ref} variant="dashboard" className={className} {...props}>
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 min-w-0">
              {title && (
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {title}
                </h1>
              )}
              {description && (
                <p className="mt-1 text-sm text-gray-500">
                  {description}
                </p>
              )}
            </div>
            
            {actions && (
              <div className="flex items-center gap-3">
                {actions}
              </div>
            )}
          </div>

          {/* Tabs */}
          {tabs && (
            <div className="mt-6">
              {tabs}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {children}
      </div>
    </Layout>
  )
})
DashboardLayout.displayName = "DashboardLayout"

// Auth Layout Component
const AuthLayout = React.forwardRef(({ 
  children,
  title,
  subtitle,
  showLogo = true,
  className,
  ...props 
}, ref) => {
  return (
    <Layout ref={ref} variant="auth" className={className} {...props}>
      <div className="w-full max-w-md mx-auto">
        {/* Logo */}
        {showLogo && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">AI</span>
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Google Ads AI
                </h1>
                <p className="text-sm text-gray-500">منصة الإعلانات الذكية</p>
              </div>
            </div>
          </div>
        )}

        {/* Auth Card */}
        <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-8">
          {title && (
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              {subtitle && (
                <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
              )}
            </div>
          )}
          
          {children}
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <a href="/help" className="hover:text-gray-700 transition-colors">
              المساعدة
            </a>
            <a href="/privacy" className="hover:text-gray-700 transition-colors">
              الخصوصية
            </a>
            <a href="/terms" className="hover:text-gray-700 transition-colors">
              الشروط
            </a>
          </div>
        </div>
      </div>
    </Layout>
  )
})
AuthLayout.displayName = "AuthLayout"

// Error Layout Component
const ErrorLayout = React.forwardRef(({ 
  error,
  title = "حدث خطأ",
  description = "عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
  showRetry = true,
  onRetry,
  className,
  ...props 
}, ref) => {
  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    } else {
      window.location.reload()
    }
  }

  return (
    <Layout ref={ref} variant="minimal" className={className} {...props}>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600 mb-6">{description}</p>
          
          {error && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <code className="text-sm text-gray-800">{error.message}</code>
            </div>
          )}
          
          {showRetry && (
            <div className="flex gap-3 justify-center">
              <Button onClick={handleRetry} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                إعادة المحاولة
              </Button>
              <Button variant="outline" onClick={() => window.history.back()}>
                العودة
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
})
ErrorLayout.displayName = "ErrorLayout"

// Loading Layout Component
const LoadingLayout = React.forwardRef(({ 
  message = "جاري التحميل...",
  className,
  ...props 
}, ref) => {
  return (
    <Layout ref={ref} variant="minimal" className={className} {...props}>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">{message}</p>
        </div>
      </div>
    </Layout>
  )
})
LoadingLayout.displayName = "LoadingLayout"

// Status Banner Component
const StatusBanner = React.forwardRef(({ 
  type = "info", // info, success, warning, error
  message,
  action,
  onClose,
  className,
  ...props 
}, ref) => {
  const getConfig = () => {
    switch (type) {
      case "success":
        return {
          icon: CheckCircle,
          className: "bg-green-50 border-green-200 text-green-800"
        }
      case "warning":
        return {
          icon: AlertCircle,
          className: "bg-yellow-50 border-yellow-200 text-yellow-800"
        }
      case "error":
        return {
          icon: AlertCircle,
          className: "bg-red-50 border-red-200 text-red-800"
        }
      default:
        return {
          icon: Info,
          className: "bg-blue-50 border-blue-200 text-blue-800"
        }
    }
  }

  const config = getConfig()
  const Icon = config.icon

  return (
    <div 
      ref={ref}
      className={cn(
        "border-l-4 p-4 flex items-center justify-between",
        config.className,
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5" />
        <span className="text-sm font-medium">{message}</span>
      </div>
      
      <div className="flex items-center gap-2">
        {action && action}
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
})
StatusBanner.displayName = "StatusBanner"

export {
  Layout,
  DashboardLayout,
  AuthLayout,
  ErrorLayout,
  LoadingLayout,
  LayoutProvider,
  StatusBanner,
  useLayout
}

