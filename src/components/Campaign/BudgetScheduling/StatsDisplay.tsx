"use client";

import React from 'react';
import { TrendingUp, Eye, MousePointer, DollarSign, Target, Users, Calendar, Clock } from 'lucide-react';

interface StatsDisplayProps {
  dailyBudget: number;
  selectedDevices: string[];
  scheduleSettings: {
    startDate: string;
    endDate: string;
    dailySchedule: {
      [key: string]: {
        enabled: boolean;
        startTime: string;
        endTime: string;
      };
    };
  };
  selectedPreset: string;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ 
  dailyBudget, 
  selectedDevices, 
  scheduleSettings,
  selectedPreset 
}) => {
  // Calculate campaign duration
  const calculateDuration = () => {
    if (!scheduleSettings.startDate || !scheduleSettings.endDate) return 30; // Default 30 days
    const start = new Date(scheduleSettings.startDate);
    const end = new Date(scheduleSettings.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Calculate active days per week
  const getActiveDaysPerWeek = () => {
    return Object.values(scheduleSettings.dailySchedule).filter(day => day.enabled).length;
  };

  // Calculate performance estimates based on budget and settings
  const calculateEstimates = () => {
    const duration = calculateDuration();
    const activeDaysPerWeek = getActiveDaysPerWeek();
    const deviceMultiplier = selectedDevices.length * 0.4; // Each device adds 40% reach
    const budgetMultiplier = Math.log10(dailyBudget) * 2; // Logarithmic scaling
    
    // Base estimates (conservative)
    const baseImpressions = dailyBudget * 100;
    const baseCTR = 2.5; // 2.5% average CTR
    const baseCPC = 1.2; // $1.20 average CPC
    const baseConversionRate = 3.5; // 3.5% conversion rate
    
    // Apply multipliers
    const dailyImpressions = Math.round(baseImpressions * (1 + deviceMultiplier) * (activeDaysPerWeek / 7));
    const dailyClicks = Math.round(dailyImpressions * (baseCTR / 100));
    const actualCPC = baseCPC * (1 - (deviceMultiplier * 0.1)); // More devices = lower CPC
    const dailyConversions = Math.round(dailyClicks * (baseConversionRate / 100));
    
    return {
      dailyImpressions,
      dailyClicks,
      ctr: baseCTR,
      cpc: actualCPC,
      dailyConversions,
      totalBudget: dailyBudget * duration,
      duration,
      activeDaysPerWeek
    };
  };

  const estimates = calculateEstimates();

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const performanceCards = [
    {
      title: 'Daily Impressions',
      value: formatNumber(estimates.dailyImpressions),
      subtitle: 'Estimated views per day',
      icon: <Eye className="w-5 h-5" />,
      color: 'blue',
      trend: '+12%'
    },
    {
      title: 'Daily Clicks',
      value: formatNumber(estimates.dailyClicks),
      subtitle: `${estimates.ctr}% CTR`,
      icon: <MousePointer className="w-5 h-5" />,
      color: 'green',
      trend: '+8%'
    },
    {
      title: 'Cost Per Click',
      value: `$${estimates.cpc.toFixed(2)}`,
      subtitle: 'Average CPC',
      icon: <DollarSign className="w-5 h-5" />,
      color: 'orange',
      trend: '-5%'
    },
    {
      title: 'Daily Conversions',
      value: estimates.dailyConversions.toString(),
      subtitle: '3.5% conversion rate',
      icon: <Target className="w-5 h-5" />,
      color: 'purple',
      trend: '+15%'
    }
  ];

  const summaryCards = [
    {
      title: 'Total Budget',
      value: `$${estimates.totalBudget.toLocaleString()}`,
      subtitle: `${estimates.duration} days`,
      icon: <DollarSign className="w-5 h-5" />,
      color: 'green'
    },
    {
      title: 'Target Devices',
      value: selectedDevices.length.toString(),
      subtitle: selectedDevices.join(', '),
      icon: <Users className="w-5 h-5" />,
      color: 'blue'
    },
    {
      title: 'Active Days',
      value: `${estimates.activeDaysPerWeek}/7`,
      subtitle: 'Days per week',
      icon: <Calendar className="w-5 h-5" />,
      color: 'purple'
    },
    {
      title: 'Schedule Type',
      value: selectedPreset === 'custom' ? 'Custom' : 'Preset',
      subtitle: selectedPreset.replace('-', ' '),
      icon: <Clock className="w-5 h-5" />,
      color: 'orange'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-800',
        icon: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
      },
      green: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        text: 'text-green-700 dark:text-green-300',
        border: 'border-green-200 dark:border-green-800',
        icon: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
      },
      orange: {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        text: 'text-orange-700 dark:text-orange-300',
        border: 'border-orange-200 dark:border-orange-800',
        icon: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
      },
      purple: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        text: 'text-purple-700 dark:text-purple-300',
        border: 'border-purple-200 dark:border-purple-800',
        icon: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
      }
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="space-y-6">
      {/* Performance Estimates */}
      <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Performance Estimates</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Projected campaign performance</p>
          </div>
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {performanceCards.map((card, index) => {
            const colors = getColorClasses(card.color);
            return (
              <div
                key={index}
                className={`p-4 rounded-xl border ${colors.bg} ${colors.border}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${colors.icon}`}>
                    {card.icon}
                  </div>
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                    {card.trend}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className={`text-2xl font-bold ${colors.text}`}>
                    {card.value}
                  </div>
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {card.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {card.subtitle}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Performance Insights */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Performance Insights</span>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            {dailyBudget < 50 
              ? "Consider increasing budget for better reach and performance metrics"
              : dailyBudget < 200
              ? "Good budget allocation for steady growth and consistent visibility"
              : "Excellent budget for maximum reach and aggressive growth targets"
            }
          </p>
        </div>
      </div>

      {/* Campaign Summary */}
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Campaign Summary</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Overview of your campaign settings</p>
          </div>
          <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
            <Target className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card, index) => {
            const colors = getColorClasses(card.color);
            return (
              <div
                key={index}
                className={`p-4 rounded-xl border ${colors.bg} ${colors.border}`}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`p-2 rounded-lg ${colors.icon}`}>
                    {card.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-lg font-bold ${colors.text}`}>
                      {card.value}
                    </div>
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {card.title}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 truncate">
                  {card.subtitle}
                </div>
              </div>
            );
          })}
        </div>

        {/* Budget Breakdown */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Budget Breakdown</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                ${dailyBudget}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Daily Budget</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                ${(dailyBudget * 7).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Weekly Budget</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                ${estimates.totalBudget.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total Budget</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDisplay;
