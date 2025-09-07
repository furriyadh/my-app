"use client";

import React, { useState, useEffect } from 'react';
import AccountSelectionModal from '@/components/Modals/AccountSelectionModal';
import { AccountOption } from '@/types/modal';

export default function OnboardingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<AccountOption | null>(null);

  // Open modal automatically when page loads (simulating first-time user)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsModalOpen(true);
    }, 1000); // Delay for dramatic effect

    return () => clearTimeout(timer);
  }, []);

  const handleOptionSelect = (option: string) => {
    const accountOption = option as AccountOption;
    setSelectedOption(accountOption);
    setIsModalOpen(false);
    
    // Handle routing based on selection
    console.log('Selected option:', accountOption);
    
    // All options now redirect to New Campaign page
    // Backend will handle different logic based on the selected option
    switch (accountOption) {
      case 'own-accounts':
        // Connect existing Google Ads account -> New Campaign
        window.location.href = '/new-campaign?type=connect';
        break;
      case 'furriyadh-managed':
        // Use Furriyadh managed accounts -> New Campaign
        window.location.href = '/new-campaign?type=managed';
        break;
      case 'new-account':
        // Create new account with Furriyadh -> New Campaign
        window.location.href = '/new-campaign?type=new';
        break;
      default:
        console.error('Unknown option selected:', accountOption);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen">
      {/* Dashboard Content (will be blurred when modal is open) */}
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome to Furriyadh
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Your AI-powered advertising platform
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Stats Cards */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Campaigns</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">24</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ad Spend</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">$12,450</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Conversions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">1,247</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Campaign Performance
            </h3>
            <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">Chart Placeholder</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">Campaign updated</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Test Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
          >
            Show Account Selection Modal
          </button>
        </div>

        {/* Selection Result */}
        {selectedOption && (
          <div className="mt-6 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg text-center">
            <p className="text-green-800 dark:text-green-400">
              Selected option: <strong>{selectedOption}</strong>
            </p>
          </div>
        )}
      </div>

      {/* Account Selection Modal */}
      <AccountSelectionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSelect={handleOptionSelect}
      />
    </div>
  );
}

