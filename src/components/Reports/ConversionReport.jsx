"use client";

import React, { useState } from "react";
import {
  Target,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Phone,
  Mail,
  Download,
  Users,
  MousePointer,
  Eye,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Calendar,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Info,
  Star,
  Award,
  Zap,
  Clock,
  MapPin,
  Smartphone,
  Monitor,
  Tablet,
  CreditCard,
  FileText,
  UserPlus,
  Heart,
  Share2
} from "lucide-react";

const ConversionReport = () => {
  const [selectedView, setSelectedView] = useState("overview");
  const [selectedTimeframe, setSelectedTimeframe] = useState("last_30_days");
  const [selectedConversionType, setSelectedConversionType] = useState("all");

  // Conversion overview data
  const conversionOverview = [
    {
      type: "Purchase",
      count: 1247,
      value: "$156,789",
      rate: "4.23%",
      change: "+12.5%",
      trend: "up",
      icon: ShoppingCart,
      color: "bg-green-500"
    },
    {
      type: "Lead Generation",
      count: 892,
      value: "$89,456",
      rate: "3.87%",
      change: "+8.3%",
      trend: "up",
      icon: UserPlus,
      color: "bg-blue-500"
    },
    {
      type: "Phone Calls",
      count: 456,
      value: "$45,678",
      rate: "2.14%",
      change: "-2.1%",
      trend: "down",
      icon: Phone,
      color: "bg-purple-500"
    },
    {
      type: "Email Signups",
      count: 2134,
      value: "$21,340",
      rate: "8.76%",
      change: "+15.7%",
      trend: "up",
      icon: Mail,
      color: "bg-orange-500"
    },
    {
      type: "Downloads",
      count: 1678,
      value: "$16,780",
      rate: "6.45%",
      change: "+5.2%",
      trend: "up",
      icon: Download,
      color: "bg-red-500"
    },
    {
      type: "App Installs",
      count: 789,
      value: "$23,670",
      rate: "3.21%",
      change: "+18.9%",
      trend: "up",
      icon: Smartphone,
      color: "bg-indigo-500"
    }
  ];

  // Conversion funnel data
  const conversionFunnel = [
    { stage: "Impressions", count: 1245678, percentage: 100, dropOff: 0 },
    { stage: "Clicks", count: 45678, percentage: 3.67, dropOff: 96.33 },
    { stage: "Landing Page Views", count: 38456, percentage: 84.18, dropOff: 15.82 },
    { stage: "Product Views", count: 23456, percentage: 61.01, dropOff: 38.99 },
    { stage: "Add to Cart", count: 12345, percentage: 52.63, dropOff: 47.37 },
    { stage: "Checkout Started", count: 6789, percentage: 55.01, dropOff: 44.99 },
    { stage: "Purchase Completed", count: 1247, percentage: 18.37, dropOff: 81.63 }
  ];

  // Attribution data
  const attributionData = [
    {
      channel: "Google Ads",
      firstClick: 234,
      lastClick: 456,
      linear: 345,
      timeDecay: 389,
      positionBased: 367,
      value: "$45,678"
    },
    {
      channel: "Facebook Ads",
      firstClick: 189,
      lastClick: 234,
      linear: 211,
      timeDecay: 223,
      positionBased: 218,
      value: "$23,456"
    },
    {
      channel: "Organic Search",
      firstClick: 345,
      lastClick: 123,
      linear: 234,
      timeDecay: 198,
      positionBased: 267,
      value: "$34,567"
    },
    {
      channel: "Email Marketing",
      firstClick: 67,
      lastClick: 189,
      linear: 128,
      timeDecay: 156,
      positionBased: 134,
      value: "$12,345"
    },
    {
      channel: "Direct Traffic",
      firstClick: 123,
      lastClick: 345,
      linear: 234,
      timeDecay: 289,
      positionBased: 256,
      value: "$28,901"
    }
  ];

  // Conversion paths data
  const conversionPaths = [
    {
      path: "Google Ads → Landing Page → Purchase",
      conversions: 456,
      percentage: 36.6,
      avgValue: "$125.67",
      touchpoints: 1
    },
    {
      path: "Facebook → Email → Google Ads → Purchase",
      conversions: 234,
      percentage: 18.8,
      avgValue: "$189.45",
      touchpoints: 3
    },
    {
      path: "Organic → Google Ads → Purchase",
      conversions: 189,
      percentage: 15.2,
      avgValue: "$156.78",
      touchpoints: 2
    },
    {
      path: "Direct → Google Ads → Email → Purchase",
      conversions: 123,
      percentage: 9.9,
      avgValue: "$234.56",
      touchpoints: 3
    },
    {
      path: "YouTube → Google Ads → Purchase",
      conversions: 89,
      percentage: 7.1,
      avgValue: "$98.34",
      touchpoints: 2
    }
  ];

  // Time to conversion data
  const timeToConversion = [
    { period: "Same Day", conversions: 456, percentage: 36.6, avgValue: "$89.45" },
    { period: "1-3 Days", conversions: 345, percentage: 27.7, avgValue: "$123.67" },
    { period: "4-7 Days", conversions: 234, percentage: 18.8, avgValue: "$156.78" },
    { period: "1-2 Weeks", conversions: 123, percentage: 9.9, avgValue: "$189.34" },
    { period: "2-4 Weeks", conversions: 67, percentage: 5.4, avgValue: "$234.56" },
    { period: "1+ Month", conversions: 22, percentage: 1.8, avgValue: "$345.67" }
  ];

  // Device conversion data
  const deviceConversions = [
    {
      device: "Desktop",
      conversions: 678,
      rate: "5.67%",
      avgValue: "$189.45",
      revenue: "$128,456",
      icon: Monitor,
      color: "bg-blue-500"
    },
    {
      device: "Mobile",
      conversions: 456,
      rate: "3.21%",
      avgValue: "$123.67",
      revenue: "$56,394",
      icon: Smartphone,
      color: "bg-green-500"
    },
    {
      device: "Tablet",
      conversions: 113,
      rate: "4.89%",
      avgValue: "$156.78",
      revenue: "$17,716",
      icon: Tablet,
      color: "bg-purple-500"
    }
  ];

  // Goal completion data
  const goalCompletions = [
    {
      goal: "Newsletter Signup",
      completions: 2134,
      rate: "8.76%",
      value: "$10.00",
      totalValue: "$21,340",
      status: "excellent"
    },
    {
      goal: "Product Purchase",
      completions: 1247,
      rate: "4.23%",
      value: "$125.67",
      totalValue: "$156,789",
      status: "good"
    },
    {
      goal: "Contact Form",
      completions: 892,
      rate: "3.87%",
      value: "$100.29",
      totalValue: "$89,456",
      status: "good"
    },
    {
      goal: "Phone Call",
      completions: 456,
      rate: "2.14%",
      value: "$100.17",
      totalValue: "$45,678",
      status: "warning"
    },
    {
      goal: "App Download",
      completions: 1678,
      rate: "6.45%",
      value: "$10.00",
      totalValue: "$16,780",
      status: "excellent"
    }
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

  const getFunnelStageColor = (index) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500", 
      "bg-purple-500",
      "bg-orange-500",
      "bg-red-500",
      "bg-indigo-500",
      "bg-pink-500"
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Conversion Report
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Comprehensive analysis of conversions, attribution, and customer journey
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="last_7_days">Last 7 Days</option>
                <option value="last_30_days">Last 30 Days</option>
                <option value="last_90_days">Last 90 Days</option>
                <option value="this_quarter">This Quarter</option>
              </select>
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
            {["overview", "funnel", "attribution", "paths", "timing", "goals"].map((view) => (
              <button
                key={view}
                onClick={() => setSelectedView(view)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedView === view
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Conversion Overview */}
        {selectedView === "overview" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {conversionOverview.map((conversion, index) => {
                const Icon = conversion.icon;
                return (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${conversion.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className={`flex items-center space-x-1 text-sm ${
                        conversion.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {conversion.trend === 'up' ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                        <span>{conversion.change}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {conversion.type}
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {conversion.count.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Conversions
                          </div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {conversion.value}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Total Value
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Conversion Rate
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {conversion.rate}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Device Conversions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Conversion by Device
                </h2>
                <Smartphone className="w-5 h-5 text-gray-500" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {deviceConversions.map((device, index) => {
                  const Icon = device.icon;
                  return (
                    <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 ${device.color} rounded-lg flex items-center justify-center`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {device.device}
                          </h3>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Conversions</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {device.conversions.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Conv. Rate</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {device.rate}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Avg. Value</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {device.avgValue}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Revenue</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {device.revenue}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Conversion Funnel */}
        {selectedView === "funnel" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Conversion Funnel
              </h2>
              <Target className="w-5 h-5 text-gray-500" />
            </div>
            
            <div className="space-y-4">
              {conversionFunnel.map((stage, index) => (
                <div key={index} className="relative">
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 ${getFunnelStageColor(index)} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                      {index + 1}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {stage.stage}
                        </h3>
                        <div className="flex items-center space-x-4">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {stage.count.toLocaleString()}
                          </span>
                          {index > 0 && (
                            <span className="text-sm text-red-600 dark:text-red-400">
                              -{stage.dropOff.toFixed(1)}% drop-off
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div 
                          className={`${getFunnelStageColor(index)} h-3 rounded-full transition-all duration-500`}
                          style={{ width: `${stage.percentage}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {stage.percentage.toFixed(2)}% of previous stage
                        </span>
                        {index === 0 && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            100% baseline
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {index < conversionFunnel.length - 1 && (
                    <div className="ml-4 mt-2 mb-2">
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attribution Analysis */}
        {selectedView === "attribution" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Attribution Analysis
              </h2>
              <Activity className="w-5 h-5 text-gray-500" />
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-600">
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Channel</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">First Click</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Last Click</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Linear</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Time Decay</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Position Based</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {attributionData.map((channel, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-4 px-4 font-medium text-gray-900 dark:text-white">
                        {channel.channel}
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {channel.firstClick}
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {channel.lastClick}
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {channel.linear}
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {channel.timeDecay}
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {channel.positionBased}
                      </td>
                      <td className="py-4 px-4 font-medium text-gray-900 dark:text-white">
                        {channel.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Conversion Paths */}
        {selectedView === "paths" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Top Conversion Paths
              </h2>
              <Share2 className="w-5 h-5 text-gray-500" />
            </div>
            
            <div className="space-y-4">
              {conversionPaths.map((path, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {path.path}
                    </h3>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {path.touchpoints} touchpoint{path.touchpoints > 1 ? 's' : ''}
                      </span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {path.conversions} conversions
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${path.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {path.percentage}% of conversions
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Avg. Value</div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {path.avgValue}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Time to Conversion */}
        {selectedView === "timing" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Time to Conversion
              </h2>
              <Clock className="w-5 h-5 text-gray-500" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {timeToConversion.map((period, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {period.period}
                    </h3>
                    
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {period.conversions}
                    </div>
                    
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      {period.percentage}% of conversions
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${period.percentage}%` }}
                      ></div>
                    </div>
                    
                    <div className="text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Avg. Value: </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {period.avgValue}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Goal Completions */}
        {selectedView === "goals" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Goal Completions
              </h2>
              <Award className="w-5 h-5 text-gray-500" />
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-600">
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Goal</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Completions</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Rate</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Value per Goal</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Total Value</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {goalCompletions.map((goal, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-4 px-4 font-medium text-gray-900 dark:text-white">
                        {goal.goal}
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {goal.completions.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {goal.rate}
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {goal.value}
                      </td>
                      <td className="py-4 px-4 font-medium text-gray-900 dark:text-white">
                        {goal.totalValue}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(goal.status)}`}>
                          {goal.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversionReport;

