'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Check, Search, Monitor, ShoppingCart, Video, Smartphone, Zap, TrendingUp, Crown, Sparkles, Award, TrendingUp as TrendingIcon } from 'lucide-react';
import GlowButton from '@/components/ui/glow-button';
import { useTranslation } from '@/lib/hooks/useTranslation';
import ScrollList from '@/components/ui/scroll-list';
import CampaignProgress from '@/components/ui/campaign-progress';

interface CampaignType {
  id: string;
  name: string;
  name_en: string;
  type: string;
  icon: React.ComponentType<any>; // Professional Lucide icon
}

// Campaign types loaded directly - no API call needed
const CAMPAIGN_TYPES: CampaignType[] = [
  {
    id: '1',
    name: 'حملة البحث',
    name_en: 'Search Campaign',
    type: 'SEARCH',
    icon: Search
  },
  {
    id: '2',
    name: 'حملة الشبكة الإعلانية',
    name_en: 'Display Campaign',
    type: 'DISPLAY',
    icon: Monitor
  },
  {
    id: '3',
    name: 'حملة التسوق',
    name_en: 'Shopping Campaign',
    type: 'SHOPPING',
    icon: ShoppingCart
  },
  {
    id: '4',
    name: 'حملة الفيديو',
    name_en: 'Video Campaign',
    type: 'VIDEO',
    icon: Video
  },
  {
    id: '5',
    name: 'حملة التطبيقات',
    name_en: 'App Campaign',
    type: 'APP',
    icon: Smartphone
  },
  {
    id: '6',
    name: 'الأداء الأقصى',
    name_en: 'Performance Max',
    type: 'PERFORMANCE_MAX',
    icon: Zap
  },
  {
    id: '7',
    name: 'توليد الطلب',
    name_en: 'Demand Gen',
    type: 'DEMAND_GEN',
    icon: TrendingUp
  }
];

