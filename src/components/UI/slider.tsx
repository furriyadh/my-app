import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "../../lib/utils"
import { DollarSign, TrendingUp, Target, Users } from "lucide-react"

// Type definitions
interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  className?: string;
  value?: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
}

interface PredictionMetrics {
  clicks?: number;
  impressions: number;
  cpc?: string;
  conversions?: number;
  views?: number;
  cpv?: string;
  engagements?: number;
  sales?: number;
}

interface BudgetSliderProps {
  value?: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  campaignType?: "search" | "display" | "video" | "shopping";
  className?: string;
  showPredictions?: boolean;
  currency?: string;
}

interface RangeSliderProps {
  value?: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, ...props }, ref) => 
  React.createElement(
    SliderPrimitive.Root,
    {
      ref,
      className: cn(
        "relative flex w-full touch-none select-none items-center",
        className
      ),
      ...props
    },
    React.createElement(
      SliderPrimitive.Track,
      { className: "relative h-3 w-full grow overflow-hidden rounded-full bg-gradient-to-r from-gray-100 to-gray-200" },
      React.createElement(SliderPrimitive.Range, { className: "absolute h-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg" })
    ),
    React.createElement(SliderPrimitive.Thumb, { className: "block h-6 w-6 rounded-full border-2 border-white bg-gradient-to-r from-blue-500 to-purple-600 ring-offset-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-110 shadow-lg" })
  )
)
Slider.displayName = SliderPrimitive.Root.displayName

