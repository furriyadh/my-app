"use client";

import React, { useState, useEffect, useMemo } from "react";
import { getBackendUrl } from "@/lib/config";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  Target,
  TrendingUp,
  DollarSign,
  Users,
  Activity,
  Eye,
  MousePointer,
  Zap,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  Play,
  Pause
} from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";

const CampaignStats = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statsData, setStatsData] = useState({
    campaignsByType: [],
    campaignsByStatus: [],
    performanceByType: [],
    budgetAllocation: [],
    conversionFunnel: []
  });

  useEffect(() => {
    fetchCampaignStats();
  }, []);

  const fetchCampaignStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const backendUrl = `${getBackendUrl()}/api`;

      const response = await fetch(`${backendUrl}/campaigns/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(typeof window !== 'undefined' && localStorage.getItem('auth_token') && {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          })
        }
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.data) {
          setStatsData(formatStatsData(result.data));
        } else {
          // Use fallback data
          setStatsData(generateFallbackStats());
        }
      } else {
        setStatsData(generateFallbackStats());
      }
    } catch (err) {
      console.error('Error fetching campaign stats:', err);
      setError(err.message);
      setStatsData(generateFallbackStats());
    } finally {
      setIsLoading(false);
    }
  };

  const formatStatsData = (data) => {
    return {
      campaignsByType: data.campaignsByType || [],
      campaignsByStatus: data.campaignsByStatus || [],
      performanceByType: data.performanceByType || [],
      budgetAllocation: data.budgetAllocation || [],
      conversionFunnel: data.conversionFunnel || []
    };
  };

  const generateFallbackStats = () => {
    return {
      campaignsByType: [
        { name: 'Search', value: 0, color: '#3B82F6' },
        { name: 'Display', value: 0, color: '#10B981' },
        { name: 'Shopping', value: 0, color: '#F59E0B' },
        { name: 'Video', value: 0, color: '#EF4444' },
        { name: 'Performance Max', value: 0, color: '#8B5CF6' }
      ],
      campaignsByStatus: [
        { name: 'Active', value: 0, color: '#10B981', icon: Play },
        { name: 'Paused', value: 0, color: '#F59E0B', icon: Pause },
        { name: 'Draft', value: 0, color: '#6B7280', icon: Clock },
        { name: 'Ended', value: 0, color: '#EF4444', icon: CheckCircle }
      ],
      performanceByType: [],
      budgetAllocation: [],
      conversionFunnel: [
        { stage: 'Impressions', value: 0, percentage: 100 },
        { stage: 'Clicks', value: 0, percentage: 0 },
        { stage: 'Visits', value: 0, percentage: 0 },
        { stage: 'Conversions', value: 0, percentage: 0 }
      ]
    };
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-gray-600 dark:text-gray-400">{entry.name}:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-blue-200/30 animate-pulse">
          <div className="w-48 h-6 bg-blue-200/30 rounded mb-4"></div>
          <div className="h-64 bg-blue-200/30 rounded"></div>
        </div>
      ))}
    </div>
  );

  // Stat cards
  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <div className={`bg-white/15 backdrop-blur-md rounded-lg p-4 border border-${color}-300/30 hover:shadow-lg transition-all duration-200`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg bg-${color}-500/20 backdrop-blur-sm border border-${color}-300/20`}>
          <Icon className={`w-5 h-5 text-${color}-200`} />
        </div>
        {change && (
          <div className={`text-xs font-medium ${change >= 0 ? 'text-green-300' : 'text-red-300'}`}>
            {change >= 0 ? '+' : ''}{change}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 drop-shadow-md mb-1">
        {value}
      </div>
      <div className="text-sm text-blue-100 drop-shadow-sm">
        {title}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-800 mb-4">
          {t.dashboard?.campaignStatistics || 'Campaign Statistics'}
        </h2>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-800 mb-2">
            {t.dashboard?.campaignStatistics || 'Campaign Statistics'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t.dashboard?.detailedBreakdown || 'Detailed breakdown of your campaign performance'}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title={t.dashboard?.totalCampaigns || "Total Campaigns"}
          value={statsData.campaignsByType.reduce((sum, item) => sum + item.value, 0)}
          icon={Target}
          color="blue"
        />
        <StatCard
          title={t.dashboard?.activeCampaigns || "Active Campaigns"}
          value={statsData.campaignsByStatus.find(s => s.name === 'Active')?.value || 0}
          icon={Play}
          color="green"
        />
        <StatCard
          title={t.dashboard?.totalBudget || "Total Budget"}
          value={`$${statsData.budgetAllocation.reduce((sum, item) => sum + (item.budget || 0), 0).toLocaleString()}`}
          icon={DollarSign}
          color="purple"
        />
        <StatCard
          title={t.dashboard?.avgPerformance || "Avg Performance"}
          value="0%"
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaigns by Type */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-blue-200/30">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-800 mb-4">
            {t.dashboard?.campaignsByType || 'Campaigns by Type'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statsData.campaignsByType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statsData.campaignsByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {statsData.campaignsByType.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              {t.dashboard?.noDataAvailable || 'No data available'}
            </div>
          )}
        </div>

        {/* Campaigns by Status */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-blue-200/30">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-800 mb-4">
            {t.dashboard?.campaignsByStatus || 'Campaigns by Status'}
          </h3>
          <div className="space-y-4">
            {statsData.campaignsByStatus.map((status, index) => {
              const Icon = status.icon;
              const total = statsData.campaignsByStatus.reduce((sum, s) => sum + s.value, 0);
              const percentage = total > 0 ? (status.value / total) * 100 : 0;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4" style={{ color: status.color }} />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-800">
                        {status.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-800">
                      {status.value}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: status.color
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          {statsData.campaignsByStatus.every(s => s.value === 0) && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              {t.dashboard?.noDataAvailable || 'No data available'}
            </div>
          )}
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-blue-200/30 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-800 mb-4">
            {t.dashboard?.conversionFunnel || 'Conversion Funnel'}
          </h3>
          <div className="space-y-4">
            {statsData.conversionFunnel.map((stage, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-800">
                    {stage.stage}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-800">
                      {stage.value.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      ({stage.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-500"
                    style={{ width: `${stage.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          {statsData.conversionFunnel.every(s => s.value === 0) && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              {t.dashboard?.noDataAvailable || 'No data available'}
            </div>
          )}
        </div>
      </div>

      {/* Additional Insights */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-blue-200/30">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-800 mb-4">
          {t.dashboard?.keyInsights || 'Key Insights'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start space-x-3 p-4 bg-blue-500/10 rounded-lg border border-blue-300/20">
            <Target className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-800 mb-1">
                {t.dashboard?.campaignHealth || 'Campaign Health'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t.dashboard?.campaignHealthDesc || 'Most campaigns are performing within expected ranges'}
              </div>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-4 bg-green-500/10 rounded-lg border border-green-300/20">
            <TrendingUp className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-800 mb-1">
                {t.dashboard?.growthOpportunity || 'Growth Opportunity'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t.dashboard?.growthOpportunityDesc || 'Consider scaling top-performing campaigns'}
              </div>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-4 bg-purple-500/10 rounded-lg border border-purple-300/20">
            <Award className="w-5 h-5 text-purple-400 mt-0.5" />
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-800 mb-1">
                {t.dashboard?.optimization || 'Optimization'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t.dashboard?.optimizationDesc || 'Review underperforming campaigns for improvements'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignStats;

