'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Search, Globe, Smartphone, ShoppingBag, Zap, TrendingUp, MapPin, Youtube, CheckCircle, Play, Monitor, Users, BarChart3, Building2 } from 'lucide-react';

// Import the new service selection modal
import ServiceSelectionModal, { ServiceType } from '@/components/ServiceSelectionModal';

// Import the new account selection modal
import AccountSelectionModal from '@/components/AccountSelectionModal';

// Import specialized campaign components
import SearchCampaignForm from '@/components/Campaign/AdCreative/SearchCampaignForm';
import PerformanceMaxForm from '@/components/Campaign/AdCreative/PerformanceMaxForm';
import ShoppingCampaignForm from '@/components/Campaign/AdCreative/ShoppingCampaignForm';
import VideoCampaignForm from '@/components/Campaign/AdCreative/VideoCampaignForm';
import AppCampaignForm from '@/components/Campaign/AdCreative/AppCampaignForm';
import DisplayCampaignForm from '@/components/Campaign/AdCreative/DisplayCampaignForm';
import DemandGenForm from '@/components/Campaign/AdCreative/DemandGenForm';
import BasicInformationForm from '@/components/Campaign/AdCreative/BasicInformationForm';

// Types for Google Accounts
interface GoogleAccount {
  id: string;
  name: string;
  type: 'google_ads' | 'merchant_center' | 'youtube' | 'analytics' | 'business';
  details?: {
    currency_code?: string;
    website_url?: string;
    subscriber_count?: number;
    view_count?: number;
    property_count?: number;
    location_count?: number;
  };
}

interface UserAccounts {
  google_ads: GoogleAccount[];
  merchant_center: GoogleAccount[];
  youtube: GoogleAccount[];
  analytics: GoogleAccount[];
  business: GoogleAccount[];
}

// Types
interface CampaignType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  color: string;
}

interface CampaignFormData {
  campaignType: string | null;
  selectedAccounts?: {
    google_ads?: string;
    merchant_center?: string;
    youtube?: string;
    analytics?: string;
    business?: string;
  };
  searchOptions?: {
    websiteVisits: boolean;
    phoneCalls: boolean;
  };
  performanceMaxOptions?: {
    addProducts: boolean;
    merchantCenterAccount?: string;
  };
  shoppingOptions?: {
    campaignSubtype: 'performance-max' | 'standard' | null;
    merchantCenterAccount?: string;
  };
  videoOptions?: {
    campaignSubtype: 'video-views' | 'video-reach' | 'drive-conversions' | 'ad-sequence' | 'audio-reach' | null;
    videoReachType?: 'efficient-reach' | 'non-skippable-reach' | 'target-frequency' | null;
    youtubeChannel?: string;
  };
  appOptions?: {
    campaignSubtype: 'app-installs' | 'app-engagement' | 'app-pre-registration' | null;
    appPlatform?: 'android' | 'ios' | null;
    appSearchQuery?: string;
    appStoreUrl?: string;
  };
  displayOptions?: {
    displayType: 'standard' | 'gmail' | 'mobile-app' | null;
  };
  demandGenOptions?: {
    campaignFormat: 'standard' | 'carousel' | null;
  };
  basicInfo: {
    campaignName: string;
    finalUrl?: string;
    phoneNumber?: string;
    videoUrl?: string;
  };
}

// Campaign Steps for Progress Indicator
const campaignSteps = [
  { id: 1, name: 'Campaign Setup', description: 'Choose campaign type and configure options' },
  { id: 2, name: 'Location Targeting', description: 'Geographic and demographic targeting' },
  { id: 3, name: 'Budget & Bidding', description: 'Budget settings and bidding strategy' },
  { id: 4, name: 'Review & Launch', description: 'Final review and campaign launch' }
];

// Campaign Types Data (Google Ads exact types)
const campaignTypes: CampaignType[] = [
  {
    id: 'search',
    name: 'Search',
    description: 'Show text ads when people search for your products or services on Google',
    icon: <Search className="w-8 h-8" />,
    badge: 'Most Popular',
    color: 'blue'
  },
  {
    id: 'performance-max',
    name: 'Performance Max',
    description: 'Get the best of Google\'s automation to reach customers across all channels',
    icon: <TrendingUp className="w-8 h-8" />,
    badge: 'Recommended',
    color: 'indigo'
  },
  {
    id: 'display',
    name: 'Display',
    description: 'Show image ads on websites and apps that partner with Google',
    icon: <Monitor className="w-8 h-8" />,
    color: 'green'
  },
  {
    id: 'shopping',
    name: 'Shopping',
    description: 'Promote your products with rich product information and images',
    icon: <ShoppingBag className="w-8 h-8" />,
    color: 'orange'
  },
  {
    id: 'video',
    name: 'Video',
    description: 'Show video ads on YouTube and across the web',
    icon: <Play className="w-8 h-8" />,
    color: 'red'
  },
  {
    id: 'app',
    name: 'App',
    description: 'Promote your mobile app across Google\'s network',
    icon: <Smartphone className="w-8 h-8" />,
    color: 'purple'
  },
  {
    id: 'demand-gen',
    name: 'Demand Gen',
    description: 'Drive demand for your products across Google\'s most visual and engaging surfaces',
    icon: <Globe className="w-8 h-8" />,
    badge: 'New',
    color: 'teal'
  }
];

