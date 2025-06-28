"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

interface SidebarMenuProps {
  toggleActive: () => void;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ toggleActive }) => {
  const pathname = usePathname();
  const router = useRouter();

  // Initialize openIndex to 0 to open the first item by default
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);
  const [isOrganizationDropdownOpen, setIsOrganizationDropdownOpen] = React.useState(false);
  // Plan types: 'basic', 'premium' (no free plan)
  const [userPlan, setUserPlan] = React.useState<'basic' | 'premium'>('basic'); // Default to basic plan
  const [existingBusinessesCount, setExistingBusinessesCount] = React.useState(1); // Simulate 1 existing business
  const [remainingBalance, setRemainingBalance] = React.useState(0); // Simulate remaining balance

  // Plan limits
  const planLimits = {
    basic: 3,     // Basic plan ($29): 3 businesses  
    premium: -1   // Premium plan ($120): unlimited businesses
  };

  // Check if user can add more businesses
  const canAddMoreBusinesses = () => {
    const limit = planLimits[userPlan];
    if (limit === -1) return true; // Unlimited for premium
    return existingBusinessesCount < limit;
  };

  // Get upgrade message based on current plan
  const getUpgradeMessage = () => {
    if (userPlan === 'basic') {
      return 'Upgrade to Premium ($120) for unlimited businesses.';
    }
    return '';
  };

  const toggleOrganizationDropdown = () => {
    setIsOrganizationDropdownOpen(!isOrganizationDropdownOpen);
  };

  const toggleAccordion = (index: number) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  // Helper function to check if a menu item is active
  const isActiveSection = (section: string) => {
    const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const currentSection = searchParams.get('section');
    return currentSection === section;
  };

  // Helper function to check if overview is active (no section parameter)
  const isOverviewActive = () => {
    const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const currentSection = searchParams.get('section');
    return pathname === '/dashboard' && !currentSection;
  };

  const handleLogout = async () => {
    // Show confirmation dialog
    const confirmLogout = confirm('هل أنت متأكد من تسجيل الخروج؟');
    
    if (confirmLogout) {
      try {
        // Clear all stored data
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear cookies
        document.cookie.split(";").forEach((c) => {
          const eqPos = c.indexOf("=");
          const name = eqPos > -1 ? c.substr(0, eqPos) : c;
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        });

        // Call logout API if exists
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
        } catch (error) {
          console.log('Logout API not available, proceeding with client-side logout');
        }

        // Force page reload and redirect to home
        window.location.href = '/';
        
        // Alternative: use router if the above doesn't work
        // router.push('/');
        // router.refresh();
        
      } catch (error) {
        console.error('Logout error:', error);
        // Force redirect even if there's an error
        window.location.href = '/';
      }
    }
  };

  return (
    <>
      <div className="sidebar-area bg-white dark:bg-[#0c1427] fixed z-[7] top-0 h-screen w-[300px] overflow-y-auto overflow-x-hidden border-r border-gray-200 dark:border-gray-700 flex flex-col scrollbar-hide">
        <style jsx>{`
          .scrollbar-hide {
            -ms-overflow-style: none;  /* Internet Explorer 10+ */
            scrollbar-width: none;  /* Firefox */
          }
          .scrollbar-hide::-webkit-scrollbar { 
            display: none;  /* Safari and Chrome */
          }
        `}</style>
        <div className="sidebar-header p-6 border-b border-gray-200 dark:border-gray-700">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Furriyadh
            </span>
          </Link>
        </div>

        <div className="sidebar-content p-4 flex-1">
          {/* Organization Dropdown */}
          <div className="mb-6">
            <button
              onClick={toggleOrganizationDropdown}
              className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">O</span>
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Organization Name
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {userPlan === 'basic' ? 'Basic Plan' : 'Premium Plan'}
                  </div>
                </div>
              </div>
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  isOrganizationDropdownOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isOrganizationDropdownOpen && (
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Plan:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {userPlan === 'basic' ? 'Basic ($29)' : 'Premium ($120)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Businesses:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {existingBusinessesCount}/{userPlan === 'basic' ? '3' : '∞'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Balance:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${remainingBalance}
                    </span>
                  </div>
                  {!canAddMoreBusinesses() && (
                    <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded text-xs text-yellow-800 dark:text-yellow-200">
                      {getUpgradeMessage()}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Main Dashboard Section */}
          <div className="space-y-1">
            <h3 className="uppercase tracking-widest px-3 mb-3" style={{fontSize: '12px', fontWeight: '600', color: '#4B5563', opacity: '0.9'}}>
              DASHBOARD
            </h3>
            
            {/* Overview */}
            <Link
              href="/dashboard?section=overview"
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-300 relative ${
                isOverviewActive()
                  ? 'bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/30 text-blue-700 dark:text-blue-300 shadow-md border-l-4 border-blue-500 transform scale-[1.02]'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-200 hover:shadow-sm'
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm font-medium">Overview</span>
              {isOverviewActive() && (
                <div className="absolute right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </Link>

            {/* New Campaign - مميز بلون أخضر */}
            <Link
              href="/new-campaign"
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-300 relative ${
                pathname === '/new-campaign'
                  ? 'bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900/40 dark:to-green-800/30 text-green-700 dark:text-green-300 shadow-md border-l-4 border-green-500 transform scale-[1.02]'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-green-50/70 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-300 hover:shadow-sm'
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-sm font-medium">New Campaign</span>
              <span className="ml-auto bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-[10px] px-2 py-0.5 rounded-full font-medium">
                Create
              </span>
              {pathname === '/new-campaign' && (
                <div className="absolute right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              )}
            </Link>

            {/* Analytics */}
            <Link
              href="/dashboard?section=analytics"
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-300 relative ${
                isActiveSection('analytics')
                  ? 'bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/30 text-blue-700 dark:text-blue-300 shadow-md border-l-4 border-blue-500 transform scale-[1.02]'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-200 hover:shadow-sm'
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm font-medium">Analytics</span>
              {isActiveSection('analytics') && (
                <div className="absolute right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </Link>

            {/* Reports */}
            <Link
              href="/dashboard?section=reports"
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-300 relative ${
                isActiveSection('reports')
                  ? 'bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/30 text-blue-700 dark:text-blue-300 shadow-md border-l-4 border-blue-500 transform scale-[1.02]'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-200 hover:shadow-sm'
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium">Reports</span>
              {isActiveSection('reports') && (
                <div className="absolute right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </Link>

            {/* Campaign Wizard */}
            <Link
              href="/dashboard?section=campaign-wizard"
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-300 relative ${
                isActiveSection('campaign-wizard')
                  ? 'bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/30 text-blue-700 dark:text-blue-300 shadow-md border-l-4 border-blue-500 transform scale-[1.02]'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-200 hover:shadow-sm'
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="text-sm font-medium">Campaign Wizard</span>
              {isActiveSection('campaign-wizard') && (
                <div className="absolute right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </Link>

            {/* Basic Info */}
            <Link
              href="/dashboard?section=basic-info"
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-300 relative ${
                isActiveSection('basic-info')
                  ? 'bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/30 text-blue-700 dark:text-blue-300 shadow-md border-l-4 border-blue-500 transform scale-[1.02]'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-200 hover:shadow-sm'
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">Basic Info</span>
              {isActiveSection('basic-info') && (
                <div className="absolute right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </Link>

            {/* Budget Settings */}
            <Link
              href="/dashboard?section=budget-settings"
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-300 relative ${
                isActiveSection('budget-settings')
                  ? 'bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/30 text-blue-700 dark:text-blue-300 shadow-md border-l-4 border-blue-500 transform scale-[1.02]'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-200 hover:shadow-sm'
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span className="text-sm font-medium">Budget Settings</span>
              {isActiveSection('budget-settings') && (
                <div className="absolute right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </Link>

            {/* Targeting Options */}
            <Link
              href="/dashboard?section=targeting-options"
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-300 relative ${
                isActiveSection('targeting-options')
                  ? 'bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/30 text-blue-700 dark:text-blue-300 shadow-md border-l-4 border-blue-500 transform scale-[1.02]'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-200 hover:shadow-sm'
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium">Targeting Options</span>
              {isActiveSection('targeting-options') && (
                <div className="absolute right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </Link>

            {/* Asset Upload */}
            <Link
              href="/dashboard?section=asset-upload"
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-300 relative ${
                isActiveSection('asset-upload')
                  ? 'bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/30 text-blue-700 dark:text-blue-300 shadow-md border-l-4 border-blue-500 transform scale-[1.02]'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-200 hover:shadow-sm'
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-sm font-medium">Asset Upload</span>
              {isActiveSection('asset-upload') && (
                <div className="absolute right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </Link>

            {/* AI Analysis */}
            <Link
              href="/dashboard?section=ai-analysis"
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-300 relative ${
                isActiveSection('ai-analysis')
                  ? 'bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/40 dark:to-purple-800/30 text-purple-700 dark:text-purple-300 shadow-md border-l-4 border-purple-500 transform scale-[1.02]'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-purple-50/70 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300 hover:shadow-sm'
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="text-sm font-medium">AI Analysis</span>
              <span className="ml-auto bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[10px] px-2 py-0.5 rounded-full font-medium">
                AI
              </span>
              {isActiveSection('ai-analysis') && (
                <div className="absolute right-2 w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              )}
            </Link>
          </div>

          {/* Account Management Section */}
          <div className="mt-8 space-y-1">
            <h3 className="uppercase tracking-widest px-3 mb-3" style={{fontSize: '12px', fontWeight: '600', color: '#4B5563', opacity: '0.9'}}>
              ACCOUNT MANAGEMENT
            </h3>
            
            {/* Billing */}
            <Link
              href="/dashboard?section=billing"
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-300 relative ${
                isActiveSection('billing')
                  ? 'bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/30 text-blue-700 dark:text-blue-300 shadow-md border-l-4 border-blue-500 transform scale-[1.02]'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-200 hover:shadow-sm'
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="text-sm font-medium">Billing</span>
              {isActiveSection('billing') && (
                <div className="absolute right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </Link>

            {/* My Profile */}
            <Link
              href="/dashboard?section=profile"
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-300 relative ${
                isActiveSection('profile')
                  ? 'bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/30 text-blue-700 dark:text-blue-300 shadow-md border-l-4 border-blue-500 transform scale-[1.02]'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-200 hover:shadow-sm'
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-sm font-medium">My Profile</span>
              {isActiveSection('profile') && (
                <div className="absolute right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </Link>

            {/* Settings */}
            <Link
              href="/dashboard?section=settings"
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-300 relative ${
                isActiveSection('settings')
                  ? 'bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/30 text-blue-700 dark:text-blue-300 shadow-md border-l-4 border-blue-500 transform scale-[1.02]'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-200 hover:shadow-sm'
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium">Settings</span>
              {isActiveSection('settings') && (
                <div className="absolute right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </Link>
          </div>
        </div>

        {/* Logout Button */}
        <div className="sidebar-footer p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default SidebarMenu;