// Budget Slider Component with Advanced Features
const BudgetSlider = React.forwardRef<HTMLDivElement, BudgetSliderProps>(({ 
  value = [50], 
  onValueChange, 
  min = 5, 
  max = 10000, 
  step = 5,
  campaignType = "search",
  className,
  showPredictions = true,
  currency = "USD",
  ...props 
}, ref) => {
  const [currentValue, setCurrentValue] = React.useState(value)
  
  React.useEffect(() => {
    setCurrentValue(value)
  }, [value])

  const handleValueChange = React.useCallback((newValue: number[]) => {
    setCurrentValue(newValue)
    onValueChange?.(newValue)
  }, [onValueChange])

  // Budget ranges with colors
  const getBudgetRange = React.useCallback((budget: number) => {
    if (budget < 20) return { label: "ميزانية محدودة", color: "text-red-600", bg: "bg-red-50" }
    if (budget < 100) return { label: "ميزانية متوسطة", color: "text-yellow-600", bg: "bg-yellow-50" }
    if (budget < 500) return { label: "ميزانية جيدة", color: "text-green-600", bg: "bg-green-50" }
    if (budget < 1000) return { label: "ميزانية عالية", color: "text-blue-600", bg: "bg-blue-50" }
    return { label: "ميزانية ممتازة", color: "text-purple-600", bg: "bg-purple-50" }
  }, [])

  // Performance predictions based on campaign type and budget
  const getPredictions = React.useCallback((budget: number, type: string): PredictionMetrics => {
    const baseMetrics = {
      search: {
        clicks: Math.round(budget * 2.5),
        impressions: Math.round(budget * 125),
        cpc: (budget / (budget * 2.5)).toFixed(2),
        conversions: Math.round(budget * 0.15)
      },
      display: {
        clicks: Math.round(budget * 1.8),
        impressions: Math.round(budget * 500),
        cpc: (budget / (budget * 1.8)).toFixed(2),
        conversions: Math.round(budget * 0.08)
      },
      video: {
        views: Math.round(budget * 50),
        impressions: Math.round(budget * 200),
        cpv: (budget / (budget * 50)).toFixed(3),
        engagements: Math.round(budget * 5)
      },
      shopping: {
        clicks: Math.round(budget * 3.2),
        impressions: Math.round(budget * 80),
        cpc: (budget / (budget * 3.2)).toFixed(2),
        sales: Math.round(budget * 0.25)
      }
    }

    return baseMetrics[type as keyof typeof baseMetrics] || baseMetrics.search
  }, [])

  const budgetRange = getBudgetRange(currentValue[0])
  const predictions = showPredictions ? getPredictions(currentValue[0], campaignType) : null

  // Format currency
  const formatCurrency = React.useCallback((amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }, [currency])

  // Format numbers
  const formatNumber = React.useCallback((num: number) => {
    return new Intl.NumberFormat('ar-SA').format(num)
  }, [])

  return React.createElement(
    "div",
    { ref, className: cn("w-full space-y-6", className), ...props },
    // Budget Display
    React.createElement(
      "div",
      { className: "text-center space-y-2" },
      React.createElement(
        "div",
        { className: "flex items-center justify-center gap-2" },
        React.createElement(DollarSign, { className: "h-6 w-6 text-green-600" }),
        React.createElement(
          "span",
          { className: "text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" },
          formatCurrency(currentValue[0])
        )
      ),
      React.createElement(
        "div",
        { className: cn("inline-flex items-center px-3 py-1 rounded-full text-sm font-medium", budgetRange.bg, budgetRange.color) },
        budgetRange.label
      ),
      React.createElement("p", { className: "text-sm text-gray-600" }, "الميزانية اليومية")
    ),
    // Slider
    React.createElement(
      "div",
      { className: "px-4" },
      React.createElement(Slider, {
        value: currentValue,
        onValueChange: handleValueChange,
        min,
        max,
        step,
        className: "w-full"
      }),
      // Min/Max Labels
      React.createElement(
        "div",
        { className: "flex justify-between mt-2 text-xs text-gray-500" },
        React.createElement("span", null, formatCurrency(min)),
        React.createElement("span", null, formatCurrency(max))
      )
    ),
    // Quick Budget Options
    React.createElement(
      "div",
      { className: "grid grid-cols-4 gap-2" },
      ...[25, 50, 100, 500].map((amount) => 
        React.createElement(
          "button",
          {
            key: amount,
            onClick: () => handleValueChange([amount]),
            className: cn(
              "px-3 py-2 text-sm rounded-lg border transition-all duration-200 hover:scale-105",
              currentValue[0] === amount
                ? "bg-blue-500 text-white border-blue-500 shadow-lg"
                : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
            )
          },
          formatCurrency(amount)
        )
      )
    ),
    // Performance Predictions
    showPredictions && predictions && React.createElement(
      "div",
      { className: "bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 space-y-4" },
      React.createElement(
        "div",
        { className: "flex items-center gap-2 text-sm font-medium text-gray-700" },
        React.createElement(TrendingUp, { className: "h-4 w-4" }),
        "النتائج المتوقعة يومياً"
      ),
      React.createElement(
        "div",
        { className: "grid grid-cols-2 gap-4" },
        ...(campaignType === 'video' ? [
          React.createElement(
            "div",
            { className: "text-center" },
            React.createElement("div", { className: "text-2xl font-bold text-blue-600" }, formatNumber(predictions.views || 0)),
            React.createElement("div", { className: "text-xs text-gray-600" }, "مشاهدة")
          ),
          React.createElement(
            "div",
            { className: "text-center" },
            React.createElement("div", { className: "text-2xl font-bold text-purple-600" }, formatNumber(predictions.engagements || 0)),
            React.createElement("div", { className: "text-xs text-gray-600" }, "تفاعل")
          ),
          React.createElement(
            "div",
            { className: "text-center" },
            React.createElement("div", { className: "text-2xl font-bold text-green-600" }, formatNumber(predictions.impressions)),
            React.createElement("div", { className: "text-xs text-gray-600" }, "ظهور")
          ),
          React.createElement(
            "div",
            { className: "text-center" },
            React.createElement("div", { className: "text-2xl font-bold text-orange-600" }, `$${predictions.cpv || '0'}`),
            React.createElement("div", { className: "text-xs text-gray-600" }, "تكلفة المشاهدة")
          )
        ] : [
          React.createElement(
            "div",
            { className: "text-center" },
            React.createElement("div", { className: "text-2xl font-bold text-blue-600" }, formatNumber(predictions.clicks || 0)),
            React.createElement("div", { className: "text-xs text-gray-600" }, "نقرة")
          ),
          React.createElement(
            "div",
            { className: "text-center" },
            React.createElement("div", { className: "text-2xl font-bold text-purple-600" }, formatNumber(predictions.impressions)),
            React.createElement("div", { className: "text-xs text-gray-600" }, "ظهور")
          ),
          React.createElement(
            "div",
            { className: "text-center" },
            React.createElement(
              "div",
              { className: "text-2xl font-bold text-green-600" },
              campaignType === 'shopping' ? formatNumber(predictions.sales || 0) : formatNumber(predictions.conversions || 0)
            ),
            React.createElement(
              "div",
              { className: "text-xs text-gray-600" },
              campaignType === 'shopping' ? 'مبيعة' : 'تحويل'
            )
          ),
          React.createElement(
            "div",
            { className: "text-center" },
            React.createElement("div", { className: "text-2xl font-bold text-orange-600" }, `$${predictions.cpc || '0'}`),
            React.createElement("div", { className: "text-xs text-gray-600" }, "تكلفة النقرة")
          )
        ])
      ),
      // ROI Indicator
      React.createElement(
        "div",
        { className: "flex items-center justify-center gap-2 pt-2 border-t border-gray-200" },
        React.createElement(Target, { className: "h-4 w-4 text-green-600" }),
        React.createElement(
          "span",
          { className: "text-sm text-gray-600" },
          `العائد المتوقع: ${formatCurrency(currentValue[0] * 3.5)}`
        )
      )
    ),
    // Budget Tips
    React.createElement(
      "div",
      { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-3" },
      React.createElement(
        "div",
        { className: "flex items-start gap-2" },
        React.createElement(Users, { className: "h-4 w-4 text-yellow-600 mt-0.5" }),
        React.createElement(
          "div",
          { className: "text-sm text-yellow-800" },
          React.createElement("p", { className: "font-medium" }, "نصيحة:"),
          React.createElement(
            "p",
            null,
            currentValue[0] < 50 
              ? "ننصح بزيادة الميزانية للحصول على نتائج أفضل وبيانات أكثر دقة."
              : currentValue[0] < 200
              ? "ميزانية جيدة للبدء! يمكنك زيادتها تدريجياً حسب الأداء."
              : "ميزانية ممتازة ستحقق نتائج قوية وتغطية واسعة للجمهور المستهدف."
          )
        )
      )
    )
  )
})
BudgetSlider.displayName = "BudgetSlider"

// Simple Range Slider
const RangeSlider = React.forwardRef<HTMLDivElement, RangeSliderProps>(({ 
  value = [20, 80], 
  onValueChange, 
  min = 0, 
  max = 100, 
  step = 1,
  className,
  ...props 
}, ref) => {
  return React.createElement(Slider, {
    ref,
    value,
    onValueChange,
    min,
    max,
    step,
    className: cn("w-full", className),
    ...props
  })
})
RangeSlider.displayName = "RangeSlider"

export { Slider, BudgetSlider, RangeSlider }

