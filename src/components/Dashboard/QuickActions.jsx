"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Zap,
  Target,
  BarChart3,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Bell,
  Calendar,
  Users,
  TrendingUp,
  Eye,
  MousePointer,
  DollarSign,
  Search,
  Play,
  Pause,
  Copy,
  Edit3,
  FileText,
  Lightbulb,
  Rocket,
  Shield,
  Globe,
  Clock,
  ArrowRight,
  ExternalLink,
  BookOpen,
  HelpCircle,
  Star,
  Award
} from "lucide-react";

const QuickActions = () => {
  const [recentActions, setRecentActions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // Mock recent actions data
  const mockRecentActions = [
    {
      id: 1,
      action: "Created new campaign",
      campaign: "Summer Sale 2024",
      timestamp: "2 hours ago",
      type: "create",
      icon: Plus
    },
    {
      id: 2,
      action: "Paused campaign",
      campaign: "Brand Awareness",
      timestamp: "5 hours ago",
      type: "pause",
      icon: Pause
    },
    {
      id: 3,
      action: "Updated budget",
      campaign: "Holiday Special",
      timestamp: "1 day ago",
      type: "edit",
      icon: Edit3
    },
    {
      id: 4,
      action: "Downloaded report",
      campaign: "Q2 Performance",
      timestamp: "2 days ago",
      type: "download",
      icon: Download
    }
  ];

  // Mock notifications
  const mockNotifications = [
    {
      id: 1,
      title: "Campaign budget alert",
      message: "Summer Sale campaign has used 90% of budget",
      type: "warning",
      timestamp: "1 hour ago"
    },
    {
      id: 2,
      title: "Performance milestone",
      message: "Holiday Special reached 1000 conversions!",
      type: "success",
      timestamp: "3 hours ago"
    },
    {
      id: 3,
      title: "Optimization suggestion",
      message: "Consider increasing bid for high-performing keywords",
      type: "info",
      timestamp: "1 day ago"
    }
  ];

  // Load data
  useEffect(() => {
    setTimeout(() => {
      setRecentActions(mockRecentActions);
      setNotifications(mockNotifications);
      setIsLoading(false);
    }, 800);
  }, []);

  // Quick action configurations
  const quickActions = [
    {
      id: "new-campaign",
      title: "New Campaign",
      description: "Create a new advertising campaign",
      icon: Plus,
      color: "blue",
      action: () => console.log("Create new campaign"),
      shortcut: "Ctrl+N"
    },
    {
      id: "campaign-wizard",
      title: "Campaign Wizard",
      description: "AI-powered campaign creation",
      icon: Zap,
      color: "purple",
      action: () => console.log("Open campaign wizard"),
      badge: "AI"
    },
    {
      id: "keyword-research",
      title: "Keyword Research",
      description: "Find high-performing keywords",
      icon: Search,
      color: "green",
      action: () => console.log("Open keyword research"),
      shortcut: "Ctrl+K"
    },
    {
      id: "performance-report",
      title: "Performance Report",
      description: "Generate detailed analytics",
      icon: BarChart3,
      color: "orange",
      action: () => console.log("Generate report"),
      shortcut: "Ctrl+R"
    },
    {
      id: "audience-insights",
      title: "Audience Insights",
      description: "Analyze your target audience",
      icon: Users,
      color: "teal",
      action: () => console.log("View audience insights")
    },
    {
      id: "budget-optimizer",
      title: "Budget Optimizer",
      description: "Optimize campaign budgets",
      icon: Target,
      color: "red",
      action: () => console.log("Open budget optimizer"),
      badge: "New"
    },
    {
      id: "bulk-operations",
      title: "Bulk Operations",
      description: "Manage multiple campaigns",
      icon: Settings,
      color: "gray",
      action: () => console.log("Open bulk operations")
    },
    {
      id: "export-data",
      title: "Export Data",
      description: "Download campaign data",
      icon: Download,
      color: "indigo",
      action: () => console.log("Export data")
    }
  ];

  // Suggested actions based on performance
  const suggestedActions = [
    {
      id: "optimize-bids",
      title: "Optimize Bid Strategies",
      description: "Improve performance with smart bidding",
      icon: TrendingUp,
      priority: "high",
      impact: "High ROI potential"
    },
    {
      id: "expand-keywords",
      title: "Expand Keyword List",
      description: "Add high-potential keywords to campaigns",
      icon: Lightbulb,
      priority: "medium",
      impact: "Increase reach"
    },
    {
      id: "update-ads",
      title: "Refresh Ad Creatives",
      description: "Update ad copy and visuals for better CTR",
      icon: Rocket,
      priority: "medium",
      impact: "Improve engagement"
    },
    {
      id: "review-negatives",
      title: "Review Negative Keywords",
      description: "Optimize negative keyword lists",
      icon: Shield,
      priority: "low",
      impact: "Reduce wasted spend"
    }
  ];

  // Learning resources
  const learningResources = [
    {
      id: "best-practices",
      title: "Campaign Best Practices",
      description: "Learn proven strategies for success",
      icon: BookOpen,
      type: "guide"
    },
    {
      id: "optimization-tips",
      title: "Optimization Tips",
      description: "Weekly tips to improve performance",
      icon: Star,
      type: "tips"
    },
    {
      id: "case-studies",
      title: "Success Case Studies",
      description: "Real examples from top advertisers",
      icon: Award,
      type: "case-study"
    },
    {
      id: "help-center",
      title: "Help Center",
      description: "Get answers to common questions",
      icon: HelpCircle,
      type: "help"
    }
  ];

  // Color configurations
  const colorConfigs = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-200 dark:border-blue-800",
      text: "text-blue-700 dark:text-blue-400",
      icon: "text-blue-600 dark:text-blue-400",
      hover: "hover:bg-blue-100 dark:hover:bg-blue-900/30"
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-900/20",
      border: "border-purple-200 dark:border-purple-800",
      text: "text-purple-700 dark:text-purple-400",
      icon: "text-purple-600 dark:text-purple-400",
      hover: "hover:bg-purple-100 dark:hover:bg-purple-900/30"
    },
    green: {
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-200 dark:border-green-800",
      text: "text-green-700 dark:text-green-400",
      icon: "text-green-600 dark:text-green-400",
      hover: "hover:bg-green-100 dark:hover:bg-green-900/30"
    },
    orange: {
      bg: "bg-orange-50 dark:bg-orange-900/20",
      border: "border-orange-200 dark:border-orange-800",
      text: "text-orange-700 dark:text-orange-400",
      icon: "text-orange-600 dark:text-orange-400",
      hover: "hover:bg-orange-100 dark:hover:bg-orange-900/30"
    },
    teal: {
      bg: "bg-teal-50 dark:bg-teal-900/20",
      border: "border-teal-200 dark:border-teal-800",
      text: "text-teal-700 dark:text-teal-400",
      icon: "text-teal-600 dark:text-teal-400",
      hover: "hover:bg-teal-100 dark:hover:bg-teal-900/30"
    },
    red: {
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-200 dark:border-red-800",
      text: "text-red-700 dark:text-red-400",
      icon: "text-red-600 dark:text-red-400",
      hover: "hover:bg-red-100 dark:hover:bg-red-900/30"
    },
    gray: {
      bg: "bg-gray-50 dark:bg-gray-900/20",
      border: "border-gray-200 dark:border-gray-800",
      text: "text-gray-700 dark:text-gray-400",
      icon: "text-gray-600 dark:text-gray-400",
      hover: "hover:bg-gray-100 dark:hover:bg-gray-900/30"
    },
    indigo: {
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
      border: "border-indigo-200 dark:border-indigo-800",
      text: "text-indigo-700 dark:text-indigo-400",
      icon: "text-indigo-600 dark:text-indigo-400",
      hover: "hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
    }
  };

  // Priority colors
  const priorityColors = {
    high: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30",
    medium: "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30",
    low: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30"
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div>
              <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="w-48 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // Quick action card component
  const QuickActionCard = ({ action }) => {
    const colors = colorConfigs[action.color];
    const Icon = action.icon;

    return (
      <button
        onClick={action.action}
        className={`w-full p-4 rounded-lg border transition-all duration-200 text-left group ${colors.bg} ${colors.border} ${colors.hover} hover:shadow-md hover:scale-105`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2 rounded-lg ${colors.bg} border ${colors.border}`}>
            <Icon className={`w-5 h-5 ${colors.icon}`} />
          </div>
          <div className="flex items-center space-x-2">
            {action.badge && (
              <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">
                {action.badge}
              </span>
            )}
            {action.shortcut && (
              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                {action.shortcut}
              </span>
            )}
          </div>
        </div>
        <h3 className={`font-semibold mb-1 ${colors.text} group-hover:text-opacity-80`}>
          {action.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {action.description}
        </p>
        <div className="flex items-center justify-end mt-3">
          <ArrowRight className={`w-4 h-4 ${colors.icon} opacity-0 group-hover:opacity-100 transition-opacity`} />
        </div>
      </button>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Quick Actions
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Streamline your workflow with one-click actions
          </p>
        </div>
        <button className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
          <Settings className="w-4 h-4" />
          <span className="text-sm">Customize</span>
        </button>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Common Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map(action => (
            <QuickActionCard key={action.id} action={action} />
          ))}
        </div>
      </div>

      {/* Suggested Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Suggested Actions
        </h3>
        <div className="space-y-3">
          {suggestedActions.map(action => {
            const Icon = action.icon;
            return (
              <div key={action.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 group cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {action.title}
                        </h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColors[action.priority]}`}>
                          {action.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {action.description}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <TrendingUp className="w-3 h-3" />
                        <span>{action.impact}</span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout for Recent Actions and Learning Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Actions */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Actions
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {recentActions.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentActions.map(action => {
                  const Icon = action.icon;
                  return (
                    <div key={action.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {action.action}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {action.campaign}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {action.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">No recent actions</p>
              </div>
            )}
          </div>
        </div>

        {/* Learning Resources */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Learning Resources
          </h3>
          <div className="space-y-3">
            {learningResources.map(resource => {
              const Icon = resource.icon;
              return (
                <div key={resource.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 group cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {resource.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {resource.description}
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Notifications Panel */}
      {notifications.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Notifications
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {notifications.map(notification => (
                <div key={notification.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className={`p-1 rounded-full ${
                      notification.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                      notification.type === 'success' ? 'bg-green-100 dark:bg-green-900/30' :
                      'bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                      <Bell className={`w-3 h-3 ${
                        notification.type === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                        notification.type === 'success' ? 'text-green-600 dark:text-green-400' :
                        'text-blue-600 dark:text-blue-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {notification.message}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {notification.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActions;

