'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GlowingBorderCard from '@/components/ui/glowingbordercard';
import { InteractiveInput } from '@/components/ui/interactive-input';

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

const IntegrationCard: React.FC<IntegrationCardProps> = ({
  title,
  description,
  icon,
  status,
  onConnect
}) => {
  const colors = getIntegrationColors(title);

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
            {status === 'connected' ? 'CONNECTED' : 'FEATURED'}
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
            // Connected state - dual buttons
            <div className="flex gap-1 w-full">
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
                Manage
              </InteractiveInput>
              <InteractiveInput
                className="text-white flex-1 !bg-red-500"
                variant="default"
                inputSize="small"
                glow={true}
                rounded="custom"
                hideAnimations={false}
                uppercase={true}
                textEffect="normal"
                shimmerColor="#FF0000"
                shimmerSize="0.1em"
                shimmerDuration="3s"
                borderRadius="100px"
                background="#EF4444"
                onClick={onConnect}
              >
                Disconnect
              </InteractiveInput>
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
              Get Started
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
      status: 'not-connected' as const
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
      status: 'not-connected' as const
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
      status: 'not-connected' as const
    }
  ]);

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
            
            // Clear all cookies
            document.cookie = 'oauth_access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'oauth_refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'google_ads_connected=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'oauth_user_info=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            
            // Clear localStorage
            localStorage.removeItem('hasSeenServiceModal');
            localStorage.removeItem('googleAdsConnected');
            localStorage.removeItem('googleAdsConnectionTime');
            localStorage.removeItem('selectedGoogleAdsAccount');
            
            // Revoke Google permissions
            try {
              await fetch('https://oauth2.googleapis.com/revoke', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                  token: document.cookie.split('oauth_access_token=')[1]?.split(';')[0] || ''
                })
              });
            } catch (revokeError) {
              console.log('⚠️ Could not revoke token from Google');
            }
            
            // Update UI
            setIntegrations(prev => 
              prev.map(integration => 
                integration.id === 'google-ads' 
                  ? { ...integration, status: 'not-connected' as const }
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
    const checkGoogleAdsConnection = () => {
      // Check localStorage first (fastest)
      const isConnectedLocal = localStorage.getItem('googleAdsConnected') === 'true';
      
      // Check cookies for OAuth tokens
      const hasAccessToken = document.cookie.includes('oauth_access_token=');
      const isGoogleAdsConnected = document.cookie.includes('google_ads_connected=true');
      
      // If any connection indicator is found, mark as connected
      if (isConnectedLocal || hasAccessToken || isGoogleAdsConnected) {
        setIntegrations(prev => 
          prev.map(integration => 
            integration.id === 'google-ads' 
              ? { ...integration, status: 'connected' as const }
              : integration
          )
        );
      }
    };

    checkGoogleAdsConnection();
  }, []);

  const connectedCount = integrations.filter(int => int.status === 'connected').length;
  const totalCount = integrations.length;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">Integrations</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Connect your accounts and external services to enhance your advertising campaigns.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white font-medium">
              {connectedCount} of {totalCount} connected
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
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default IntegrationsPage;