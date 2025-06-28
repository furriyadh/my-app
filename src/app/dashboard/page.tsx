"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AccountSelectionModal from "@/components/Modals/AccountSelectionModal";
import { AccountOption } from "@/types/modal";
import Dashboard from "@/components/Dashboard";
import OverviewCards from "@/components/Dashboard/OverviewCards";
import PerformanceChart from "@/components/Dashboard/PerformanceChart";
import RecentCampaigns from "@/components/Dashboard/RecentCampaigns";
import QuickActions from "@/components/Dashboard/QuickActions";
import GoogleAds from "@/components/Dashboard/GoogleAds";

const DashboardPage: React.FC = () => {
  const searchParams = useSearchParams();
  const section = searchParams.get("section") || "overview";
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);

  // Check if user is first time visitor
  useEffect(() => {
    const hasVisited = localStorage.getItem('furriyadh_user_visited');
    const accountType = localStorage.getItem('furriyadh_account_type');
    
    if (!hasVisited || !accountType) {
      setIsFirstTimeUser(true);
      setShowModal(true);
    }
  }, []);

  const handleModalSelect = (option: AccountOption) => {
    // Save user choice
    localStorage.setItem('furriyadh_account_type', option);
    localStorage.setItem('furriyadh_user_visited', 'true');
    
    setShowModal(false);
    setIsFirstTimeUser(false);
    
    // Handle routing based on selection
    switch (option) {
      case 'own-accounts':
        window.location.href = '/new-campaign?type=connect';
        break;
      case 'furriyadh-managed':
        window.location.href = '/new-campaign?type=managed';
        break;
      case 'new-account':
        window.location.href = '/new-campaign?type=new';
        break;
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    // Mark as visited even if closed without selection
    localStorage.setItem('furriyadh_user_visited', 'true');
  };

  const renderSection = () => {
    switch (section) {
      // Main Dashboard Sections
      case "analytics":
        return (
          <div className="p-6 space-y-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Deep insights into your advertising performance and user behavior
              </p>
            </div>
            
            {/* Analytics Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PerformanceChart />
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Traffic Sources
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Google Ads</span>
                    <span className="font-medium text-gray-900 dark:text-white">45.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Direct Traffic</span>
                    <span className="font-medium text-gray-900 dark:text-white">28.7%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Social Media</span>
                    <span className="font-medium text-gray-900 dark:text-white">16.3%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Email Marketing</span>
                    <span className="font-medium text-gray-900 dark:text-white">9.8%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <OverviewCards />
          </div>
        );

      case "reports":
        return (
          <div className="p-6 space-y-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Reports & Insights
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Comprehensive reports and data analysis for your campaigns
              </p>
            </div>
            
            {/* Reports Content */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <PerformanceChart />
              </div>
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Quick Reports
                  </h3>
                  <div className="space-y-3">
                    <button className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                      <div className="font-medium text-gray-900 dark:text-white">Weekly Performance</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Last 7 days summary</div>
                    </button>
                    <button className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                      <div className="font-medium text-gray-900 dark:text-white">Monthly Trends</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">30-day analysis</div>
                    </button>
                    <button className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                      <div className="font-medium text-gray-900 dark:text-white">Campaign ROI</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Return on investment</div>
                    </button>
                  </div>
                </div>
                <QuickActions />
              </div>
            </div>
          </div>
        );

      case "campaigns":
        return (
          <div className="p-6 space-y-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Campaign Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage and monitor all your advertising campaigns
              </p>
            </div>
            
            {/* Campaigns Content */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              <div className="xl:col-span-3">
                <RecentCampaigns />
              </div>
              <div className="space-y-6">
                <QuickActions />
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Campaign Stats
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Active Campaigns</span>
                      <span className="font-bold text-green-600">12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Paused Campaigns</span>
                      <span className="font-bold text-yellow-600">3</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Draft Campaigns</span>
                      <span className="font-bold text-gray-600">5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Budget</span>
                      <span className="font-bold text-blue-600">$15,420</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "performance":
        return (
          <div className="p-6 space-y-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Performance Metrics
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track key performance indicators and optimize your campaigns
              </p>
            </div>
            
            {/* Performance Content */}
            <OverviewCards />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PerformanceChart />
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Performance Goals
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600 dark:text-gray-400">CTR Goal</span>
                      <span className="font-medium text-gray-900 dark:text-white">2.5%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '85%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Conversion Rate</span>
                      <span className="font-medium text-gray-900 dark:text-white">4.2%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '70%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600 dark:text-gray-400">ROAS Target</span>
                      <span className="font-medium text-gray-900 dark:text-white">3.5x</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{width: '92%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      // Google Ads Sections
      case "google-dashboard":
      case "google-campaigns":
      case "campaign-wizard":
      case "basic-info":
      case "budget-settings":
      case "targeting-options":
      case "asset-upload":
      case "ai-analysis":
      case "campaign-preview":
        return <GoogleAds />;

      // Account Management Sections
      case "billing":
        return (
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Billing & Payments
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your subscription, payments, and billing information
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Billing Management
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  View your current plan, payment history, and manage billing settings
                </p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
                  Manage Billing
                </button>
              </div>
            </div>
          </div>
        );

      case "profile":
        return (
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                My Profile
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your personal information and account preferences
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Profile Settings
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Update your profile information, password, and notification preferences
                </p>
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors">
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Configure your account settings and application preferences
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Application Settings
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Customize your dashboard experience and notification preferences
                </p>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors">
                  Configure Settings
                </button>
              </div>
            </div>
          </div>
        );

      case "overview":
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {renderSection()}
      
      {/* Account Selection Modal for First Time Users */}
      <AccountSelectionModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSelect={handleModalSelect}
      />
    </div>
  );
};

export default DashboardPage;

