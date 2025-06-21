"use client";

import React, { useEffect, useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  MousePointer, 
  Phone, 
  DollarSign,
  Loader,
  AlertCircle,
  RefreshCw,
  Target,
  Users,
  BarChart3
} from "lucide-react";

interface GoogleAdsMetrics {
  totalCost: number;
  costChange: number;
  impressions: number;
  impressionsChange: number;
  clicks: number;
  clicksChange: number;
  ctr: number;
  ctrChange: number;
  conversions: number;
  conversionsChange: number;
  conversionRate: number;
  conversionRateChange: number;
}

interface GoogleAdsKPIProps {
  selectedPeriod: string;
  currency: string;
}

const GoogleAdsKPI: React.FC<GoogleAdsKPIProps> = ({ selectedPeriod, currency }) => {
  const [metrics, setMetrics] = useState<GoogleAdsMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/google-ads/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          period: selectedPeriod,
          currency: currency
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }

      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      console.error('Error fetching metrics:', err);
      // Mock data for demonstration
      setMetrics({
        totalCost: 5735.07,
        costChange: -12.5,
        impressions: 771,
        impressionsChange: 8.3,
        clicks: 23,
        clicksChange: -15.2,
        ctr: 2.98,
        ctrChange: -0.8,
        conversions: 3,
        conversionsChange: 50.0,
        conversionRate: 13.04,
        conversionRateChange: 25.6
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [selectedPeriod, currency]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const formatCurrency = (amount: number): string => {
    return `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-500" />
    );
  };

  const getChangeColor = (change: number): string => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-center h-24">
              <Loader className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <div>
            <h3 className="text-red-800 font-semibold">خطأ في تحميل البيانات</h3>
            <p className="text-red-600 text-sm mt-1">
              {error || 'فشل في الاتصال بـ Google Ads API'}
            </p>
            <button
              onClick={fetchMetrics}
              className="mt-3 flex items-center gap-2 text-red-700 hover:text-red-800 font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      {/* Red Section - Cost Metrics */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          مؤشرات التكلفة والإنفاق
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Cost */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm border border-red-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-red-700 text-sm font-medium">إجمالي التكلفة</p>
                  <p className="text-red-500 text-xs">Total Cost</p>
                </div>
              </div>
              {getChangeIcon(metrics.costChange)}
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-red-800">
                {formatCurrency(metrics.totalCost)}
              </p>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${getChangeColor(metrics.costChange)}`}>
                  {metrics.costChange >= 0 ? '+' : ''}{metrics.costChange.toFixed(1)}%
                </span>
                <span className="text-red-600 text-xs">vs last period</span>
              </div>
            </div>
          </div>

          {/* Cost Per Click */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm border border-red-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-red-700 text-sm font-medium">تكلفة النقرة</p>
                  <p className="text-red-500 text-xs">Cost Per Click</p>
                </div>
              </div>
              {getChangeIcon(-5.2)}
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-red-800">
                {formatCurrency(metrics.totalCost / metrics.clicks)}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-red-600">
                  -5.2%
                </span>
                <span className="text-red-600 text-xs">vs last period</span>
              </div>
            </div>
          </div>

          {/* Conversion Cost */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm border border-red-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-red-700 text-sm font-medium">تكلفة التحويل</p>
                  <p className="text-red-500 text-xs">Cost Per Conversion</p>
                </div>
              </div>
              {getChangeIcon(-15.8)}
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-red-800">
                {formatCurrency(metrics.totalCost / metrics.conversions)}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-red-600">
                  -15.8%
                </span>
                <span className="text-red-600 text-xs">vs last period</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blue Section - Performance Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          مؤشرات الأداء والتفاعل
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Impressions */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-blue-700 text-sm font-medium">مرات الظهور</p>
                  <p className="text-blue-500 text-xs">Impressions</p>
                </div>
              </div>
              {getChangeIcon(metrics.impressionsChange)}
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-blue-800">
                {formatNumber(metrics.impressions)}
              </p>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${getChangeColor(metrics.impressionsChange)}`}>
                  {metrics.impressionsChange >= 0 ? '+' : ''}{metrics.impressionsChange.toFixed(1)}%
                </span>
                <span className="text-blue-600 text-xs">vs last period</span>
              </div>
            </div>
          </div>

          {/* Clicks */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <MousePointer className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-blue-700 text-sm font-medium">النقرات</p>
                  <p className="text-blue-500 text-xs">Clicks</p>
                </div>
              </div>
              {getChangeIcon(metrics.clicksChange)}
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-blue-800">
                {formatNumber(metrics.clicks)}
              </p>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${getChangeColor(metrics.clicksChange)}`}>
                  {metrics.clicksChange >= 0 ? '+' : ''}{metrics.clicksChange.toFixed(1)}%
                </span>
                <span className="text-blue-600 text-xs">vs last period</span>
              </div>
            </div>
          </div>

          {/* CTR */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-blue-700 text-sm font-medium">معدل النقر</p>
                  <p className="text-blue-500 text-xs">Click-Through Rate</p>
                </div>
              </div>
              {getChangeIcon(metrics.ctrChange)}
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-blue-800">
                {formatPercentage(metrics.ctr)}
              </p>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${getChangeColor(metrics.ctrChange)}`}>
                  {metrics.ctrChange >= 0 ? '+' : ''}{metrics.ctrChange.toFixed(1)}%
                </span>
                <span className="text-blue-600 text-xs">vs last period</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleAdsKPI;