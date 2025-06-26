"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Target,
  MousePointer,
  Eye,
  DollarSign,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Users,
  Smartphone,
  Monitor,
  Globe,
  ChevronDown,
  Info,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

const PerformanceReport = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("last_30_days");
  const [selectedCampaign, setSelectedCampaign] = useState("all");
  const [selectedMetric, setSelectedMetric] = useState("impressions");
  const [viewType, setViewType] = useState("overview");

  // Performance metrics data
  const performanceMetrics = [
    {
      title: "Click-Through Rate (CTR)",
      value: "3.45%",
      change: "+0.23%",
      trend: "up",
      benchmark: "2.8%",
      status: "good",
      icon: MousePointer
    },
    {
      title: "Cost Per Click (CPC)",
      value: "$1.24",
      change: "-$0.08",
      trend: "down",
      benchmark: "$1.45",
      status: "excellent",
      icon: DollarSign
    },
    {
      title: "Conversion Rate",
      value: "4.67%",
      change: "+0.45%",
      trend: "up",
      benchmark: "3.2%",
      status: "excellent",
      icon: Target
    },
    {
      title: "Return on Ad Spend (ROAS)",
      value: "4.2x",
      change: "+0.3x",
      trend: "up",
      benchmark: "3.5x",
      status: "good",
      icon: TrendingUp
    },
    {
      title: "Quality Score",
      value: "7.8/10",
      change: "+0.2",
      trend: "up",
      benchmark: "6.5/10",
      status: "good",
      icon: CheckCircle
    },
    {
      title: "Impression Share",
      value: "68.4%",
      change: "-2.1%",
      trend: "down",
      benchmark: "75%",
      status: "warning",
      icon: Eye
    }
  ];

  // Campaign performance data
  const campaignPerformance = [
    {
      name: "Holiday Sale Campaign",
      impressions: "1,245,678",
      clicks: "42,156",
      ctr: "3.38%",
      cpc: "$1.15",
      conversions: "1,987",
      conversionRate: "4.71%",
      cost: "$48,479",
      revenue: "$203,456",
      roas: "4.2x",
      status: "active"
    },
    {
      name: "Brand Awareness",
      impressions: "987,432",
      clicks: "28,934",
      ctr: "2.93%",
      cpc: "$0.89",
      conversions: "1,234",
      conversionRate: "4.26%",
      cost: "$25,751",
      revenue: "$98,765",
      roas: "3.8x",
      status: "active"
    },
    {
      name: "Product Launch",
      impressions: "654,321",
      clicks: "23,567",
      ctr: "3.60%",
      cpc: "$1.45",
      conversions: "1,098",
      conversionRate: "4.66%",
      cost: "$34,172",
      revenue: "$156,789",
      roas: "4.6x",
      status: "paused"
    },
    {
      name: "Retargeting Campaign",
      impressions: "432,109",
      clicks: "18,765",
      ctr: "4.34%",
      cpc: "$0.95",
      conversions: "987",
      conversionRate: "5.26%",
      cost: "$17,827",
      revenue: "$89,432",
      roas: "5.0x",
      status: "active"
    }
  ];

  // Device performance data
  const devicePerformance = [
    {
      device: "Desktop",
      impressions: "45.2%",
      clicks: "52.1%",
      conversions: "58.3%",
      ctr: "3.8%",
      conversionRate: "5.2%",
      color: "bg-blue-500"
    },
    {
      device: "Mobile",
      impressions: "42.8%",
      clicks: "38.9%",
      conversions: "32.1%",
      ctr: "3.1%",
      conversionRate: "3.9%",
      color: "bg-green-500"
    },
    {
      device: "Tablet",
      impressions: "12.0%",
      clicks: "9.0%",
      conversions: "9.6%",
      ctr: "2.5%",
      conversionRate: "4.8%",
      color: "bg-purple-500"
    }
  ];

  // Time performance data (sample for chart)
  const timePerformance = [
    { time: "00:00", impressions: 1200, clicks: 45, conversions: 2 },
    { time: "04:00", impressions: 800, clicks: 28, conversions: 1 },
    { time: "08:00", impressions: 3200, clicks: 125, conversions: 8 },
    { time: "12:00", impressions: 4500, clicks: 180, conversions: 12 },
    { time: "16:00", impressions: 3800, clicks: 152, conversions: 10 },
    { time: "20:00", impressions: 2100, clicks: 89, conversions: 6 }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "excellent":
        return "text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400";
      case "good":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400";
      case "warning":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "poor":
        return "text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "excellent":
      case "good":
        return <CheckCircle className="w-4 h-4" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4" />;
      case "poor":
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Performance Report
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Comprehensive analysis of campaign performance and key metrics
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="last_7_days">Last 7 Days</option>
                  <option value="last_30_days">Last 30 Days</option>
                  <option value="last_90_days">Last 90 Days</option>
                  <option value="this_quarter">This Quarter</option>
                </select>
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="mb-6">
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {["overview", "campaigns", "devices", "timeline"].map((view) => (
              <button
                key={view}
                onClick={() => setViewType(view)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewType === view
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Performance Metrics Overview */}
        {viewType === "overview" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {performanceMetrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {metric.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Benchmark: {metric.benchmark}
                          </p>
                        </div>
                      </div>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getStatusColor(metric.status)}`}>
                        {getStatusIcon(metric.status)}
                        <span className="capitalize">{metric.status}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {metric.value}
                        </div>
                        <div className={`flex items-center space-x-1 text-sm ${
                          metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {metric.trend === 'up' ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4" />
                          )}
                          <span>{metric.change}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Performance Chart Placeholder */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Performance Trends
                </h2>
                <div className="flex items-center space-x-4">
                  <select
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="impressions">Impressions</option>
                    <option value="clicks">Clicks</option>
                    <option value="conversions">Conversions</option>
                    <option value="cost">Cost</option>
                  </select>
                  <LineChart className="w-5 h-5 text-gray-500" />
                </div>
              </div>
              
              {/* Simple chart representation */}
              <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Performance chart for {selectedMetric} over {selectedPeriod}
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Chart visualization would be implemented here
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Campaign Performance */}
        {viewType === "campaigns" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Campaign Performance
              </h2>
              <Activity className="w-5 h-5 text-gray-500" />
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-600">
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Campaign</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Impressions</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Clicks</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">CTR</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">CPC</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Conversions</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Conv. Rate</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">ROAS</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignPerformance.map((campaign, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {campaign.name}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">{campaign.impressions}</td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">{campaign.clicks}</td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">{campaign.ctr}</td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">{campaign.cpc}</td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">{campaign.conversions}</td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">{campaign.conversionRate}</td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">{campaign.roas}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          campaign.status === 'active'
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                            : 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300'
                        }`}>
                          {campaign.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Device Performance */}
        {viewType === "devices" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Device Performance
                </h2>
                <Smartphone className="w-5 h-5 text-gray-500" />
              </div>
              
              <div className="space-y-4">
                {devicePerformance.map((device, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 ${device.color} rounded-full`}></div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {device.device}
                        </h3>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        CTR: {device.ctr}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">Impressions</div>
                        <div className="font-medium text-gray-900 dark:text-white">{device.impressions}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">Clicks</div>
                        <div className="font-medium text-gray-900 dark:text-white">{device.clicks}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">Conversions</div>
                        <div className="font-medium text-gray-900 dark:text-white">{device.conversions}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Device Distribution
                </h2>
                <PieChart className="w-5 h-5 text-gray-500" />
              </div>
              
              {/* Pie chart placeholder */}
              <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Device distribution pie chart
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Visual representation would be here
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timeline Performance */}
        {viewType === "timeline" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Hourly Performance
              </h2>
              <Clock className="w-5 h-5 text-gray-500" />
            </div>
            
            {/* Timeline chart placeholder */}
            <div className="h-80 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">
                  Hourly performance timeline chart
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Shows performance metrics by hour of day
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Insights and Recommendations */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Performance Insights
            </h2>
            <Target className="w-5 h-5 text-gray-500" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 dark:text-white">Key Insights</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">
                      Strong ROAS Performance
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Your campaigns are generating 4.2x return on ad spend, exceeding the 3.5x benchmark.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                      Desktop Dominance
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      Desktop devices show highest conversion rates at 5.2%, significantly outperforming mobile.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 dark:text-white">Recommendations</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                      Improve Impression Share
                    </p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400">
                      Consider increasing budgets to capture the missing 31.6% impression share.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-purple-800 dark:text-purple-300">
                      Optimize Mobile Experience
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-400">
                      Focus on improving mobile conversion rates to match desktop performance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceReport;

