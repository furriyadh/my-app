import * as React from "react"
import { cn } from "@/lib/utils"
import { 
  Bell, 
  Search, 
  Settings, 
  User, 
  Menu, 
  X,
  ChevronDown,
  LogOut,
  UserCircle,
  CreditCard,
  HelpCircle,
  Moon,
  Sun,
  Globe,
  Zap,
  BarChart3,
  Target,
  Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

// Header Component
const Header = React.forwardRef(({ 
  user,
  onMenuClick,
  onSearch,
  notifications = [],
  className,
  ...props 
}, ref) => {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isSearchFocused, setIsSearchFocused] = React.useState(false)
  const [theme, setTheme] = React.useState("light")

  const handleSearch = (e) => {
    e.preventDefault()
    onSearch?.(searchQuery)
  }

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    // Apply theme logic here
  }

  const unreadNotifications = notifications.filter(n => !n.read).length

  return (
    <header 
      ref={ref}
      className={cn(
        "sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60",
        className
      )}
      {...props}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left Section - Logo & Menu */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Google Ads AI
                </h1>
                <p className="text-xs text-gray-500">منصة الإعلانات الذكية</p>
              </div>
            </div>
          </div>

          {/* Center Section - Search */}
          <div className="flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="البحث في الحملات، التقارير..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={cn(
                  "pl-4 pr-10 transition-all duration-200",
                  isSearchFocused && "ring-2 ring-blue-500 border-blue-500"
                )}
              />
              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute left-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </form>
          </div>

          {/* Right Section - Actions & User */}
          <div className="flex items-center gap-2">
            {/* Quick Actions */}
            <div className="hidden md:flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                حملة جديدة
              </Button>
              
              <Button variant="ghost" size="sm">
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="hidden sm:flex"
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  {unreadNotifications > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                    >
                      {unreadNotifications > 9 ? "9+" : unreadNotifications}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  الإشعارات
                  {unreadNotifications > 0 && (
                    <Badge variant="secondary">{unreadNotifications} جديد</Badge>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    لا توجد إشعارات جديدة
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.slice(0, 5).map((notification, index) => (
                      <DropdownMenuItem key={index} className="flex flex-col items-start p-3">
                        <div className="flex items-center gap-2 w-full">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            notification.read ? "bg-gray-300" : "bg-blue-500"
                          )} />
                          <span className="font-medium text-sm">{notification.title}</span>
                          <span className="text-xs text-gray-500 ml-auto">
                            {notification.time}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 mr-4">
                          {notification.message}
                        </p>
                      </DropdownMenuItem>
                    ))}
                  </div>
                )}
                
                {notifications.length > 5 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-center text-blue-600">
                      عرض جميع الإشعارات
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    </div>
                    <div className="hidden md:block text-right">
                      <p className="text-sm font-medium">{user?.name || "المستخدم"}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.name || "المستخدم"}</span>
                    <span className="text-xs text-gray-500 font-normal">
                      {user?.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem className="gap-2">
                  <UserCircle className="h-4 w-4" />
                  الملف الشخصي
                </DropdownMenuItem>
                
                <DropdownMenuItem className="gap-2">
                  <CreditCard className="h-4 w-4" />
                  الفوترة والاشتراك
                </DropdownMenuItem>
                
                <DropdownMenuItem className="gap-2">
                  <Settings className="h-4 w-4" />
                  الإعدادات
                </DropdownMenuItem>
                
                <DropdownMenuItem className="gap-2">
                  <Globe className="h-4 w-4" />
                  اللغة والمنطقة
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem className="gap-2">
                  <HelpCircle className="h-4 w-4" />
                  المساعدة والدعم
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem className="gap-2 text-red-600 focus:text-red-600">
                  <LogOut className="h-4 w-4" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Search Results Overlay */}
      {isSearchFocused && searchQuery && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-500 mb-2">
                نتائج البحث عن "{searchQuery}"
              </div>
              {/* Search results would go here */}
              <div className="text-sm text-gray-400">
                لا توجد نتائج مطابقة
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
})
Header.displayName = "Header"

// Mobile Header Component
const MobileHeader = React.forwardRef(({ 
  user,
  onMenuClick,
  notifications = [],
  className,
  ...props 
}, ref) => {
  const unreadNotifications = notifications.filter(n => !n.read).length

  return (
    <header 
      ref={ref}
      className={cn(
        "lg:hidden sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur",
        className
      )}
      {...props}
    >
      <div className="flex h-14 items-center justify-between px-4">
        {/* Left - Menu & Logo */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Ads AI
            </span>
          </div>
        </div>

        {/* Right - Notifications & User */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            {unreadNotifications > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
              >
                {unreadNotifications > 9 ? "9+" : unreadNotifications}
              </Badge>
            )}
          </Button>

          {/* User Avatar */}
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
})
MobileHeader.displayName = "MobileHeader"

// Breadcrumb Component
const Breadcrumb = React.forwardRef(({ 
  items = [],
  className,
  ...props 
}, ref) => {
  return (
    <nav 
      ref={ref}
      className={cn("flex items-center space-x-1 text-sm text-gray-500", className)}
      {...props}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="mx-2 text-gray-300">/</span>
          )}
          {item.href ? (
            <a 
              href={item.href}
              className="hover:text-gray-700 transition-colors"
            >
              {item.label}
            </a>
          ) : (
            <span className={cn(
              index === items.length - 1 && "text-gray-900 font-medium"
            )}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
})
Breadcrumb.displayName = "Breadcrumb"

export { Header, MobileHeader, Breadcrumb }

