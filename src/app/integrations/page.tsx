'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GlowingBorderCard from '@/components/ui/glowingbordercard';
import { InteractiveInput } from '@/components/ui/interactive-input';
import { useTranslation } from '@/lib/hooks/useTranslation';

// Integration Card Component
interface IntegrationCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'connected' | 'not-connected';
  onConnect: () => void;
}

interface Integration {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'connected' | 'not-connected';
}

// Helper function to get integration colors (from/to)
const getIntegrationColors = (title: string): { from: string; to: string } => {
  switch (title) {
    case 'Google Ads integration':
      return { from: 'purple-600', to: 'purple-600' }; // Purple
    case 'Google Analytics integration':  
      return { from: 'purple-600', to: 'purple-600' }; // Purple
    case 'Google Tag Manager integration':
      return { from: 'purple-600', to: 'purple-600' }; // Purple
    default:
      return { from: 'purple-600', to: 'purple-600' }; // Purple default
  }
};

const IntegrationCard: React.FC<IntegrationCardProps & { onRefresh?: () => void; isRefreshing?: boolean }> = ({
  title,
  description,
  icon,
  status,
  onConnect,
  onRefresh,
  isRefreshing
}) => {
  const colors = getIntegrationColors(title);
  const { language, isRTL } = useTranslation();

  return (
    <GlowingBorderCard 
      className="w-80 h-80" 
      fromColor={colors.from} 
      toColor={colors.to}
    >
      <div className="w-full h-full flex flex-col relative overflow-hidden">
        {/* Header Section */}
        <div className="flex justify-between items-start w-full mb-2 px-1">
          {/* Status Badge */}
          <div className={`px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
            status === 'connected' 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
          }`}>
            {status === 'connected' ? (language === 'ar' ? 'متصل' : 'CONNECTED') : (language === 'ar' ? 'مميز' : 'FEATURED')}
          </div>
          
          {/* Icon */}
          <div className="text-white opacity-90 transform hover:scale-110 transition-transform flex items-center justify-center">
            {icon}
          </div>
        </div>

        {/* Main Content Section */}
        <div className="flex-1 flex flex-col justify-center items-center text-center px-2 py-1">
          {/* Title */}
          <h3 className="text-lg font-semibold mb-1 text-white leading-tight text-center">
            {title.includes('Tag Manager') 
              ? 'Tag Manager' 
              : title.replace(' integration', '')
            }
          </h3>

          {/* Description */}
          <p className="text-xs text-gray-400 leading-relaxed text-center">
            {title.includes('Tag Manager') 
              ? 'Manage website tracking and analytics tags'
              : description.replace('this project to your ', 'your ')
            }
          </p>
        </div>

        {/* Footer Section */}
        <div className="w-full px-1 pb-1">
          {status === 'connected' ? (
            // Connected state - زر إدارة + زر تحديث الأذونات
            <div className="flex gap-2">
              <InteractiveInput
                className="bg-green-500 text-white flex-1"
                variant="default"
                inputSize="small"
                glow={true}
                rounded="custom"
                hideAnimations={false}
                uppercase={true}
                textEffect="normal"
                shimmerColor="#39FF14"
                shimmerSize="0.1em"
                shimmerDuration="3s"
                borderRadius="100px"
                background="rgba(0, 0, 0, 1)"
                onClick={() => window.location.href = '/integrations/google-ads'}
              >
                {language === 'ar' ? 'إدارة' : 'Manage'}
              </InteractiveInput>
              {onRefresh && (
                <InteractiveInput
                  className={`text-white flex-1 ${isRefreshing ? 'opacity-50 pointer-events-none' : ''}`}
                  variant="default"
                  inputSize="small"
                  glow={true}
                  rounded="custom"
                  hideAnimations={false}
                  uppercase={true}
                  textEffect="normal"
                  shimmerColor="#A855F7"
                  shimmerSize="0.1em"
                  shimmerDuration="3s"
                  borderRadius="100px"
                  background="rgba(0, 0, 0, 1)"
                  onClick={isRefreshing ? undefined : onRefresh}
                >
                  {isRefreshing 
                    ? (language === 'ar' ? 'جاري...' : 'Loading...') 
                    : (language === 'ar' ? 'إعادة الاتصال' : 'Reconnect')
                  }
                </InteractiveInput>
              )}
            </div>
          ) : (
            // Not connected state - single button
            <InteractiveInput
              className="bg-green-500 text-white w-full"
              variant="default"
              inputSize="small"
              glow={true}
              rounded="custom"
              hideAnimations={false}
              uppercase={true}
              textEffect="normal"
              shimmerColor="#39FF14"
              shimmerSize="0.1em"
              shimmerDuration="3s"
              borderRadius="100px"
              background="rgba(0, 0, 0, 1)"
              onClick={onConnect}
            >
              {language === 'ar' ? 'ابدأ' : 'Get Started'}
            </InteractiveInput>
          )}
        </div>
      </div>
    </GlowingBorderCard>
  );
};

