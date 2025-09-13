"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Plus, 
  Link as LinkIcon, 
  CloudUpload, 
  Users, 
  Settings,
  ChevronRight,
  Building2
} from "lucide-react";
 
const SidebarMenu: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const [isOrganizationDropdownOpen, setIsOrganizationDropdownOpen] = React.useState(false);
  const [userPlan, setUserPlan] = React.useState<'basic' | 'premium'>('basic');
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  const toggleOrganizationDropdown = () => {
    setIsOrganizationDropdownOpen(!isOrganizationDropdownOpen);
  };

  // Monitor dark mode changes
  React.useEffect(() => {
    // Check initially
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);

    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      console.log('🔄 SidebarMenu: Dark mode changed to:', isDark);
      setIsDarkMode(isDark);
    };

    // Watch for changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Listen to custom theme change event
    const handleThemeChange = (event: CustomEvent) => {
      console.log('🔄 SidebarMenu: Received theme change event:', event.detail);
      setIsDarkMode(event.detail.isDarkMode);
    };

    window.addEventListener('themeChanged', handleThemeChange as EventListener);

    return () => {
      observer.disconnect();
      window.removeEventListener('themeChanged', handleThemeChange as EventListener);
    };
  }, []);

  // Helper functions for active states
  const isOverviewActive = () => {
    return pathname === '/dashboard' || pathname?.includes('section=overview');
  };

  const isActiveSection = (section: string) => {
    return pathname?.includes(`section=${section}`);
  };

  return (
    <>
      <div 
        key={`sidebar-${isDarkMode ? 'dark' : 'light'}`}
        className={cn(
          "fixed z-[100] top-0 h-screen overflow-y-auto overflow-x-hidden border-r flex flex-col transition-all duration-500 ease-in-out backdrop-blur-xl",
          isDarkMode 
            ? "border-gray-700/50 bg-gray-900/95 shadow-2xl" 
            : "border-gray-200/50 bg-white/95 shadow-2xl",
          isExpanded ? "w-[300px]" : "w-[80px]"
        )}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <style jsx>{`
          .scrollbar-hide {
            -ms-overflow-style: none;  /* Internet Explorer 10+ */
            scrollbar-width: none;  /* Firefox */
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;  /* Safari and Chrome */
          }
        `}</style>

        <div className="flex-1 px-6 py-8">
          {/* Organization Header */}
          <div className="mb-10">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-4">
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Building2 className="w-6 h-6 text-white" />
                </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                </motion.div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <p className={cn(
                        "text-sm font-medium whitespace-nowrap mb-2",
                        isDarkMode ? "text-white" : "text-gray-900"
                      )}>
                        Organization Name
                      </p>
                      <div className="flex items-center space-x-3">
                        <span className={cn(
                          "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm",
                          isDarkMode 
                            ? "bg-gradient-to-r from-blue-900/60 to-purple-900/60 text-blue-200 border border-blue-700/30" 
                            : "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200"
                        )}>
                      Basic Plan
                    </span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Main Dashboard Section */}
          <div className="space-y-2">
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="px-3 mb-4"
                >
                  <p className={cn(
                    "uppercase tracking-wider text-sm font-medium text-left",
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  )}>
                    Dashboard
                  </p>
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent mt-2"></div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Overview */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
            <Link
              href="/dashboard?section=overview"
                className={cn(
                  "flex items-center justify-start px-4 py-3 rounded-xl transition-all duration-300 relative group",
                  isOverviewActive()
                    ? isDarkMode 
                      ? 'bg-gradient-to-r from-blue-900/60 to-purple-900/60 text-blue-200 shadow-lg border border-blue-700/30'
                      : 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-lg border border-blue-200'
                    : isDarkMode
                      ? 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200 hover:shadow-md hover:border-gray-700/50'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md hover:border-gray-200'
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "p-2 rounded-lg transition-colors",
                isOverviewActive()
                      ? "bg-blue-500/20"
                      : "bg-gray-100/50 dark:bg-gray-800/50 group-hover:bg-blue-500/10"
                  )}>
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1"
                      >
                        <span className="text-sm font-semibold">Overview</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {isOverviewActive() && isExpanded && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-3 w-2 h-2 bg-blue-500 rounded-full"
                  />
              )}
            </Link>
            </motion.div>

            {/* New Campaign */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
            <Link
              href="/campaign/new"
                className={cn(
                  "flex items-center justify-start px-4 py-3 rounded-xl transition-all duration-300 relative group",
                  pathname === '/campaign/new'
                    ? isDarkMode 
                      ? 'bg-gradient-to-r from-green-900/60 to-emerald-900/60 text-green-200 shadow-lg border border-green-700/30'
                      : 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 shadow-lg border border-green-200'
                    : isDarkMode
                      ? 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200 hover:shadow-md hover:border-gray-700/50'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md hover:border-gray-200'
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "p-2 rounded-lg transition-colors",
                pathname === '/campaign/new'
                      ? "bg-green-500/20"
                      : "bg-gray-100/50 dark:bg-gray-800/50 group-hover:bg-green-500/10"
                  )}>
                    <Plus className="w-5 h-5" />
                  </div>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1 flex items-center justify-between"
                      >
                        <span className="text-sm font-semibold">New Campaign</span>
                        <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-sm">
                Create
              </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {pathname === '/campaign/new' && isExpanded && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-3 w-2 h-2 bg-green-500 rounded-full"
                  />
              )}
            </Link>
            </motion.div>

            {/* Integrations */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
            <Link
              href="/integrations"
                className={cn(
                  "flex items-center justify-start px-4 py-3 rounded-xl transition-all duration-300 relative group",
                  pathname === '/integrations'
                    ? isDarkMode 
                      ? 'bg-gradient-to-r from-purple-900/60 to-violet-900/60 text-purple-200 shadow-lg border border-purple-700/30'
                      : 'bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 shadow-lg border border-purple-200'
                    : isDarkMode
                      ? 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200 hover:shadow-md hover:border-gray-700/50'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md hover:border-gray-200'
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "p-2 rounded-lg transition-colors",
                pathname === '/integrations'
                      ? "bg-purple-500/20"
                      : "bg-gray-100/50 dark:bg-gray-800/50 group-hover:bg-purple-500/10"
                  )}>
                    <LinkIcon className="w-5 h-5" />
                  </div>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1 flex items-center justify-between"
                      >
                        <span className="text-sm font-semibold">Integrations</span>
                        <span className="bg-gradient-to-r from-purple-500 to-violet-500 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-sm">
                Connect
              </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {pathname === '/integrations' && isExpanded && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-3 w-2 h-2 bg-purple-500 rounded-full"
                  />
              )}
            </Link>
            </motion.div>



            {/* Asset Upload */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
            <Link
              href="/dashboard?section=asset-upload"
                className={cn(
                  "flex items-center justify-start px-4 py-3 rounded-xl transition-all duration-300 relative group",
                  isActiveSection('asset-upload')
                    ? isDarkMode 
                      ? 'bg-gradient-to-r from-blue-900/60 to-cyan-900/60 text-blue-200 shadow-lg border border-blue-700/30'
                      : 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 shadow-lg border border-blue-200'
                    : isDarkMode
                      ? 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200 hover:shadow-md hover:border-gray-700/50'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md hover:border-gray-200'
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "p-2 rounded-lg transition-colors",
                isActiveSection('asset-upload')
                      ? "bg-blue-500/20"
                      : "bg-gray-100/50 dark:bg-gray-800/50 group-hover:bg-blue-500/10"
                  )}>
                    <CloudUpload className="w-5 h-5" />
                  </div>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1"
                      >
                        <span className="text-sm font-semibold">Asset Upload</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {isActiveSection('asset-upload') && isExpanded && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-3 w-2 h-2 bg-blue-500 rounded-full"
                  />
              )}
            </Link>
            </motion.div>
          </div>

          {/* Account Management Section */}
          <div className="mt-12 space-y-2">
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="px-3 mb-4"
                >
                  <p className={cn(
                    "uppercase tracking-wider text-sm font-medium text-left",
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  )}>
                    Account Management
                  </p>
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent mt-2"></div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Accounts */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
            <Link
              href="/accounts"
                className={cn(
                  "flex items-center justify-start px-4 py-3 rounded-xl transition-all duration-300 relative group",
                  pathname === '/accounts'
                    ? isDarkMode 
                      ? 'bg-gradient-to-r from-gray-800/60 to-slate-800/60 text-gray-200 shadow-lg border border-gray-700/30'
                      : 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 shadow-lg border border-gray-200'
                    : isDarkMode
                      ? 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200 hover:shadow-md hover:border-gray-700/50'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md hover:border-gray-200'
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "p-2 rounded-lg transition-colors",
                pathname === '/accounts'
                      ? "bg-gray-500/20"
                      : "bg-gray-100/50 dark:bg-gray-800/50 group-hover:bg-gray-500/10"
                  )}>
                    <Users className="w-5 h-5" />
                  </div>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1"
                      >
                        <span className="text-sm font-semibold">Accounts</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {pathname === '/accounts' && isExpanded && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-3 w-2 h-2 bg-gray-500 rounded-full"
                  />
              )}
            </Link>
            </motion.div>

            {/* Settings */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
            <Link
              href="/settings"
                className={cn(
                  "flex items-center justify-start px-4 py-3 rounded-xl transition-all duration-300 relative group",
                  pathname === '/settings'
                    ? isDarkMode 
                      ? 'bg-gradient-to-r from-gray-800/60 to-slate-800/60 text-gray-200 shadow-lg border border-gray-700/30'
                      : 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 shadow-lg border border-gray-200'
                    : isDarkMode
                      ? 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200 hover:shadow-md hover:border-gray-700/50'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md hover:border-gray-200'
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "p-2 rounded-lg transition-colors",
                pathname === '/settings'
                      ? "bg-gray-500/20"
                      : "bg-gray-100/50 dark:bg-gray-800/50 group-hover:bg-gray-500/10"
                  )}>
                    <Settings className="w-5 h-5" />
                  </div>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1"
                      >
                        <span className="text-sm font-semibold">Settings</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {pathname === '/settings' && isExpanded && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-3 w-2 h-2 bg-gray-500 rounded-full"
                  />
              )}
            </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SidebarMenu;