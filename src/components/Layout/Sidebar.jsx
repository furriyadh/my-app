import * as React from "react"
import { cn } from "@/lib/utils"
import { 
  Home, 
  Target, 
  Users, 
  Settings,
  Plus,
  Link,
  Upload,
  ChevronRight,
  LayoutDashboard,
  BarChart3,
  Activity,
  Zap,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { motion, AnimatePresence } from "framer-motion"

const dashboardItems = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    href: "/dashboard?section=overview",
    badge: null
  },
  {
    id: "new-campaign",
    label: "New Campaign",
    icon: Plus,
    href: "/campaign/new",
    badge: "Create"
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: Link,
    href: "/integrations",
    badge: "Connect"
  },
  {
    id: "asset-upload",
    label: "Asset Upload",
    icon: Upload,
    href: "/dashboard?section=asset-upload",
    badge: null
  }
]

const analyticsItems = [
  {
    id: "performance",
    label: "Performance",
    icon: BarChart3,
    href: "/dashboard?section=analytics",
    badge: null
  },
  {
    id: "campaigns",
    label: "Campaigns",
    icon: Activity,
    href: "/dashboard?section=campaigns",
    badge: null
  },
  {
    id: "targeting",
    label: "Targeting",
    icon: Target,
    href: "/dashboard?section=targeting",
    badge: null
  }
]

const accountManagementItems = [
  {
    id: "accounts",
    label: "Accounts",
    icon: Users,
    href: "/accounts",
    badge: null
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    href: "/settings",
    badge: null
  }
]

const quickActionsItems = [
  {
    id: "quick-actions",
    label: "Quick Actions",
    icon: Zap,
    href: "/dashboard?section=quick-actions",
    badge: "New"
  }
]

export function Sidebar({ className, isCollapsed = false, onToggleCollapse, ...props }) {
  const [activeItem, setActiveItem] = React.useState("overview")
  const [isHovered, setIsHovered] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  React.useEffect(() => {
    if (isMobile) {
      setIsHovered(false)
    }
  }, [isMobile])

  const shouldExpand = !isCollapsed || isHovered

  const handleItemClick = (itemId) => {
    setActiveItem(itemId)
  }

  const renderNavItem = (item) => (
    <motion.div
      key={item.id}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Button
        variant={activeItem === item.id ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start gap-3 h-12 px-3 relative",
          activeItem === item.id && "shadow-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
          "hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
        )}
        onClick={() => handleItemClick(item.id)}
      >
        <item.icon className="h-5 w-5 flex-shrink-0" />
        <AnimatePresence>
          {shouldExpand && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-between flex-1 min-w-0"
            >
              <span className="text-sm font-medium truncate">{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {item.badge}
                </Badge>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    </motion.div>
  )

  return (
    <motion.div
      className={cn(
        "flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300",
        shouldExpand ? "w-64" : "w-16",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <AnimatePresence>
            {shouldExpand && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">Trezo</span>
              </motion.div>
            )}
          </AnimatePresence>
          {!isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-6">
          {/* Dashboard Section */}
          <div className="space-y-2">
            <AnimatePresence>
              {shouldExpand && (
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2"
                >
                  DASHBOARD
                </motion.h3>
              )}
            </AnimatePresence>
            <div className="space-y-1">
              {dashboardItems.map(renderNavItem)}
            </div>
          </div>

          {/* Analytics Section */}
          <div className="space-y-2">
            <AnimatePresence>
              {shouldExpand && (
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2"
                >
                  ANALYTICS
                </motion.h3>
              )}
            </AnimatePresence>
            <div className="space-y-1">
              {analyticsItems.map(renderNavItem)}
            </div>
          </div>

          {/* Account Management Section */}
          <div className="space-y-2">
            <AnimatePresence>
              {shouldExpand && (
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2"
                >
                  ACCOUNT MANAGEMENT
                </motion.h3>
              )}
            </AnimatePresence>
            <div className="space-y-1">
              {accountManagementItems.map(renderNavItem)}
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="space-y-2">
            <AnimatePresence>
              {shouldExpand && (
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2"
                >
                  QUICK ACTIONS
                </motion.h3>
              )}
            </AnimatePresence>
            <div className="space-y-1">
              {quickActionsItems.map(renderNavItem)}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Mobile Sidebar Component
export function MobileSidebar({ isOpen, onClose, activeItem, onItemClick, ...props }) {
  const [activeItemState, setActiveItemState] = React.useState("overview")

  const handleItemClick = (itemId) => {
    setActiveItemState(itemId)
    if (onItemClick) onItemClick(itemId)
  }

  const renderNavItem = (item) => (
    <Button
      key={item.id}
      variant={activeItemState === item.id ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start gap-3 h-12 px-3",
        activeItemState === item.id && "shadow-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
      )}
      onClick={() => handleItemClick(item.id)}
    >
      <item.icon className="h-5 w-5 flex-shrink-0" />
      <span className="text-sm font-medium">{item.label}</span>
      {item.badge && (
        <Badge variant="secondary" className="ml-2 text-xs">
          {item.badge}
        </Badge>
      )}
    </Button>
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed inset-0 z-50 lg:hidden"
        >
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/50" onClick={onClose} />
          
          {/* Sidebar */}
          <div className="relative flex flex-col h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">T</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">Trezo</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-6">
                {/* Dashboard Section */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    DASHBOARD
                  </h3>
                  <div className="space-y-1">
                    {dashboardItems.map(renderNavItem)}
                  </div>
                </div>

                {/* Analytics Section */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    ANALYTICS
                  </h3>
                  <div className="space-y-1">
                    {analyticsItems.map(renderNavItem)}
                  </div>
                </div>

                {/* Account Management Section */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    ACCOUNT MANAGEMENT
                  </h3>
                  <div className="space-y-1">
                    {accountManagementItems.map(renderNavItem)}
                  </div>
                </div>

                {/* Quick Actions Section */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    QUICK ACTIONS
                  </h3>
                  <div className="space-y-1">
                    {quickActionsItems.map(renderNavItem)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