// Main Integrations Page Component
const IntegrationsPage: React.FC = () => {
  const router = useRouter();
  const { t, language, isRTL } = useTranslation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'google-ads',
      title: 'Google Ads integration',
      description: 'Connect this project to your Google Ads account.',
      icon: (
        <div className="w-12 h-12 flex items-center justify-center">
          <img 
            src="/images/integrations/google-ads-logo.svg" 
            alt="Google Ads" 
            className="w-12 h-12 object-contain"
          />
        </div>
      ),
      status: 'not-connected'
    },
    {
      id: 'google-analytics',
      title: 'Google Analytics integration',
      description: 'Connect your Google Analytics account.',
      icon: (
        <div className="w-12 h-12 flex items-center justify-center">
          <img 
            src="/images/integrations/google-analytics-logo.svg" 
            alt="Google Analytics" 
            className="w-12 h-12 object-contain"
          />
        </div>
      ),
      status: 'not-connected'
    },
    {
      id: 'google-tag-manager',
      title: 'Google Tag Manager integration',
      description: 'Connect your Google Tag Manager account.',
      icon: (
        <div className="w-12 h-12 flex items-center justify-center">
          <img 
            src="/images/integrations/google-tag-manager-logo.svg" 
            alt="Google Tag Manager" 
            className="w-12 h-12 object-contain"
          />
        </div>
      ),
      status: 'not-connected'
    }
  ]);

  // Function to refresh permissions and fetch accounts
  const handleRefreshPermissions = async () => {
    setIsRefreshing(true);
    try {
      console.log('🔄 Refreshing Google Ads permissions and accounts...');
      
      // 1. مسح الحسابات القديمة من قاعدة البيانات للمستخدم الحالي
      try {
        console.log('🗑️ Deleting old accounts from database...');
        const deleteResponse = await fetch('/api/client-requests', {
          method: 'DELETE',
          credentials: 'include'
        });
        if (deleteResponse.ok) {
          console.log('✅ Old accounts deleted from database');
        } else {
          console.warn('⚠️ Could not delete old accounts:', await deleteResponse.text());
        }
      } catch (e) {
        console.warn('⚠️ Could not delete old accounts:', e);
      }
      
      // 2. مسح الكاش
      try {
        await fetch('/api/user/accounts?clearCache=true', {
          method: 'GET',
          credentials: 'include'
        });
        console.log('✅ Cache cleared');
      } catch (e) {
        console.warn('⚠️ Could not clear cache:', e);
      }
      
      // 3. إعادة توجيه المستخدم لعملية OAuth لتحديث الأذونات وجلب الحسابات
      window.location.href = '/api/oauth/google?redirect_after=' + encodeURIComponent('/integrations/google-ads') + '&refresh=true';
      
    } catch (error) {
      console.error('❌ Error refreshing permissions:', error);
      alert(language === 'ar' ? 'حدث خطأ أثناء تحديث الأذونات' : 'Error refreshing permissions');
      setIsRefreshing(false);
    }
  };

  const handleConnect = async (integrationId: string) => {
    console.log(`Connecting to ${integrationId}`);
    
    if (integrationId === 'google-ads') {
      // Check if already connected
      const googleAdsIntegration = integrations.find(int => int.id === 'google-ads');
      if (googleAdsIntegration?.status === 'connected') {
        // If connected, ask to disconnect
        if (confirm('Are you sure you want to disconnect Google Ads? This will revoke all permissions.')) {
          try {
            console.log('🔌 Disconnecting Google Ads...');
            
            // Clear HttpOnly cookies through API call
            await fetch('/api/oauth/logout', {
              method: 'POST',
              credentials: 'include'
            });
            
            // Clear non-HttpOnly cookies
            document.cookie = 'google_ads_connected=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            
            // Clear localStorage (for UI state only)
            localStorage.removeItem('hasSeenServiceModal');
            localStorage.removeItem('selectedGoogleAdsAccount');
            
            // Revoke Google permissions
            try {
              await fetch('https://oauth2.googleapis.com/revoke', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                  token: '' // HttpOnly cookies not accessible via JavaScript
                })
              });
            } catch (revokeError) {
              console.log('⚠️ Could not revoke token from Google');
            }
            
            // Update UI
            setIntegrations(prev => 
              prev.map(integration => 
                integration.id === 'google-ads' 
                  ? { ...integration, status: 'not-connected' }
                  : integration
              )
            );
            
            console.log('✅ Google Ads disconnected successfully');
            alert('Google Ads disconnected successfully. You can reconnect anytime.');
            
          } catch (error) {
            console.error('❌ Error disconnecting Google Ads:', error);
            alert('Error disconnecting Google Ads. Please try again.');
          }
        }
      } else {
        // If not connected, start OAuth flow
        window.location.href = '/api/oauth/google?redirect_after=' + encodeURIComponent('/integrations/google-ads');
      }
    } else {
      // For other integrations, show coming soon message
      alert('This integration will be available soon!');
    }
  };


  // Optimized connection check - reduced API calls
  useEffect(() => {
    const checkGoogleAdsConnection = async () => {
      try {
        // فحص الاتصال لكل عميل بناءً على البيانات المخزنة في Supabase (client_requests)
        const response = await fetch('/api/client-requests', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          console.warn('⚠️ فشل في فحص حالة Google Ads من /api/client-requests:', response.status, response.statusText);
          return;
        }

        const result = await response.json();
        const requests = Array.isArray(result.data) ? result.data : [];
        const hasGoogleAdsConnection = requests.length > 0;

        setIntegrations(prev => 
          prev.map(integration => 
            integration.id === 'google-ads' 
              ? { ...integration, status: hasGoogleAdsConnection ? 'connected' : 'not-connected' }
              : integration
          )
        );
      } catch (error) {
        console.warn('⚠️ خطأ في فحص حالة Google Ads:', error);
      }
    };

    checkGoogleAdsConnection();
  }, []);

  const connectedCount = integrations.filter(int => int.status === 'connected').length;
  const totalCount = integrations.length;

  return (
    <div className="min-h-screen p-6" dir="ltr">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-white mb-4" dir={isRTL ? 'rtl' : 'ltr'}>
            {t.integrations?.title || 'Integrations'}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
            {t.integrations?.description || 'Connect your accounts and external services to enhance your advertising campaigns.'}
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white font-medium" dir={isRTL ? 'rtl' : 'ltr'}>
              {isRTL ? `${connectedCount} من ${totalCount} متصل` : `${connectedCount} of ${totalCount} connected`}
            </span>
          </div>
        </div>

        {/* Integration Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto place-items-center">
          {integrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              title={integration.title}
              description={integration.description}
              icon={integration.icon}
              status={integration.status}
              onConnect={() => handleConnect(integration.id)}
              onRefresh={integration.id === 'google-ads' ? handleRefreshPermissions : undefined}
              isRefreshing={isRefreshing}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default IntegrationsPage;