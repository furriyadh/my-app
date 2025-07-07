"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, DollarSign, TrendingUp, Eye, MousePointer, Target, Users, BarChart3, Zap, Star, Award, Crown, Smartphone, Monitor, Tablet } from 'lucide-react';

// Budget Level Types
type BudgetLevel = 'beginner' | 'intermediate' | 'expert';

// BudgetSlider Component with Budget Levels
const BudgetSlider: React.FC<{
  dailyBudget: number;
  setDailyBudget: (budget: number) => void;
  budgetLevel: BudgetLevel;
  setBudgetLevel: (level: BudgetLevel) => void;
}> = ({ dailyBudget, setDailyBudget, budgetLevel, setBudgetLevel }) => {
  const quickBudgets = [5, 25, 50, 100, 250, 500, 1000, 2500];

  // Budget levels configuration
  const budgetLevels = [
    {
      id: 'beginner' as BudgetLevel,
      name: 'مبتدئ',
      nameEn: 'Beginner',
      icon: <Star className="w-5 h-5" />,
      range: '$5 - $50',
      description: 'مناسب للاختبار والجماهير الصغيرة',
      color: 'green',
      minBudget: 5,
      maxBudget: 50
    },
    {
      id: 'intermediate' as BudgetLevel,
      name: 'متوسط',
      nameEn: 'Intermediate',
      icon: <Award className="w-5 h-5" />,
      range: '$51 - $500',
      description: 'مثالي للنمو المستقر والوصول المتوازن',
      color: 'blue',
      minBudget: 51,
      maxBudget: 500
    },
    {
      id: 'expert' as BudgetLevel,
      name: 'خبير',
      nameEn: 'Expert',
      icon: <Crown className="w-5 h-5" />,
      range: '$501 - $10,000',
      description: 'أقصى وصول ونتائج سريعة ومنافسة قوية',
      color: 'purple',
      minBudget: 501,
      maxBudget: 10000
    }
  ];

  // Determine current budget level based on amount
  const getCurrentLevel = (budget: number): BudgetLevel => {
    if (budget <= 50) return 'beginner';
    if (budget <= 500) return 'intermediate';
    return 'expert';
  };

  // Update budget level when budget changes
  React.useEffect(() => {
    const newLevel = getCurrentLevel(dailyBudget);
    if (newLevel !== budgetLevel) {
      setBudgetLevel(newLevel);
    }
  }, [dailyBudget, budgetLevel, setBudgetLevel]);

  const getColorClasses = (color: string) => {
    const colorMap = {
      green: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        text: 'text-green-700 dark:text-green-300',
        border: 'border-green-200 dark:border-green-800',
        button: 'bg-green-600 hover:bg-green-700',
        icon: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
      },
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-800',
        button: 'bg-blue-600 hover:bg-blue-700',
        icon: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
      },
      purple: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        text: 'text-purple-700 dark:text-purple-300',
        border: 'border-purple-200 dark:border-purple-800',
        button: 'bg-purple-600 hover:bg-purple-700',
        icon: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
      }
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.green;
  };

  const currentLevelConfig = budgetLevels.find(level => level.id === budgetLevel)!;
  const colors = getColorClasses(currentLevelConfig.color);

  return (
    <div className="bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-green-900/20 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Daily Budget</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Set your daily advertising spend</p>
        </div>
        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
          <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
      </div>

      <div className="space-y-6">
        {/* Budget Display */}
        <div className="text-center">
          <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
            ${dailyBudget.toLocaleString()}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">per day</p>
        </div>

        {/* Slider */}
        <div className="space-y-4">
          <input
            type="range"
            min="5"
            max="10000"
            step="5"
            value={dailyBudget}
            onChange={(e) => setDailyBudget(parseInt(e.target.value))}
            className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #10b981 0%, #10b981 ${((dailyBudget - 5) / (10000 - 5)) * 100}%, #e5e7eb ${((dailyBudget - 5) / (10000 - 5)) * 100}%, #e5e7eb 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>$5</span>
            <span>$10,000</span>
          </div>
        </div>

        {/* Quick Budget Options */}
        <div className="grid grid-cols-4 gap-2">
          {quickBudgets.map((budget) => (
            <button
              key={budget}
              onClick={() => setDailyBudget(budget)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                dailyBudget === budget
                  ? 'bg-green-600 text-white shadow-md scale-105'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20'
              }`}
            >
              ${budget >= 1000 ? `${budget/1000}K` : budget}
            </button>
          ))}
        </div>

        {/* Budget Level Indicator */}
        <div className={`p-4 rounded-xl border ${colors.bg} ${colors.border}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${colors.icon}`}>
                {currentLevelConfig.icon}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`font-bold text-lg ${colors.text}`}>
                    {currentLevelConfig.name}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({currentLevelConfig.nameEn})
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentLevelConfig.description}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-sm font-semibold ${colors.text}`}>
                {currentLevelConfig.range}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Budget Range
              </div>
            </div>
          </div>
        </div>

        {/* Budget Insights */}
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-semibold text-green-700 dark:text-green-300">Budget Insights</span>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400">
            {budgetLevel === 'beginner' 
              ? "Suitable for testing and learning - focus on low-cost keywords"
              : budgetLevel === 'intermediate'
              ? "Balanced budget - you can target medium-competition keywords"
              : "Strong budget - you can compete for high value and competitive keywords"
            }
          </p>
          <div className="mt-2 text-xs text-green-500 dark:text-green-400">
            <span className="font-medium">Monthly estimate: ${(dailyBudget * 30).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Performance Estimates Component
const PerformanceEstimates: React.FC<{
  dailyBudget: number;
  budgetLevel: BudgetLevel;
}> = ({ dailyBudget, budgetLevel }) => {
  // Enhanced calculations based on budget level and realistic market data
  const calculateEstimates = () => {
    // More realistic and encouraging metrics based on budget level
    const levelMetrics = {
      beginner: {
        avgCPC: 0.65,  // Lower CPC for less competitive keywords
        avgCTR: 2.8,   // Good CTR for targeted campaigns
        avgConversionRate: 4.2,  // Higher conversion rate for focused targeting
        competitionLevel: 'Low',
        qualityScore: 7,
        impressionShare: 25
      },
      intermediate: {
        avgCPC: 1.20,  // Medium CPC for moderate competition
        avgCTR: 3.1,   // Better CTR with more experience
        avgConversionRate: 5.1,  // Good conversion rate
        competitionLevel: 'Medium',
        qualityScore: 8,
        impressionShare: 45
      },
      expert: {
        avgCPC: 2.10,  // Higher CPC for competitive keywords but still reasonable
        avgCTR: 3.5,   // Best CTR with optimized campaigns
        avgConversionRate: 6.2,  // Excellent conversion rate
        competitionLevel: 'High',
        qualityScore: 9,
        impressionShare: 75
      }
    };

    const metrics = levelMetrics[budgetLevel];
    
    // Calculate daily metrics
    const dailyClicks = Math.round(dailyBudget / metrics.avgCPC);
    const dailyImpressions = Math.round(dailyClicks / (metrics.avgCTR / 100));
    const dailyConversions = Math.round(dailyClicks * (metrics.avgConversionRate / 100));
    
    // Calculate monthly metrics
    const monthlyClicks = dailyClicks * 30;
    const monthlyImpressions = dailyImpressions * 30;
    const monthlyConversions = dailyConversions * 30;
    const monthlyBudget = dailyBudget * 30;
    
    return {
      daily: {
        impressions: dailyImpressions,
        clicks: dailyClicks,
        conversions: dailyConversions,
        ctr: metrics.avgCTR,
        cpc: metrics.avgCPC,
        conversionRate: metrics.avgConversionRate,
        competitionLevel: metrics.competitionLevel,
        qualityScore: metrics.qualityScore,
        impressionShare: metrics.impressionShare
      },
      monthly: {
        impressions: monthlyImpressions,
        clicks: monthlyClicks,
        conversions: monthlyConversions,
        budget: monthlyBudget
      }
    };
  };

  const estimates = calculateEstimates();

  // Format numbers for display
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
      value: formatNumber(estimates.daily.impressions),
      subtitle: `${estimates.daily.impressionShare}% impression share`,
      icon: <Eye className="w-5 h-5" />,
      color: 'blue',
      trend: budgetLevel === 'expert' ? '+22%' : budgetLevel === 'intermediate' ? '+18%' : '+15%'
    },
    {
      title: 'Daily Clicks',
      value: formatNumber(estimates.daily.clicks),
      subtitle: `${estimates.daily.ctr}% CTR`,
      icon: <MousePointer className="w-5 h-5" />,
      color: 'purple',
      trend: budgetLevel === 'expert' ? '+20%' : budgetLevel === 'intermediate' ? '+16%' : '+12%'
    },
    {
      title: 'Daily Conversions',
      value: estimates.daily.conversions.toString(),
      subtitle: `${estimates.daily.conversionRate}% rate`,
      icon: <Target className="w-5 h-5" />,
      color: 'orange',
      trend: budgetLevel === 'expert' ? '+28%' : budgetLevel === 'intermediate' ? '+22%' : '+18%'
    },
    {
      title: 'Cost Per Click',
      value: `$${estimates.daily.cpc.toFixed(2)}`,
      subtitle: `${estimates.daily.competitionLevel} competition`,
      icon: <DollarSign className="w-5 h-5" />,
      color: 'green',
      trend: budgetLevel === 'expert' ? '+5%' : budgetLevel === 'intermediate' ? '+2%' : '-3%'
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
      purple: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        text: 'text-purple-700 dark:text-purple-300',
        border: 'border-purple-200 dark:border-purple-800',
        icon: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
      },
      orange: {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        text: 'text-orange-700 dark:text-orange-300',
        border: 'border-orange-200 dark:border-orange-800',
        icon: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
      },
      green: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        text: 'text-green-700 dark:text-green-300',
        border: 'border-green-200 dark:border-green-800',
        icon: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
      }
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Expected Performance</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Realistic projections for {budgetLevel} level campaigns
          </p>
        </div>
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
          <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
      </div>

      {/* Budget Level Performance Indicator */}
      <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Campaign Level: <span className="text-blue-600 dark:text-blue-400 capitalize">{budgetLevel}</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Competition: {estimates.daily.competitionLevel} • Quality Score: {estimates.daily.qualityScore}/10
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {estimates.daily.impressionShare}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Impression Share
            </div>
          </div>
        </div>
      </div>

      {/* Daily Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {performanceCards.map((card, index) => {
          const colors = getColorClasses(card.color);
          const isPositiveTrend = card.trend.startsWith('+');
          return (
            <div
              key={index}
              className={`p-4 rounded-xl border ${colors.bg} ${colors.border}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${colors.icon}`}>
                  {card.icon}
                </div>
                <span className={`text-xs font-semibold ${
                  isPositiveTrend ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
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

      {/* Monthly Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Monthly Projections</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">30-day performance estimates</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatNumber(estimates.monthly.impressions)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Impressions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {formatNumber(estimates.monthly.clicks)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Clicks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {estimates.monthly.conversions}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Conversions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${estimates.monthly.budget.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Budget</div>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-center space-x-2 mb-2">
          <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Performance Insights</span>
        </div>
        <p className="text-xs text-blue-600 dark:text-blue-400">
          {budgetLevel === 'beginner' 
            ? "Great starting budget! Focus on targeted keywords to maximize conversions. You can expect solid results with proper optimization."
            : budgetLevel === 'intermediate'
            ? "Excellent budget for steady growth. You can target competitive keywords while maintaining good ROI and conversion rates."
            : "Premium budget for maximum impact. Target high-value keywords and expect excellent visibility with strong conversion performance."
          }
        </p>
      </div>
    </div>
  );
};

// Device Targeting Component
const DeviceTargeting: React.FC<{
  selectedDevices: string[];
  setSelectedDevices: (devices: string[]) => void;
}> = ({ selectedDevices, setSelectedDevices }) => {
  // Device options
  const deviceOptions = [
    {
      id: 'desktop',
      name: 'Desktop',
      icon: <Monitor className="w-5 h-5" />,
      description: 'Computers and laptops'
    },
    {
      id: 'mobile',
      name: 'Mobile',
      icon: <Smartphone className="w-5 h-5" />,
      description: 'Smartphones'
    },
    {
      id: 'tablet',
      name: 'Tablet',
      icon: <Tablet className="w-5 h-5" />,
      description: 'Tablets and iPads'
    }
  ];

  // Handle device selection
  const toggleDevice = (deviceId: string) => {
    setSelectedDevices(
      selectedDevices.includes(deviceId)
        ? selectedDevices.filter(id => id !== deviceId)
        : [...selectedDevices, deviceId]
    );
  };

  return (
    <div className="bg-gradient-to-br from-white to-indigo-50 dark:from-gray-800 dark:to-indigo-900/20 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Device Targeting</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Choose which devices to target</p>
        </div>
        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
          <Smartphone className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {deviceOptions.map((device) => (
          <button
            key={device.id}
            onClick={() => toggleDevice(device.id)}
            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              selectedDevices.includes(device.id)
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md scale-105'
                : 'border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-25 dark:hover:bg-indigo-900/10'
            }`}
          >
            <div className="flex flex-col items-center space-y-3">
              <div className={`p-3 rounded-xl ${
                selectedDevices.includes(device.id)
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {device.icon}
              </div>
              <div className="text-center">
                <div className={`font-semibold ${
                  selectedDevices.includes(device.id)
                    ? 'text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {device.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {device.description}
                </div>
              </div>
              {selectedDevices.includes(device.id) && (
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
        <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
          {selectedDevices.length} device{selectedDevices.length !== 1 ? 's' : ''} selected
        </p>
        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
          Your ads will show on: {selectedDevices.join(', ')}
        </p>
      </div>
    </div>
  );
};

// Main BudgetScheduling Component
const BudgetScheduling: React.FC = () => {
  const [dailyBudget, setDailyBudget] = useState<number>(50);
  const [budgetLevel, setBudgetLevel] = useState<BudgetLevel>('beginner');
  const [selectedDevices, setSelectedDevices] = useState<string[]>(['desktop', 'mobile']);

  return (
    <div className="space-y-8">
      {/* Budget Slider Component */}
      <BudgetSlider 
        dailyBudget={dailyBudget}
        setDailyBudget={setDailyBudget}
        budgetLevel={budgetLevel}
        setBudgetLevel={setBudgetLevel}
      />

      {/* Performance Estimates Component */}
      <PerformanceEstimates 
        dailyBudget={dailyBudget}
        budgetLevel={budgetLevel}
      />

      {/* Device Targeting Component */}
      <DeviceTargeting 
        selectedDevices={selectedDevices}
        setSelectedDevices={setSelectedDevices}
      />
    </div>
  );
};

// Campaign Steps for Progress Indicator
const campaignSteps = [
  { id: 1, name: 'Basic Info & Ad Type', description: 'Campaign details and advertisement type' },
  { id: 2, name: 'Location Targeting', description: 'Geographic and demographic targeting' },
  { id: 3, name: 'Budget & Scheduling', description: 'Budget settings and scheduling strategy' },
  { id: 4, name: 'Review & Launch', description: 'Final review and campaign launch' }
];

const BudgetSchedulingPage: React.FC = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Budget & Scheduling</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Set your budget and schedule for optimal performance</p>
          </div>
        </div>

        {/* Enhanced Progress Indicator */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Campaign Setup Progress</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Complete each step to launch your campaign</p>
          </div>
          
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700"></div>
            <div className="absolute top-5 left-0 h-0.5 bg-blue-600 transition-all duration-500" style={{width: '75%'}}></div>
            
            {/* Steps */}
            <div className="relative flex justify-between">
              {campaignSteps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center">
                  {/* Step Circle */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    step.id <= 3
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'
                  }`}>
                    {step.id <= 3 ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  
                  {/* Step Info */}
                  <div className="mt-3 text-center max-w-32">
                    <div className={`text-sm font-medium ${
                      step.id <= 3
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {step.name}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 leading-tight">
                      {step.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Budget & Scheduling Component */}
        <BudgetScheduling />

      </div>
    </div>
  );
};

export default BudgetSchedulingPage;

