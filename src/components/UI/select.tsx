import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "../../lib/utils"

// Type definitions
interface SelectTriggerProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  className?: string;
}

interface SelectScrollUpButtonProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton> {
  className?: string;
}

interface SelectScrollDownButtonProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton> {
  className?: string;
}

interface SelectContentProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> {
  className?: string;
  position?: "popper" | "item-aligned";
}

interface SelectLabelProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label> {
  className?: string;
}

interface SelectItemProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> {
  className?: string;
  children?: React.ReactNode;
  value: string;
}

interface SelectSeparatorProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator> {
  className?: string;
}

interface CampaignSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  campaigns?: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    budget: number;
  }>;
}

interface LocationSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  multiple?: boolean;
}

interface BudgetSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const Select = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(({ className, children, ...props }, ref) => 
  React.createElement(
    SelectPrimitive.Trigger,
    {
      ref,
      className: cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
        className
      ),
      ...props
    },
    children,
    React.createElement(SelectPrimitive.Icon, { asChild: true },
      React.createElement(ChevronDown, { className: "h-4 w-4 opacity-50" })
    )
  )
)
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  SelectScrollUpButtonProps
>(({ className, ...props }, ref) => 
  React.createElement(
    SelectPrimitive.ScrollUpButton,
    {
      ref,
      className: cn(
        "flex cursor-default items-center justify-center py-1",
        className
      ),
      ...props
    },
    React.createElement(ChevronUp, { className: "h-4 w-4" })
  )
)
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  SelectScrollDownButtonProps
>(({ className, ...props }, ref) => 
  React.createElement(
    SelectPrimitive.ScrollDownButton,
    {
      ref,
      className: cn(
        "flex cursor-default items-center justify-center py-1",
        className
      ),
      ...props
    },
    React.createElement(ChevronDown, { className: "h-4 w-4" })
  )
)
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  SelectContentProps
>(({ className, children, position = "popper", ...props }, ref) => 
  React.createElement(
    SelectPrimitive.Portal,
    null,
    React.createElement(
      SelectPrimitive.Content,
      {
        ref,
        className: cn(
          "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white text-gray-950 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        ),
        position,
        ...props
      },
      React.createElement(SelectScrollUpButton),
      React.createElement(
        SelectPrimitive.Viewport,
        {
          className: cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          )
        },
        children
      ),
      React.createElement(SelectScrollDownButton)
    )
  )
)
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  SelectLabelProps
>(({ className, ...props }, ref) => 
  React.createElement(SelectPrimitive.Label, {
    ref,
    className: cn("py-1.5 pr-2 pl-8 text-sm font-semibold", className),
    ...props
  })
)
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  SelectItemProps
>(({ className, children, ...props }, ref) => 
  React.createElement(
    SelectPrimitive.Item,
    {
      ref,
      className: cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      ),
      ...props
    },
    React.createElement(
      "span",
      { className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center" },
      React.createElement(
        SelectPrimitive.ItemIndicator,
        null,
        React.createElement(Check, { className: "h-4 w-4" })
      )
    ),
    React.createElement(SelectPrimitive.ItemText, null, children)
  )
)
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  SelectSeparatorProps
>(({ className, ...props }, ref) => 
  React.createElement(SelectPrimitive.Separator, {
    ref,
    className: cn("-mx-1 my-1 h-px bg-gray-100", className),
    ...props
  })
)
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

// Campaign Select Component
const CampaignSelect = React.forwardRef<HTMLDivElement, CampaignSelectProps>(({
  value,
  onValueChange,
  placeholder = "اختر حملة...",
  className,
  campaigns = [],
  ...props
}, ref) => {
  const getStatusBadge = React.useCallback((status: string) => {
    const statusConfig = {
      active: { label: "نشط", className: "bg-green-100 text-green-800" },
      paused: { label: "متوقف", className: "bg-yellow-100 text-yellow-800" },
      ended: { label: "منتهي", className: "bg-gray-100 text-gray-800" },
      draft: { label: "مسودة", className: "bg-blue-100 text-blue-800" }
    }
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
  }, [])

  return React.createElement(
    "div",
    { ref, className: cn("w-full", className), ...props },
    React.createElement(
      Select,
      { value, onValueChange },
      React.createElement(
        SelectTrigger,
        { className: "w-full" },
        React.createElement(SelectValue, { placeholder })
      ),
      React.createElement(
        SelectContent,
        null,
        React.createElement(SelectLabel, null, "الحملات المتاحة"),
        ...campaigns.map((campaign) => 
          React.createElement(
            SelectItem,
            { key: campaign.id, value: campaign.id },
            React.createElement(
              "div",
              { className: "flex items-center justify-between w-full" },
              React.createElement(
                "div",
                { className: "flex flex-col" },
                React.createElement("span", { className: "font-medium" }, campaign.name),
                React.createElement("span", { className: "text-xs text-gray-500" }, campaign.type)
              ),
              React.createElement(
                "div",
                { className: "flex items-center gap-2" },
                React.createElement(
                  "span",
                  {
                    className: cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      getStatusBadge(campaign.status).className
                    )
                  },
                  getStatusBadge(campaign.status).label
                ),
                React.createElement(
                  "span",
                  { className: "text-xs text-gray-600" },
                  `$${campaign.budget}`
                )
              )
            )
          )
        )
      )
    )
  )
})
CampaignSelect.displayName = "CampaignSelect"

