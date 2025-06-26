"use client";

import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Eye, 
  MousePointer,
  Target,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  Globe,
  Calendar
} from "lucide-react";

const OverviewCards = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [animateCards, setAnimateCards] = useState(false);

  // Mock data - في التطبيق الحقيقي سيأتي من API
  const [metricsData, setMetricsData] = useState({
    totalSpend: {
      current: 12450.75,
      previous: 11230.50,
      change: 10.87,
      trend: 'up'
    },
    impressions: {
      current: 2450000,
      previous: 2180000,
      change: 12.39,
      trend: 'up'
    },
    clicks: {
      current: 45680,
      previous: 42150,
      change: 8.37,
      trend: 'up'
    },
    conversions: {
      current: 1250,
      previous: 1180,
      change: 5.93,
      trend: 'up'
    },
    ctr: {
      current: 1.86,
      previous: 1.93,
      change: -3.63,
      trend: 'down'
    },
    cpc: {
      current: 0.27,
      previous: 0.31,
      change: -12.90,
      trend: 'down'
    },
    roas: {
      current: 4.2,
      previous: 3.8,
      change: 10.53,
      trend: 'up'
    },
    qualityScore: {
      current: 8.5,
      previous: 8.2,
      change: 3.66,
      trend: 'up'
    }
  });

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setAnimateCards(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Format numbers
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(num);
  };

  const formatPercentage = (num) => {
    return `${num > 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  // Card configuration
  const cardConfigs = [
    {
      id: 'spend',
      title: 'Total Ad Spend',
      value: formatCurrency(metricsData.totalSpend.current),
      change: metricsData.totalSpend.change,
      trend: metricsData.totalSpend.trend,
      icon: DollarSign,
      color: 'blue',
      description: 'Total advertising expenditure',
      period: 'vs last 30 days'
    },
    {
      id: 'impressions',
      title: 'Impressions',
      value: formatNumber(metricsData.impressions.current),
      change: metricsData.impressions.change,
      trend: metricsData.impressions.trend,
      icon: Eye,
      color: 'green',
      description: 'Total ad impressions served',
      period: 'vs last 30 days'
    },
    {
      id: 'clicks',
      title: 'Clicks',
      value: formatNumber(metricsData.clicks.current),
      change: metricsData.clicks.change,
      trend: metricsData.clicks.trend,
      icon: MousePointer,
      color: 'purple',
      description: 'Total clicks received',
      period: 'vs last 30 days'
    },
    {
      id: 'conversions',
      title: 'Conversions',
      value: formatNumber(metricsData.conversions.current),
      change: metricsData.conversions.change,
      trend: metricsData.conversions.trend,
      icon: Target,
      color: 'orange',
      description: 'Total conversions achieved',
      period: 'vs last 30 days'
    },
    {
      id: 'ctr',
      title: 'Click-Through Rate',
      value: `${metricsData.ctr.current}%`,
      change: metricsData.ctr.change,
      trend: metricsData.ctr.trend,
      icon: BarChart3,
      color: 'red',
      description: 'Average CTR across campaigns',
      period: 'vs last 30 days'
    },
    {
      id: 'cpc',
      title: 'Cost Per Click',
      value: formatCurrency(metricsData.cpc.current),
      change: metricsData.cpc.change,
      trend: metricsData.cpc.trend,
      icon: Activity,
      color: 'teal',
      description: 'Average cost per click',
      period: 'vs last 30 days'
    },
    {
      id: 'roas',
      title: 'Return on Ad Spend',
      value: `${metricsData.roas.current}x`,
      change: metricsData.roas.change,
      trend: metricsData.roas.trend,
      icon: Zap,
      color: 'indigo',
      description: 'Revenue per dollar spent',
      period: 'vs last 30 days'
    },
    {
      id: 'quality',
      title: 'Quality Score',
      value: metricsData.qualityScore.current,
      change: metricsData.qualityScore.change,
      trend: metricsData.qualityScore.trend,
      icon: Globe,
      color: 'pink',
      description: 'Average quality score',
      period: 'vs last 30 days'
    }
  ];

  // Color configurations
  const colorConfigs = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      icon: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30'
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      icon: 'text-green-600 dark:text-green-400',
      iconBg: 'bg-green-100 dark:bg-green-900/30'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-200 dark:border-purple-800',
      icon: 'text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30'
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      border: 'border-orange-200 dark:border-orange-800',
      icon: 'text-orange-600 dark:text-orange-400',
      iconBg: 'bg-orange-100 dark:bg-orange-900/30'
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      icon: 'text-red-600 dark:text-red-400',
      iconBg: 'bg-red-100 dark:bg-red-900/30'
    },
    teal: {
      bg: 'bg-teal-50 dark:bg-teal-900/20',
      border: 'border-teal-200 dark:border-teal-800',
      icon: 'text-teal-600 dark:text-teal-400',
      iconBg: 'bg-teal-100 dark:bg-teal-900/30'
    },
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      border: 'border-indigo-200 dark:border-indigo-800',
      icon: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-100 dark:bg-indigo-900/30'
    },
    pink: {
      bg: 'bg-pink-50 dark:bg-pink-900/20',
      border: 'border-pink-200 dark:border-pink-800',
      icon: 'text-pink-600 dark:text-pink-400',
      iconBg: 'bg-pink-100 dark:bg-pink-900/30'
    }
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="w-20 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Individual card component
  const MetricCard = ({ config, index }) => {
    const colors = colorConfigs[config.color];
    const Icon = config.icon;
    const TrendIcon = config.trend === 'up' ? ArrowUpRight : ArrowDownRight;
    const isPositiveTrend = config.trend === 'up';

    return (
      <div 
        className={`
          bg-white dark:bg-gray-800 rounded-xl p-6 border transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer
          ${colors.border} ${colors.bg}
          ${animateCards ? 'animate-fadeInUp' : 'opacity-0'}
        `}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${colors.iconBg}`}>
            <Icon className={`w-6 h-6 ${colors.icon}`} />
          </div>
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
            isPositiveTrend 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            <TrendIcon className="w-3 h-3" />
            <span>{formatPercentage(Math.abs(config.change))}</span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {config.title}
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {config.value}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {config.description}
          </p>
          <div className="flex items-center space-x-1 text-xs text-gray-400 dark:text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>{config.period}</span>
          </div>
        </div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none"></div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Performance Overview</h2>
          <div className="w-32 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Performance Overview
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Key metrics and performance indicators for your advertising campaigns
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Activity className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardConfigs.map((config, index) => (
          <MetricCard key={config.id} config={config} index={index} />
        ))}
      </div>

      {/* Summary Footer */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Overall Performance
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your campaigns are performing well with strong ROAS and improving quality scores
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">↗</div>
              <div className="text-xs text-gray-500">Trending Up</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">4.2x</div>
              <div className="text-xs text-gray-500">Avg ROAS</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Custom CSS for animations
const styles = `
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeInUp {
  animation: fadeInUp 0.6s ease-out forwards;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default OverviewCards;

