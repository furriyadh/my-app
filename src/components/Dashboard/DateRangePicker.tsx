"use client";

import React, { useState, useEffect, useRef, memo } from 'react';
import { Calendar, ChevronDown, X } from 'lucide-react';
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

// Preset ranges - خارج الـ component لتجنب إعادة الإنشاء
const PRESETS = [
  { label: 'Today', labelAr: 'اليوم', days: 0 },
  { label: 'Yesterday', labelAr: 'أمس', days: -1 },
  { label: 'Last 7 days', labelAr: 'آخر 7 أيام', days: 7 },
  { label: 'Last 30 days', labelAr: 'آخر 30 يوم', days: 30 },
  { label: 'Last 60 days', labelAr: 'آخر 60 يوم', days: 60 },
  { label: 'Last 90 days', labelAr: 'آخر 90 يوم', days: 90 },
  { label: 'This Month', labelAr: 'هذا الشهر', type: 'thisMonth' },
  { label: 'Last Month', labelAr: 'الشهر الماضي', type: 'lastMonth' },
  { label: 'This Quarter', labelAr: 'هذا الربع', type: 'thisQuarter' },
  { label: 'Last Quarter', labelAr: 'الربع الماضي', type: 'lastQuarter' },
  { label: 'This Year', labelAr: 'هذا العام', type: 'thisYear' },
  { label: 'Last Year', labelAr: 'العام الماضي', type: 'lastYear' }
];

const getPresetDates = (preset: typeof PRESETS[0]): { startDate: Date; endDate: Date } => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1);
  
  if (preset.days !== undefined) {
    if (preset.days === 0) {
      return { startDate: today, endDate: endOfToday };
    } else if (preset.days === -1) {
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return { startDate: yesterday, endDate: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1) };
    } else {
      const startDate = new Date(today.getTime() - preset.days * 24 * 60 * 60 * 1000);
      return { startDate, endDate: endOfToday };
    }
  }
  
  switch (preset.type) {
    case 'thisMonth':
      return { startDate: new Date(now.getFullYear(), now.getMonth(), 1), endDate: endOfToday };
    case 'lastMonth': {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { startDate: firstDay, endDate: lastDay };
    }
    case 'thisQuarter': {
      const quarter = Math.floor(now.getMonth() / 3);
      return { startDate: new Date(now.getFullYear(), quarter * 3, 1), endDate: endOfToday };
    }
    case 'lastQuarter': {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const lastQuarter = currentQuarter === 0 ? 3 : currentQuarter - 1;
      const year = currentQuarter === 0 ? now.getFullYear() - 1 : now.getFullYear();
      return { 
        startDate: new Date(year, lastQuarter * 3, 1), 
        endDate: new Date(year, lastQuarter * 3 + 3, 0, 23, 59, 59, 999) 
      };
    }
    case 'thisYear':
      return { startDate: new Date(now.getFullYear(), 0, 1), endDate: endOfToday };
    case 'lastYear':
      return { 
        startDate: new Date(now.getFullYear() - 1, 0, 1), 
        endDate: new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999) 
      };
    default:
      return { startDate: today, endDate: endOfToday };
  }
};

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  onDateRangeChange,
  enableComparison = true
}) => {
  const { t, isRTL } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // الـ label المعروض على الزر
  const [displayLabel, setDisplayLabel] = useState('Today');
  const [selectedDates, setSelectedDates] = useState<{ startDate: Date; endDate: Date }>(() => getPresetDates(PRESETS[0]));
  const [compareEnabled, setCompareEnabled] = useState(false);

  // تحميل الفترة المحفوظة من localStorage عند التحميل
  useEffect(() => {
    const saved = localStorage.getItem('dashboard_date_range');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.label) {
          const preset = PRESETS.find(p => p.label === parsed.label);
          if (preset) {
            const dates = getPresetDates(preset);
            setSelectedDates(dates);
            setDisplayLabel(isRTL ? preset.labelAr : preset.label);
          }
        }
      } catch (e) {
        console.warn('Failed to parse saved date range');
      }
    }
  }, []); // يُنفذ مرة واحدة فقط

  // تحديث الـ label عند تغيير اللغة
  useEffect(() => {
    const preset = PRESETS.find(p => p.label === displayLabel || p.labelAr === displayLabel);
    if (preset) {
      setDisplayLabel(isRTL ? preset.labelAr : preset.label);
    }
  }, [isRTL]);

  // Handle preset selection
  const handlePresetSelect = (preset: typeof PRESETS[0]) => {
    const dates = getPresetDates(preset);
    const newLabel = isRTL ? preset.labelAr : preset.label;
    
    console.log('🔄 تغيير الفترة إلى:', newLabel);
    
    // تحديث الـ state فوراً
    setDisplayLabel(newLabel);
    setSelectedDates(dates);
    
    // حفظ في localStorage (بالإنجليزي دائماً)
    localStorage.setItem('dashboard_date_range', JSON.stringify({
      label: preset.label, // نحفظ بالإنجليزي
      startDate: dates.startDate.toISOString(),
      endDate: dates.endDate.toISOString()
    }));
    
    // إرسال التغيير للـ parent
    const range: DateRange = { ...dates, label: newLabel };
    if (compareEnabled) {
      const duration = dates.endDate.getTime() - dates.startDate.getTime();
      const comparison: ComparisonRange = {
        startDate: new Date(dates.startDate.getTime() - duration),
        endDate: new Date(dates.startDate.getTime() - 1)
      };
      onDateRangeChange(range, comparison);
    } else {
      onDateRangeChange(range);
    }
    
    setIsOpen(false);
  };

  // Toggle comparison
  const handleComparisonToggle = () => {
    const newCompareEnabled = !compareEnabled;
    setCompareEnabled(newCompareEnabled);
    
    const range: DateRange = { ...selectedDates, label: displayLabel };
    if (newCompareEnabled) {
      const duration = selectedDates.endDate.getTime() - selectedDates.startDate.getTime();
      const comparison: ComparisonRange = {
        startDate: new Date(selectedDates.startDate.getTime() - duration),
        endDate: new Date(selectedDates.startDate.getTime() - 1)
      };
      onDateRangeChange(range, comparison);
    } else {
      onDateRangeChange(range);
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
    if (isSameDay(selectedDates.startDate, selectedDates.endDate)) {
      return formatDate(selectedDates.startDate);
    }
    return `${formatDate(selectedDates.startDate)} - ${formatDate(selectedDates.endDate)}`;
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
        <span className="font-medium">{displayLabel}</span>
        <span className="text-purple-400 text-xs">
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
              {PRESETS.map((preset, index) => {
                const presetLabel = isRTL ? preset.labelAr : preset.label;
                const isSelected = displayLabel === presetLabel || displayLabel === preset.label || displayLabel === preset.labelAr;
                
                return (
                  <button
                    key={index}
                    onClick={() => handlePresetSelect(preset)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                      isSelected
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                        : 'text-gray-300 hover:bg-purple-900/20 hover:text-white'
                    }`}
                  >
                    {presetLabel}
                  </button>
                );
              })}
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
                    className="sr-only"
                  />
                  <div className={`w-10 h-5 rounded-full transition-colors ${
                    compareEnabled ? 'bg-purple-600' : 'bg-gray-700'
                  }`}>
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                      compareEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </div>
                </div>
                <span className="text-gray-300 text-sm">
                  {isRTL ? 'مقارنة بالفترة السابقة' : 'Compare to previous period'}
                </span>
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default memo(DateRangePicker);