const CampaignNewPage: React.FC = () => {
  const router = useRouter();
  const { t, language, isRTL } = useTranslation();
  const [selectedCampaignType, setSelectedCampaignType] = useState<string | null>(null);

  // Load saved campaign type from localStorage (from website-url detection)
  useEffect(() => {
    try {
      const campaignData = JSON.parse(localStorage.getItem('campaignData') || '{}');
      if (campaignData.campaignType) {
        setSelectedCampaignType(campaignData.campaignType);
      }
    } catch (error) {
      console.error('Error loading campaign data:', error);
    }
  }, []);

  const handleCampaignTypeSelect = useCallback((campaignType: string) => {
    setSelectedCampaignType(campaignType);

    // Preserve important data from website-url page, clear only campaign-specific data
    try {
      const existingData = JSON.parse(localStorage.getItem('campaignData') || '{}');

      // Remove campaign-specific data that depends on campaign type
      localStorage.removeItem('generatedContent');
      localStorage.removeItem('selectedLocations');
      localStorage.removeItem('forecastData');
      localStorage.removeItem('cpcData');
      localStorage.removeItem('initialEstimates');
      localStorage.removeItem('creatingCampaign');

      // Preserve URL data, app data, and merchant data from website-url page
      const preservedData = {
        campaignType: campaignType,
        // Preserve website URL
        websiteUrl: existingData.websiteUrl,
        phoneNumber: existingData.phoneNumber,
        // Preserve detected type
        detectedUrlType: existingData.detectedUrlType,
        suggestedCampaignType: existingData.suggestedCampaignType,
        // Preserve Merchant selection
        selectedMerchantId: existingData.selectedMerchantId,
        selectedMerchantName: existingData.selectedMerchantName,
        // Preserve App selection
        selectedApp: existingData.selectedApp,
        selectedOS: existingData.selectedOS,
      };

      localStorage.setItem('campaignData', JSON.stringify(preservedData));

      console.log('🔄 Campaign type changed, preserved URL/App data:', preservedData);

      // Dispatch custom event to update sidebar
      window.dispatchEvent(new Event('campaignTypeChanged'));
    } catch (error) {
      console.error('Error saving campaign type:', error);
    }
  }, []);

  const handleNext = useCallback(() => {
    if (!selectedCampaignType) {
      alert(t.campaign?.selectCampaignType || 'Please select a campaign type');
      return;
    }

    try {
      // Save campaign type to localStorage (preserve existing data from website-url)
      const existingData = JSON.parse(localStorage.getItem('campaignData') || '{}');
      localStorage.setItem('campaignData', JSON.stringify({
        ...existingData,
        campaignType: selectedCampaignType
      }));

      // Dispatch event to update sidebar
      window.dispatchEvent(new Event('campaignTypeChanged'));

      // Navigate to next step (location targeting)
      router.push('/google-ads/campaigns/location-targeting');
    } catch (error) {
      console.error('Error navigating to next step:', error);
      alert(language === 'ar' ? 'خطأ في الانتقال للخطوة التالية' : 'Error navigating to next step. Please try again.');
    }
  }, [selectedCampaignType, router, language]);

  // Campaign type descriptions
  const getCampaignDescription = (type: string): string => {
    const descriptions: { [key: string]: string } = {
      'SEARCH': t.campaign?.searchDescription || 'Text ads on Google search results',
      'DISPLAY': t.campaign?.displayDescription || 'Visual ads on websites and apps',
      'SHOPPING': t.campaign?.shoppingDescription || 'Product ads with images and prices',
      'VIDEO': t.campaign?.videoDescription || 'Video ads on YouTube and partner sites',
      'APP': t.campaign?.appDescription || 'Promote your mobile app downloads',
      'PERFORMANCE_MAX': t.campaign?.performanceMaxDescription || 'AI-powered ads across all Google properties',
      'DEMAND_GEN': t.campaign?.demandGenDescription || 'Drive demand on YouTube, Discover, and Gmail'
    };

    return descriptions[type];
  };

  // Get badge for campaign type
  const getCampaignBadge = (type: string): { text: string; text_ar: string; icon: React.ReactNode; bgGradient: string; iconColor: string } | null => {
    const badges: { [key: string]: { text: string; text_ar: string; icon: React.ReactNode; bgGradient: string; iconColor: string } } = {
      'SEARCH': {
        text: 'Most Popular',
        text_ar: 'الأكثر شعبية',
        icon: <Crown />,
        bgGradient: 'from-yellow-400 via-yellow-500 to-orange-500',
        iconColor: 'text-yellow-100'
      },
      'PERFORMANCE_MAX': {
        text: 'AI Powered',
        text_ar: 'مدعوم بالذكاء',
        icon: <Sparkles />,
        bgGradient: 'from-purple-500 via-fuchsia-500 to-pink-500',
        iconColor: 'text-purple-100'
      },
      'SHOPPING': {
        text: 'Best ROI',
        text_ar: 'أفضل عائد',
        icon: <Award />,
        bgGradient: 'from-blue-500 via-cyan-500 to-blue-600',
        iconColor: 'text-blue-100'
      },
      'VIDEO': {
        text: 'Trending',
        text_ar: 'رائج',
        icon: <TrendingIcon />,
        bgGradient: 'from-pink-500 via-rose-500 to-pink-600',
        iconColor: 'text-pink-100'
      }
    };

    return badges[type] || null;
  };


  return (
    <div className="min-h-screen overflow-x-hidden" dir="ltr">
      {/* Campaign Progress */}
      <CampaignProgress currentStep={0} totalSteps={3} />

      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-2 sm:mb-6">
          <h1
            className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {t.campaign?.chooseCampaignType || 'Choose Your Campaign Type'}
          </h1>
        </div>

        {/* Campaign Type Selection */}
        <div className="max-w-4xl mx-auto">
          {/* ScrollList for Campaign Types */}
          <div className="flex justify-center">
            <ScrollList
              data={CAMPAIGN_TYPES}
              renderItem={(campaignType: CampaignType, index: number) => {
                const colors = [
                  'bg-gradient-to-br from-yellow-500 to-orange-600', // Search
                  'bg-gradient-to-br from-green-500 to-emerald-600',  // Display
                  'bg-gradient-to-br from-blue-500 to-cyan-600',   // Shopping
                  'bg-gradient-to-br from-purple-500 to-pink-600', // Video
                  'bg-gradient-to-br from-orange-500 to-red-600', // App
                  'bg-gradient-to-br from-pink-500 to-rose-600',   // Performance Max
                  'bg-gradient-to-br from-red-500 to-pink-600'     // Demand Gen
                ];

                // Checkmark colors matching card gradients
                const checkmarkColors = [
                  'bg-gradient-to-br from-yellow-500 to-orange-600 shadow-orange-600/60 dark:shadow-orange-500/50', // Search
                  'bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-600/60 dark:shadow-green-500/50',  // Display
                  'bg-gradient-to-br from-blue-500 to-cyan-600 shadow-blue-600/60 dark:shadow-cyan-500/50',   // Shopping
                  'bg-gradient-to-br from-purple-500 to-pink-600 shadow-purple-600/60 dark:shadow-pink-500/50', // Video
                  'bg-gradient-to-br from-orange-500 to-red-600 shadow-orange-600/60 dark:shadow-red-500/50', // App
                  'bg-gradient-to-br from-pink-500 to-rose-600 shadow-pink-600/60 dark:shadow-rose-500/50',   // Performance Max
                  'bg-gradient-to-br from-red-500 to-pink-600 shadow-red-600/60 dark:shadow-pink-500/50'     // Demand Gen
                ];

                const isSelected = selectedCampaignType === campaignType.type;
                const IconComponent = campaignType.icon;
                const badge = getCampaignBadge(campaignType.type);

                return (
                  <div
                    className={`relative p-4 sm:p-5 ${colors[index % colors.length]} rounded-xl cursor-pointer transition-all duration-150 ease-out h-full flex flex-col justify-center border ${isSelected
                      ? 'ring-2 sm:ring-4 ring-gray-900/30 dark:ring-white/60 shadow-2xl shadow-gray-400/70 dark:shadow-black/40 scale-[1.02] border-gray-300 dark:border-white/30'
                      : 'shadow-lg shadow-gray-300/60 dark:shadow-black/20 hover:shadow-xl hover:shadow-gray-400/70 dark:hover:shadow-black/30 hover:scale-[1.01] border-gray-200 dark:border-white/10'
                      }`}
                    onClick={() => handleCampaignTypeSelect(campaignType.type)}
                  >
                    {/* Professional Badge - Top Right */}
                    {badge && (
                      <div className="absolute -top-2 -right-1 sm:-right-2 z-10">
                        <div className={`bg-gradient-to-r ${badge.bgGradient} text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1 sm:gap-1.5 shadow-lg ring-1 sm:ring-2 ring-white/20 backdrop-blur-sm`}>
                          <span className={`${badge.iconColor} [&>svg]:w-3 [&>svg]:h-3 sm:[&>svg]:w-4 sm:[&>svg]:h-4`}>
                            {badge.icon}
                          </span>
                          <span className="text-[10px] sm:text-xs font-bold drop-shadow-md whitespace-nowrap">
                            {language === 'ar' ? badge.text_ar : badge.text}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Professional Checkmark - Fixed position */}
                    {isSelected && (
                      <div className="absolute top-1/2 -translate-y-1/2 right-2 sm:right-4 z-10">
                        <div className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 ${checkmarkColors[index % checkmarkColors.length]} rounded-full shadow-lg ring-2 ring-white/30`}>
                          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={3} />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      {/* Icon and Title */}
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                          <IconComponent className="w-5 h-5 sm:w-7 sm:h-7 text-white drop-shadow-md" strokeWidth={2} />
                        </div>
                        <h3
                          className="text-base sm:text-lg font-bold text-white drop-shadow-md text-left leading-tight"
                          dir={isRTL ? 'rtl' : 'ltr'}
                        >
                          {isRTL ? campaignType.name : campaignType.name_en}
                        </h3>
                      </div>
                      <p
                        className="text-white/90 text-xs sm:text-sm leading-snug sm:leading-relaxed drop-shadow text-left mt-2 line-clamp-2"
                        dir={isRTL ? 'rtl' : 'ltr'}
                      >
                        {getCampaignDescription(campaignType.type)}
                      </p>
                    </div>
                  </div>
                );
              }}
              itemHeight={130}
            />
          </div>

          {/* Navigation Buttons */}
          <div className="mt-4 sm:mt-8 flex justify-between items-center max-w-2xl mx-auto">
            <GlowButton
              onClick={() => router.push('/google-ads/campaigns/website-url')}
              variant="green"
            >
              <span className="flex items-center gap-2">
                <ArrowLeft className="w-5 h-5" />
                {language === 'ar' ? 'السابق' : 'Previous'}
              </span>
            </GlowButton>

            <GlowButton
              onClick={handleNext}
              disabled={!selectedCampaignType}
              variant="blue"
            >
              <span className="flex items-center gap-2">
                {t.campaign?.nextStep || 'Next Step'}
                <ArrowRight className="w-5 h-5" />
              </span>
            </GlowButton>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CampaignNewPage;