import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-12 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 hover:border-gray-300 transition-all duration-200",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-lg border border-gray-200 bg-white text-gray-950 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-2 pl-8 pr-2 text-sm font-semibold text-gray-900", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-md py-2 pl-8 pr-2 text-sm outline-none focus:bg-blue-50 focus:text-blue-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-gray-50 transition-colors duration-150",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4 text-blue-600" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-gray-200", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

// Campaign Type Select Component
const CampaignTypeSelect = React.forwardRef(({ value, onValueChange, placeholder = "اختر نوع الحملة", className, ...props }, ref) => {
  const campaignTypes = [
    {
      value: "search",
      label: "حملة البحث",
      description: "إعلانات نصية تظهر في نتائج البحث",
      icon: "🔍"
    },
    {
      value: "display",
      label: "حملة العرض",
      description: "إعلانات بصرية على مواقع الشبكة",
      icon: "🖼️"
    },
    {
      value: "video",
      label: "حملة الفيديو",
      description: "إعلانات فيديو على YouTube",
      icon: "🎥"
    },
    {
      value: "shopping",
      label: "حملة التسوق",
      description: "إعلانات المنتجات مع الأسعار",
      icon: "🛒"
    },
    {
      value: "app",
      label: "حملة التطبيقات",
      description: "ترويج تحميل التطبيقات",
      icon: "📱"
    },
    {
      value: "smart",
      label: "الحملة الذكية",
      description: "حملة تلقائية بالذكاء الاصطناعي",
      icon: "🤖"
    },
    {
      value: "performance_max",
      label: "Performance Max",
      description: "حملة شاملة لجميع القنوات",
      icon: "⚡"
    },
    {
      value: "local",
      label: "حملة محلية",
      description: "استهداف العملاء المحليين",
      icon: "📍"
    },
    {
      value: "call",
      label: "حملة الاتصال",
      description: "تشجيع العملاء على الاتصال",
      icon: "📞"
    }
  ]

  const selectedCampaign = campaignTypes.find(type => type.value === value)

  return (
    <Select value={value} onValueChange={onValueChange} {...props}>
      <SelectTrigger ref={ref} className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder}>
          {selectedCampaign && (
            <div className="flex items-center gap-3">
              <span className="text-lg">{selectedCampaign.icon}</span>
              <div className="flex flex-col items-start">
                <span className="font-medium">{selectedCampaign.label}</span>
                <span className="text-xs text-gray-500 hidden sm:block">
                  {selectedCampaign.description}
                </span>
              </div>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectLabel>أنواع الحملات الإعلانية</SelectLabel>
        <SelectSeparator />
        {campaignTypes.map((type) => (
          <SelectItem key={type.value} value={type.value}>
            <div className="flex items-center gap-3 w-full">
              <span className="text-lg">{type.icon}</span>
              <div className="flex flex-col items-start">
                <span className="font-medium">{type.label}</span>
                <span className="text-xs text-gray-500">
                  {type.description}
                </span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
})
CampaignTypeSelect.displayName = "CampaignTypeSelect"

// Location Select Component
const LocationSelect = React.forwardRef(({ value, onValueChange, placeholder = "اختر الموقع الجغرافي", className, ...props }, ref) => {
  const locations = [
    { value: "saudi_arabia", label: "المملكة العربية السعودية", flag: "🇸🇦" },
    { value: "uae", label: "الإمارات العربية المتحدة", flag: "🇦🇪" },
    { value: "egypt", label: "مصر", flag: "🇪🇬" },
    { value: "kuwait", label: "الكويت", flag: "🇰🇼" },
    { value: "qatar", label: "قطر", flag: "🇶🇦" },
    { value: "bahrain", label: "البحرين", flag: "🇧🇭" },
    { value: "oman", label: "عُمان", flag: "🇴🇲" },
    { value: "jordan", label: "الأردن", flag: "🇯🇴" },
    { value: "lebanon", label: "لبنان", flag: "🇱🇧" },
    { value: "iraq", label: "العراق", flag: "🇮🇶" },
    { value: "morocco", label: "المغرب", flag: "🇲🇦" },
    { value: "tunisia", label: "تونس", flag: "🇹🇳" },
    { value: "algeria", label: "الجزائر", flag: "🇩🇿" }
  ]

  const selectedLocation = locations.find(loc => loc.value === value)

  return (
    <Select value={value} onValueChange={onValueChange} {...props}>
      <SelectTrigger ref={ref} className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder}>
          {selectedLocation && (
            <div className="flex items-center gap-2">
              <span>{selectedLocation.flag}</span>
              <span>{selectedLocation.label}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectLabel>الدول المتاحة</SelectLabel>
        <SelectSeparator />
        {locations.map((location) => (
          <SelectItem key={location.value} value={location.value}>
            <div className="flex items-center gap-2">
              <span>{location.flag}</span>
              <span>{location.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
})
LocationSelect.displayName = "LocationSelect"

// Language Select Component
const LanguageSelect = React.forwardRef(({ value, onValueChange, placeholder = "اختر اللغة", className, ...props }, ref) => {
  const languages = [
    { value: "ar", label: "العربية", flag: "🇸🇦" },
    { value: "en", label: "English", flag: "🇺🇸" },
    { value: "fr", label: "Français", flag: "🇫🇷" },
    { value: "es", label: "Español", flag: "🇪🇸" },
    { value: "de", label: "Deutsch", flag: "🇩🇪" },
    { value: "it", label: "Italiano", flag: "🇮🇹" },
    { value: "pt", label: "Português", flag: "🇵🇹" },
    { value: "ru", label: "Русский", flag: "🇷🇺" },
    { value: "zh", label: "中文", flag: "🇨🇳" },
    { value: "ja", label: "日本語", flag: "🇯🇵" },
    { value: "ko", label: "한국어", flag: "🇰🇷" },
    { value: "hi", label: "हिन्दी", flag: "🇮🇳" }
  ]

  const selectedLanguage = languages.find(lang => lang.value === value)

  return (
    <Select value={value} onValueChange={onValueChange} {...props}>
      <SelectTrigger ref={ref} className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder}>
          {selectedLanguage && (
            <div className="flex items-center gap-2">
              <span>{selectedLanguage.flag}</span>
              <span>{selectedLanguage.label}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectLabel>اللغات المتاحة</SelectLabel>
        <SelectSeparator />
        {languages.map((language) => (
          <SelectItem key={language.value} value={language.value}>
            <div className="flex items-center gap-2">
              <span>{language.flag}</span>
              <span>{language.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
})
LanguageSelect.displayName = "LanguageSelect"

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  CampaignTypeSelect,
  LocationSelect,
  LanguageSelect,
}

