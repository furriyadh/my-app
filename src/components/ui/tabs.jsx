import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"
import { 
  BarChart3, 
  Target, 
  Users, 
  TrendingUp, 
  Settings, 
  FileText,
  Search,
  Eye,
  ShoppingCart,
  Video,
  Smartphone,
  MapPin,
  Phone
} from "lucide-react"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-12 items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-500",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-950 data-[state=active]:shadow-sm hover:bg-white/50",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

// Campaign Type Tabs Component
const CampaignTypeTabs = React.forwardRef(({ 
  value, 
  onValueChange, 
  className,
  showIcons = true,
  variant = "default", // default, pills, underline
  ...props 
}, ref) => {
  const campaignTypes = [
    {
      value: "search",
      label: "البحث",
      icon: Search,
      description: "إعلانات نصية في نتائج البحث",
      color: "text-blue-600"
    },
    {
      value: "display",
      label: "العرض",
      icon: Eye,
      description: "إعلانات بصرية على الشبكة",
      color: "text-purple-600"
    },
    {
      value: "video",
      label: "الفيديو",
      icon: Video,
      description: "إعلانات فيديو على YouTube",
      color: "text-red-600"
    },
    {
      value: "shopping",
      label: "التسوق",
      icon: ShoppingCart,
      description: "إعلانات المنتجات والأسعار",
      color: "text-green-600"
    },
    {
      value: "app",
      label: "التطبيقات",
      icon: Smartphone,
      description: "ترويج تحميل التطبيقات",
      color: "text-indigo-600"
    },
    {
      value: "local",
      label: "محلية",
      icon: MapPin,
      description: "استهداف العملاء المحليين",
      color: "text-orange-600"
    },
    {
      value: "call",
      label: "الاتصال",
      icon: Phone,
      description: "تشجيع العملاء على الاتصال",
      color: "text-teal-600"
    }
  ]

  const getTabsListClass = () => {
    switch (variant) {
      case "pills":
        return "bg-transparent gap-2"
      case "underline":
        return "bg-transparent border-b border-gray-200 rounded-none h-auto p-0"
      default:
        return "bg-gray-100"
    }
  }

  const getTabsTriggerClass = () => {
    switch (variant) {
      case "pills":
        return "bg-white border border-gray-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600 hover:border-blue-300"
      case "underline":
        return "bg-transparent border-b-2 border-transparent rounded-none data-[state=active]:border-blue-600 data-[state=active]:bg-transparent hover:bg-gray-50"
      default:
        return ""
    }
  }

  return (
    <Tabs value={value} onValueChange={onValueChange} className={className} {...props}>
      <TabsList className={cn("w-full", getTabsListClass())}>
        {campaignTypes.map((type) => {
          const Icon = type.icon
          return (
            <TabsTrigger
              key={type.value}
              value={type.value}
              className={cn("flex-1 gap-2", getTabsTriggerClass())}
            >
              {showIcons && <Icon className={cn("h-4 w-4", type.color)} />}
              <span className="hidden sm:inline">{type.label}</span>
            </TabsTrigger>
          )
        })}
      </TabsList>

      {campaignTypes.map((type) => (
        <TabsContent key={type.value} value={type.value} className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <type.icon className={cn("h-6 w-6", type.color)} />
              <h3 className="text-lg font-semibold text-gray-900">
                حملة {type.label}
              </h3>
            </div>
            <p className="text-gray-600">{type.description}</p>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
})
CampaignTypeTabs.displayName = "CampaignTypeTabs"

// Reports Tabs Component
const ReportsTabs = React.forwardRef(({ 
  value = "overview", 
  onValueChange, 
  className,
  ...props 
}, ref) => {
  const reportTypes = [
    {
      value: "overview",
      label: "نظرة عامة",
      icon: BarChart3,
      badge: null
    },
    {
      value: "campaigns",
      label: "الحملات",
      icon: Target,
      badge: "12"
    },
    {
      value: "keywords",
      label: "الكلمات المفتاحية",
      icon: Search,
      badge: "156"
    },
    {
      value: "audience",
      label: "الجمهور",
      icon: Users,
      badge: null
    },
    {
      value: "performance",
      label: "الأداء",
      icon: TrendingUp,
      badge: "جديد"
    },
    {
      value: "settings",
      label: "الإعدادات",
      icon: Settings,
      badge: null
    }
  ]

  return (
    <Tabs value={value} onValueChange={onValueChange} className={className} {...props}>
      <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 bg-white border border-gray-200 rounded-lg p-1">
        {reportTypes.map((report) => {
          const Icon = report.icon
          return (
            <TabsTrigger
              key={report.value}
              value={report.value}
              className="flex flex-col gap-1 h-16 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 border border-transparent"
            >
              <div className="flex items-center gap-1">
                <Icon className="h-4 w-4" />
                {report.badge && (
                  <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {report.badge}
                  </span>
                )}
              </div>
              <span className="text-xs">{report.label}</span>
            </TabsTrigger>
          )
        })}
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Overview Cards */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الظهور</p>
                <p className="text-2xl font-bold text-gray-900">1.2M</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">+12.5%</span>
              <span className="text-sm text-gray-500">من الشهر الماضي</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي النقرات</p>
                <p className="text-2xl font-bold text-gray-900">45.2K</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">+8.2%</span>
              <span className="text-sm text-gray-500">من الشهر الماضي</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">معدل النقر</p>
                <p className="text-2xl font-bold text-gray-900">3.8%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">+0.3%</span>
              <span className="text-sm text-gray-500">من الشهر الماضي</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي التكلفة</p>
                <p className="text-2xl font-bold text-gray-900">$12.5K</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">+5.1%</span>
              <span className="text-sm text-gray-500">من الشهر الماضي</span>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="campaigns">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">تقارير الحملات</h3>
          <p className="text-gray-600">عرض تفصيلي لأداء جميع الحملات الإعلانية</p>
        </div>
      </TabsContent>

      <TabsContent value="keywords">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">تقارير الكلمات المفتاحية</h3>
          <p className="text-gray-600">تحليل أداء الكلمات المفتاحية وتحسين الاستهداف</p>
        </div>
      </TabsContent>

      <TabsContent value="audience">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">تقارير الجمهور</h3>
          <p className="text-gray-600">فهم سلوك الجمهور المستهدف وتفضيلاته</p>
        </div>
      </TabsContent>

      <TabsContent value="performance">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">تقارير الأداء</h3>
          <p className="text-gray-600">مقاييس الأداء المتقدمة والتحليلات التنبؤية</p>
        </div>
      </TabsContent>

      <TabsContent value="settings">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">إعدادات التقارير</h3>
          <p className="text-gray-600">تخصيص التقارير وإعدادات التصدير</p>
        </div>
      </TabsContent>
    </Tabs>
  )
})
ReportsTabs.displayName = "ReportsTabs"

// Vertical Tabs Component
const VerticalTabs = React.forwardRef(({ 
  value, 
  onValueChange, 
  tabs = [],
  className,
  ...props 
}, ref) => {
  return (
    <Tabs 
      value={value} 
      onValueChange={onValueChange} 
      orientation="vertical"
      className={cn("flex gap-6", className)} 
      {...props}
    >
      <TabsList className="flex flex-col h-auto w-48 bg-white border border-gray-200 p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="w-full justify-start gap-3 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 border border-transparent"
            >
              {Icon && <Icon className="h-4 w-4" />}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="ml-auto bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                  {tab.badge}
                </span>
              )}
            </TabsTrigger>
          )
        })}
      </TabsList>

      <div className="flex-1">
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-0">
            {tab.content}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  )
})
VerticalTabs.displayName = "VerticalTabs"

// Animated Tabs Component
const AnimatedTabs = React.forwardRef(({ 
  value, 
  onValueChange, 
  tabs = [],
  className,
  ...props 
}, ref) => {
  const [activeTab, setActiveTab] = React.useState(value)

  React.useEffect(() => {
    setActiveTab(value)
  }, [value])

  const handleTabChange = (newValue) => {
    setActiveTab(newValue)
    onValueChange?.(newValue)
  }

  return (
    <div className={cn("w-full", className)} {...props}>
      <div className="relative">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={cn(
                "relative flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
                activeTab === tab.value
                  ? "text-blue-700 bg-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              )}
            >
              {tab.icon && <tab.icon className="h-4 w-4 mr-2 inline" />}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        {tabs.map((tab) => (
          <div
            key={tab.value}
            className={cn(
              "transition-all duration-300",
              activeTab === tab.value
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2 absolute pointer-events-none"
            )}
          >
            {activeTab === tab.value && tab.content}
          </div>
        ))}
      </div>
    </div>
  )
})
AnimatedTabs.displayName = "AnimatedTabs"

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  CampaignTypeTabs,
  ReportsTabs,
  VerticalTabs,
  AnimatedTabs,
}

