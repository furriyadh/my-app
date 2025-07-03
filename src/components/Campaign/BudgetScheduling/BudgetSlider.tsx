'use client';

import React from 'react';
import { DollarSign } from 'lucide-react';

interface BudgetSliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  currency: string;
  className?: string;
}

export const BudgetSlider: React.FC<BudgetSliderProps> = ({
  value,
  onChange,
  min,
  max,
  currency,
  className = ''
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* عرض المبلغ الحالي */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <DollarSign className="w-6 h-6 text-green-600" />
          <span className="text-sm text-gray-600">الميزانية اليومية</span>
        </div>
        <div className="text-4xl font-bold text-gray-900">
          {formatCurrency(value)}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {formatCurrency(value * 30)} شهرياً تقريباً
        </div>
      </div>

      {/* الشريط المنزلق */}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={handleSliderChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #10b981 0%, #10b981 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`
          }}
        />
        
        {/* نقاط المرجع */}
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{formatCurrency(min)}</span>
          <span>{formatCurrency(max)}</span>
        </div>
      </div>

      {/* نصائح الميزانية */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className={`p-3 rounded-lg border-2 transition-colors ${
          value <= 20 ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="text-sm font-medium text-gray-700">محدودة</div>
          <div className="text-xs text-gray-500">$3 - $20</div>
        </div>
        
        <div className={`p-3 rounded-lg border-2 transition-colors ${
          value > 20 && value <= 100 ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="text-sm font-medium text-gray-700">متوسطة</div>
          <div className="text-xs text-gray-500">$21 - $100</div>
        </div>
        
        <div className={`p-3 rounded-lg border-2 transition-colors ${
          value > 100 ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="text-sm font-medium text-gray-700">عالية</div>
          <div className="text-xs text-gray-500">$100+</div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