// Location Select Component
const LocationSelect = React.forwardRef<HTMLDivElement, LocationSelectProps>(({
  value,
  onValueChange,
  placeholder = "اختر الموقع...",
  className,
  multiple = false,
  ...props
}, ref) => {
  const locations = [
    { value: "saudi-arabia", label: "المملكة العربية السعودية", flag: "🇸🇦" },
    { value: "riyadh", label: "الرياض", flag: "🏙️" },
    { value: "jeddah", label: "جدة", flag: "🏙️" },
    { value: "dammam", label: "الدمام", flag: "🏙️" },
    { value: "mecca", label: "مكة المكرمة", flag: "🕋" },
    { value: "medina", label: "المدينة المنورة", flag: "🕌" },
    { value: "uae", label: "الإمارات العربية المتحدة", flag: "🇦🇪" },
    { value: "kuwait", label: "الكويت", flag: "🇰🇼" },
    { value: "qatar", label: "قطر", flag: "🇶🇦" },
    { value: "bahrain", label: "البحرين", flag: "🇧🇭" },
    { value: "oman", label: "عُمان", flag: "🇴🇲" },
    { value: "egypt", label: "مصر", flag: "🇪🇬" },
    { value: "jordan", label: "الأردن", flag: "🇯🇴" },
    { value: "lebanon", label: "لبنان", flag: "🇱🇧" }
  ]

  return React.createElement(
    "div",
    { ref, className: cn("w-full", className), ...props },
    React.createElement(
      Select,
      { value, onValueChange },
      React.createElement(
        SelectTrigger,
        { className: "w-full" },
        React.createElement(SelectValue, { placeholder })
      ),
      React.createElement(
        SelectContent,
        null,
        React.createElement(SelectLabel, null, "المواقع الجغرافية"),
        ...locations.map((location) => 
          React.createElement(
            SelectItem,
            { key: location.value, value: location.value },
            React.createElement(
              "div",
              { className: "flex items-center gap-2" },
              React.createElement("span", null, location.flag),
              React.createElement("span", null, location.label)
            )
          )
        )
      )
    )
  )
})
LocationSelect.displayName = "LocationSelect"

// Budget Select Component
const BudgetSelect = React.forwardRef<HTMLDivElement, BudgetSelectProps>(({
  value,
  onValueChange,
  placeholder = "اختر الميزانية...",
  className,
  ...props
}, ref) => {
  const budgetRanges = [
    { value: "10-50", label: "$10 - $50 يومياً", description: "للمشاريع الصغيرة" },
    { value: "50-100", label: "$50 - $100 يومياً", description: "للشركات الناشئة" },
    { value: "100-500", label: "$100 - $500 يومياً", description: "للشركات المتوسطة" },
    { value: "500-1000", label: "$500 - $1,000 يومياً", description: "للشركات الكبيرة" },
    { value: "1000-5000", label: "$1,000 - $5,000 يومياً", description: "للمؤسسات" },
    { value: "5000+", label: "$5,000+ يومياً", description: "للشركات العملاقة" },
    { value: "custom", label: "ميزانية مخصصة", description: "حدد المبلغ بنفسك" }
  ]

  return React.createElement(
    "div",
    { ref, className: cn("w-full", className), ...props },
    React.createElement(
      Select,
      { value, onValueChange },
      React.createElement(
        SelectTrigger,
        { className: "w-full" },
        React.createElement(SelectValue, { placeholder })
      ),
      React.createElement(
        SelectContent,
        null,
        React.createElement(SelectLabel, null, "نطاقات الميزانية"),
        ...budgetRanges.map((budget) => 
          React.createElement(
            SelectItem,
            { key: budget.value, value: budget.value },
            React.createElement(
              "div",
              { className: "flex flex-col" },
              React.createElement("span", { className: "font-medium" }, budget.label),
              React.createElement("span", { className: "text-xs text-gray-500" }, budget.description)
            )
          )
        )
      )
    )
  )
})
BudgetSelect.displayName = "BudgetSelect"

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
  CampaignSelect,
  LocationSelect,
  BudgetSelect,
}

