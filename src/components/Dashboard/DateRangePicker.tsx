"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronDown, X, TrendingUp, TrendingDown } from 'lucide-react';
import { useTranslation } from '@/lib/hooks/useTranslation';

interface DateRange {
  startDate: Date;
  endDate: Date;
  label: string;
}

interface ComparisonRange {
  startDate: Date;
  endDate: Date;
}

interface DateRangePickerProps {
  onDateRangeChange: (range: DateRange, comparison?: ComparisonRange) => void;
  enableComparison?: boolean;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  onDateRangeChange,
  enableComparison = true
}) => {
  const { t, isRTL } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Preset ranges - تعريفها أولاً قبل استخدامها
  const presets = [
    {
      label: 'Today',
      labelAr: 'اليوم',
      getValue: () => ({
        startDate: new Date(new Date().setHours(0, 0, 0, 0)),
        endDate: new Date(new Date().setHours(23, 59, 59, 999))
      })
    },
    {
      label: 'Yesterday',
      labelAr: 'أمس',
      getValue: () => {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return {
          startDate: new Date(yesterday.setHours(0, 0, 0, 0)),
          endDate: new Date(yesterday.setHours(23, 59, 59, 999))
        };
      }
    },
    {
      label: 'Last 7 days',
      labelAr: 'آخر 7 أيام',
      getValue: () => ({
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date()
      })
    },
    {
      label: 'Last 30 days',
      labelAr: 'آخر 30 يوم',
      getValue: () => ({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date()
      })
    },
    {
      label: 'Last 60 days',
      labelAr: 'آخر 60 يوم',
      getValue: () => ({
        startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        endDate: new Date()
      })
    },
    {
      label: 'Last 90 days',
      labelAr: 'آخر 90 يوم',
      getValue: () => ({
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        endDate: new Date()
      })
    },
    {
      label: 'This Month',
      labelAr: 'هذا الشهر',
      getValue: () => ({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        endDate: new Date()
      })
    },
    {
      label: 'Last Month',
      labelAr: 'الشهر الماضي',
      getValue: () => {
        const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1));
        return {
          startDate: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1),
          endDate: new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0)
        };
      }
    },
    {
      label: 'This Quarter',
      labelAr: 'هذا الربع',
      getValue: () => {
        const now = new Date();
        const quarter = Math.floor(now.getMonth() / 3);
        return {
          startDate: new Date(now.getFullYear(), quarter * 3, 1),
          endDate: new Date()
        };
      }
    },
    {
      label: 'Last Quarter',
      labelAr: 'الربع الماضي',
      getValue: () => {
        const now = new Date();
        const quarter = Math.floor(now.getMonth() / 3);
        const lastQuarter = quarter === 0 ? 3 : quarter - 1;
        const year = quarter === 0 ? now.getFullYear() - 1 : now.getFullYear();
        return {
          startDate: new Date(year, lastQuarter * 3, 1),
          endDate: new Date(year, lastQuarter * 3 + 3, 0)
        };
      }
    },
    {
      label: 'This Year',
      labelAr: 'هذا العام',
      getValue: () => ({
        startDate: new Date(new Date().getFullYear(), 0, 1),
        endDate: new Date()
      })
    },
    {
      label: 'Last Year',
      labelAr: 'العام الماضي',
      getValue: () => ({
        startDate: new Date(new Date().getFullYear() - 1, 0, 1),
        endDate: new Date(new Date().getFullYear() - 1, 11, 31)
      })
    }
  ];

  // القيمة الافتراضية (اليوم)
  const getDefaultRange = (): DateRange => ({
    startDate: new Date(new Date().setHours(0, 0, 0, 0)),
    endDate: new Date(new Date().setHours(23, 59, 59, 999)),
    label: isRTL ? 'اليوم' : 'Today'
  });

  const [selectedRange, setSelectedRange] = useState<DateRange>(getDefaultRange);
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [comparisonRange, setComparisonRange] = useState<ComparisonRange | undefined>();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // تحميل الفترة المحفوظة من localStorage بعد mount (client-side فقط)
  useEffect(() => {
    if (isInitialized) return; // تجنب التكرار
    
    const saved = localStorage.getItem('dashboard_date_range');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const preset = presets.find(p => p.label === parsed.label || p.labelAr === parsed.label);
        if (preset) {
          const freshRange = preset.getValue();
          const newRange: DateRange = {
            ...freshRange,
            label: isRTL ? preset.labelAr : preset.label
          };
          console.log('📅 DateRangePicker - تحميل الفترة المحفوظة:', newRange.label);
          setSelectedRange(newRange);
        }
      } catch (e) {
        console.warn('Failed to parse saved date range');
      }
    }
    setIsInitialized(true);
  }, [isRTL, isInitialized]);
  
  // تحديث الـ label عند تغيير اللغة
  useEffect(() => {
    if (!isInitialized) return;
    
    const preset = presets.find(p => p.label === selectedRange.label || p.labelAr === selectedRange.label);
    if (preset) {
      const correctLabel = isRTL ? preset.labelAr : preset.label;
      if (selectedRange.label !== correctLabel) {
        setSelectedRange(prev => ({ ...prev, label: correctLabel }));
      }
    }
  }, [isRTL, isInitialized]);

  // حفظ الاختيار في localStorage عند التغيير (نحفظ الـ label بالإنجليزي دائماً للتوافق)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // نبحث عن الـ preset للحصول على الـ label بالإنجليزي
      const preset = presets.find(p => p.label === selectedRange.label || p.labelAr === selectedRange.label);
      const labelToSave = preset ? preset.label : selectedRange.label; // نحفظ بالإنجليزي دائماً
      
      localStorage.setItem('dashboard_date_range', JSON.stringify({
        startDate: selectedRange.startDate.toISOString(),
        endDate: selectedRange.endDate.toISOString(),
        label: labelToSave // نحفظ بالإنجليزي دائماً
      }));
    }
  }, [selectedRange]);

  // Calculate comparison range based on selected range
  const calculateComparisonRange = (range: DateRange): ComparisonRange => {
    const duration = range.endDate.getTime() - range.startDate.getTime();
    return {
      startDate: new Date(range.startDate.getTime() - duration),
      endDate: new Date(range.startDate.getTime() - 1)
    };
  };

  // Handle preset selection
  const handlePresetSelect = (preset: typeof presets[0]) => {
    const range = preset.getValue();
    const newLabel = isRTL ? preset.labelAr : preset.label;
    const newRange: DateRange = {
      ...range,
      label: newLabel
    };
    
    setSelectedRange(newRange);
    
    if (compareEnabled) {
      const comparison = calculateComparisonRange(newRange);
      setComparisonRange(comparison);
      onDateRangeChange(newRange, comparison);
    } else {
      onDateRangeChange(newRange);
    }
    
    setIsOpen(false);
  };

  // Toggle comparison
  const handleComparisonToggle = () => {
    const newCompareEnabled = !compareEnabled;
    setCompareEnabled(newCompareEnabled);
    
    if (newCompareEnabled) {
      const comparison = calculateComparisonRange(selectedRange);
      setComparisonRange(comparison);
      onDateRangeChange(selectedRange, comparison);
    } else {
      setComparisonRange(undefined);
      onDateRangeChange(selectedRange);
    }
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // تحقق إذا كان نفس اليوم
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  // عرض نطاق التاريخ بشكل ذكي
  const formatDateRange = (): string => {
    if (isSameDay(selectedRange.startDate, selectedRange.endDate)) {
      return formatDate(selectedRange.startDate);
    }
    return `${formatDate(selectedRange.startDate)} - ${formatDate(selectedRange.endDate)}`;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-purple-900/30 hover:bg-purple-900/50 border border-purple-900/50 rounded-lg text-purple-200 text-sm transition-all backdrop-blur-sm"
      >
        <Calendar className="w-4 h-4" />
        <span className="font-medium">{selectedRange.label}</span>
        <span className="hidden md:inline text-purple-400 text-xs">
          ({formatDateRange()})
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div 
          className="absolute top-full mt-2 right-0 w-80 bg-[#060010] border border-purple-900/50 rounded-xl shadow-2xl shadow-purple-900/20 z-50 backdrop-blur-xl"
          style={{ direction: isRTL ? 'rtl' : 'ltr' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-purple-900/30">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              {isRTL ? 'نطاق التاريخ' : 'Date Range'}
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Presets */}
          <div className="p-4 max-h-96 overflow-y-auto custom-scrollbar">
            <div className="space-y-1">
              {presets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => handlePresetSelect(preset)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                    selectedRange.label === (isRTL ? preset.labelAr : preset.label)
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                      : 'text-gray-300 hover:bg-purple-900/20 hover:text-white'
                  }`}
                >
                  {isRTL ? preset.labelAr : preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Comparison Toggle */}
          {enableComparison && (
            <div className="p-4 border-t border-purple-900/30">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={compareEnabled}
                    onChange={handleComparisonToggle}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </div>
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">
                    {isRTL ? 'مقارنة مع الفترة السابقة' : 'Compare to previous period'}
                  </div>
                  {compareEnabled && comparisonRange && (
                    <div className="text-xs text-gray-400 mt-1">
                      {formatDate(comparisonRange.startDate)} - {formatDate(comparisonRange.endDate)}
                    </div>
                  )}
                </div>
              </label>
            </div>
          )}
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(139, 92, 246, 0.1);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>
    </div>
  );
};

export default DateRangePicker;

