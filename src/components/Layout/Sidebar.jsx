import * as React from "react"
import { cn } from "@/lib/utils"
import { 
  BarChart3, 
  Target, 
  Users, 
  Settings, 
  HelpCircle,
  Plus,
  Search,
  Eye,
  ShoppingCart,
  Video,
  Smartphone,
  MapPin,
  Phone,
  FileText,
  TrendingUp,
  Calendar,
  CreditCard,
  Zap,
  ChevronRight,
  ChevronDown,
  Home,
  Folder,
  Star,
  Archive,
  Trash2,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Bell,
  Globe,
  Shield,
  Database,
  Code,
  Layers,
  Activity
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Navigation Items Configuration
const navigationItems = [
  {
    id: "dashboard",
    label: "لوحة التحكم",
    icon: Home,
    href: "/dashboard",
    badge: null,
    description: "نظرة عامة على الأداء"
  },
  {
    id: "campaigns",
    label: "الحملات الإعلانية",
    icon: Target,
    badge: "12",
    description: "إدارة جميع الحملات",
    children: [
      {
        id: "all-campaigns",
        label: "جميع الحملات",
        icon: Folder,
        href: "/campaigns",
        badge: "12"
      },
      {
        id: "new-campaign",
        label: "حملة جديدة",
        icon: Plus,
        href: "/campaigns/new",
        highlight: true
      },
      {
        id: "search-campaigns",
        label: "حملات البحث",
        icon: Search,
        href: "/campaigns/search",
        badge: "8"
      },
      {
        id: "display-campaigns",
        label: "حملات العرض",
        icon: Eye,
        href: "/campaigns/display",
        badge: "3"
      },
      {
        id: "video-campaigns",
        label: "حملات الفيديو",
        icon: Video,
        href: "/campaigns/video",
        badge: "1"
      },
      {
        id: "shopping-campaigns",
        label: "حملات التسوق",
        icon: ShoppingCart,
        href: "/campaigns/shopping"
      },
      {
        id: "app-campaigns",
        label: "حملات التطبيقات",
        icon: Smartphone,
        href: "/campaigns/app"
      },
      {
        id: "local-campaigns",
        label: "الحملات المحلية",
        icon: MapPin,
        href: "/campaigns/local"
      },
      {
        id: "call-campaigns",
        label: "حملات الاتصال",
        icon: Phone,
        href: "/campaigns/call"
      }
    ]
  },
  {
    id: "keywords",
    label: "الكلمات المفتاحية",
    icon: Search,
    href: "/keywords",
    badge: "156",
    description: "إدارة الكلمات المفتاحية",
    children: [
      {
        id: "keyword-research",
        label: "بحث الكلمات",
        icon: Search,
        href: "/keywords/research"
      },
      {
        id: "keyword-planner",
        label: "مخطط الكلمات",
        icon: Calendar,
        href: "/keywords/planner"
      },
      {
        id: "negative-keywords",
        label: "الكلمات السلبية",
        icon: Archive,
        href: "/keywords/negative"
      }
    ]
  },
  {
    id: "ads",
    label: "الإعلانات",
    icon: FileText,
    href: "/ads",
    badge: "45",
    description: "إدارة الإعلانات والنصوص",
    children: [
      {
        id: "text-ads",
        label: "الإعلانات النصية",
        icon: FileText,
        href: "/ads/text"
      },
      {
        id: "image-ads",
        label: "الإعلانات المصورة",
        icon: Eye,
        href: "/ads/image"
      },
      {
        id: "video-ads",
        label: "إعلانات الفيديو",
        icon: Video,
        href: "/ads/video"
      },
      {
        id: "responsive-ads",
        label: "الإعلانات المتجاوبة",
        icon: Smartphone,
        href: "/ads/responsive"
      }
    ]
  },
  {
    id: "audience",
    label: "الجمهور",
    icon: Users,
    href: "/audience",
    description: "استهداف الجمهور",
    children: [
      {
        id: "demographics",
        label: "الديموغرافيا",
        icon: Users,
        href: "/audience/demographics"
      },
      {
        id: "interests",
        label: "الاهتمامات",
        icon: Star,
        href: "/audience/interests"
      },
      {
        id: "remarketing",
        label: "إعادة التسويق",
        icon: RefreshCw,
        href: "/audience/remarketing"
      },
      {
        id: "custom-audience",
        label: "جمهور مخصص",
        icon: Filter,
        href: "/audience/custom"
      }
    ]
  },
  {
    id: "reports",
    label: "التقارير والتحليلات",
    icon: BarChart3,
    href: "/reports",
    description: "تقارير الأداء المفصلة",
    children: [
      {
        id: "performance",
        label: "تقارير الأداء",
        icon: TrendingUp,
        href: "/reports/performance"
      },
      {
        id: "conversion",
        label: "تقارير التحويل",
        icon: Target,
        href: "/reports/conversion"
      },
      {
        id: "audience-insights",
        label: "رؤى الجمهور",
        icon: Users,
        href: "/reports/audience"
      },
      {
        id: "competitive",
        label: "تحليل المنافسين",
        icon: Activity,
        href: "/reports/competitive"
      },
      {
        id: "custom-reports",
        label: "تقارير مخصصة",
        icon: FileText,
        href: "/reports/custom"
      }
    ]
  },
  {
    id: "tools",
    label: "الأدوات",
    icon: Zap,
    href: "/tools",
    description: "أدوات التحسين والأتمتة",
    children: [
      {
        id: "keyword-planner",
        label: "مخطط الكلمات",
        icon: Search,
        href: "/tools/keyword-planner"
      },
      {
        id: "ad-preview",
        label: "معاينة الإعلان",
        icon: Eye,
        href: "/tools/ad-preview"
      },
      {
        id: "bid-simulator",
        label: "محاكي المزايدة",
        icon: TrendingUp,
        href: "/tools/bid-simulator"
      },
      {
        id: "conversion-tracking",
        label: "تتبع التحويل",
        icon: Target,
        href: "/tools/conversion-tracking"
      },
      {
        id: "bulk-operations",
        label: "العمليات المجمعة",
        icon: Layers,
        href: "/tools/bulk-operations"
      }
    ]
  },
  {
    id: "billing",
    label: "الفوترة",
    icon: CreditCard,
    href: "/billing",
    description: "إدارة الفوترة والمدفوعات"
  },
  {
    id: "settings",
    label: "الإعدادات",
    icon: Settings,
    href: "/settings",
    description: "إعدادات الحساب والتفضيلات",
    children: [
      {
        id: "account-settings",
        label: "إعدادات الحساب",
        icon: Settings,
        href: "/settings/account"
      },
      {
        id: "notification-settings",
        label: "إعدادات الإشعارات",
        icon: Bell,
        href: "/settings/notifications"
      },
      {
        id: "privacy-settings",
        label: "إعدادات الخصوصية",
        icon: Shield,
        href: "/settings/privacy"
      },
      {
        id: "api-settings",
        label: "إعدادات API",
        icon: Code,
        href: "/settings/api"
      },
      {
        id: "data-settings",
        label: "إعدادات البيانات",
        icon: Database,
        href: "/settings/data"
      }
    ]
  }
]

// Sidebar Item Component
const SidebarItem = React.forwardRef(({ 
  item, 
  isActive, 
  isCollapsed,
  onItemClick,
  level = 0,
  className,
  ...props 
}, ref) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const hasChildren = item.children && item.children.length > 0
  const Icon = item.icon

  const handleClick = () => {
    if (hasChildren) {
      setIsOpen(!isOpen)
    } else {
      onItemClick?.(item)
    }
  }

  const itemContent = (
    <div className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group",
      isActive && "bg-blue-50 text-blue-700 border-r-2 border-blue-600",
      !isActive && "hover:bg-gray-50 text-gray-700",
      item.highlight && "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600",
      level > 0 && "ml-4",
      className
    )}>
      <Icon className={cn(
        "h-5 w-5 flex-shrink-0",
        isActive && "text-blue-600",
        item.highlight && "text-white"
      )} />
      
      {!isCollapsed && (
        <>
          <span className="flex-1 text-sm font-medium truncate">
            {item.label}
          </span>
          
          {item.badge && (
            <Badge 
              variant={isActive ? "default" : "secondary"} 
              className={cn(
                "text-xs",
                item.highlight && "bg-white/20 text-white hover:bg-white/30"
              )}
            >
              {item.badge}
            </Badge>
          )}
          
          {hasChildren && (
            <ChevronRight className={cn(
              "h-4 w-4 transition-transform duration-200",
              isOpen && "rotate-90"
            )} />
          )}
        </>
      )}
    </div>
  )

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              ref={ref}
              variant="ghost"
              className={cn(
                "w-full justify-start p-2 h-auto",
                isActive && "bg-blue-50 text-blue-700"
              )}
              onClick={handleClick}
              {...props}
            >
              {itemContent}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex flex-col gap-1">
            <span className="font-medium">{item.label}</span>
            {item.description && (
              <span className="text-xs text-gray-500">{item.description}</span>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (hasChildren) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            ref={ref}
            variant="ghost"
            className="w-full justify-start p-0 h-auto"
            onClick={handleClick}
            {...props}
          >
            {itemContent}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1 mt-1">
          {item.children.map((child) => (
            <SidebarItem
              key={child.id}
              item={child}
              isActive={isActive}
              isCollapsed={false}
              onItemClick={onItemClick}
              level={level + 1}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <Button
      ref={ref}
      variant="ghost"
      className="w-full justify-start p-0 h-auto"
      onClick={handleClick}
      {...props}
    >
      {itemContent}
    </Button>
  )
})
SidebarItem.displayName = "SidebarItem"

// Main Sidebar Component
const Sidebar = React.forwardRef(({ 
  isCollapsed = false,
  activeItem,
  onItemClick,
  onToggleCollapse,
  className,
  ...props 
}, ref) => {
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredItems = React.useMemo(() => {
    if (!searchQuery) return navigationItems

    return navigationItems.filter(item => {
      const matchesItem = item.label.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesChildren = item.children?.some(child => 
        child.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
      return matchesItem || matchesChildren
    })
  }, [searchQuery])

  return (
    <aside 
      ref={ref}
      className={cn(
        "flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
      {...props}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="البحث في القائمة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                <Plus className="h-4 w-4" />
                حملة جديدة
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {filteredItems.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              isActive={activeItem === item.id}
              isCollapsed={isCollapsed}
              onItemClick={onItemClick}
            />
          ))}
        </nav>

        {!isCollapsed && (
          <>
            <Separator className="my-4" />
            
            {/* Quick Stats */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                إحصائيات سريعة
              </h4>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-800">حملات نشطة</span>
                  </div>
                  <span className="text-sm font-semibold text-green-800">8</span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-blue-800">الميزانية اليومية</span>
                  </div>
                  <span className="text-sm font-semibold text-blue-800">$1,250</span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-purple-800">معدل النقر</span>
                  </div>
                  <span className="text-sm font-semibold text-purple-800">3.8%</span>
                </div>
              </div>
            </div>
          </>
        )}
      </ScrollArea>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-gray-200">
        {!isCollapsed ? (
          <div className="space-y-2">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
              <HelpCircle className="h-4 w-4" />
              المساعدة والدعم
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start gap-2"
              onClick={onToggleCollapse}
            >
              <ChevronRight className="h-4 w-4" />
              طي القائمة
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full p-2">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  المساعدة والدعم
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full p-2"
                    onClick={onToggleCollapse}
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  توسيع القائمة
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    </aside>
  )
})
Sidebar.displayName = "Sidebar"

// Mobile Sidebar Component
const MobileSidebar = React.forwardRef(({ 
  isOpen,
  onClose,
  activeItem,
  onItemClick,
  className,
  ...props 
}, ref) => {
  const handleItemClick = (item) => {
    onItemClick?.(item)
    onClose?.()
  }

  return (
    <div 
      ref={ref}
      className={cn(
        "fixed inset-0 z-50 lg:hidden",
        isOpen ? "block" : "hidden"
      )}
      {...props}
    >
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={cn(
        "fixed right-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300",
        isOpen ? "translate-x-0" : "translate-x-full",
        className
      )}>
        <Sidebar
          isCollapsed={false}
          activeItem={activeItem}
          onItemClick={handleItemClick}
          className="w-full border-r-0"
        />
      </div>
    </div>
  )
})
MobileSidebar.displayName = "MobileSidebar"

export { Sidebar, MobileSidebar, SidebarItem }

