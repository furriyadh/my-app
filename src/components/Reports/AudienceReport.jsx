"use client";

import React, { useState } from "react";
import {
  Users,
  MapPin,
  Clock,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Heart,
  ShoppingBag,
  Briefcase,
  GraduationCap,
  Home,
  Car,
  Gamepad2,
  Music,
  Camera,
  Plane,
  Coffee,
  Book,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  MousePointer,
  Target,
  DollarSign,
  Star,
  Award,
  Zap
} from "lucide-react";

const AudienceReport = () => {
  const [selectedView, setSelectedView] = useState("demographics");
  const [selectedTimeframe, setSelectedTimeframe] = useState("last_30_days");
  const [selectedMetric, setSelectedMetric] = useState("impressions");

  // Demographics data
  const ageGroups = [
    { range: "18-24", percentage: 15.2, impressions: 234567, clicks: 8934, conversions: 234, color: "bg-blue-500" },
    { range: "25-34", percentage: 32.8, impressions: 567890, clicks: 19876, conversions: 567, color: "bg-green-500" },
    { range: "35-44", percentage: 28.4, impressions: 456789, clicks: 16543, conversions: 489, color: "bg-purple-500" },
    { range: "45-54", percentage: 16.7, impressions: 298765, clicks: 9876, conversions: 298, color: "bg-orange-500" },
    { range: "55-64", percentage: 5.9, impressions: 123456, clicks: 3456, conversions: 123, color: "bg-red-500" },
    { range: "65+", percentage: 1.0, impressions: 34567, clicks: 987, conversions: 34, color: "bg-gray-500" }
  ];

  const genderData = [
    { gender: "Male", percentage: 58.3, impressions: 1045678, clicks: 34567, conversions: 1045, color: "bg-blue-500" },
    { gender: "Female", percentage: 41.7, impressions: 754321, clicks: 25432, conversions: 754, color: "bg-pink-500" }
  ];

  // Geographic data
  const topLocations = [
    { country: "United States", city: "New York", percentage: 22.4, impressions: 456789, clicks: 15678, conversions: 456, revenue: "$12,345" },
    { country: "United States", city: "Los Angeles", percentage: 18.7, impressions: 387654, clicks: 13456, conversions: 387, revenue: "$10,234" },
    { country: "United Kingdom", city: "London", percentage: 12.3, impressions: 234567, clicks: 8765, conversions: 234, revenue: "$6,789" },
    { country: "Canada", city: "Toronto", percentage: 9.8, impressions: 198765, clicks: 6543, conversions: 198, revenue: "$5,432" },
    { country: "Australia", city: "Sydney", percentage: 8.2, impressions: 165432, clicks: 5432, conversions: 165, revenue: "$4,567" },
    { country: "Germany", city: "Berlin", percentage: 6.9, impressions: 134567, clicks: 4321, conversions: 134, revenue: "$3,789" },
    { country: "France", city: "Paris", percentage: 5.4, impressions: 109876, clicks: 3456, conversions: 109, revenue: "$2,987" },
    { country: "Japan", city: "Tokyo", percentage: 4.8, impressions: 98765, clicks: 2987, conversions: 98, revenue: "$2,654" }
  ];

  // Device data
  const deviceData = [
    { 
      device: "Desktop", 
      percentage: 45.6, 
      impressions: 823456, 
      clicks: 28765, 
      conversions: 823, 
      avgSessionDuration: "4:32",
      bounceRate: "32.4%",
      color: "bg-blue-500",
      icon: Monitor
    },
    { 
      device: "Mobile", 
      percentage: 42.1, 
      impressions: 756789, 
      clicks: 23456, 
      conversions: 567, 
      avgSessionDuration: "2:18",
      bounceRate: "45.7%",
      color: "bg-green-500",
      icon: Smartphone
    },
    { 
      device: "Tablet", 
      percentage: 12.3, 
      impressions: 219876, 
      clicks: 7654, 
      conversions: 219, 
      avgSessionDuration: "3:45",
      bounceRate: "38.9%",
      color: "bg-purple-500",
      icon: Tablet
    }
  ];

  // Interests data
  const interests = [
    { category: "Technology", percentage: 28.4, engagement: "high", icon: Smartphone, color: "bg-blue-500" },
    { category: "Business", percentage: 24.7, engagement: "high", icon: Briefcase, color: "bg-green-500" },
    { category: "Shopping", percentage: 19.3, engagement: "medium", icon: ShoppingBag, color: "bg-purple-500" },
    { category: "Travel", percentage: 15.8, engagement: "high", icon: Plane, color: "bg-orange-500" },
    { category: "Education", percentage: 12.6, engagement: "medium", icon: GraduationCap, color: "bg-red-500" },
    { category: "Entertainment", percentage: 11.9, engagement: "medium", icon: Music, color: "bg-pink-500" },
    { category: "Sports", percentage: 9.7, engagement: "low", icon: Award, color: "bg-indigo-500" },
    { category: "Food & Dining", percentage: 8.4, engagement: "medium", icon: Coffee, color: "bg-yellow-500" }
  ];

  // Behavior data
  const behaviorData = [
    { 
      segment: "New Visitors", 
      percentage: 67.3, 
      avgSessionDuration: "2:45", 
      pagesPerSession: 3.2, 
      conversionRate: "2.8%",
      value: "Medium"
    },
    { 
      segment: "Returning Visitors", 
      percentage: 32.7, 
      avgSessionDuration: "4:18", 
      pagesPerSession: 5.7, 
      conversionRate: "6.4%",
      value: "High"
    }
  ];

  // Time-based data
  const hourlyData = [
    { hour: "00:00", impressions: 1200, clicks: 45, conversions: 2 },
    { hour: "06:00", impressions: 2800, clicks: 98, conversions: 5 },
    { hour: "09:00", impressions: 5600, clicks: 234, conversions: 12 },
    { hour: "12:00", impressions: 7800, clicks: 345, conversions: 18 },
    { hour: "15:00", impressions: 6900, clicks: 289, conversions: 15 },
    { hour: "18:00", impressions: 8200, clicks: 367, conversions: 21 },
    { hour: "21:00", impressions: 4500, clicks: 178, conversions: 9 }
  ];

  const dayOfWeekData = [
    { day: "Monday", impressions: 145678, clicks: 5234, conversions: 145, performance: "average" },
    { day: "Tuesday", impressions: 167890, clicks: 6123, conversions: 167, performance: "good" },
    { day: "Wednesday", impressions: 156789, clicks: 5678, conversions: 156, performance: "average" },
    { day: "Thursday", impressions: 178901, clicks: 6789, conversions: 178, performance: "excellent" },
    { day: "Friday", impressions: 189012, clicks: 7234, conversions: 189, performance: "excellent" },
    { day: "Saturday", impressions: 134567, clicks: 4567, conversions: 134, performance: "below" },
    { day: "Sunday", impressions: 123456, clicks: 4123, conversions: 123, performance: "below" }
  ];

  const getPerformanceColor = (performance) => {
    switch (performance) {
      case "excellent":
        return "text-green-600 dark:text-green-400";
      case "good":
        return "text-blue-600 dark:text-blue-400";
      case "average":
        return "text-yellow-600 dark:text-yellow-400";
      case "below":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getEngagementColor = (engagement) => {
    switch (engagement) {
      case "high":
        return "text-green-600 dark:text-green-400";
      case "medium":
        return "text-yellow-600 dark:text-yellow-400";
      case "low":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
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
                Audience Report
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Comprehensive analysis of your audience demographics, behavior, and interests
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
            {["demographics", "geography", "devices", "interests", "behavior", "timing"].map((view) => (
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

        {/* Demographics */}
        {selectedView === "demographics" && (
          <div className="space-y-8">
            {/* Age Groups */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Age Distribution
                </h2>
                <Users className="w-5 h-5 text-gray-500" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ageGroups.map((group, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {group.range} years
                      </h3>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {group.percentage}%
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                      <div 
                        className={`${group.color} h-2 rounded-full`}
                        style={{ width: `${group.percentage}%` }}
                      ></div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">Impressions</div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {group.impressions.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">Clicks</div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {group.clicks.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">Conversions</div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {group.conversions}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gender Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Gender Distribution
                </h2>
                <PieChart className="w-5 h-5 text-gray-500" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {genderData.map((gender, index) => (
                  <div key={index} className="text-center">
                    <div className="flex items-center justify-center mb-4">
                      <div className={`w-20 h-20 ${gender.color} rounded-full flex items-center justify-center`}>
                        <span className="text-white text-2xl font-bold">
                          {gender.percentage}%
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      {gender.gender}
                    </h3>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">Impressions</div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {gender.impressions.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">Clicks</div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {gender.clicks.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">Conversions</div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {gender.conversions}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Geography */}
        {selectedView === "geography" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Geographic Performance
              </h2>
              <MapPin className="w-5 h-5 text-gray-500" />
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-600">
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Location</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Share</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Impressions</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Clicks</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Conversions</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topLocations.map((location, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {location.city}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {location.country}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${location.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {location.percentage}%
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {location.impressions.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {location.clicks.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {location.conversions}
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {location.revenue}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Devices */}
        {selectedView === "devices" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Device Performance
              </h2>
              <Smartphone className="w-5 h-5 text-gray-500" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {deviceData.map((device, index) => {
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
                      <span className="text-xl font-bold text-gray-900 dark:text-white">
                        {device.percentage}%
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Impressions</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {device.impressions.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Clicks</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {device.clicks.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Conversions</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {device.conversions}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Avg. Session</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {device.avgSessionDuration}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Bounce Rate</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {device.bounceRate}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Interests */}
        {selectedView === "interests" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Audience Interests
              </h2>
              <Heart className="w-5 h-5 text-gray-500" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {interests.map((interest, index) => {
                const Icon = interest.icon;
                return (
                  <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-8 h-8 ${interest.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${getEngagementColor(interest.engagement)}`}>
                        {interest.engagement}
                      </span>
                    </div>
                    
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                      {interest.category}
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {interest.percentage}%
                      </span>
                      <div className="w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`${interest.color} h-2 rounded-full`}
                          style={{ width: `${interest.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Behavior */}
        {selectedView === "behavior" && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Visitor Behavior
                </h2>
                <Activity className="w-5 h-5 text-gray-500" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {behaviorData.map((segment, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {segment.segment}
                      </h3>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {segment.percentage}%
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Avg. Session Duration</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {segment.avgSessionDuration}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Pages per Session</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {segment.pagesPerSession}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Conversion Rate</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {segment.conversionRate}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Customer Value</span>
                        <span className={`font-medium ${
                          segment.value === 'High' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {segment.value}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Timing */}
        {selectedView === "timing" && (
          <div className="space-y-8">
            {/* Day of Week Performance */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Day of Week Performance
                </h2>
                <Calendar className="w-5 h-5 text-gray-500" />
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-600">
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Day</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Impressions</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Clicks</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Conversions</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dayOfWeekData.map((day, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="py-4 px-4 font-medium text-gray-900 dark:text-white">
                          {day.day}
                        </td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                          {day.impressions.toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                          {day.clicks.toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                          {day.conversions}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`capitalize ${getPerformanceColor(day.performance)}`}>
                            {day.performance}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Hourly Performance Chart Placeholder */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Hourly Performance
                </h2>
                <Clock className="w-5 h-5 text-gray-500" />
              </div>
              
              <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Hourly performance chart
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Shows audience activity by hour of day
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudienceReport;

