import * as React from "react"
import { cn } from "@/lib/utils"
import { 
  Home, 
  Target, 
  Users, 
  Settings,
  Plus,
  Link,
  Upload
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

const navigationItems = [
  {
    id: "dashboard",
    label: "لوحة التحكم",
    icon: Home,
    href: "/dashboard?section=overview",
    badge: null,
    description: "نظرة عامة على الأداء"
  },
  {
    id: "new-campaign",
    label: "حملة جديدة",
    icon: Plus,
    href: "/campaign/new",
    highlight: true,
    description: "إنشاء حملة إعلانية جديدة"
  },
  {
    id: "integrations",
    label: "التكاملات",
    icon: Link,
    href: "/integrations",
    badge: "Connect",
    description: "ربط الحسابات والخدمات الخارجية"
  },
  {
    id: "google-ads",
    label: "Google Ads",
    icon: Target,
    href: "/integrations/google-ads",
    description: "إدارة حسابات Google Ads"
  },
  {
    id: "asset-upload",
    label: "رفع الأصول",
    icon: Upload,
    href: "/dashboard?section=asset-upload",
    description: "رفع الصور والفيديوهات"
  }
]

const accountManagementItems = [
  {
    id: "accounts",
    label: "إدارة الحسابات",
    icon: Users,
    href: "/accounts",
    description: "إدارة حسابات العملاء"
  },
  {
    id: "settings",
    label: "الإعدادات",
    icon: Settings,
    href: "/settings",
    description: "إعدادات النظام"
  }
]

export function Sidebar({ className, ...props }) {
  const [activeItem, setActiveItem] = React.useState("dashboard")

  const handleItemClick = (itemId) => {
    setActiveItem(itemId)
  }

  const renderNavItem = (item) => (
    <Button
      key={item.id}
      variant={activeItem === item.id ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start gap-3 h-12 px-3",
        activeItem === item.id && "shadow-sm",
        item.highlight && "border border-blue-200 dark:border-blue-800"
      )}
      onClick={() => handleItemClick(item.id)}
    >
      <item.icon className="h-5 w-5" />
      <div className="flex-1 text-right">
        <div className="font-medium">{item.label}</div>
        {item.description && (
          <div className="text-xs text-muted-foreground">{item.description}</div>
        )}
      </div>
      {item.badge && (
        <Badge variant={item.badge === "Connect" ? "default" : "secondary"} className="text-xs">
          {item.badge}
        </Badge>
      )}
    </Button>
  )

  return (
    <div className={cn("pb-12", className)} {...props}>
      <div className="space-y-4 py-4">
        {/* Organization Info */}
        <div className="px-3 py-2">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">
              Organization Name
            </h2>
            <Badge variant="outline" className="text-xs">
              Basic Plan
            </Badge>
          </div>
        </div>
        
        <Separator />
        
        {/* Main Navigation */}
        <div className="px-3">
          <div className="space-y-1">
            <h3 className="mb-2 px-4 text-sm font-semibold tracking-tight text-muted-foreground">
              القائمة الرئيسية
            </h3>
            {navigationItems.map(renderNavItem)}
          </div>
        </div>
        
        <Separator />
        
        {/* Account Management */}
        <div className="px-3">
          <div className="space-y-1">
            <h3 className="mb-2 px-4 text-sm font-semibold tracking-tight text-muted-foreground">
              ACCOUNT MANAGEMENT
            </h3>
            {accountManagementItems.map(renderNavItem)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar