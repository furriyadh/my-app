'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Check, Plus, Settings } from 'lucide-react';
import { useTranslation } from '@/lib/hooks/useTranslation';

// Smart Notification Manager
const NotificationManager = dynamic(() => import('@/components/NotificationManager'), {
  ssr: false,
});

// Integration Card Component
interface IntegrationCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'connected' | 'not-connected';
  onConnect: () => void;
  integrationId: string;
}

interface Integration {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'connected' | 'not-connected';
}

const IntegrationCard: React.FC<IntegrationCardProps & { onRefresh?: () => void; isRefreshing?: boolean }> = ({
  title,
  description,
  icon,
  status,
  onConnect,
  integrationId
}) => {
  const { language } = useTranslation();

  return (
    <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md transition-all duration-300 hover:-translate-y-1">
      <div className="trezo-card-header mb-[20px] flex items-center justify-between">
        <div className="trezo-card-title flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-800">
            {icon}
          </div>
          <div>
            <h5 className="!mb-0">
              {title.includes('Tag Manager') ? 'Tag Manager' : title.replace(' integration', '')}
            </h5>
          </div>
        </div>

        {status === 'connected' && (
          <span className="inline-block px-2 py-0.5 rounded-full bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400 text-xs font-medium border border-green-100 dark:border-green-900/20">
            {language === 'ar' ? 'متصل' : 'Connected'}
          </span>
        )}
      </div>

      <div className="trezo-card-content">
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-[20px] min-h-[40px]">
          {title.includes('Tag Manager')
            ? 'Manage website tracking and analytics tags'
            : description.replace('this project to your ', 'your ')
          }
        </p>

        {status === 'connected' ? (
          <div className="flex gap-3">
            <button
              className="flex-1 px-4 py-2 bg-primary-50 text-primary-600 dark:bg-primary-900/10 dark:text-primary-400 text-sm font-medium rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/20 transition-colors"
              onClick={() => window.location.href = `/google-ads/integrations/${integrationId}`}
            >
              {language === 'ar' ? 'إدارة' : 'Manage'}
            </button>
            <button
              className="px-4 py-2 bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
              onClick={onConnect}
            >
              <Plus className="w-4 h-4" />
              {language === 'ar' ? 'جديد' : 'New'}
            </button>
          </div>
        ) : (
          <button
            className="w-full px-4 py-2 bg-primary-600 text-white text-sm font-bold rounded-lg hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            onClick={onConnect}
          >
            {language === 'ar' ? 'ربط الحساب' : 'Connect'}
          </button>
        )}
      </div>
    </div>
  );
};

