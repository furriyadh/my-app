import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"
import { DollarSign, TrendingUp, Target, Users } from "lucide-react"

const Slider = React.forwardRef(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-3 w-full grow overflow-hidden rounded-full bg-gradient-to-r from-gray-100 to-gray-200">
      <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-6 w-6 rounded-full border-2 border-white bg-gradient-to-r from-blue-500 to-purple-600 ring-offset-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-110 shadow-lg" />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

// Budget Slider Component with Advanced Features
const BudgetSlider = React.forwardRef(({ 
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

  const handleValueChange = (newValue) => {
    setCurrentValue(newValue)
    onValueChange?.(newValue)
  }

  // Budget ranges with colors
  const getBudgetRange = (budget) => {
    if (budget < 20) return { label: "ميزانية محدودة", color: "text-red-600", bg: "bg-red-50" }
    if (budget < 100) return { label: "ميزانية متوسطة", color: "text-yellow-600", bg: "bg-yellow-50" }
    if (budget < 500) return { label: "ميزانية جيدة", color: "text-green-600", bg: "bg-green-50" }
    if (budget < 1000) return { label: "ميزانية عالية", color: "text-blue-600", bg: "bg-blue-50" }
    return { label: "ميزانية ممتازة", color: "text-purple-600", bg: "bg-purple-50" }
  }

  // Performance predictions based on campaign type and budget
  const getPredictions = (budget, type) => {
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

    return baseMetrics[type] || baseMetrics.search
  }

  const budgetRange = getBudgetRange(currentValue[0])
  const predictions = showPredictions ? getPredictions(currentValue[0], campaignType) : null

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Format numbers
  const formatNumber = (num) => {
    return new Intl.NumberFormat('ar-SA').format(num)
  }

  return (
    <div className={cn("w-full space-y-6", className)} {...props}>
      {/* Budget Display */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <DollarSign className="h-6 w-6 text-green-600" />
          <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {formatCurrency(currentValue[0])}
          </span>
        </div>
        <div className={cn("inline-flex items-center px-3 py-1 rounded-full text-sm font-medium", budgetRange.bg, budgetRange.color)}>
          {budgetRange.label}
        </div>
        <p className="text-sm text-gray-600">الميزانية اليومية</p>
      </div>

      {/* Slider */}
      <div className="px-4">
        <Slider
          ref={ref}
          value={currentValue}
          onValueChange={handleValueChange}
          min={min}
          max={max}
          step={step}
          className="w-full"
        />
        
        {/* Min/Max Labels */}
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>{formatCurrency(min)}</span>
          <span>{formatCurrency(max)}</span>
        </div>
      </div>

      {/* Quick Budget Options */}
      <div className="grid grid-cols-4 gap-2">
        {[25, 50, 100, 500].map((amount) => (
          <button
            key={amount}
            onClick={() => handleValueChange([amount])}
            className={cn(
              "px-3 py-2 text-sm rounded-lg border transition-all duration-200 hover:scale-105",
              currentValue[0] === amount
                ? "bg-blue-500 text-white border-blue-500 shadow-lg"
                : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
            )}
          >
            {formatCurrency(amount)}
          </button>
        ))}
      </div>

      {/* Performance Predictions */}
      {showPredictions && predictions && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <TrendingUp className="h-4 w-4" />
            النتائج المتوقعة يومياً
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {campaignType === 'video' ? (
              <>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{formatNumber(predictions.views)}</div>
                  <div className="text-xs text-gray-600">مشاهدة</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{formatNumber(predictions.engagements)}</div>
                  <div className="text-xs text-gray-600">تفاعل</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{formatNumber(predictions.impressions)}</div>
                  <div className="text-xs text-gray-600">ظهور</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">${predictions.cpv}</div>
                  <div className="text-xs text-gray-600">تكلفة المشاهدة</div>
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{formatNumber(predictions.clicks)}</div>
                  <div className="text-xs text-gray-600">نقرة</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{formatNumber(predictions.impressions)}</div>
                  <div className="text-xs text-gray-600">ظهور</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {campaignType === 'shopping' ? formatNumber(predictions.sales) : formatNumber(predictions.conversions)}
                  </div>
                  <div className="text-xs text-gray-600">
                    {campaignType === 'shopping' ? 'مبيعة' : 'تحويل'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">${predictions.cpc}</div>
                  <div className="text-xs text-gray-600">تكلفة النقرة</div>
                </div>
              </>
            )}
          </div>

          {/* ROI Indicator */}
          <div className="flex items-center justify-center gap-2 pt-2 border-t border-gray-200">
            <Target className="h-4 w-4 text-green-600" />
            <span className="text-sm text-gray-600">
              العائد المتوقع: {formatCurrency(currentValue[0] * 3.5)}
            </span>
          </div>
        </div>
      )}

      {/* Budget Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Users className="h-4 w-4 text-yellow-600 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium">نصيحة:</p>
            <p>
              {currentValue[0] < 50 
                ? "ننصح بزيادة الميزانية للحصول على نتائج أفضل وبيانات أكثر دقة."
                : currentValue[0] < 200
                ? "ميزانية جيدة للبدء! يمكنك زيادتها تدريجياً حسب الأداء."
                : "ميزانية ممتازة ستحقق نتائج قوية وتغطية واسعة للجمهور المستهدف."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
})
BudgetSlider.displayName = "BudgetSlider"

// Simple Range Slider
const RangeSlider = React.forwardRef(({ 
  value = [20, 80], 
  onValueChange, 
  min = 0, 
  max = 100, 
  step = 1,
  className,
  ...props 
}, ref) => {
  return (
    <Slider
      ref={ref}
      value={value}
      onValueChange={onValueChange}
      min={min}
      max={max}
      step={step}
      className={cn("w-full", className)}
      {...props}
    />
  )
})
RangeSlider.displayName = "RangeSlider"

export { Slider, BudgetSlider, RangeSlider }

