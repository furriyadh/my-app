"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, TrendingUp, Eye, MousePointer, Target, Users, BarChart3, Zap, DollarSign, Check } from 'lucide-react';
import { useTranslation } from '@/lib/hooks/useTranslation';

// Performance Estimates Component
const PerformanceEstimates: React.FC<{
  dailyBudget?: number;
  budgetLevel?: string;
}> = ({ dailyBudget = 100, budgetLevel = 'intermediate' }) => {
  const { t, isRTL } = useTranslation();
  // Calculate estimated metrics based on budget
  const calculateMetrics = () => {
    const baseMetrics = {
      impressions: dailyBudget * 250,
      clicks: dailyBudget * 15,
      conversions: dailyBudget * 0.8,
      ctr: 6.0,
      conversionRate: 5.3,
      cpc: dailyBudget / 15
    };

    // Adjust based on budget level
    const multipliers: { [key: string]: number } = {
      'beginner': 0.8,
      'intermediate': 1.0,
      'expert': 1.3
    };

    const multiplier = multipliers[budgetLevel] || 1.0;

    return {
      impressions: {
        min: Math.round(baseMetrics.impressions * multiplier * 0.8),
        max: Math.round(baseMetrics.impressions * multiplier * 1.2)
      },
      clicks: {
        min: Math.round(baseMetrics.clicks * multiplier * 0.8),
        max: Math.round(baseMetrics.clicks * multiplier * 1.2)
      },
      conversions: {
        min: Math.round(baseMetrics.conversions * multiplier * 0.7),
        max: Math.round(baseMetrics.conversions * multiplier * 1.3)
      },
      ctr: baseMetrics.ctr * multiplier,
      conversionRate: baseMetrics.conversionRate * multiplier,
      cpc: baseMetrics.cpc / multiplier
    };
  };

  const metrics = calculateMetrics();

  const performanceMetrics = [
    {
      icon: <Eye className="w-5 h-5" />,
      label: t.campaign?.expectedImpressions || 'Expected Impressions',
      value: `${(metrics.impressions.min / 1000).toFixed(1)}K - ${(metrics.impressions.max / 1000).toFixed(1)}K`,
      subtext: t.campaign?.perDay || 'per day',
      color: 'blue'
    },
    {
      icon: <MousePointer className="w-5 h-5" />,
      label: t.campaign?.expectedClicks || 'Expected Clicks',
      value: `${metrics.clicks.min} - ${metrics.clicks.max}`,
      subtext: `${metrics.ctr.toFixed(1)}% ${t.campaign?.ctr || 'CTR'}`,
      color: 'green'
    },
    {
      icon: <Target className="w-5 h-5" />,
      label: t.campaign?.expectedConversions || 'Expected Conversions',
      value: `${metrics.conversions.min} - ${metrics.conversions.max}`,
      subtext: `${metrics.conversionRate.toFixed(1)}% ${t.campaign?.conversionRate || 'conversion rate'}`,
      color: 'purple'
    },
    {
      icon: <DollarSign className="w-5 h-5" />,
      label: t.campaign?.avgCostPerClick || 'Avg. Cost Per Click',
      value: `$${metrics.cpc.toFixed(2)}`,
      subtext: t.campaign?.estimatedCPC || 'estimated CPC',
      color: 'amber'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: { bg: string; text: string; icon: string } } = {
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-700 dark:text-blue-300',
        icon: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
      },
      green: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        text: 'text-green-700 dark:text-green-300',
        icon: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
      },
      purple: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        text: 'text-purple-700 dark:text-purple-300',
        icon: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
      },
      amber: {
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        text: 'text-amber-700 dark:text-amber-300',
        icon: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
      }
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white" dir={isRTL ? 'rtl' : 'ltr'}>{t.campaign?.expectedPerformance || 'Expected Performance'}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1" dir={isRTL ? 'rtl' : 'ltr'}>
            {t.campaign?.realisticProjections || 'Realistic projections for'} {budgetLevel} {t.campaign?.levelCampaigns || 'level campaigns'}
          </p>
        </div>
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
          <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {performanceMetrics.map((metric, index) => {
          const colors = getColorClasses(metric.color);
          return (
            <div key={index} className={`p-4 rounded-xl ${colors.bg} border border-gray-200 dark:border-gray-700`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${colors.icon}`}>
                  {metric.icon}
                </div>
                <Zap className={`w-4 h-4 ${colors.text}`} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{metric.label}</p>
                <p className={`text-lg font-bold ${colors.text} mt-1`}>{metric.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{metric.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h4 className="font-semibold text-blue-700 dark:text-blue-300" dir={isRTL ? 'rtl' : 'ltr'}>{t.campaign?.performanceFactors || 'Performance Factors'}</h4>
          </div>
          <ul className="space-y-2 text-sm text-blue-600 dark:text-blue-400" dir={isRTL ? 'rtl' : 'ltr'}>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              {t.campaign?.locationTargetingCTR || 'Location targeting precision affects CTR by 15-30%'}
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              {t.campaign?.adQualityScore || 'Ad quality score can improve CPC by up to 50%'}
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              {t.campaign?.landingPageRelevance || 'Landing page relevance impacts conversion rate significantly'}
            </li>
          </ul>
        </div>

        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
          <p className="text-sm font-semibold text-green-700 dark:text-green-300 mb-1" dir={isRTL ? 'rtl' : 'ltr'}>
            💡 {t.campaign?.optimizationTip || 'Optimization Tip'}
          </p>
          <p className="text-sm text-green-600 dark:text-green-400" dir={isRTL ? 'rtl' : 'ltr'}>
            {
              budgetLevel === 'beginner'
                ? (t.campaign?.beginnerTip || "Great starting budget! Focus on targeted keywords to maximize conversions. You can expect solid results with proper optimization.")
                : budgetLevel === 'intermediate'
                  ? (t.campaign?.intermediateTip || "Excellent budget for steady growth. You can target competitive keywords while maintaining good ROI and conversion rates.")
                  : (t.campaign?.expertTip || "Premium budget for maximum impact. Target high-value keywords and expect excellent visibility with strong conversion performance.")
            }
          </p>
        </div>
      </div>
    </div>
  );
};

const PerformancePage: React.FC = () => {
  const router = useRouter();
  const { t, language, isRTL } = useTranslation();

  return (
    <div className="min-h-screen" dir="ltr">
      {/* Header */}
      <div className="bg-white dark:bg-black shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white" dir={isRTL ? 'rtl' : 'ltr'}>{t.campaign?.performancePreview || 'Performance Preview'}</h1>
            <div className="w-20" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Performance Estimates */}
        <PerformanceEstimates />

        {/* Additional Performance Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Reach Estimates */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white" dir={isRTL ? 'rtl' : 'ltr'}>{t.campaign?.audienceReach || 'Audience Reach'}</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Daily Reach</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">10K - 25K users</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Weekly Reach</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">50K - 150K users</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Reach</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">200K - 600K users</span>
              </div>
            </div>
          </div>

          {/* Optimization Recommendations */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white" dir={isRTL ? 'rtl' : 'ltr'}>{t.campaign?.quickOptimizations || 'Quick Optimizations'}</h3>
            </div>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Enable conversion tracking for better optimization</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Use ad extensions to increase CTR by 10-15%</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Test multiple ad variations for best performance</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Monitor quality score weekly for improvements</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => router.push('/google-ads/campaigns/budget-scheduling')}
            className="flex items-center px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Previous
          </button>
          <button
            onClick={() => router.push('/google-ads/campaigns/preview')}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Next
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PerformancePage;
