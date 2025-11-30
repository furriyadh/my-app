"use client";

import React, { useState, useEffect, useMemo } from "react";
import { getBackendUrl } from "@/lib/config";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Calendar,
  Filter,
  Download,
  Maximize2,
  RefreshCw,
  Eye,
  MousePointer,
  DollarSign,
  Target
} from "lucide-react";

const PerformanceChart = () => {
  const [activeChart, setActiveChart] = useState('performance');
  const [timeRange, setTimeRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]);

  // Time range configurations
  const timeRanges = [
    { value: '7d', label: 'Last 7 Days', days: 7 },
    { value: '30d', label: 'Last 30 Days', days: 30 },
    { value: '90d', label: 'Last 90 Days', days: 90 },
    { value: '1y', label: 'Last Year', days: 365 }
  ];

  // Chart configurations
  const chartTypes = [
    {
      id: 'performance',
      name: 'Performance Trends',
      icon: TrendingUp,
      description: 'Key metrics over time'
    },
    {
      id: 'spend',
      name: 'Spend Analysis',
      icon: DollarSign,
      description: 'Cost and revenue analysis'
    },
    {
      id: 'engagement',
      name: 'Engagement Metrics',
      icon: Activity,
      description: 'Clicks and impressions'
    },
    {
      id: 'distribution',
      name: 'Performance Distribution',
      icon: PieChartIcon,
      description: 'Metric distribution breakdown'
    }
  ];

  // Load data based on time range
  useEffect(() => {
    fetchPerformanceData();
  }, [timeRange]);

  const fetchPerformanceData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const backendUrl = `${getBackendUrl()}/api`;

      const selectedRange = timeRanges.find(range => range.value === timeRange);
      
      const params = new URLSearchParams({
        days: selectedRange.days.toString()
      });

      const response = await fetch(`${backendUrl}/campaigns/performance?${params.toString()}`, {
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
          const formattedData = formatPerformanceData(result.data, selectedRange.days);
          setChartData(formattedData);
        } else {
          // Use fallback data if API doesn't return proper data
          setChartData(generateFallbackData(selectedRange.days));
        }
      } else {
        // Use fallback data on error
        setChartData(generateFallbackData(selectedRange.days));
      }
    } catch (err) {
      console.error('Error fetching performance data:', err);
      setError(err.message);
      // Use fallback data on error
      const selectedRange = timeRanges.find(range => range.value === timeRange);
      setChartData(generateFallbackData(selectedRange.days));
    } finally {
      setIsLoading(false);
    }
  };

  const formatPerformanceData = (data, days) => {
    if (Array.isArray(data) && data.length > 0) {
      return data.map(item => ({
        date: item.date,
        displayDate: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        impressions: item.impressions || 0,
        clicks: item.clicks || 0,
        spend: item.spend || item.cost || 0,
        conversions: item.conversions || 0,
        ctr: item.ctr || 0,
        cpc: item.cpc || 0,
        roas: item.roas || 0
      }));
    }
    return generateFallbackData(days);
  };

  const generateFallbackData = (days) => {
    const data = [];
    const baseDate = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        impressions: 0,
        clicks: 0,
        spend: 0.0,
        conversions: 0,
        ctr: 0.0,
        cpc: 0.0,
        roas: 0.0
      });
    }
    return data;
  };

  // Refresh data
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchPerformanceData().finally(() => {
      setIsRefreshing(false);
    });
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!chartData.length) return {};
    
    const totalImpressions = chartData.reduce((sum, item) => sum + item.impressions, 0);
    const totalClicks = chartData.reduce((sum, item) => sum + item.clicks, 0);
    const totalSpend = chartData.reduce((sum, item) => sum + item.spend, 0);
    const totalConversions = chartData.reduce((sum, item) => sum + item.conversions, 0);
    const avgCTR = chartData.reduce((sum, item) => sum + item.ctr, 0) / chartData.length;
    const avgCPC = chartData.reduce((sum, item) => sum + item.cpc, 0) / chartData.length;
    const avgROAS = chartData.reduce((sum, item) => sum + item.roas, 0) / chartData.length;

    return {
      totalImpressions: totalImpressions.toLocaleString(),
      totalClicks: totalClicks.toLocaleString(),
      totalSpend: `$${totalSpend.toLocaleString()}`,
      totalConversions: totalConversions.toLocaleString(),
      avgCTR: `${avgCTR.toFixed(2)}%`,
      avgCPC: `$${avgCPC.toFixed(3)}`,
      avgROAS: `${avgROAS.toFixed(1)}x`
    };
  }, [chartData]);

  // Pie chart data for distribution
  const pieChartData = useMemo(() => {
    if (!chartData.length) return [];
    
    const totalSpend = chartData.reduce((sum, item) => sum + item.spend, 0);
    return [
      { name: 'Search Campaigns', value: totalSpend * 0.45, color: '#3B82F6' },
      { name: 'Display Campaigns', value: totalSpend * 0.25, color: '#10B981' },
      { name: 'Video Campaigns', value: totalSpend * 0.20, color: '#F59E0B' },
      { name: 'Shopping Campaigns', value: totalSpend * 0.10, color: '#EF4444' }
    ];
  }, [chartData]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="  p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-gray-800 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-gray-600 dark:text-gray-400">{entry.name}:</span>
              <span className="font-medium text-gray-900 dark:text-gray-800">
                {typeof entry.value === 'number' && entry.value > 1000 
                  ? entry.value.toLocaleString() 
                  : entry.value}
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
    <div className="animate-pulse">
      <div className="h-8 bg-blue-200/30 rounded w-1/3 mb-4"></div>
      <div className="h-80 bg-blue-200/30 rounded mb-4"></div>
      <div className="flex space-x-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 bg-blue-200/30 rounded flex-1"></div>
        ))}
      </div>
    </div>
  );

  // Render different chart types
  const renderChart = () => {
    if (isLoading) return <LoadingSkeleton />;

    switch (activeChart) {
      case 'performance':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="displayDate" 
                stroke="#6B7280"
                fontSize={12}
              />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="impressions" 
                stroke="#3B82F6" 
                strokeWidth={3}
                name="Impressions"
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="clicks" 
                stroke="#10B981" 
                strokeWidth={3}
                name="Clicks"
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'spend':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="displayDate" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="spend"
                stackId="1"
                stroke="#F59E0B"
                fill="#FEF3C7"
                name="Ad Spend"
              />
              <Area
                type="monotone"
                dataKey="conversions"
                stackId="2"
                stroke="#8B5CF6"
                fill="#EDE9FE"
                name="Conversions"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'engagement':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="displayDate" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="ctr" fill="#06B6D4" name="CTR %" />
              <Bar dataKey="roas" fill="#84CC16" name="ROAS" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'distribution':
        return (
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Spend']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="  rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-800 mb-2">
            Performance Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Detailed performance metrics and trends analysis
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-blue-300/30 rounded-lg bg-white/15 backdrop-blur-md text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>

          {/* Action Buttons */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-800 transition-colors disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          
          <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-800 transition-colors" title="Download Report">
            <Download className="w-5 h-5" />
          </button>
          
          <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-800 transition-colors" title="Fullscreen">
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chart Type Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {chartTypes.map(type => {
          const Icon = type.icon;
          return (
            <button
              key={type.id}
              onClick={() => setActiveChart(type.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeChart === type.id
                  ? 'bg-blue-500/30 text-blue-200 backdrop-blur-sm border border-blue-300/30 drop-shadow-sm'
                  : 'bg-white/10 text-blue-100 backdrop-blur-sm border border-blue-200/20 hover:bg-white/20 drop-shadow-sm'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{type.name}</span>
            </button>
          );
        })}
      </div>

      {/* Chart Container */}
      <div className="mb-6">
        {renderChart()}
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg mx-auto mb-2">
            <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-800">
            {summaryStats.totalImpressions}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Impressions</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg mx-auto mb-2">
            <MousePointer className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-800">
            {summaryStats.totalClicks}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Clicks</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg mx-auto mb-2">
            <DollarSign className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-800">
            {summaryStats.totalSpend}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Spend</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg mx-auto mb-2">
            <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-800">
            {summaryStats.totalConversions}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Conversions</div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-800">
            {summaryStats.avgCTR}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Avg CTR</div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-800">
            {summaryStats.avgCPC}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Avg CPC</div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-800">
            {summaryStats.avgROAS}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Avg ROAS</div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;

