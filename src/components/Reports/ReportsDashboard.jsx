"use client";

import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  MousePointer,
  Eye,
  DollarSign,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Search,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  PieChart,
  LineChart
} from "lucide-react";

const ReportsDashboard = () => {
  const [selectedDateRange, setSelectedDateRange] = useState("last_30_days");
  const [selectedCampaign, setSelectedCampaign] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  // Sample data
  const summaryStats = [
    {
      title: "Total Impressions",
      value: "2,847,392",
      change: "+12.5%",
      trend: "up",
      icon: Eye,
      color: "blue"
    },
    {
      title: "Total Clicks",
      value: "156,847",
      change: "+8.3%",
      trend: "up",
      icon: MousePointer,
      color: "green"
    },
    {
      title: "Total Conversions",
      value: "12,456",
      change: "-2.1%",
      trend: "down",
      icon: Target,
      color: "purple"
    },
    {
      title: "Total Spend",
      value: "$45,892",
      change: "+15.7%",
      trend: "up",
      icon: DollarSign,
      color: "orange"
    }
  ];

  const quickReports = [
    {
      title: "Performance Report",
      description: "Comprehensive campaign performance analysis",
      icon: BarChart3,
      color: "bg-blue-500",
      metrics: ["CTR", "CPC", "ROAS", "Quality Score"]
    },
    {
      title: "Keyword Report",
      description: "Detailed keyword performance and insights",
      icon: Search,
      color: "bg-green-500",
      metrics: ["Search Volume", "Competition", "CPC", "Position"]
    },
    {
      title: "Audience Report",
      description: "Demographics and audience behavior analysis",
      icon: Users,
      color: "bg-purple-500",
      metrics: ["Age Groups", "Gender", "Interests", "Locations"]
    },
    {
      title: "Conversion Report",
      description: "Conversion tracking and funnel analysis",
      icon: Target,
      color: "bg-orange-500",
      metrics: ["Conversion Rate", "Cost per Conversion", "Revenue", "ROI"]
    }
  ];

  const recentReports = [
    {
      name: "Q4 Performance Summary",
      type: "Performance",
      date: "2024-12-15",
      status: "completed",
      size: "2.4 MB"
    },
    {
      name: "Holiday Campaign Analysis",
      type: "Campaign",
      date: "2024-12-10",
      status: "completed",
      size: "1.8 MB"
    },
    {
      name: "Keyword Optimization Report",
      type: "Keywords",
      date: "2024-12-08",
      status: "processing",
      size: "3.1 MB"
    },
    {
      name: "Audience Insights December",
      type: "Audience",
      date: "2024-12-05",
      status: "completed",
      size: "1.2 MB"
    }
  ];

  const handleGenerateReport = (reportType) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert(`Generating ${reportType} report...`);
    }, 2000);
  };

  const handleRefreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Reports Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Generate and analyze comprehensive advertising reports
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefreshData}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                <span>Export All</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Report Filters
            </h2>
            <Filter className="w-5 h-5 text-gray-500" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Range
              </label>
              <select
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="last_7_days">Last 7 Days</option>
                <option value="last_30_days">Last 30 Days</option>
                <option value="last_90_days">Last 90 Days</option>
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
                <option value="this_quarter">This Quarter</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Campaign */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Campaign
              </label>
              <select
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Campaigns</option>
                <option value="holiday_sale">Holiday Sale Campaign</option>
                <option value="brand_awareness">Brand Awareness</option>
                <option value="product_launch">Product Launch</option>
                <option value="retargeting">Retargeting Campaign</option>
              </select>
            </div>

            {/* Report Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Report Type
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="summary">Summary Report</option>
                <option value="detailed">Detailed Report</option>
                <option value="comparison">Comparison Report</option>
                <option value="trend">Trend Analysis</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {summaryStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-${stat.color}-100 dark:bg-${stat.color}-900/20 rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                  </div>
                  <div className={`flex items-center space-x-1 text-sm ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    <span>{stat.change}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {stat.value}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Reports */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Quick Reports
            </h2>
            <Activity className="w-5 h-5 text-gray-500" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickReports.map((report, index) => {
              const Icon = report.icon;
              return (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-center mb-4">
                    <div className={`w-10 h-10 ${report.color} rounded-lg flex items-center justify-center mr-3`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {report.title}
                    </h3>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {report.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    {report.metrics.map((metric, idx) => (
                      <div key={idx} className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
                        {metric}
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => handleGenerateReport(report.title)}
                    disabled={isLoading}
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm disabled:opacity-50"
                  >
                    {isLoading ? 'Generating...' : 'Generate Report'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Reports
            </h2>
            <div className="flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-500">Last 30 days</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                    Report Name
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                    Size
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((report, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {report.name}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                        {report.type}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                      {report.date}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        report.status === 'completed'
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                          : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                      {report.size}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;

