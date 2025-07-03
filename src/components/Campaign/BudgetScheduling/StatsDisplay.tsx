'use client';

import React from 'react';
import { TrendingUp, MousePointer, Eye, DollarSign } from 'lucide-react';
import { BudgetData } from '@/lib/types/campaign';

interface StatsDisplayProps {
  budget: BudgetData;
  isLoading: boolean;
}

export const StatsDisplay: React.FC<StatsDisplayProps> = ({
  budget,
  isLoading
}) => {
  const stats = [
    {
      icon: Eye,
      label: 'الوصول التقديري',
      value: budget.estimatedReach?.toLocaleString() || '0',
      suffix: 'شخص',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: MousePointer,
      label: 'النقرات اليومية',
      value: budget.estimatedClicks?.toString() || '0',
      suffix: 'نقرة',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: DollarSign,
      label: 'متوسط تكلفة النقرة',
      value: budget.avgCPC?.toFixed(2) || '0.00',
      suffix: '$',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: TrendingUp,
      label: 'معدل النقر المتوقع',
      value: budget.estimatedClicks && budget.estimatedReach 
        ? ((budget.estimatedClicks / budget.estimatedReach) * 100).toFixed(2)
        : '0.00',
      suffix: '%',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 bg-gray-100 rounded-lg animate-pulse">
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-6 bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        
        return (
          <div key={index} className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <IconComponent className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
            
            <div className="flex items-baseline gap-1">
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.suffix}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

