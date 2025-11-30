'use client';

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { 
  BarChart3, 
  Plus, 
  Link as LinkIcon, 
  CloudUpload, 
  Users, 
  Settings,
  Building2,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Sparkles,
  Zap,
  TrendingUp,
  FolderKanban,
  Eye,
  Edit,
  FileText,
  Bell,
  Search,
  Clock
} from "lucide-react";
 
const SidebarMenu: React.FC = React.memo(() => {
  const pathname = usePathname();
  
  // State for submenu dropdowns
  const [billingOpen, setBillingOpen] = React.useState(false);
  const [accountsOpen, setAccountsOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [campaignsOpen, setCampaignsOpen] = React.useState(false);
  
  // Check if any submenu is open
  const hasOpenSubmenu = billingOpen || accountsOpen || settingsOpen || campaignsOpen;
  
  // Use translation hook
  const { t, language, isRTL } = useTranslation();
  
  // State for sidebar open/close - Use localStorage to persist state
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(() => {
    // Initialize based on screen size and localStorage (client-side only)
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 1280; // xl breakpoint
      
      // On mobile, always start closed to prevent black screen
      if (isMobile) {
        // Clean up any leftover classes from previous session
        document.body.classList.remove('sidebar-open');
        document.documentElement.classList.remove('sidebar-open');
        document.body.style.top = '';
        return false; // Always closed on mobile initially
      }
      
      // On desktop, check localStorage
      const savedState = localStorage.getItem('sidebarOpen');
      if (savedState !== null) {
        return savedState === 'true';
      }
      // Default to open on desktop
      return true;
    }
    return false; // Default for SSR (closed)
  });
  
  // State for Quick Search
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // State for Recent Pages
  const [recentPages, setRecentPages] = React.useState<{ path: string; name: string }[]>([]);
  
  // State for selected campaign type color
  const [campaignTypeColor, setCampaignTypeColor] = React.useState({
    gradient: 'from-yellow-500 to-orange-600',
    hoverGradient: 'from-yellow-400 to-orange-500'
  });
  
  // Toggle sidebar and save to localStorage
  const toggleSidebar = React.useCallback(() => {
    setIsSidebarOpen(prev => {
      const newState = !prev;
      // Save to localStorage (only for desktop)
      if (typeof window !== 'undefined') {
        const isMobile = window.innerWidth < 1280;
        
        // Only save to localStorage on desktop
        if (!isMobile) {
          localStorage.setItem('sidebarOpen', String(newState));
        } else {
          // On mobile, always remove from localStorage to prevent black screen on refresh
          localStorage.removeItem('sidebarOpen');
        }
        
        // Prevent body scroll on mobile when sidebar is open
        if (isMobile) {
          if (newState) {
            // Disable scroll on body and html
            document.body.classList.add('sidebar-open');
            document.documentElement.classList.add('sidebar-open');
            // Save current scroll position
            const scrollY = window.scrollY;
            document.body.style.top = `-${scrollY}px`;
          } else {
            // Re-enable scroll
            const scrollY = document.body.style.top;
            document.body.classList.remove('sidebar-open');
            document.documentElement.classList.remove('sidebar-open');
            document.body.style.top = '';
            if (scrollY) {
              window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }
          }
        }
      }
      return newState;
    });
  }, []);

  // Remove auto-close on resize - sidebar only closes when X button is clicked
  // No useEffect for auto-closing sidebar

  // Handle link click - close sidebar on mobile/tablet only
  const handleLinkClick = React.useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1280) {
      // Only close on mobile/tablet, not on desktop
      setIsSidebarOpen(false);
    }
  }, []);

  // Clean up on mount to prevent black screen on mobile refresh
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 1280;
      
      // On mobile, always ensure sidebar is closed and body scroll is enabled on mount
      if (isMobile) {
        // Clean up any leftover classes
        document.body.classList.remove('sidebar-open');
        document.documentElement.classList.remove('sidebar-open');
        document.body.style.top = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';
        
        // Ensure sidebar is closed on mobile
        if (isSidebarOpen) {
          setIsSidebarOpen(false);
        }
      }
    }
  }, []); // Only run on mount

  // Ensure body scroll is disabled when sidebar opens on mobile
  React.useEffect(() => {
    // Clean up on mount (in case of page refresh with stale state)
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 1280;
      
      // Always clean up on mobile mount to prevent black screen
      if (isMobile) {
        document.body.classList.remove('sidebar-open');
        document.documentElement.classList.remove('sidebar-open');
        document.body.style.top = '';
      }
      
      // Then apply state if sidebar should be open
      if (isMobile && isSidebarOpen) {
        // Disable scroll on body and html
        document.body.classList.add('sidebar-open');
        document.documentElement.classList.add('sidebar-open');
        // Save current scroll position
        const scrollY = window.scrollY;
        document.body.style.top = `-${scrollY}px`;
      } else if (isMobile && !isSidebarOpen) {
        // Re-enable scroll
        const scrollY = document.body.style.top;
        document.body.classList.remove('sidebar-open');
        document.documentElement.classList.remove('sidebar-open');
        document.body.style.top = '';
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
      }
    }
    
    return () => {
      // Cleanup on unmount
      if (typeof window !== 'undefined') {
        document.body.classList.remove('sidebar-open');
        document.documentElement.classList.remove('sidebar-open');
        document.body.style.top = '';
      }
    };
  }, [isSidebarOpen]);

  // Update campaign color based on selected campaign type
  React.useEffect(() => {
    const updateCampaignColor = () => {
      try {
        const campaignData = localStorage.getItem('campaignData');
        if (campaignData) {
          const data = JSON.parse(campaignData);
          const campaignType = data.campaignType;

          // Map campaign types to colors (same as campaign/new page)
          const colorMap: { [key: string]: { gradient: string; hoverGradient: string } } = {
            'SEARCH': { 
              gradient: 'from-yellow-500 to-orange-600', 
              hoverGradient: 'from-yellow-400 to-orange-500' 
            },
            'DISPLAY': { 
              gradient: 'from-green-500 to-emerald-600', 
              hoverGradient: 'from-green-400 to-emerald-500' 
            },
            'SHOPPING': { 
              gradient: 'from-blue-500 to-cyan-600', 
              hoverGradient: 'from-blue-400 to-cyan-500' 
            },
            'VIDEO': { 
              gradient: 'from-purple-500 to-pink-600', 
              hoverGradient: 'from-purple-400 to-pink-500' 
            },
            'APP': { 
              gradient: 'from-orange-500 to-red-600', 
              hoverGradient: 'from-orange-400 to-red-500' 
            },
            'PERFORMANCE_MAX': { 
              gradient: 'from-pink-500 to-rose-600', 
              hoverGradient: 'from-pink-400 to-rose-500' 
            },
            'DEMAND_GEN': { 
              gradient: 'from-red-500 to-pink-600', 
              hoverGradient: 'from-red-400 to-pink-500' 
            }
          };
          
          if (campaignType && colorMap[campaignType]) {
            setCampaignTypeColor(colorMap[campaignType]);
          }
        }
      } catch (error) {
        console.error('Error reading campaign type:', error);
      }
    };
    
    // Update on mount
    updateCampaignColor();
    
    // Listen for storage changes
    window.addEventListener('storage', updateCampaignColor);
    
    // Listen for custom event when campaign type changes
    window.addEventListener('campaignTypeChanged', updateCampaignColor);

    return () => {
      window.removeEventListener('storage', updateCampaignColor);
      window.removeEventListener('campaignTypeChanged', updateCampaignColor);
    };
  }, []);


  // Auto-open submenu if user is on a related page
  React.useEffect(() => {
    if (pathname?.includes('section=billing') || pathname?.includes('billing') || pathname?.includes('/invoices')) {
      setBillingOpen(true);
    } else {
      setBillingOpen(false);
    }
    
    if (pathname?.startsWith('/accounts') || pathname?.startsWith('/my-profile')) {
      setAccountsOpen(true);
    } else {
      setAccountsOpen(false);
    }
    
    if (pathname?.startsWith('/settings')) {
      setSettingsOpen(true);
    } else {
      setSettingsOpen(false);
    }
    
    if (pathname?.includes('/campaign/performance') || pathname?.includes('/campaign/edit-ads') || pathname?.includes('/campaign/preview')) {
      setCampaignsOpen(true);
    } else {
      setCampaignsOpen(false);
    }
  }, [pathname]);

  // Track Recent Pages
  React.useEffect(() => {
    if (!pathname || pathname === '/' || pathname === '/dashboard') {
      // Don't track dashboard or root as recent
      return;
    }
    
    try {
      // Load recent pages from localStorage
      const storedPages = localStorage.getItem('recentPages');
      const pages: { path: string; name: string }[] = storedPages ? JSON.parse(storedPages) : [];
      
      // Get page name from pathname
      const getPageName = (path: string) => {
        if (!path) return 'Page';
        if (path === '/dashboard') return 'Dashboard';
        if (path.includes('/campaign/new')) return 'New Campaign';
        if (path.includes('/campaign/performance')) return 'Campaign Performance';
        if (path.includes('/campaign/edit-ads')) return 'Edit Ads';
        if (path.includes('/campaign/preview')) return 'Preview Campaign';
        if (path.includes('/campaign/location-targeting')) return 'Location Targeting';
        if (path.includes('/campaign/budget-scheduling')) return 'Budget & Scheduling';
        if (path.includes('/campaign/website-url')) return 'Website URL';
        if (path.includes('/integrations/google-ads')) return 'Google Ads';
        if (path.includes('/integrations')) return 'Integrations';
        if (path.includes('/accounts')) return 'Accounts';
        if (path.includes('/my-profile')) return 'My Profile';
        if (path.includes('/notifications')) return 'Notifications';
        if (path.includes('/invoices')) return 'Invoices';
        if (path.includes('/settings')) return 'Settings';
        const segments = path.split('/').filter(Boolean);
        return segments[segments.length - 1]?.replace(/-/g, ' ')?.replace(/\b\w/g, l => l.toUpperCase()) || 'Page';
      };
      
      const currentPage = { path: pathname, name: getPageName(pathname) };
      
      // Check if page already exists
      const existingIndex = pages.findIndex(p => p.path === pathname);
      if (existingIndex !== -1) {
        pages.splice(existingIndex, 1);
      }
      
      // Add to beginning
      pages.unshift(currentPage);
      
      // Keep only last 5 and filter out invalid entries
      const recentPagesLimit = pages
        .filter(p => p && p.path && p.name)
        .slice(0, 5);
      
      // Save to localStorage
      localStorage.setItem('recentPages', JSON.stringify(recentPagesLimit));
      setRecentPages(recentPagesLimit);
    } catch (error) {
      console.error('Error tracking recent pages:', error);
    }
  }, [pathname]);

  // Load recent pages on mount
  React.useEffect(() => {
    try {
      const storedPages = localStorage.getItem('recentPages');
      if (storedPages) {
        const parsedPages = JSON.parse(storedPages);
        // Filter out any invalid entries
        const validPages = parsedPages.filter((p: any) => p && p.path && p.name);
        setRecentPages(validPages);
      }
    } catch (error) {
      console.error('Error loading recent pages:', error);
      // Clear corrupted data
      localStorage.removeItem('recentPages');
    }
  }, []);

  // Helper functions for active states - Always accurate
  const isOverviewActive = React.useMemo(() => {
    return pathname === '/dashboard' || pathname === '/';
  }, [pathname]);

  const isActiveSection = React.useCallback((section: string) => {
    return pathname?.includes(`section=${section}`);
  }, [pathname]);
  
  const isBillingActive = React.useMemo(() => {
    return pathname?.includes('section=billing') || pathname?.includes('/billing');
  }, [pathname]);

  const isCampaignActive = React.useMemo(() => {
    return pathname?.startsWith('/campaign');
  }, [pathname]);

  const isIntegrationsActive = React.useMemo(() => {
    return pathname?.startsWith('/integrations');
  }, [pathname]);

  const isAccountsActive = React.useMemo(() => {
    return pathname?.startsWith('/accounts');
  }, [pathname]);

  const isSettingsActive = React.useMemo(() => {
    return pathname?.startsWith('/settings');
  }, [pathname]);

  const isCampaignsActive = React.useMemo(() => {
    return pathname?.includes('/campaign/performance') || 
           pathname?.includes('/campaign/edit-ads') || 
           pathname?.includes('/campaign/preview');
  }, [pathname]);

  const isNotificationsActive = React.useMemo(() => {
    return pathname?.startsWith('/notifications');
  }, [pathname]);

  const campaignsSubItems = React.useMemo(() => [
    { id: 'performance', name: t.sidebar.campaignPerformance || 'Campaign Performance', href: '/campaign/performance' },
    { id: 'edit-ads', name: t.sidebar.editAds || 'Edit Ads', href: '/campaign/edit-ads' },
    { id: 'preview', name: t.sidebar.previewCampaign || 'Preview Campaign', href: '/campaign/preview' }
  ], [t]);

  const billingSubItems = React.useMemo(() => [
    { id: 'credit', name: t.sidebar.credit || 'Credit', href: '/dashboard?section=billing&sub=credit' },
    { id: 'subscriptions', name: t.sidebar.subscriptions || 'Subscriptions', href: '/dashboard?section=billing&sub=subscriptions' },
    { id: 'payments', name: t.sidebar.payments || 'Payments', href: '/dashboard?section=billing&sub=payments' },
    { id: 'invoices', name: t.sidebar.invoices || 'Invoices', href: '/invoices' }
  ], [t]);

  const accountsSubItems = React.useMemo(() => [
    { id: 'google-ads', name: t.sidebar.googleAdsAccounts || 'Google Ads Accounts', href: '/accounts' },
    { id: 'profile', name: t.sidebar.myProfile || 'My Profile', href: '/my-profile' }
  ], [t]);

  const settingsSubItems = React.useMemo(() => [
    { id: 'general', name: t.sidebar.general || 'General', href: '/settings' },
    { id: 'privacy', name: t.sidebar.privacyPolicy || 'Privacy Policy', href: '/settings/privacy-policy' },
    { id: 'terms', name: t.sidebar.termsConditions || 'Terms & Conditions', href: '/settings/terms-conditions' },
    { id: 'connections', name: t.sidebar.connections || 'Connections', href: '/settings/connections' },
    { id: 'password', name: t.sidebar.changePassword || 'Change Password', href: '/settings/change-password' }
  ], [t]);

  const allTabs = React.useMemo(() => [
    {
      id: 1,
      name: t.sidebar.overview || 'Overview',
      icon: BarChart3,
      href: '/dashboard',
      isActive: isOverviewActive,
      hasSubmenu: false,
      gradient: 'from-purple-600 to-violet-600',
      hoverGradient: 'from-purple-500 to-violet-500',
      badge: { text: `5 ${t.sidebar.active || 'Active'}`, color: 'bg-purple-500' },
      tooltip: t.sidebar.viewDashboardStats || 'View your dashboard statistics'
    },
    {
      id: 2,
      name: t.sidebar.newCampaign || 'New Campaign',
      icon: Plus,
      href: '/campaign/new',
      isActive: isCampaignActive,
      hasSubmenu: false,
      gradient: campaignTypeColor.gradient,
      hoverGradient: campaignTypeColor.hoverGradient,
      badge: null,
      tooltip: t.sidebar.createNewCampaign || 'Create a new advertising campaign',
      sparkle: true
    },
    {
      id: 3,
      name: t.sidebar.myCampaigns || 'My Campaigns',
      icon: FolderKanban,
      href: '/campaign/performance',
      isActive: isCampaignsActive,
      hasSubmenu: true,
      subItems: campaignsSubItems,
      gradient: 'from-violet-600 to-fuchsia-600',
      hoverGradient: 'from-violet-500 to-fuchsia-500',
      badge: { text: '12', color: 'bg-violet-500' },
      tooltip: t.sidebar.viewManageCampaigns || 'View and manage your campaigns'
    },
    {
      id: 4,
      name: t.sidebar.integrations || 'Integrations',
      icon: LinkIcon,
      href: '/integrations',
      isActive: isIntegrationsActive,
      hasSubmenu: false,
      gradient: 'from-green-600 to-emerald-600',
      hoverGradient: 'from-green-500 to-emerald-500',
      badge: { text: '3', color: 'bg-green-500' },
      tooltip: t.sidebar.manageIntegrations || 'Manage your connected integrations'
    },
    {
      id: 5,
      name: t.sidebar.assetUpload || 'Asset Upload',
      icon: CloudUpload,
      href: '/dashboard?section=asset-upload',
      isActive: isActiveSection('asset-upload'),
      hasSubmenu: false,
      gradient: 'from-cyan-600 to-teal-600',
      hoverGradient: 'from-cyan-500 to-teal-500',
      badge: { text: '24', color: 'bg-cyan-500' },
      tooltip: t.sidebar.uploadManageAssets || 'Upload and manage your assets'
    },
    {
      id: 6,
      name: t.sidebar.billing || 'Billing',
      icon: CreditCard,
      href: '/dashboard?section=billing',
      isActive: isBillingActive,
      hasSubmenu: true,
      subItems: billingSubItems,
      gradient: 'from-orange-600 to-yellow-600',
      hoverGradient: 'from-orange-500 to-yellow-500',
      badge: { text: '$150', color: 'bg-orange-500' },
      tooltip: t.sidebar.viewBillingPayments || 'View billing and payments'
    },
    {
      id: 7,
      name: t.sidebar.accounts || 'Accounts',
      icon: Users,
      href: '/accounts',
      isActive: isAccountsActive,
      hasSubmenu: true,
      subItems: accountsSubItems,
      gradient: 'from-purple-600 to-pink-600',
      hoverGradient: 'from-purple-500 to-pink-500',
      badge: { text: '2', color: 'bg-purple-500' },
      tooltip: t.sidebar.manageAccounts || 'Manage your connected accounts'
    },
    {
      id: 8,
      name: t.sidebar.notifications || 'Notifications',
      icon: Bell,
      href: '/notifications',
      isActive: isNotificationsActive,
      hasSubmenu: false,
      gradient: 'from-rose-600 to-red-600',
      hoverGradient: 'from-rose-500 to-red-500',
      badge: { text: '7', color: 'bg-rose-500' },
      tooltip: t.sidebar.viewNotifications || 'View your notifications'
    },
    {
      id: 9,
      name: t.sidebar.settings || 'Settings',
      icon: Settings,
      href: '/settings',
      isActive: isSettingsActive,
      hasSubmenu: true,
      subItems: settingsSubItems,
      gradient: 'from-gray-600 to-slate-600',
      hoverGradient: 'from-gray-500 to-slate-500',
      badge: null,
      tooltip: t.sidebar.configurePreferences || 'Configure your preferences'
    }
  ], [pathname, t, isOverviewActive, isCampaignActive, isCampaignsActive, isIntegrationsActive, isActiveSection, isBillingActive, isAccountsActive, isNotificationsActive, isSettingsActive, campaignsSubItems, billingSubItems, accountsSubItems, settingsSubItems, campaignTypeColor]);

  // Filter tabs based on search query
  const filteredTabs = React.useMemo(() => {
    if (!searchQuery) return allTabs;
    const query = searchQuery.toLowerCase();
    return allTabs.filter(tab => 
      tab.name.toLowerCase().includes(query) ||
      tab.subItems?.some(sub => sub.name.toLowerCase().includes(query))
    );
  }, [allTabs, searchQuery]);

  return (
    <>
      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        /* Custom scrollbar for sidebar */
        .sidebar-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 3px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
        
        /* Prevent body scroll when sidebar is open on mobile - STRONG */
        @media (max-width: 1279px) {
          body.sidebar-open {
            overflow: hidden !important;
            position: fixed !important;
            width: 100% !important;
            height: 100% !important;
          }
          
          html.sidebar-open {
            overflow: hidden !important;
            height: 100% !important;
          }
        }
      `}</style>
      
      {/* Hamburger Button - Beautiful & Floating */}
      {!isSidebarOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleSidebar}
          className={`fixed top-6 z-[101] p-4 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl shadow-2xl hover:shadow-indigo-500/50 transition-all duration-300 group ${
            isRTL ? 'right-6' : 'left-6'
          }`}
        >
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-75 blur-xl transition-opacity duration-300"></div>
          
          {/* Icon */}
          <Menu className="w-7 h-7 relative z-10 drop-shadow-lg" />
          
          {/* Pulse animation */}
          <span className="absolute top-1 right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
        </motion.button>
      )}

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: isSidebarOpen 
            ? 0 
            : isRTL 
              ? 360 
              : -360
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed top-0 w-[360px] flex flex-col z-[100] px-6 pb-6 pt-3 border-gray-800 shadow-2xl overflow-hidden ${
          isRTL 
            ? 'right-0 border-l' 
            : 'left-0 border-r'
        }`}
        style={{
          backgroundColor: '#000000',
          position: 'fixed',
          willChange: 'transform',
          height: '100vh',
          minHeight: '100vh',
          touchAction: 'pan-y' // Allow vertical scroll only
        }}
      >
        {/* Close Button - Beautiful */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleSidebar}
          className={`absolute top-3 p-2.5 text-gray-400 hover:text-white hover:bg-gradient-to-br hover:from-red-500 hover:to-pink-600 rounded-xl transition-all duration-300 group ${
            isRTL ? 'left-6' : 'right-6'
          }`}
        >
          <X className="w-6 h-6 group-hover:drop-shadow-lg transition-all" />
        </motion.button>

          {/* Organization Header */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative transition-transform hover:scale-105">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Building2 className="w-8 h-8 text-white" />
                </div>
              <div className={`absolute -top-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 ${
                isRTL ? '-left-1' : '-right-1'
              }`}></div>
            </div>
            
            <div className="flex-1">
              <p className="text-lg font-bold mb-1.5 text-white" dir={isRTL ? 'rtl' : 'ltr'}>
                {t.sidebar.organizationName || 'Organization Name'}
              </p>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-indigo-900/60 text-indigo-200 border border-indigo-700/30" dir={isRTL ? 'rtl' : 'ltr'}>
                {t.sidebar.basicPlan || 'Basic Plan'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Search Bar */}
        <div className="mb-3 relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300">
            <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder={t.sidebar.quickSearch || 'Quick search...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-sm"
              dir={isRTL ? 'rtl' : 'ltr'}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Recent Pages */}
        {recentPages.length > 0 && !searchQuery && (
          <div className="mb-3 px-2">
            <div className="flex items-center gap-2 mb-1.5 text-xs text-gray-400 font-semibold uppercase tracking-wider" dir={isRTL ? 'rtl' : 'ltr'}>
              <Clock className="w-3.5 h-3.5" />
              <span>{t.sidebar.recentPages || 'Recent Pages'}</span>
            </div>
            <div className="space-y-1">
              {recentPages.slice(0, 3).filter(page => page && page.path).map((page, index) => (
                <Link
                  key={index}
                  href={page.path || '/dashboard'}
                  onClick={handleLinkClick}
                  className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 truncate group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover:bg-indigo-400 transition-colors"></div>
                    <span>{page.name || 'Page'}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      {/* Sidebar navigation */}
      <div 
        className={`flex-1 flex flex-col rounded-xl bg-white/5 backdrop-filter backdrop-blur-lg overflow-x-hidden p-2 sidebar-scroll ${
          hasOpenSubmenu ? 'overflow-y-auto' : 'overflow-hidden'
        }`}
        style={{
          minHeight: 0, // Important for flex scroll
          WebkitOverflowScrolling: hasOpenSubmenu ? 'touch' : 'auto', // Smooth scrolling on iOS only when submenu open
          touchAction: hasOpenSubmenu ? 'pan-y' : 'none', // Allow vertical scroll only when submenu open
          paddingBottom: hasOpenSubmenu ? '2rem' : '0' // Add padding to show last item when submenu open
        }}
      >
        {/* All Tabs */}
        <div className='flex flex-col gap-1'>
          {filteredTabs.map((tab) => {
            const Icon = tab.icon;
            const isOpen = tab.id === 3 ? campaignsOpen : tab.id === 6 ? billingOpen : tab.id === 7 ? accountsOpen : tab.id === 9 ? settingsOpen : false;
            const setOpen = tab.id === 3 ? setCampaignsOpen : tab.id === 6 ? setBillingOpen : tab.id === 7 ? setAccountsOpen : tab.id === 9 ? setSettingsOpen : () => {};
            
            return (
              <div key={`tab-${tab.id}`}>
                {/* Tab with or without submenu */}
                {tab.hasSubmenu ? (
                  <>
                    {/* Main Tab Button (with submenu) - ENHANCED */}
                    <button
                      onClick={() => setOpen(!isOpen)}
                      className={`
                        relative group flex items-center justify-between w-full px-6 py-4 transition-all overflow-hidden
                        ${
                          tab.isActive
                            ? 'text-white'
                            : 'text-gray-400 hover:text-gray-200'
                        }
                      `}
                      title={tab.tooltip}
                    >
                      {/* Background highlight for active tab with custom gradient */}
                      {tab.isActive && (
                      <motion.div
                          layoutId='sidebarTabBackground'
                          className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} rounded-lg`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        />
                      )}

                      {/* Hover gradient effect */}
                      {!tab.isActive && (
                        <div className={`absolute inset-0 bg-gradient-to-r ${tab.hoverGradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-lg`} />
                      )}

                      {/* Glow effect on hover */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${tab.hoverGradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`} />

                      {/* Tab content with icon and text */}
                      <div className='flex items-center gap-4 z-10 flex-1'>
                        <motion.div
                          animate={tab.isActive ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 0.5 }}
                        >
                          <Icon className={`w-6 h-6 ${tab.isActive ? 'drop-shadow-lg' : ''} group-hover:scale-110 transition-transform`} />
                      </motion.div>
                        <span className='text-lg font-medium' dir={language === 'ar' ? 'rtl' : 'ltr'}>{tab.name}</span>
                        
                        {/* Badge */}
                        {tab.badge && (
                          <div className={`${tab.badge.color} text-white text-xs font-bold px-2 py-0.5 rounded-full ${isRTL ? 'mr-auto' : 'ml-auto'} ${tab.isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'} transition-opacity`}>
                            {tab.badge.text}
                          </div>
                        )}
                </div>

                      {/* Chevron Icon */}
                      <div className={`z-10 ${isRTL ? 'mr-2' : 'ml-2'}`}>
            <motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
              >
                          <ChevronDown className='w-5 h-5' />
                        </motion.div>
                  </div>
                    </button>

                    {/* Submenu - ENHANCED */}
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`${isRTL ? 'mr-12' : 'ml-12'} mt-2 mb-3 space-y-2`}
                      >
                        {tab.subItems?.map((subItem) => {
                          const isSubItemActive = pathname === subItem.href || pathname?.includes(subItem.id);
                          
                          return (
            <Link
                              key={subItem.id}
                              href={subItem.href}
                              prefetch={true}
                              onClick={handleLinkClick}
                              className={`
                                relative block px-5 py-3 text-base rounded-lg transition-all group overflow-hidden
                                ${
                                  isSubItemActive
                                    ? 'text-white'
                                    : 'text-gray-400 hover:text-gray-200'
                                }
                              `}
              >
                              {/* Gradient Background for Active Submenu - using parent gradient */}
                              {isSubItemActive && (
                      <motion.div
                                  layoutId={`submenu-${tab.id}-background`}
                                  className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} rounded-lg`}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                                />
                              )}
                              
                              {/* Hover gradient effect */}
                              {!isSubItemActive && (
                                <div className={`absolute inset-0 bg-gradient-to-r ${tab.hoverGradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-lg`} />
                              )}
                              
                              {/* Submenu Text */}
                              <span className='relative z-10 font-medium' dir={language === 'ar' ? 'rtl' : 'ltr'}>{subItem.name}</span>
                              
                              {/* White Dot Indicator */}
                              {isSubItemActive && (
                  <motion.div 
                                  layoutId={`submenu-${tab.id}-dot`}
                                  className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white ${
                                    isRTL ? 'left-3' : 'right-3'
                                  }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                                  transition={{ delay: 0.1 }}
                  />
              )}
            </Link>
                          );
                        })}
            </motion.div>
                    )}
                  </>
                ) : (
                  /* Main Tab Link (without submenu) - ENHANCED */
            <Link
                    href={tab.href}
                    prefetch={true}
                    onClick={handleLinkClick}
                    className={`
                      relative group flex items-center w-full px-6 py-4 transition-all overflow-hidden
                      ${
                        tab.isActive
                          ? 'text-white'
                          : 'text-gray-400 hover:text-gray-200'
                      }
                    `}
                    title={tab.tooltip}
                  >
                    {/* Background highlight for active tab with custom gradient */}
                    {tab.isActive && (
                      <motion.div
                        layoutId='sidebarTabBackground'
                        className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} rounded-lg`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}

                    {/* Hover gradient effect */}
                    {!tab.isActive && (
                      <div className={`absolute inset-0 bg-gradient-to-r ${tab.hoverGradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-lg`} />
                    )}

                    {/* Glow effect on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${tab.hoverGradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`} />

                    {/* Tab content with icon and text */}
                    <div className='flex items-center gap-4 z-10 flex-1'>
                      <motion.div
                        animate={tab.isActive ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.5, repeat: tab.sparkle ? Infinity : 0, repeatDelay: 3 }}
                      >
                        <Icon className={`w-6 h-6 ${tab.isActive ? 'drop-shadow-lg' : ''} group-hover:scale-110 transition-transform`} />
                      </motion.div>
                      <span className='text-lg font-medium' dir={language === 'ar' ? 'rtl' : 'ltr'}>{tab.name}</span>
                </div>

                    {/* Badge */}
                    {tab.badge && (
                      <div className={`${tab.badge.color} text-white text-xs font-bold px-2 py-0.5 rounded-full z-10 ${tab.isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'} transition-opacity`}>
                        {tab.badge.text}
                      </div>
                    )}

                    {/* Sparkles for New Campaign */}
                    {tab.sparkle && tab.isActive && (
                      <Sparkles className={`w-4 h-4 absolute top-2 z-10 text-yellow-300 animate-pulse ${isRTL ? 'left-2' : 'right-2'}`} />
                    )}

                    {/* Small dot indicator */}
                    {tab.isActive && !tab.badge && (
                  <motion.div 
                        layoutId='sidebarActiveDot'
                        className={`absolute w-2.5 h-2.5 rounded-full bg-white ${
                          isRTL ? 'left-4' : 'right-4'
                        }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                        transition={{ delay: 0.1 }}
                  />
              )}
            </Link>
                )}
                  </div>
            );
          })}
        </div>
      </div>
      </motion.div>

      {/* Overlay when sidebar is open on mobile/tablet - click to close */}
      {isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/50 z-[99] xl:hidden backdrop-blur-sm cursor-pointer"
        />
      )}
    </>
  );
});

SidebarMenu.displayName = 'SidebarMenu';

export default SidebarMenu;
