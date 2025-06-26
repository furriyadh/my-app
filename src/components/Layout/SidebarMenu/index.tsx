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
  const [googleAdsOpen, setGoogleAdsOpen] = React.useState<boolean>(false);
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

  const toggleGoogleAds = () => {
    setGoogleAdsOpen(!googleAdsOpen);
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
      <div className="sidebar-area bg-white dark:bg-[#0c1427] fixed z-[7] top-0 h-screen w-[300px] overflow-y-auto border-r border-gray-200 dark:border-gray-700 flex flex-col">
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
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 mb-3">
              DASHBOARD
            </h3>
            
            {/* Overview */}
            <Link
              href="/dashboard?section=overview"
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                pathname === '/dashboard' && !new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('section')
                  ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Overview</span>
            </Link>

            {/* Analytics */}
            <Link
              href="/dashboard?section=analytics"
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('section') === 'analytics'
                  ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Analytics</span>
            </Link>

            {/* Reports */}
            <Link
              href="/dashboard?section=reports"
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('section') === 'reports'
                  ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Reports</span>
            </Link>

            {/* Campaigns */}
            <Link
              href="/dashboard?section=campaigns"
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('section') === 'campaigns'
                  ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              <span>Campaigns</span>
            </Link>

            {/* Performance */}
            <Link
              href="/dashboard?section=performance"
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('section') === 'performance'
                  ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>Performance</span>
            </Link>
          </div>

          {/* Advertising Platforms Section */}
          <div className="mt-8 space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 mb-3">
              ADVERTISING PLATFORMS
            </h3>
            
            {/* Google Ads Accordion */}
            <div className="space-y-1">
              <button
                onClick={toggleGoogleAds}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                  new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('section')?.includes('google') || pathname === '/new-campaign'
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-green-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">G</span>
                  </div>
                  <span>Google Ads</span>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    googleAdsOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Google Ads Sub-menu */}
              {googleAdsOpen && (
                <div className="ml-6 space-y-1 border-l border-gray-200 dark:border-gray-700 pl-4">
                  {/* NEW CAMPAIGN - في المقدمة بدلاً من Dashboard */}
                  <Link
                    href="/new-campaign"
                    className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                      pathname === '/new-campaign'
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>New Campaign</span>
                  </Link>
                  
                  <Link
                    href="/dashboard?section=google-campaigns"
                    className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                      new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('section') === 'google-campaigns'
                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    Campaigns
                  </Link>
                  
                  <Link
                    href="/dashboard?section=campaign-wizard"
                    className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                      new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('section') === 'campaign-wizard'
                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    Campaign Wizard
                  </Link>
                  
                  <Link
                    href="/dashboard?section=basic-info"
                    className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                      new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('section') === 'basic-info'
                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    Basic Info
                  </Link>
                  
                  <Link
                    href="/dashboard?section=budget-settings"
                    className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                      new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('section') === 'budget-settings'
                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    Budget Settings
                  </Link>
                  
                  <Link
                    href="/dashboard?section=targeting-options"
                    className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                      new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('section') === 'targeting-options'
                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    Targeting Options
                  </Link>
                  
                  <Link
                    href="/dashboard?section=asset-upload"
                    className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                      new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('section') === 'asset-upload'
                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    Asset Upload
                  </Link>
                  
                  <Link
                    href="/dashboard?section=ai-analysis"
                    className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                      new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('section') === 'ai-analysis'
                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    AI Analysis
                  </Link>
                  
                  <Link
                    href="/dashboard?section=campaign-preview"
                    className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                      new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('section') === 'campaign-preview'
                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    Campaign Preview
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Account Management Section */}
          <div className="mt-8 space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 mb-3">
              ACCOUNT MANAGEMENT
            </h3>
            
            {/* Billing */}
            <Link
              href="/dashboard?section=billing"
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('section') === 'billing'
                  ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span>Billing</span>
            </Link>

            {/* My Profile */}
            <Link
              href="/dashboard?section=profile"
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('section') === 'profile'
                  ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>My Profile</span>
            </Link>

            {/* Settings */}
            <Link
              href="/dashboard?section=settings"
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('section') === 'settings'
                  ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Settings</span>
            </Link>
          </div>
        </div>

        {/* Logout Button */}
        <div className="sidebar-footer p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default SidebarMenu;

