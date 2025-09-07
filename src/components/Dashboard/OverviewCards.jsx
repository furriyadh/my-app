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

  // البيانات الحقيقية من API
  const [metricsData, setMetricsData] = useState({
    totalSpend: {
      current: 0,
      previous: 0,
      change: 0,
      trend: 'neutral'
    },
    impressions: {
      current: 0,
      previous: 0,
      change: 0,
      trend: 'neutral'
    },
    clicks: {
      current: 0,
      previous: 0,
      change: 0,
      trend: 'neutral'
    },
    conversions: {
      current: 0,
      previous: 0,
      change: 0,
      trend: 'neutral'
    },
    ctr: {
      current: 0,
      previous: 0,
      change: 0,
      trend: 'neutral'
    },
    cpc: {
      current: 0,
      previous: 0,
      change: 0,
      trend: 'neutral'
    },
    roas: {
      current: 0,
      previous: 0,
      change: 0,
      trend: 'neutral'
    },
    qualityScore: {
      current: 0,
      previous: 0,
      change: 0,
      trend: 'neutral'
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

  // Color configurations - Updated for animated wave background
  const colorConfigs = {
    blue: {
      bg: 'bg-white/15 backdrop-blur-md',
      border: 'border-blue-300/30',
      icon: 'text-blue-200 drop-shadow-sm',
      iconBg: 'bg-blue-500/20 backdrop-blur-sm border border-blue-300/20'
    },
    green: {
      bg: 'bg-white/15 backdrop-blur-md',
      border: 'border-green-300/30',
      icon: 'text-green-200 drop-shadow-sm',
      iconBg: 'bg-green-500/20 backdrop-blur-sm border border-green-300/20'
    },
    purple: {
      bg: 'bg-white/15 backdrop-blur-md',
      border: 'border-purple-300/30',
      icon: 'text-purple-200 drop-shadow-sm',
      iconBg: 'bg-purple-500/20 backdrop-blur-sm border border-purple-300/20'
    },
    orange: {
      bg: 'bg-white/15 backdrop-blur-md',
      border: 'border-orange-300/30',
      icon: 'text-orange-200 drop-shadow-sm',
      iconBg: 'bg-orange-500/20 backdrop-blur-sm border border-orange-300/20'
    },
    red: {
      bg: 'bg-white/15 backdrop-blur-md',
      border: 'border-red-300/30',
      icon: 'text-red-200 drop-shadow-sm',
      iconBg: 'bg-red-500/20 backdrop-blur-sm border border-red-300/20'
    },
    teal: {
      bg: 'bg-white/15 backdrop-blur-md',
      border: 'border-teal-300/30',
      icon: 'text-teal-200 drop-shadow-sm',
      iconBg: 'bg-teal-500/20 backdrop-blur-sm border border-teal-300/20'
    },
    indigo: {
      bg: 'bg-white/15 backdrop-blur-md',
      border: 'border-indigo-300/30',
      icon: 'text-indigo-200 drop-shadow-sm',
      iconBg: 'bg-indigo-500/20 backdrop-blur-sm border border-indigo-300/20'
    },
    pink: {
      bg: 'bg-white/15 backdrop-blur-md',
      border: 'border-pink-300/30',
      icon: 'text-pink-200 drop-shadow-sm',
      iconBg: 'bg-pink-500/20 backdrop-blur-sm border border-pink-300/20'
    }
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-blue-200/30 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-200/30 rounded-lg"></div>
            <div className="w-16 h-4 bg-blue-200/30 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="w-24 h-8 bg-blue-200/30 rounded"></div>
            <div className="w-32 h-4 bg-blue-200/30 rounded"></div>
            <div className="w-20 h-3 bg-blue-200/30 rounded"></div>
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
            rounded-xl p-6 border transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer
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
              ? 'bg-green-500/20 text-green-200 backdrop-blur-sm border border-green-300/20 drop-shadow-sm' 
              : 'bg-red-500/20 text-red-200 backdrop-blur-sm border border-red-300/20 drop-shadow-sm'
          }`}>
            <TrendIcon className="w-3 h-3" />
            <span>{formatPercentage(Math.abs(config.change))}</span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-blue-100 drop-shadow-sm">
            {config.title}
          </h3>
          <p className="text-2xl font-bold text-gray-900 drop-shadow-md">
            {config.value}
          </p>
          <p className="text-xs text-blue-200 drop-shadow-sm">
            {config.description}
          </p>
          <div className="flex items-center space-x-1 text-xs text-blue-300 drop-shadow-sm">
            <Calendar className="w-3 h-3" />
            <span>{config.period}</span>
          </div>
        </div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none"></div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 drop-shadow-lg">Performance Overview</h2>
          <div className="w-32 h-8 bg-blue-200/30 rounded animate-pulse"></div>
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
          <h2 className="text-2xl font-bold text-gray-900 drop-shadow-lg mb-2">
            Performance Overview
          </h2>
          <p className="text-blue-100 drop-shadow-md">
            Key metrics and performance indicators for your advertising campaigns
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-blue-200 drop-shadow-sm">
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
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-blue-200/30 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 drop-shadow-md mb-2">
              Overall Performance
            </h3>
            <p className="text-blue-100 drop-shadow-sm">
              Your campaigns are performing well with strong ROAS and improving quality scores
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-300 drop-shadow-sm">↗</div>
              <div className="text-xs text-blue-200 drop-shadow-sm">Trending Up</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-300 drop-shadow-sm">4.2x</div>
              <div className="text-xs text-blue-200 drop-shadow-sm">Avg ROAS</div>
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