// Color variants for cards
const colorVariants = {
  blue: 'border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 bg-blue-50 dark:bg-blue-900/20',
  green: 'border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700 bg-green-50 dark:bg-green-900/20',
  red: 'border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 bg-red-50 dark:bg-red-900/20',
  purple: 'border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700 bg-purple-50 dark:bg-purple-900/20',
  orange: 'border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700 bg-orange-50 dark:bg-orange-900/20',
  indigo: 'border-indigo-200 dark:border-indigo-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20',
  teal: 'border-teal-200 dark:border-teal-800 hover:border-teal-300 dark:hover:border-teal-700 bg-teal-50 dark:bg-teal-900/20'
};

const iconColorVariants = {
  blue: 'text-blue-600 dark:text-blue-400',
  green: 'text-green-600 dark:text-green-400',
  red: 'text-red-600 dark:text-red-400',
  purple: 'text-purple-600 dark:text-purple-400',
  orange: 'text-orange-600 dark:text-orange-400',
  indigo: 'text-indigo-600 dark:text-indigo-400',
  teal: 'text-teal-600 dark:text-teal-400'
};

const CampaignNewPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Service selection state
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  
  // Account selection state
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [userAccounts, setUserAccounts] = useState<UserAccounts | null>(null);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  
  const [formData, setFormData] = useState<CampaignFormData>({
    campaignType: null,
    selectedAccounts: {},
    searchOptions: {
      websiteVisits: false,
      phoneCalls: false
    },
    performanceMaxOptions: {
      addProducts: false
    },
    shoppingOptions: {
      campaignSubtype: null
    },
    videoOptions: {
      campaignSubtype: null
    },
    appOptions: {
      campaignSubtype: null,
      appPlatform: null,
      appSearchQuery: '',
      appStoreUrl: ''
    },
    displayOptions: {
      displayType: null
    },
    demandGenOptions: {
      campaignFormat: null
    },
    basicInfo: {
      campaignName: '',
      finalUrl: '',
      phoneNumber: '',
      videoUrl: ''
    }
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for OAuth callback and connected accounts
  useEffect(() => {
    const connected = searchParams.get('connected');
    const adsAccounts = searchParams.get('ads_accounts');
    const merchantAccounts = searchParams.get('merchant_accounts');
    const youtubeChannels = searchParams.get('youtube_channels');
    const analyticsAccounts = searchParams.get('analytics_accounts');
    const businessLocations = searchParams.get('business_locations');

    if (connected === 'true') {
      // User just completed OAuth, show account selection modal
      setSelectedService('client');
      fetchUserAccounts();
    } else {
      // Check for existing service selection
      const savedService = localStorage.getItem('furriyadh_service_type') as ServiceType;
      if (savedService) {
        setSelectedService(savedService);
        if (savedService === 'client') {
          fetchUserAccounts();
        }
      } else {
        // Show service selection modal if no service is selected
        setShowServiceModal(true);
      }
    }
  }, [searchParams]);

  // Fetch user accounts from API
  const fetchUserAccounts = async () => {
    setIsLoadingAccounts(true);
    try {
      const response = await fetch('/api/user/accounts', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const accounts = await response.json();
        setUserAccounts(accounts);
        
        // Show account selection modal if user has accounts
        if (hasAnyAccounts(accounts)) {
          setShowAccountModal(true);
        }
      } else {
        console.error('Failed to fetch user accounts');
      }
    } catch (error) {
      console.error('Error fetching user accounts:', error);
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  // Check if user has any accounts
  const hasAnyAccounts = (accounts: UserAccounts): boolean => {
    return Object.values(accounts).some(accountList => accountList.length > 0);
  };

  // Handle service selection
  const handleServiceSelect = (serviceType: ServiceType) => {
    setSelectedService(serviceType);
    
    // If client account is selected, redirect to OAuth flow
    if (serviceType === 'client') {
      // Redirect to Google OAuth
      window.location.href = '/api/oauth/google';
      return;
    }
    
    // For furriyadh accounts, continue normally
    setShowServiceModal(false);
  };

  // Handle account selection
  const handleAccountSelect = (accounts: {[key: string]: string}) => {
    setFormData(prev => ({
      ...prev,
      selectedAccounts: accounts
    }));
    setShowAccountModal(false);
  };

  // Enhanced form validation for all campaign types
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    // Campaign type validation
    if (!formData.campaignType) {
      newErrors.campaignType = 'Please select a campaign type';
    }

    // Campaign name validation
    if (!formData.basicInfo?.campaignName?.trim()) {
      newErrors.campaignName = 'Campaign name is required';
    }

    // Account selection validation for client service
    if (selectedService === 'client') {
      if (formData.campaignType === 'shopping' && !formData.selectedAccounts?.merchant_center) {
        newErrors.merchantCenter = 'Please select a Merchant Center account';
      }
      if (formData.campaignType === 'video' && !formData.selectedAccounts?.youtube) {
        newErrors.youtubeChannel = 'Please select a YouTube channel';
      }
      if (!formData.selectedAccounts?.google_ads) {
        newErrors.googleAds = 'Please select a Google Ads account';
      }
    }

    // Campaign-specific validations
    if (formData.campaignType === 'search') {
      if (!formData.searchOptions?.websiteVisits && !formData.searchOptions?.phoneCalls) {
        newErrors.searchOptions = 'Please select at least one option (Website visits or Phone calls)';
      }
      if (formData.searchOptions?.phoneCalls && !formData.basicInfo?.phoneNumber?.trim()) {
        newErrors.phoneNumber = 'Phone number is required for call ads';
      }
    }

    if (formData.campaignType === 'performance-max') {
      if (!formData.basicInfo?.finalUrl?.trim()) {
        newErrors.finalUrl = 'Final URL is required for Performance Max campaigns';
      }
      if (formData.performanceMaxOptions?.addProducts && selectedService === 'client' && !formData.selectedAccounts?.merchant_center) {
        newErrors.merchantCenter = 'Please select a Merchant Center account';
      }
    }

    if (formData.campaignType === 'shopping') {
      if (!formData.shoppingOptions?.campaignSubtype) {
        newErrors.campaignSubtype = 'Please select a campaign subtype';
      }
    }

    if (formData.campaignType === 'video') {
      if (!formData.videoOptions?.campaignSubtype) {
        newErrors.campaignSubtype = 'Please select a campaign subtype';
      }
      if (!formData.basicInfo?.videoUrl?.trim()) {
        newErrors.videoUrl = 'Video URL is required for Video campaigns';
      }
      if (formData.videoOptions?.campaignSubtype === 'video-reach' && !formData.videoOptions?.videoReachType) {
        newErrors.videoReachType = 'Please select a reach strategy';
      }
    }

    if (formData.campaignType === 'app') {
      if (!formData.appOptions?.campaignSubtype) {
        newErrors.campaignSubtype = 'Please select a campaign subtype';
      }
      if (!formData.appOptions?.appSearchQuery?.trim() && !formData.appOptions?.appStoreUrl?.trim()) {
        newErrors.appSearch = 'Please search for your app or enter app store URL';
      }
    }

    if (formData.campaignType === 'display') {
      if (!formData.displayOptions?.displayType) {
        newErrors.displayType = 'Please select a display campaign type';
      }
      if (!formData.basicInfo?.finalUrl?.trim()) {
        newErrors.finalUrl = 'Final URL is required for Display campaigns';
      }
    }

    if (formData.campaignType === 'demand-gen') {
      if (!formData.demandGenOptions?.campaignFormat) {
        newErrors.campaignFormat = 'Please select a campaign format';
      }
      if (!formData.basicInfo?.finalUrl?.trim()) {
        newErrors.finalUrl = 'Final URL is required for Demand Gen campaigns';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle campaign type selection
  const handleCampaignTypeSelect = (typeId: string) => {
    setFormData(prev => ({
      ...prev,
      campaignType: typeId,
      // Reset all options when changing type
      searchOptions: { websiteVisits: false, phoneCalls: false },
      performanceMaxOptions: { addProducts: false },
      shoppingOptions: { campaignSubtype: null },
      videoOptions: { campaignSubtype: null },
      appOptions: { campaignSubtype: null, appPlatform: null, appSearchQuery: '', appStoreUrl: '' },
      displayOptions: { displayType: null },
      demandGenOptions: { campaignFormat: null },
      // Keep basicInfo but ensure it has default values
      basicInfo: {
        campaignName: prev.basicInfo?.campaignName || '',
        finalUrl: prev.basicInfo?.finalUrl || '',
        phoneNumber: prev.basicInfo?.phoneNumber || '',
        videoUrl: prev.basicInfo?.videoUrl || ''
      }
    }));
    
    if (errors.campaignType) {
      setErrors(prev => ({ ...prev, campaignType: '' }));
    }
  };

  // Handle next step
  const handleNext = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Save data to localStorage or context
      const campaignDataWithService = {
        ...formData,
        serviceType: selectedService
      };
      localStorage.setItem('campaignData', JSON.stringify(campaignDataWithService));
      
      // Navigate to next step
      router.push('/campaign/location-targeting');
    } catch (error) {
      console.error('Error saving campaign data:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render campaign-specific options using specialized components
  const renderCampaignOptions = () => {
    if (!formData.campaignType) return null;

    switch (formData.campaignType) {
      case 'search':
        return (
          <SearchCampaignForm
            formData={formData.searchOptions || { websiteVisits: false, phoneCalls: false }}
            onUpdate={(data) => setFormData(prev => ({ ...prev, searchOptions: data }))}
            errors={errors}
          />
        );

      case 'performance-max':
        return (
          <PerformanceMaxForm
            formData={formData.performanceMaxOptions || { addProducts: false }}
            onUpdate={(data) => setFormData(prev => ({ ...prev, performanceMaxOptions: data }))}
            errors={errors}
          />
        );

      case 'shopping':
        return (
          <ShoppingCampaignForm
            formData={formData.shoppingOptions || { campaignSubtype: null }}
            onUpdate={(data) => setFormData(prev => ({ ...prev, shoppingOptions: data }))}
            errors={errors}
          />
        );

      case 'video':
        return (
          <VideoCampaignForm
            formData={formData.videoOptions || { campaignSubtype: null }}
            onUpdate={(data) => setFormData(prev => ({ ...prev, videoOptions: data }))}
            errors={errors}
          />
        );

      case 'app':
        return (
          <AppCampaignForm
            formData={formData.appOptions || { campaignSubtype: null, appPlatform: null, appSearchQuery: '' }}
            onUpdate={(data) => setFormData(prev => ({ ...prev, appOptions: data }))}
            errors={errors}
          />
        );

      case 'display':
        return (
          <DisplayCampaignForm
            formData={formData.displayOptions || { displayType: null }}
            onUpdate={(data) => setFormData(prev => ({ ...prev, displayOptions: data }))}
            errors={errors}
          />
        );

      case 'demand-gen':
        return (
          <DemandGenForm
            formData={formData.demandGenOptions || { campaignFormat: null }}
            onUpdate={(data) => setFormData(prev => ({ ...prev, demandGenOptions: data }))}
            errors={errors}
          />
        );

      default:
        return null;
    }
  };

  // Render Basic Information using the specialized component
  const renderBasicInformation = () => {
    if (!formData.campaignType) return null;

    // Ensure basicInfo is always defined with default values
    const basicInfo = formData.basicInfo || {
      campaignName: '',
      finalUrl: '',
      phoneNumber: '',
      videoUrl: ''
    };

    return (
      <BasicInformationForm
        campaignType={formData.campaignType}
        formData={basicInfo}
        searchOptions={formData.searchOptions}
        onUpdate={(data) => setFormData(prev => ({ 
          ...prev, 
          basicInfo: { 
            ...prev.basicInfo, 
            ...data 
          } 
        }))}
        errors={errors}
      />
    );
  };

  // Render service type indicator
  const renderServiceIndicator = () => {
    if (!selectedService) return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              selectedService === 'furriyadh' ? 'bg-blue-500' : 'bg-green-500'
            }`}></div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {selectedService === 'furriyadh' 
                ? 'Using Furriyadh Advertising Accounts (20% commission)' 
                : 'Using Your Own Advertising Accounts (0% commission)'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {selectedService === 'client' && userAccounts && (
              <button
                onClick={() => setShowAccountModal(true)}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Select Accounts
              </button>
            )}
            <button
              onClick={() => setShowServiceModal(true)}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Change
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render selected accounts summary
  const renderSelectedAccountsSummary = () => {
    if (selectedService !== 'client' || !formData.selectedAccounts || !userAccounts) return null;

    const selectedAccountsCount = Object.keys(formData.selectedAccounts).length;
    if (selectedAccountsCount === 0) return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Selected Accounts</h3>
          <button
            onClick={() => setShowAccountModal(true)}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Change Selection
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {formData.selectedAccounts.google_ads && (
            <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-900 dark:text-white">
                {userAccounts.google_ads.find(acc => acc.id === formData.selectedAccounts?.google_ads)?.name || 'Google Ads Account'}
              </span>
            </div>
          )}
          
          {formData.selectedAccounts.merchant_center && (
            <div className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <ShoppingBag className="w-4 h-4 text-orange-600" />
              <span className="text-sm text-gray-900 dark:text-white">
                {userAccounts.merchant_center.find(acc => acc.id === formData.selectedAccounts?.merchant_center)?.name || 'Merchant Center'}
              </span>
            </div>
          )}
          
          {formData.selectedAccounts.youtube && (
            <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <Youtube className="w-4 h-4 text-red-600" />
              <span className="text-sm text-gray-900 dark:text-white">
                {userAccounts.youtube.find(acc => acc.id === formData.selectedAccounts?.youtube)?.name || 'YouTube Channel'}
              </span>
            </div>
          )}
          
          {formData.selectedAccounts.analytics && (
            <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <BarChart3 className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-900 dark:text-white">
                {userAccounts.analytics.find(acc => acc.id === formData.selectedAccounts?.analytics)?.name || 'Analytics Account'}
              </span>
            </div>
          )}
          
          {formData.selectedAccounts.business && (
            <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Building2 className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-gray-900 dark:text-white">
                {userAccounts.business.find(acc => acc.id === formData.selectedAccounts?.business)?.name || 'Business Location'}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-6 space-y-6">
        
        {/* Service Selection Modal */}
        <ServiceSelectionModal
          isOpen={showServiceModal}
          onClose={() => setShowServiceModal(false)}
          onSelect={handleServiceSelect}
        />
        
        {/* Account Selection Modal */}
        {userAccounts && (
          <AccountSelectionModal
            isOpen={showAccountModal}
            onClose={() => setShowAccountModal(false)}
            onSelect={handleAccountSelect}
            accounts={userAccounts}
            selectedAccounts={formData.selectedAccounts || {}}
            campaignType={formData.campaignType}
          />
        )}
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Campaign</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Choose your campaign type and configure settings</p>
          </div>
        </div>

        {/* Service Type Indicator */}
        {renderServiceIndicator()}

        {/* Selected Accounts Summary */}
        {renderSelectedAccountsSummary()}

        {/* Loading Accounts Indicator */}
        {isLoadingAccounts && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Loading your Google accounts...</span>
            </div>
          </div>
        )}

        {/* Campaign Setup Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Campaign Setup Progress</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Complete each step to launch your campaign</p>
          </div>
          
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700"></div>
            <div className="absolute top-5 left-0 h-0.5 bg-blue-600 transition-all duration-500" style={{width: '25%'}}></div>
            
            {/* Steps */}
            <div className="relative flex justify-between">
              {campaignSteps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center">
                  {/* Step Circle */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    step.id === 1 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'
                  }`}>
                    {step.id === 1 ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  
                  {/* Step Info */}
                  <div className="mt-3 text-center max-w-32">
                    <div className={`text-sm font-medium ${
                      step.id === 1 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {step.name}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 leading-tight">
                      {step.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Campaign Type Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Select a campaign type</h2>
            <p className="text-gray-600 dark:text-gray-400">Choose the campaign type that best fits your advertising goals</p>
          </div>

          {errors.campaignType && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-400 text-sm">{errors.campaignType}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaignTypes.map((campaignType) => (
              <div
                key={campaignType.id}
                onClick={() => handleCampaignTypeSelect(campaignType.id)}
                className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-200 hover:shadow-lg ${
                  formData.campaignType === campaignType.id 
                    ? `${colorVariants[campaignType.color as keyof typeof colorVariants]} border-opacity-100` 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                }`}
              >
                {/* Badge */}
                {campaignType.badge && (
                  <div className="absolute top-4 right-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      campaignType.badge === 'Recommended' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      campaignType.badge === 'Most Popular' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                    }`}>
                      {campaignType.badge}
                    </span>
                  </div>
                )}

                {/* Selection indicator */}
                {formData.campaignType === campaignType.id && (
                  <div className="absolute top-4 left-4">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Icon */}
                <div className={`mb-4 ${iconColorVariants[campaignType.color as keyof typeof iconColorVariants]}`}>
                  {campaignType.icon}
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {campaignType.name}
                </h3>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {campaignType.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Campaign-specific Options */}
        {renderCampaignOptions()}

        {/* Basic Information */}
        {renderBasicInformation()}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Cancel
          </button>
          
          <button
            onClick={handleNext}
            disabled={isSubmitting || !formData.campaignType || !selectedService || isLoadingAccounts}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                Next Step
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CampaignNewPage;