// Main Integrations Page Component
const IntegrationsPage: React.FC = () => {
  const router = useRouter();
  const { t, language, isRTL } = useTranslation();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Integration categories for organized display
  interface IntegrationCategory {
    id: string;
    title: string;
    titleAr: string;
    integrations: Integration[];
  }

  const [integrationCategories, setIntegrationCategories] = useState<IntegrationCategory[]>([
    {
      id: 'advertising',
      title: 'Advertising Platforms',
      titleAr: 'منصات الإعلانات',
      integrations: [
        {
          id: 'google-ads',
          title: 'Google Ads',
          description: 'Connect your Google Ads account.',
          icon: (
            <img src="/images/integrations/google-ads-logo.svg" alt="Google Ads" className="w-6 h-6 object-contain" />
          ),
          status: 'not-connected'
        },
        {
          id: 'youtube-channel',
          title: 'YouTube Channel',
          description: 'Link your YouTube channel to Google Ads.',
          icon: (
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#FF0000">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
            </svg>
          ),
          status: 'not-connected'
        },
        {
          id: 'microsoft-ads',
          title: 'Microsoft Ads',
          description: 'Connect your Microsoft Advertising account.',
          icon: (
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
              <rect x="1" y="1" width="10" height="10" fill="#F25022" />
              <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
              <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
              <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
            </svg>
          ),
          status: 'not-connected'
        },
        {
          id: 'meta-ads',
          title: 'Meta Ads',
          description: 'Connect Facebook & Instagram Ads.',
          icon: (
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          ),
          status: 'not-connected'
        },
        {
          id: 'tiktok-ads',
          title: 'TikTok Ads',
          description: 'Connect your TikTok Ads account.',
          icon: (
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
            </svg>
          ),
          status: 'not-connected'
        },
        {
          id: 'linkedin-ads',
          title: 'LinkedIn Ads',
          description: 'Connect your LinkedIn Ads account.',
          icon: (
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#0A66C2">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          ),
          status: 'not-connected'
        },
        {
          id: 'twitter-ads',
          title: 'X (Twitter) Ads',
          description: 'Connect your X Ads account.',
          icon: (
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          ),
          status: 'not-connected'
        },
        {
          id: 'snapchat-ads',
          title: 'Snapchat Ads',
          description: 'Connect your Snapchat Ads account.',
          icon: (
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#FFFC00">
              <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z" />
            </svg>
          ),
          status: 'not-connected'
        }
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics & Tracking',
      titleAr: 'التحليلات والتتبع',
      integrations: [
        {
          id: 'google-analytics',
          title: 'Google Analytics',
          description: 'Track website visitors and behavior.',
          icon: (
            <img src="/images/icons/google-analytics.svg" alt="GA" className="w-6 h-6 object-contain" />
          ),
          status: 'not-connected'
        },
        {
          id: 'google-tag-manager',
          title: 'Tag Manager',
          description: 'Manage website tracking tags.',
          icon: (
            <svg viewBox="0 0 48 48" className="w-6 h-6">
              <path fill="#4fc3f7" d="M44.945,21.453L26.547,3.055c-1.404-1.404-3.689-1.404-5.094,0L3.055,21.453c-1.404,1.404-1.404,3.689,0,5.094l18.398,18.398c0.702,0.702,1.625,1.053,2.547,1.053s1.845-0.351,2.547-1.053l18.398-18.398C46.349,25.143,46.349,22.857,44.945,21.453z M24,29l-5-5l5-5l5,5L24,29z" />
              <path fill="#2979ff" d="M33.246,9.754L24,19l5,5l-5,5l9.246,9.246l11.699-11.699c1.404-1.404,1.404-3.689,0-5.094L33.246,9.754z" />
              <path fill="#2962ff" d="M14.754,38.246l6.699,6.699c0.702,0.702,1.625,1.053,2.547,1.053s1.845-0.351,2.547-1.053l6.699-6.699L24,29L14.754,38.246z" />
            </svg>
          ),
          status: 'not-connected'
        },
        {
          id: 'google-merchant',
          title: 'Merchant Center',
          description: 'Connect your Google Merchant Center.',
          icon: (
            <svg viewBox="0 0 24 24" className="w-6 h-6">
              <path fill="#4285F4" d="M20.01 7.56L12 2 3.99 7.56v8.88L12 22l8.01-5.56V7.56z" />
              <path fill="#34A853" d="M12 22l8.01-5.56V7.56L12 13.12V22z" />
              <path fill="#FBBC05" d="M3.99 16.44L12 22v-8.88L3.99 7.56v8.88z" />
              <path fill="#EA4335" d="M12 2l8.01 5.56L12 13.12 3.99 7.56 12 2z" />
              <path fill="#fff" d="M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm0 5.5a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          ),
          status: 'not-connected'
        }
      ]
    },
    {
      id: 'marketing',
      title: 'Marketing & CRM',
      titleAr: 'التسويق وإدارة العملاء',
      integrations: [
        {
          id: 'mailchimp',
          title: 'Mailchimp',
          description: 'Connect your Mailchimp account.',
          icon: (
            <svg viewBox="0 0 52 52" className="w-6 h-6">
              <path fill="#FFE01B" d="M26 52c14.36 0 26-11.64 26-26S40.36 0 26 0 0 11.64 0 26s11.64 26 26 26z" />
              <path fill="#241c15" d="M42.6 24.1c-.4-.2-.8-.3-1.3-.3-.3 0-.5 0-.8.1.1-.3.1-.6.1-.9 0-1.1-.4-2-1.1-2.7-.7-.7-1.7-1.1-2.8-1.1-.7 0-1.4.2-1.9.5-.4-.7-.8-1.3-1.2-1.8-1.5-1.8-3.2-2.7-5.3-2.7-1.5 0-2.7.4-3.8 1.2-.4.3-.7.6-1 .9-.3-.1-.6-.2-.8-.3-.7-.2-1.5-.4-2.2-.4-1.4 0-2.6.4-3.8 1.1-1.2.7-2.1 1.8-2.7 3.1-.6 1.3-.8 2.7-.8 4.2 0 1.4.1 2.6.4 3.7.3 1.2.8 2.4 1.6 3.4.7 1 1.4 1.8 2.3 2.5.4.3.8.6 1.2.8-.2.4-.4.8-.4 1.2 0 .7.3 1.4.9 1.8.6.4 1.3.7 2.1.7.4 0 .7 0 1.1-.2.3-.1.7-.3 1.1-.6.4-.3 1-.8 1.7-1.4.2-.1.4-.3.7-.6 1.2.7 2.6 1.1 4.2 1.1 1.5 0 2.8-.3 4-1 1.2-.6 2.2-1.5 2.9-2.5.8-1 1.3-2.2 1.6-3.4.1-.5.2-1 .3-1.5.8-.2 1.5-.5 2.2-.8.1 0 .3-.1.4-.2.4-.2.9-.5 1.4-.8.7-.4 1.2-.8 1.5-1.3.4-.5.5-1 .5-1.5 0-.3-.1-.7-.3-.9-.1-.5-.4-.7-.8-.9z" />
            </svg>
          ),
          status: 'not-connected'
        },
        {
          id: 'hubspot',
          title: 'HubSpot',
          description: 'Connect your HubSpot CRM.',
          icon: (
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#FF7A59">
              <path d="M18.164 7.93V5.084a2.198 2.198 0 001.267-1.984v-.066A2.2 2.2 0 0017.23.836h-.065a2.2 2.2 0 00-2.199 2.198v.066c0 .907.554 1.684 1.34 2.017v2.79a5.856 5.856 0 00-2.832 1.503l-7.473-5.821a2.56 2.56 0 00.093-.675 2.583 2.583 0 00-2.583-2.583A2.583 2.583 0 00.928 2.914 2.583 2.583 0 003.51 5.497c.486 0 .94-.137 1.326-.373l7.36 5.733a5.895 5.895 0 00-.867 3.066c0 1.122.313 2.17.857 3.064l-2.612 2.612a1.907 1.907 0 00-.604-.104 1.93 1.93 0 00-1.93 1.93 1.93 1.93 0 001.93 1.93 1.93 1.93 0 001.93-1.93c0-.22-.04-.43-.104-.628l2.575-2.575a5.903 5.903 0 003.49 1.14 5.917 5.917 0 005.917-5.917 5.86 5.86 0 00-4.614-5.515zm-1.253 8.33a2.813 2.813 0 110-5.626 2.813 2.813 0 010 5.626z" />
            </svg>
          ),
          status: 'not-connected'
        },
        {
          id: 'klaviyo',
          title: 'Klaviyo',
          description: 'Connect your Klaviyo account.',
          icon: (
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#0A8E8E">
              <path d="M12 0L0 12l12 12 12-12L12 0zm0 3.515L20.485 12 12 20.485 3.515 12 12 3.515z" />
            </svg>
          ),
          status: 'not-connected'
        }
      ]
    }
  ]);

  // Flatten integrations for counting and connection checks
  const allIntegrations = integrationCategories.flatMap(cat => cat.integrations);
  const [integrations, setIntegrations] = useState<Integration[]>(allIntegrations);

  // Helper function to save statuses to cache
  const saveStatusToCache = (integrationId: string, status: 'connected' | 'not-connected') => {
    try {
      const cached = localStorage.getItem('cached_integration_statuses');
      const statuses: Record<string, 'connected' | 'not-connected'> = cached ? JSON.parse(cached) : {};
      statuses[integrationId] = status;
      localStorage.setItem('cached_integration_statuses', JSON.stringify(statuses));
    } catch (e) {
      console.warn('Cache save error:', e);
    }
  };

  // INSTANT: Load cached integration statuses on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem('cached_integration_statuses');
      if (cached) {
        const statuses: Record<string, 'connected' | 'not-connected'> = JSON.parse(cached);

        setIntegrations(prev => prev.map(int => ({
          ...int,
          status: statuses[int.id] || int.status
        })));

        setIntegrationCategories(prev => prev.map(cat => ({
          ...cat,
          integrations: cat.integrations.map(int => ({
            ...int,
            status: statuses[int.id] || int.status
          }))
        })));
      }
    } catch (e) {
      console.warn('Cache parse error:', e);
    }
  }, []);

  // Optimized connection check
  useEffect(() => {
    const checkGoogleAdsConnection = async () => {
      try {
        const response = await fetch('/api/client-requests', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) return;

        const result = await response.json();
        const requests = Array.isArray(result.data) ? result.data : [];
        const hasGoogleAdsConnection = requests.length > 0;
        const status = hasGoogleAdsConnection ? 'connected' : 'not-connected';

        updateIntegrationStatus('google-ads', status);
      } catch (error) {
        console.warn('⚠️ Error checking Google Ads:', error);
      }
    };

    const checkGoogleAnalyticsConnection = async () => {
      try {
        const response = await fetch('/api/analytics/connected', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) return;

        const result = await response.json();
        const hasAnalyticsConnection = result.success && result.properties && result.properties.length > 0;
        const status = hasAnalyticsConnection ? 'connected' : 'not-connected';

        updateIntegrationStatus('google-analytics', status);
      } catch (error) {
        console.warn('⚠️ Error checking Google Analytics:', error);
      }
    };

    const checkGTMConnection = async () => {
      try {
        const response = await fetch('/api/gtm/connected', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) return;

        const result = await response.json();
        const hasGTMConnection = result.success && result.containers && result.containers.length > 0;
        const status = hasGTMConnection ? 'connected' : 'not-connected';

        updateIntegrationStatus('google-tag-manager', status);
      } catch (error) {
        console.warn('⚠️ Error checking GTM:', error);
      }
    };

    const checkMerchantConnection = async () => {
      try {
        const response = await fetch('/api/merchant/connected', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) return;

        const result = await response.json();
        const hasMerchantConnection = result.success && result.accounts && result.accounts.length > 0;
        const status = hasMerchantConnection ? 'connected' : 'not-connected';

        updateIntegrationStatus('google-merchant', status);
      } catch (error) {
        console.warn('⚠️ Error checking Merchant:', error);
      }
    };

    const checkYoutubeConnection = async () => {
      try {
        const response = await fetch('/api/youtube/channels');
        if (response.ok) {
          const data = await response.json();
          const isConnected = data.success && Array.isArray(data.channels);
          updateIntegrationStatus('youtube-channel', isConnected ? 'connected' : 'not-connected');
        }
      } catch (e) {
        console.warn('⚠️ Failed to check YouTube connection', e);
      }
    };

    // Run all checks
    Promise.all([
      checkGoogleAdsConnection(),
      checkGoogleAnalyticsConnection(),
      checkGTMConnection(),
      checkMerchantConnection(),
      checkYoutubeConnection()
    ]);
  }, []);

  const updateIntegrationStatus = (id: string, status: 'connected' | 'not-connected') => {
    setIntegrations(prev => prev.map(int =>
      int.id === id ? { ...int, status } : int
    ));

    setIntegrationCategories(prev => prev.map(cat => ({
      ...cat,
      integrations: cat.integrations.map(int =>
        int.id === id ? { ...int, status } : int
      )
    })));

    saveStatusToCache(id, status);
  };

  const handleConnect = async (integrationId: string) => {
    console.log(`Connecting to ${integrationId}`);

    if (integrationId === 'google-ads') {
      window.location.href = '/api/oauth/google?redirect_after=' + encodeURIComponent('/google-ads/integrations/google-ads') + '&scope=ads';
    } else if (integrationId === 'google-analytics') {
      window.location.href = '/api/oauth/google?redirect_after=' + encodeURIComponent('/google-ads/integrations/google-analytics') + '&scope=analytics';
    } else if (integrationId === 'google-tag-manager') {
      window.location.href = '/api/oauth/google?redirect_after=' + encodeURIComponent('/google-ads/integrations/google-tag-manager') + '&scope=gtm';
    } else if (integrationId === 'google-merchant') {
      window.location.href = '/api/oauth/google?redirect_after=' + encodeURIComponent('/google-ads/integrations/google-merchant') + '&scope=merchant';
    } else if (integrationId === 'youtube-channel') {
      window.location.href = '/api/oauth/google?redirect_after=' + encodeURIComponent('/google-ads/integrations/youtube-channel') + '&scope=youtube';
    } else if (integrationId === 'meta-ads') {
      window.location.href = '/api/oauth/meta?redirect_after=' + encodeURIComponent('/google-ads/integrations/meta-ads');
    } else {
      alert('This integration will be available soon!');
    }
  };

  return (
    <>
      <div className="mb-[25px]">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-[25px]">
          <h5 className="!mb-0 text-gray-900 dark:text-white font-bold text-lg">
            {t.integrations?.title || 'Integrations'}
          </h5>
        </div>

        {/* Integration Categories */}
        <div className="space-y-[30px]">
          {integrationCategories.map((category) => (
            <div key={category.id}>
              <h5 className="!mb-[20px] pb-2 border-b border-gray-100 dark:border-gray-800">
                {language === 'ar' ? category.titleAr : category.title}
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-[25px]">
                {category.integrations.map((integration) => (
                  <IntegrationCard
                    key={integration.id}
                    integrationId={integration.id}
                    title={integration.title}
                    description={integration.description}
                    icon={integration.icon}
                    status={integration.status}
                    onConnect={() => handleConnect(integration.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Smart Notifications */}
      <NotificationManager />
    </>
  );
};

export default IntegrationsPage;