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

  const [isOrganizationDropdownOpen, setIsOrganizationDropdownOpen] = React.useState(false);
  const [userPlan, setUserPlan] = React.useState<'basic' | 'premium'>('basic');

  const toggleOrganizationDropdown = () => {
    setIsOrganizationDropdownOpen(!isOrganizationDropdownOpen);
  };

  // Helper functions for active states
  const isOverviewActive = () => {
    return pathname === '/dashboard' || pathname?.includes('section=overview');
  };

  const isActiveSection = (section: string) => {
    return pathname?.includes(`section=${section}`);
  };

  return (
    <>
      <div className="sidebar-area fixed z-[100] top-0 h-screen w-[300px] overflow-y-auto overflow-x-hidden border-r border-gray-700 flex flex-col scrollbar-hide" style={{backgroundColor: '#060010'}}>
        <style jsx>{`
          .scrollbar-hide {
            -ms-overflow-style: none;  /* Internet Explorer 10+ */
            scrollbar-width: none;  /* Firefox */
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;  /* Safari and Chrome */
          }
        `}</style>

        <div className="flex-1 px-4 py-6">
          {/* Organization Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">O</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Organization Name
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                      Basic Plan
                    </span>
                  </div>
                </div>
              </div>
            </div>
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
                  ? 'bg-white/20 backdrop-blur-sm border border-blue-300/30 text-blue-200 shadow-lg border-l-4 border-blue-500 transform scale-[1.02]'
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

            {/* New Campaign */}
            <Link
              href="/campaign/new"
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-300 relative ${
                pathname === '/campaign/new'
                  ? 'bg-white/20 backdrop-blur-sm border border-green-300/30 text-green-200 shadow-lg border-l-4 border-green-500 transform scale-[1.02]'
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
              {pathname === '/campaign/new' && (
                <div className="absolute right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              )}
            </Link>

            {/* Integrations */}
            <Link
              href="/integrations"
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-300 relative ${
                pathname === '/integrations'
                  ? 'bg-white/20 backdrop-blur-sm border border-purple-300/30 text-purple-200 shadow-lg border-l-4 border-purple-500 transform scale-[1.02]'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-purple-50/70 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300 hover:shadow-sm'
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="text-sm font-medium">Integrations</span>
              <span className="ml-auto bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[10px] px-2 py-0.5 rounded-full font-medium">
                Connect
              </span>
              {pathname === '/integrations' && (
                <div className="absolute right-2 w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              )}
            </Link>



            {/* Asset Upload */}
            <Link
              href="/dashboard?section=asset-upload"
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-300 relative ${
                isActiveSection('asset-upload')
                  ? 'bg-white/20 backdrop-blur-sm border border-blue-300/30 text-blue-200 shadow-lg border-l-4 border-blue-500 transform scale-[1.02]'
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
          </div>

          {/* Account Management Section */}
          <div className="mt-8 space-y-1">
            <h3 className="uppercase tracking-widest px-3 mb-3" style={{fontSize: '12px', fontWeight: '600', color: '#4B5563', opacity: '0.9'}}>
              ACCOUNT MANAGEMENT
            </h3>
            
            {/* Accounts */}
            <Link
              href="/accounts"
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-300 relative ${
                pathname === '/accounts'
                  ? 'bg-white/20 backdrop-blur-sm border border-gray-300/30 text-gray-200 shadow-lg border-l-4 border-gray-500 transform scale-[1.02]'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-200 hover:shadow-sm'
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <span className="text-sm font-medium">Accounts</span>
              {pathname === '/accounts' && (
                <div className="absolute right-2 w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
              )}
            </Link>

            {/* Settings */}
            <Link
              href="/settings"
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-300 relative ${
                pathname === '/settings'
                  ? 'bg-white/20 backdrop-blur-sm border border-gray-300/30 text-gray-200 shadow-lg border-l-4 border-gray-500 transform scale-[1.02]'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-200 hover:shadow-sm'
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium">Settings</span>
              {pathname === '/settings' && (
                <div className="absolute right-2 w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      <div className="fixed inset-0 z-[99] bg-black/50 lg:hidden" onClick={toggleActive}></div>
    </>
  );
};

export default SidebarMenu;