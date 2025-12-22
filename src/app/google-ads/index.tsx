"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import OverviewCards from "@/components/Dashboard/GoogleAds/Charts/OverviewCards";
import PerformanceChart from "@/components/Dashboard/GoogleAds/Charts/PerformanceChart";
import RecentCampaigns from "@/components/Dashboard/GoogleAds/Common/RecentCampaigns";
import QuickActions from "@/components/Dashboard/GoogleAds/Common/QuickActions";
import {
  LayoutDashboard,
  TrendingUp,
  Activity,
  Zap,
  RefreshCw,
  Settings,
  Bell,
  Calendar,
  Filter,
  Download,
  Maximize2,
  Grid3X3,
  List,
  Eye,
  EyeOff
} from "lucide-react";

const Dashboard: React.FC = () => {
  const searchParams = useSearchParams();
  const section = searchParams.get("section");

  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [visibleSections, setVisibleSections] = useState({
    overview: true,
    performance: true,
    campaigns: true,
    actions: true
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize dashboard
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API refresh
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRefreshing(false);
  };

  // Toggle section visibility
  const toggleSection = (sectionKey: keyof typeof visibleSections) => {
    setVisibleSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Dashboard sections configuration
  const dashboardSections: Array<{
    key: keyof typeof visibleSections;
    title: string;
    description: string;
    icon: any;
    component: any;
    visible: boolean;
  }> = [
      {
        key: "overview",
        title: "Performance Overview",
        description: "Key metrics and KPIs",
        icon: TrendingUp,
        component: OverviewCards,
        visible: visibleSections.overview
      },
      {
        key: "performance",
        title: "Performance Analytics",
        description: "Detailed charts and trends",
        icon: Activity,
        component: PerformanceChart,
        visible: visibleSections.performance
      },
      {
        key: "campaigns",
        title: "Recent Campaigns",
        description: "Campaign management",
        icon: LayoutDashboard,
        component: RecentCampaigns,
        visible: visibleSections.campaigns
      },
      {
        key: "actions",
        title: "Quick Actions",
        description: "Workflow shortcuts",
        icon: Zap,
        component: QuickActions,
        visible: visibleSections.actions
      }
    ];

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="w-64 h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="w-96 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="flex space-x-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>

      {/* Content skeleton */}
      <div className="space-y-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="w-48 h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Dashboard header
  const DashboardHeader = () => (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard Overview
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor your advertising performance and manage campaigns
        </p>
        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>Last updated: {new Date().toLocaleString()}</span>
          </div>
          {isRefreshing && (
            <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Refreshing...</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* View Mode Toggle */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md transition-colors ${viewMode === "grid"
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            title="Grid View"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md transition-colors ${viewMode === "list"
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
          title="Refresh Dashboard"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} />
        </button>

        <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" title="Export Data">
          <Download className="w-5 h-5" />
        </button>

        <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" title="Dashboard Settings">
          <Settings className="w-5 h-5" />
        </button>

        <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" title="Notifications">
          <Bell className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  // Section visibility controls
  const SectionControls = () => (
    <div className="bg-white dark:bg-[#1e293b] rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          Dashboard Sections
        </h3>
        <div className="flex items-center space-x-2">
          {dashboardSections.map(section => {
            const Icon = section.icon;
            return (
              <button
                key={section.key}
                onClick={() => toggleSection(section.key)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${section.visible
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                title={`Toggle ${section.title}`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{section.title}</span>
                {section.visible ? (
                  <Eye className="w-3 h-3" />
                ) : (
                  <EyeOff className="w-3 h-3" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Render dashboard content
  const renderDashboardContent = () => {
    if (isLoading) {
      return <LoadingSkeleton />;
    }

    const visibleSectionsList = dashboardSections.filter(section => section.visible);

    if (visibleSectionsList.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mx-auto mb-4">
            <EyeOff className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No sections visible
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Enable dashboard sections to view your data
          </p>
        </div>
      );
    }

    return (
      <div className={`space-y-8 ${viewMode === "grid" ? "" : "space-y-4"}`}>
        {visibleSectionsList.map(section => {
          const Component = section.component;
          const Icon = section.icon;

          return (
            <div key={section.key} className="group">
              {viewMode === "list" && (
                <div className="flex items-center space-x-2 mb-4">
                  <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {section.title}
                  </h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {section.description}
                  </span>
                </div>
              )}
              <div className={`${viewMode === "list" ? "pl-7" : ""}`}>
                <Component />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Handle specific section routing
  if (section && section !== "overview") {
    // This would be handled by the parent dashboard page component
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardHeader />
        <SectionControls />
        {renderDashboardContent()}
      </div>
    </div>
  );
};

export default Dashboard;

