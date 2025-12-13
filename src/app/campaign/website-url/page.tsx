'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Globe, Link as LinkIcon, Shield, Sparkles, Zap, Phone, Search, ChevronDown, AlertCircle, CheckCircle2, XCircle, ShoppingCart, Smartphone, Video, Monitor, Store } from 'lucide-react';
import ReactCountryFlag from 'react-country-flag';
import GlowButton from '@/components/ui/glow-button';
import { VerifyBadge } from '@/components/ui/verify-badge';
import { CardContainer, CardBody, CardItem } from '@/components/ui/3d-card';
import GlowingBorderCard from '@/components/ui/glowingbordercard';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/lib/hooks/useTranslation';
import CampaignProgress from '@/components/ui/campaign-progress';
import { getApiUrl } from '@/lib/config';
import PlasmaGlobe from '@/components/ui/plasma-globe';

// Types for URL detection
interface UrlDetectionResult {
  type: 'website' | 'store' | 'app' | 'video';
  platform?: 'android' | 'ios';
  appId?: string;
  videoId?: string;
  channelId?: string;
  suggestedCampaignType: string;
  details?: {
    name?: string;
    icon?: string;
  };
}

interface MerchantAccount {
  id: string;
  name: string;
  linked: boolean;
  products: number | null;
  approvalRate: number | null;
}

interface AppResult {
  id: string;
  name: string;
  icon: string;
  developer: string;
  packageName: string;
  platform: 'android' | 'ios';
}

interface VideoResult {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  viewCount: string;
  channelTitle: string;
  description: string;
}

const WebsiteUrlPage: React.FC = () => {
  const router = useRouter();
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('+1');
  const [campaignType, setCampaignType] = useState('');
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [urlErrorMessage, setUrlErrorMessage] = useState('');
  const [isUrlVerified, setIsUrlVerified] = useState(false);
  const { t, language, isRTL } = useTranslation();

  // New state for smart URL detection
  const [detectedUrlType, setDetectedUrlType] = useState<UrlDetectionResult | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [merchantAccounts, setMerchantAccounts] = useState<MerchantAccount[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null);
  const [isFetchingMerchants, setIsFetchingMerchants] = useState(false);
  const [selectedOS, setSelectedOS] = useState<'android' | 'ios'>('android');
  const [appSearchQuery, setAppSearchQuery] = useState('');
  const [appSearchResults, setAppSearchResults] = useState<AppResult[]>([]);
  const [selectedApp, setSelectedApp] = useState<AppResult | null>(null);
  const [isSearchingApps, setIsSearchingApps] = useState(false);

  // New state for Video Campaign
  const [videoSearchQuery, setVideoSearchQuery] = useState('');
  const [videoSearchResults, setVideoSearchResults] = useState<VideoResult[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<VideoResult[]>([]);
  const [isVideoSearching, setIsVideoSearching] = useState(false);

  // Dynamic colors based on campaign type
  const campaignTypeColors: Record<string, string> = {
    '': 'from-purple-500 to-violet-600',              // Default/Initial - Purple
    'DEFAULT': 'from-purple-500 to-violet-600',       // Default - Purple
    'SEARCH': 'from-amber-500 to-yellow-600',         // Gold/Yellow
    'DISPLAY': 'from-emerald-500 to-green-600',       // Green
    'SHOPPING': 'from-blue-500 to-cyan-600',          // Blue
    'VIDEO': 'from-red-500 to-rose-600',              // Red (YouTube)
    'APP': 'from-orange-500 to-amber-600',            // Orange
    'PERFORMANCE_MAX': 'from-purple-500 to-violet-600',
    'DEMAND_GEN': 'from-pink-500 to-rose-600'
  };

  // Dynamic shadow colors based on campaign type (for light mode)
  const campaignTypeShadowsLight: Record<string, string> = {
    '': 'shadow-purple-300/40',
    'DEFAULT': 'shadow-purple-300/40',
    'SEARCH': 'shadow-yellow-300/40',
    'DISPLAY': 'shadow-green-300/40',
    'SHOPPING': 'shadow-cyan-300/40',
    'VIDEO': 'shadow-red-300/40',
    'APP': 'shadow-orange-300/40',
    'PERFORMANCE_MAX': 'shadow-violet-300/40',
    'DEMAND_GEN': 'shadow-rose-300/40'
  };

  // Dynamic shadow colors based on campaign type (for dark mode)
  const campaignTypeShadowsDark: Record<string, string> = {
    '': 'dark:shadow-purple-500/30',
    'DEFAULT': 'dark:shadow-purple-500/30',
    'SEARCH': 'dark:shadow-yellow-500/30',
    'DISPLAY': 'dark:shadow-green-500/30',
    'SHOPPING': 'dark:shadow-cyan-500/30',
    'VIDEO': 'dark:shadow-red-500/30',
    'APP': 'dark:shadow-orange-500/30',
    'PERFORMANCE_MAX': 'dark:shadow-violet-500/30',
    'DEMAND_GEN': 'dark:shadow-rose-500/30'
  };

  // Dynamic border colors
  const campaignTypeBordersLight: Record<string, string> = {
    '': 'border-purple-300/50',
    'DEFAULT': 'border-purple-300/50',
    'SEARCH': 'border-yellow-300/50',
    'DISPLAY': 'border-green-300/50',
    'SHOPPING': 'border-cyan-300/50',
    'VIDEO': 'border-red-300/50',
    'APP': 'border-orange-300/50',
    'PERFORMANCE_MAX': 'border-violet-300/50',
    'DEMAND_GEN': 'border-rose-300/50'
  };

  const campaignTypeBordersDark: Record<string, string> = {
    '': 'dark:border-purple-400/30',
    'DEFAULT': 'dark:border-purple-400/30',
    'SEARCH': 'dark:border-orange-400/30',
    'DISPLAY': 'dark:border-emerald-400/30',
    'SHOPPING': 'dark:border-cyan-400/30',
    'VIDEO': 'dark:border-pink-400/30',
    'APP': 'dark:border-red-400/30',
    'PERFORMANCE_MAX': 'dark:border-rose-400/30',
    'DEMAND_GEN': 'dark:border-pink-400/30'
  };

  // Get the effective campaign type from detection result or fallback
  // When URL is empty, always show purple default
  const effectiveCampaignType = !websiteUrl ? '' : (detectedUrlType?.suggestedCampaignType || campaignType || '');

  const cardGradient = campaignTypeColors[effectiveCampaignType] || campaignTypeColors[''] || 'from-purple-500 to-violet-600';
  const cardShadowLight = campaignTypeShadowsLight[effectiveCampaignType] || campaignTypeShadowsLight[''] || 'shadow-purple-300/40';
  const cardShadowDark = campaignTypeShadowsDark[effectiveCampaignType] || campaignTypeShadowsDark[''] || 'dark:shadow-purple-500/30';
  const cardBorderLight = campaignTypeBordersLight[effectiveCampaignType] || campaignTypeBordersLight[''] || 'border-purple-300/50';
  const cardBorderDark = campaignTypeBordersDark[effectiveCampaignType] || campaignTypeBordersDark[''] || 'dark:border-purple-400/30';

  // Sync campaign type to localStorage and dispatch event to update sidebar New Campaign button color
  useEffect(() => {
    // Always save current effective campaign type to localStorage
    const currentData = JSON.parse(localStorage.getItem('campaignData') || '{}');
    const newCampaignType = effectiveCampaignType || '';

    // Always update localStorage with current campaign type
    localStorage.setItem('campaignData', JSON.stringify({
      ...currentData,
      campaignType: newCampaignType
    }));

    // Always dispatch event to notify sidebar to update its color
    window.dispatchEvent(new Event('campaignTypeChanged'));
    
    // Also trigger storage event for cross-tab sync
    window.dispatchEvent(new Event('storage'));
  }, [effectiveCampaignType]);

  // Dynamic modal colors based on campaign type
  const getModalColors = () => {
    switch (campaignType) {
      case 'SEARCH':
        return {
          primary: 'rgb(249, 115, 22)', // orange-500
          secondary: 'rgb(234, 88, 12)', // orange-600
          light: 'rgb(251, 146, 60)', // orange-400
          bgGradient: 'rgba(249, 115, 22, 0.15)',
          orb1: 'bg-orange-500/20',
          orb2: 'bg-yellow-500/20',
          icon: 'from-yellow-500 to-orange-600',
          iconShadow: 'shadow-orange-500/50',
          title: 'from-yellow-400 via-orange-400 to-orange-500',
          progress: 'from-yellow-500 via-orange-500 to-orange-600',
          progressGlow: 'from-orange-500/30 to-yellow-500/30',
          border: 'border-orange-500/20',
          shadow: '0 0 60px rgba(249, 115, 22, 0.4), 0 0 100px rgba(234, 88, 12, 0.3)',
          dots: ['bg-yellow-500', 'bg-orange-500', 'bg-orange-600']
        };
      case 'DISPLAY':
        return {
          primary: 'rgb(16, 185, 129)', // emerald-500
          secondary: 'rgb(5, 150, 105)', // emerald-600
          light: 'rgb(52, 211, 153)', // emerald-400
          bgGradient: 'rgba(16, 185, 129, 0.15)',
          orb1: 'bg-emerald-500/20',
          orb2: 'bg-green-500/20',
          icon: 'from-green-500 to-emerald-600',
          iconShadow: 'shadow-emerald-500/50',
          title: 'from-green-400 via-emerald-400 to-emerald-500',
          progress: 'from-green-500 via-emerald-500 to-emerald-600',
          progressGlow: 'from-emerald-500/30 to-green-500/30',
          border: 'border-emerald-500/20',
          shadow: '0 0 60px rgba(16, 185, 129, 0.4), 0 0 100px rgba(5, 150, 105, 0.3)',
          dots: ['bg-green-500', 'bg-emerald-500', 'bg-emerald-600']
        };
      case 'SHOPPING':
        return {
          primary: 'rgb(59, 130, 246)', // blue-500
          secondary: 'rgb(6, 182, 212)', // cyan-600
          light: 'rgb(34, 211, 238)', // cyan-400
          bgGradient: 'rgba(34, 211, 238, 0.15)',
          orb1: 'bg-cyan-500/20',
          orb2: 'bg-blue-500/20',
          icon: 'from-cyan-500 via-blue-500 to-blue-600',
          iconShadow: 'shadow-cyan-500/50',
          title: 'from-cyan-400 via-blue-400 to-blue-500',
          progress: 'from-cyan-500 via-blue-500 to-blue-600',
          progressGlow: 'from-cyan-500/30 via-blue-500/30 to-blue-600/30',
          border: 'border-cyan-500/20',
          shadow: '0 0 60px rgba(34, 211, 238, 0.4), 0 0 100px rgba(59, 130, 246, 0.3)',
          dots: ['bg-cyan-500', 'bg-blue-500', 'bg-blue-600']
        };
      case 'VIDEO':
        return {
          primary: 'rgb(168, 85, 247)', // purple-500
          secondary: 'rgb(236, 72, 153)', // pink-600
          light: 'rgb(244, 114, 182)', // pink-400
          bgGradient: 'rgba(168, 85, 247, 0.15)',
          orb1: 'bg-purple-500/20',
          orb2: 'bg-pink-500/20',
          icon: 'from-purple-500 to-pink-600',
          iconShadow: 'shadow-purple-500/50',
          title: 'from-purple-400 via-pink-400 to-pink-500',
          progress: 'from-purple-500 via-pink-500 to-pink-600',
          progressGlow: 'from-purple-500/30 to-pink-500/30',
          border: 'border-purple-500/20',
          shadow: '0 0 60px rgba(168, 85, 247, 0.4), 0 0 100px rgba(236, 72, 153, 0.3)',
          dots: ['bg-purple-500', 'bg-pink-500', 'bg-pink-600']
        };
      case 'APP':
        return {
          primary: 'rgb(249, 115, 22)', // orange-500
          secondary: 'rgb(239, 68, 68)', // red-600
          light: 'rgb(248, 113, 113)', // red-400
          bgGradient: 'rgba(249, 115, 22, 0.15)',
          orb1: 'bg-orange-500/20',
          orb2: 'bg-red-500/20',
          icon: 'from-orange-500 to-red-600',
          iconShadow: 'shadow-orange-500/50',
          title: 'from-orange-400 via-red-400 to-red-500',
          progress: 'from-orange-500 via-red-500 to-red-600',
          progressGlow: 'from-orange-500/30 to-red-500/30',
          border: 'border-orange-500/20',
          shadow: '0 0 60px rgba(249, 115, 22, 0.4), 0 0 100px rgba(239, 68, 68, 0.3)',
          dots: ['bg-orange-500', 'bg-red-500', 'bg-red-600']
        };
      case 'PERFORMANCE_MAX':
        return {
          primary: 'rgb(236, 72, 153)', // pink-500
          secondary: 'rgb(244, 63, 94)', // rose-600
          light: 'rgb(251, 113, 133)', // rose-400
          bgGradient: 'rgba(236, 72, 153, 0.15)',
          orb1: 'bg-pink-500/20',
          orb2: 'bg-rose-500/20',
          icon: 'from-pink-500 to-rose-600',
          iconShadow: 'shadow-pink-500/50',
          title: 'from-pink-400 via-rose-400 to-rose-500',
          progress: 'from-pink-500 via-rose-500 to-rose-600',
          progressGlow: 'from-pink-500/30 to-rose-500/30',
          border: 'border-pink-500/20',
          shadow: '0 0 60px rgba(236, 72, 153, 0.4), 0 0 100px rgba(244, 63, 94, 0.3)',
          dots: ['bg-pink-500', 'bg-rose-500', 'bg-rose-600']
        };
      case 'DEMAND_GEN':
        return {
          primary: 'rgb(239, 68, 68)', // red-500
          secondary: 'rgb(236, 72, 153)', // pink-600
          light: 'rgb(244, 114, 182)', // pink-400
          bgGradient: 'rgba(239, 68, 68, 0.15)',
          orb1: 'bg-red-500/20',
          orb2: 'bg-pink-500/20',
          icon: 'from-red-500 to-pink-600',
          iconShadow: 'shadow-red-500/50',
          title: 'from-red-400 via-pink-400 to-pink-500',
          progress: 'from-red-500 via-pink-500 to-pink-600',
          progressGlow: 'from-red-500/30 to-pink-500/30',
          border: 'border-red-500/20',
          shadow: '0 0 60px rgba(239, 68, 68, 0.4), 0 0 100px rgba(236, 72, 153, 0.3)',
          dots: ['bg-red-500', 'bg-pink-500', 'bg-pink-600']
        };
      default: // Default to cyan/blue theme
        return {
          primary: 'rgb(34, 211, 238)', // cyan-500
          secondary: 'rgb(59, 130, 246)', // blue-500
          light: 'rgb(96, 165, 250)', // blue-400
          bgGradient: 'rgba(34, 211, 238, 0.15)',
          orb1: 'bg-cyan-500/20',
          orb2: 'bg-blue-500/20',
          icon: 'from-cyan-500 via-blue-500 to-purple-600',
          iconShadow: 'shadow-cyan-500/50',
          title: 'from-cyan-400 via-blue-400 to-purple-400',
          progress: 'from-cyan-500 via-blue-500 to-purple-500',
          progressGlow: 'from-cyan-500/30 via-blue-500/30 to-purple-500/30',
          border: 'border-cyan-500/20',
          shadow: '0 0 60px rgba(34, 211, 238, 0.4), 0 0 100px rgba(59, 130, 246, 0.3), 0 0 140px rgba(168, 85, 247, 0.2)',
          dots: ['bg-cyan-500', 'bg-blue-500', 'bg-purple-500']
        };
    }
  };

  const modalColors = getModalColors();

  // Load campaign type from localStorage
  React.useEffect(() => {
    const campaignData = JSON.parse(localStorage.getItem('campaignData') || '{}');
    setCampaignType(campaignData.campaignType || '');
  }, []);


  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const dropdownContainer = target.closest('.country-dropdown-container');
      const searchInput = target.closest('.country-search-input');

      // Only close if clicking outside the dropdown AND not on the search input
      if (!dropdownContainer && !searchInput) {
        setIsCountryDropdownOpen(false);
        setCountrySearchQuery('');
      }
    };

    if (isCountryDropdownOpen) {
      // Use a small delay to prevent immediate closing
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 10);

      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [isCountryDropdownOpen]);

  // Comprehensive country codes list with names in multiple languages
  const allCountryCodes = [
    { code: '+1', country: 'United States', arabicName: 'الولايات المتحدة', flag: '🇺🇸', iso: 'US' },
    { code: '+1', country: 'Canada', arabicName: 'كندا', flag: '🇨🇦', iso: 'CA' },
    { code: '+20', country: 'Egypt', arabicName: 'مصر', flag: '🇪🇬', iso: 'EG' },
    { code: '+966', country: 'Saudi Arabia', arabicName: 'السعودية', flag: '🇸🇦', iso: 'SA' },
    { code: '+971', country: 'UAE', arabicName: 'الإمارات', flag: '🇦🇪', iso: 'AE' },
    { code: '+965', country: 'Kuwait', arabicName: 'الكويت', flag: '🇰🇼', iso: 'KW' },
    { code: '+974', country: 'Qatar', arabicName: 'قطر', flag: '🇶🇦', iso: 'QA' },
    { code: '+973', country: 'Bahrain', arabicName: 'البحرين', flag: '🇧🇭', iso: 'BH' },
    { code: '+968', country: 'Oman', arabicName: 'عمان', flag: '🇴🇲', iso: 'OM' },
    { code: '+962', country: 'Jordan', arabicName: 'الأردن', flag: '🇯🇴', iso: 'JO' },
    { code: '+961', country: 'Lebanon', arabicName: 'لبنان', flag: '🇱🇧', iso: 'LB' },
    { code: '+963', country: 'Syria', arabicName: 'سوريا', flag: '🇸🇾', iso: 'SY' },
    { code: '+964', country: 'Iraq', arabicName: 'العراق', flag: '🇮🇶', iso: 'IQ' },
    { code: '+967', country: 'Yemen', arabicName: 'اليمن', flag: '🇾🇪', iso: 'YE' },
    { code: '+212', country: 'Morocco', arabicName: 'المغرب', flag: '🇲🇦', iso: 'MA' },
    { code: '+213', country: 'Algeria', arabicName: 'الجزائر', flag: '🇩🇿', iso: 'DZ' },
    { code: '+216', country: 'Tunisia', arabicName: 'تونس', flag: '🇹🇳', iso: 'TN' },
    { code: '+218', country: 'Libya', arabicName: 'ليبيا', flag: '🇱🇾', iso: 'LY' },
    { code: '+44', country: 'UK', arabicName: 'بريطانيا', flag: '🇬🇧', iso: 'GB' },
    { code: '+33', country: 'France', arabicName: 'فرنسا', flag: '🇫🇷', iso: 'FR' },
    { code: '+49', country: 'Germany', arabicName: 'ألمانيا', flag: '🇩🇪', iso: 'DE' },
    { code: '+39', country: 'Italy', arabicName: 'إيطاليا', flag: '🇮🇹', iso: 'IT' },
    { code: '+34', country: 'Spain', arabicName: 'إسبانيا', flag: '🇪🇸', iso: 'ES' },
    { code: '+31', country: 'Netherlands', arabicName: 'هولندا', flag: '🇳🇱', iso: 'NL' },
    { code: '+32', country: 'Belgium', arabicName: 'بلجيكا', flag: '🇧🇪', iso: 'BE' },
    { code: '+41', country: 'Switzerland', arabicName: 'سويسرا', flag: '🇨🇭', iso: 'CH' },
    { code: '+43', country: 'Austria', arabicName: 'النمسا', flag: '🇦🇹', iso: 'AT' },
    { code: '+46', country: 'Sweden', arabicName: 'السويد', flag: '🇸🇪', iso: 'SE' },
    { code: '+47', country: 'Norway', arabicName: 'النرويج', flag: '🇳🇴', iso: 'NO' },
    { code: '+45', country: 'Denmark', arabicName: 'الدنمارك', flag: '🇩🇰', iso: 'DK' },
    { code: '+358', country: 'Finland', arabicName: 'فنلندا', flag: '🇫🇮', iso: 'FI' },
    { code: '+48', country: 'Poland', arabicName: 'بولندا', flag: '🇵🇱', iso: 'PL' },
    { code: '+90', country: 'Turkey', arabicName: 'تركيا', flag: '🇹🇷', iso: 'TR' },
    { code: '+91', country: 'India', arabicName: 'الهند', flag: '🇮🇳', iso: 'IN' },
    { code: '+92', country: 'Pakistan', arabicName: 'باكستان', flag: '🇵🇰', iso: 'PK' },
    { code: '+880', country: 'Bangladesh', arabicName: 'بنغلاديش', flag: '🇧🇩', iso: 'BD' },
    { code: '+86', country: 'China', arabicName: 'الصين', flag: '🇨🇳', iso: 'CN' },
    { code: '+81', country: 'Japan', arabicName: 'اليابان', flag: '🇯🇵', iso: 'JP' },
    { code: '+82', country: 'South Korea', arabicName: 'كوريا الجنوبية', flag: '🇰🇷', iso: 'KR' },
    { code: '+60', country: 'Malaysia', arabicName: 'ماليزيا', flag: '🇲🇾', iso: 'MY' },
    { code: '+65', country: 'Singapore', arabicName: 'سنغافورة', flag: '🇸🇬', iso: 'SG' },
    { code: '+62', country: 'Indonesia', arabicName: 'إندونيسيا', flag: '🇮🇩', iso: 'ID' },
    { code: '+63', country: 'Philippines', arabicName: 'الفلبين', flag: '🇵🇭', iso: 'PH' },
    { code: '+66', country: 'Thailand', arabicName: 'تايلاند', flag: '🇹🇭', iso: 'TH' },
    { code: '+84', country: 'Vietnam', arabicName: 'فيتنام', flag: '🇻🇳', iso: 'VN' },
    { code: '+61', country: 'Australia', arabicName: 'أستراليا', flag: '🇦🇺', iso: 'AU' },
    { code: '+64', country: 'New Zealand', arabicName: 'نيوزيلندا', flag: '🇳🇿', iso: 'NZ' },
    { code: '+7', country: 'Russia', arabicName: 'روسيا', flag: '🇷🇺', iso: 'RU' },
    { code: '+52', country: 'Mexico', arabicName: 'المكسيك', flag: '🇲🇽', iso: 'MX' },
    { code: '+55', country: 'Brazil', arabicName: 'البرازيل', flag: '🇧🇷', iso: 'BR' },
    { code: '+54', country: 'Argentina', arabicName: 'الأرجنتين', flag: '🇦🇷', iso: 'AR' },
    { code: '+27', country: 'South Africa', arabicName: 'جنوب أفريقيا', flag: '🇿🇦', iso: 'ZA' },
    { code: '+234', country: 'Nigeria', arabicName: 'نيجيريا', flag: '🇳🇬', iso: 'NG' },
    { code: '+254', country: 'Kenya', arabicName: 'كينيا', flag: '🇰🇪', iso: 'KE' },
  ];

  // Filter countries based on search query
  const filteredCountries = useMemo(() => {
    if (!countrySearchQuery) return allCountryCodes;

    const query = countrySearchQuery.toLowerCase();
    return allCountryCodes.filter(country =>
      country.country.toLowerCase().includes(query) ||
      country.arabicName.includes(query) ||
      country.code.includes(query)
    );
  }, [countrySearchQuery, allCountryCodes]);

  // Extract domain from URL
  const cleanUrl = (url: string) => {
    if (!url) return '';

    try {
      // Remove protocol if exists
      let cleanedUrl = url.replace(/^(https?:\/\/)?(www\.)?/i, '');

      // Remove trailing slash
      cleanedUrl = cleanedUrl.replace(/\/+$/, '');

      return cleanedUrl;
    } catch {
      return url;
    }
  };

  // Enhanced URL Validation with detailed error messages
  const validateUrl = (url: string): { isValid: boolean; errorMessage: string; isVerified: boolean } => {
    // Empty URL is not an error (user hasn't typed yet)
    if (!url || url.trim() === '') {
      return { isValid: true, errorMessage: '', isVerified: false };
    }

    // Check for spaces
    if (url.includes(' ')) {
      return { isValid: false, errorMessage: 'URL cannot contain spaces', isVerified: false };
    }

    // Check minimum length
    if (url.length < 3) {
      return { isValid: false, errorMessage: 'URL is too short', isVerified: false };
    }

    // Check if URL contains http:// or https://
    if (url.includes('http://') || url.includes('https://')) {
      return { isValid: false, errorMessage: 'Please remove http:// or https://', isVerified: false };
    }

    // Try to construct a full URL and validate it
    try {
      // Add https:// temporarily to validate the full URL structure
      const fullUrl = `https://${url}`;
      const urlObject = new URL(fullUrl);

      // Check if hostname is valid (has at least one dot)
      if (!urlObject.hostname.includes('.')) {
        return { isValid: false, errorMessage: 'Please enter a valid domain (e.g., example.com)', isVerified: false };
      }

      // Check for valid TLD (top-level domain)
      const tldPattern = /\.[a-zA-Z]{2,}$/;
      if (!tldPattern.test(urlObject.hostname)) {
        return { isValid: false, errorMessage: 'Invalid domain extension', isVerified: false };
      }

      // Check for dots at start or end of hostname
      if (urlObject.hostname.startsWith('.') || urlObject.hostname.endsWith('.')) {
        return { isValid: false, errorMessage: 'URL cannot start or end with a dot', isVerified: false };
      }

      // Check for consecutive dots
      if (urlObject.hostname.includes('..')) {
        return { isValid: false, errorMessage: 'URL cannot contain consecutive dots', isVerified: false };
      }

      // All checks passed - URL is valid and verified
      return { isValid: true, errorMessage: '', isVerified: true };
    } catch (error) {
      // URL constructor failed - invalid URL
      if (url.startsWith('.') || url.endsWith('.')) {
        return { isValid: false, errorMessage: 'URL cannot start or end with a dot', isVerified: false };
      }
      if (url.includes('..')) {
        return { isValid: false, errorMessage: 'URL cannot contain consecutive dots', isVerified: false };
      }
      if (!url.includes('.')) {
        return { isValid: false, errorMessage: 'Please enter a valid domain (e.g., example.com)', isVerified: false };
      }
      return { isValid: false, errorMessage: 'Invalid URL format', isVerified: false };
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleaned = cleanUrl(value);
    setWebsiteUrl(cleaned);

    const validation = validateUrl(cleaned);
    setIsValidUrl(validation.isValid);
    setUrlErrorMessage(validation.errorMessage);
    setIsUrlVerified(validation.isVerified);

    // Reset detection and campaign type when URL changes - resets to purple default
    setDetectedUrlType(null);
    setCampaignType('');
    setSelectedMerchant(null);
    setSelectedApp(null);
    setSelectedVideos([]);
  };

  // Detect URL type when URL is verified
  useEffect(() => {
    if (isUrlVerified && websiteUrl) {
      detectUrlType(websiteUrl);
    }
  }, [isUrlVerified, websiteUrl]);

  // URL type detection function - Smart detection using Merchant Center accounts + API
  const detectUrlType = async (url: string) => {
    setIsDetecting(true);
    try {
      // Smart Step 1: Check if URL matches any existing Merchant Center account website
      // This is instant and doesn't require HTML parsing
      const normalizedUrl = url.toLowerCase().replace(/^www\./, '').replace(/\/$/, '');

      // First, try to fetch merchant accounts to see if this URL is already known
      try {
        console.log('🔍 Smart detection: Fetching merchant accounts...');
        const merchantResponse = await fetch('/api/merchant/accounts', {
          credentials: 'include'
        });
        console.log('📥 Merchant response status:', merchantResponse.status);

        if (merchantResponse.ok) {
          const merchantData = await merchantResponse.json();
          console.log('📦 Merchant data received:', merchantData);

          if (merchantData.success && merchantData.accounts && merchantData.accounts.length > 0) {
            // Fetch linked accounts for status
            let linkedIds: Set<string> = new Set();
            try {
              const linkedRes = await fetch('/api/merchant/connected', { credentials: 'include' });
              if (linkedRes.ok) {
                const linkedData = await linkedRes.json();
                if (linkedData.accounts) {
                  linkedIds = new Set(linkedData.accounts.map((a: { merchant_id: string }) => a.merchant_id));
                }
              }
            } catch { /* ignore */ }

            // Map to our format
            const mappedAccounts = merchantData.accounts.map((acc: { merchantId: string; name: string; websiteUrl?: string }) => ({
              id: acc.merchantId,
              name: acc.name || `Account ${acc.merchantId}`,
              linked: linkedIds.has(acc.merchantId),
              products: null,
              approvalRate: null,
              websiteUrl: acc.websiteUrl
            }));

            // Store accounts for display - filter to only show matching domains
            // Extract domain from entered URL for comparison
            const extractDomain = (urlStr: string) => {
              try {
                // Handle URLs without protocol
                let fullUrl = urlStr;
                if (!fullUrl.startsWith('http')) {
                  fullUrl = 'https://' + fullUrl;
                }
                const parsed = new URL(fullUrl);
                return parsed.hostname.replace(/^www\./, '').toLowerCase();
              } catch {
                // Fallback: extract domain manually
                return urlStr.toLowerCase()
                  .replace(/^https?:\/\//, '')
                  .replace(/^www\./, '')
                  .split('/')[0]
                  .split('?')[0];
              }
            };

            const enteredDomain = extractDomain(url);
            console.log('🌐 Entered URL domain:', enteredDomain);

            // Find accounts that match the entered URL's domain
            const matchingAccounts = mappedAccounts.filter((account: { websiteUrl?: string }) => {
              if (!account.websiteUrl) return false;
              const accountDomain = extractDomain(account.websiteUrl);
              console.log(`🔗 Comparing: ${enteredDomain} vs ${accountDomain}`);
              return enteredDomain === accountDomain ||
                enteredDomain.endsWith('.' + accountDomain) ||
                accountDomain.endsWith('.' + enteredDomain);
            });

            console.log('✅ Matching accounts:', matchingAccounts.length);

            if (matchingAccounts.length > 0) {
              // Found matching accounts - set them for display
              setMerchantAccounts(matchingAccounts);

              // Auto-select if only one match
              const firstMatch = matchingAccounts[0];
              console.log('🎯 Smart detection: URL matches Merchant Center account:', firstMatch.name);
              setDetectedUrlType({
                type: 'store',
                suggestedCampaignType: 'SHOPPING',
                details: { name: firstMatch.name }
              });
              setCampaignType('SHOPPING');
              if (matchingAccounts.length === 1) {
                setSelectedMerchant(firstMatch.id);
              }
              setIsDetecting(false);
              return; // Early return - no need for further detection
            } else {
              // No matching accounts - clear merchant accounts
              console.log('⚠️ No matching Merchant accounts for domain:', enteredDomain);
              setMerchantAccounts([]);
            }
          }
        }
      } catch (e) {
        console.log('Merchant check skipped:', e);
      }

      // Step 2: Client-side pattern matching for YouTube and App Store URLs
      const urlLower = url.toLowerCase();

      // YouTube URL detection
      if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
        console.log('🎬 YouTube URL detected via pattern matching');

        // Extract video ID if present
        let videoId = null;
        const videoMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        if (videoMatch) {
          videoId = videoMatch[1];
        }

        // Extract channel ID if present
        let channelId = null;
        const channelMatch = url.match(/youtube\.com\/(?:channel\/|c\/|@)([a-zA-Z0-9_-]+)/);
        if (channelMatch) {
          channelId = channelMatch[1];
        }

        setDetectedUrlType({
          type: 'video',
          videoId: videoId || undefined,
          channelId: channelId || undefined,
          suggestedCampaignType: 'VIDEO',
          details: { name: 'YouTube Video' }
        });
        setCampaignType('VIDEO');
        localStorage.setItem('campaignData', JSON.stringify({
          ...JSON.parse(localStorage.getItem('campaignData') || '{}'),
          campaignType: 'VIDEO',
          detectedUrlType: 'video',
          videoId
        }));
        setIsDetecting(false);
        return;
      }

      // Google Play Store App detection
      if (urlLower.includes('play.google.com/store/apps')) {
        console.log('📱 Android App URL detected via pattern matching');
        const appIdMatch = url.match(/id=([a-zA-Z0-9._]+)/);
        const appId = appIdMatch ? appIdMatch[1] : null;

        setDetectedUrlType({
          type: 'app',
          platform: 'android',
          appId: appId || undefined,
          suggestedCampaignType: 'APP',
          details: { name: appId || 'Android App' }
        });
        setCampaignType('APP');
        setSelectedOS('android');
        if (appId) setAppSearchQuery(appId);
        localStorage.setItem('campaignData', JSON.stringify({
          ...JSON.parse(localStorage.getItem('campaignData') || '{}'),
          campaignType: 'APP',
          detectedUrlType: 'app',
          platform: 'android',
          appId
        }));
        setIsDetecting(false);
        return;
      }

      // iOS App Store detection
      if (urlLower.includes('apps.apple.com') || urlLower.includes('itunes.apple.com')) {
        console.log('🍎 iOS App URL detected via pattern matching');
        const iosAppMatch = url.match(/\/id(\d+)/);
        const appId = iosAppMatch ? iosAppMatch[1] : null;

        setDetectedUrlType({
          type: 'app',
          platform: 'ios',
          appId: appId || undefined,
          suggestedCampaignType: 'APP',
          details: { name: appId ? `iOS App ${appId}` : 'iOS App' }
        });
        setCampaignType('APP');
        setSelectedOS('ios');
        if (appId) setAppSearchQuery(appId);
        localStorage.setItem('campaignData', JSON.stringify({
          ...JSON.parse(localStorage.getItem('campaignData') || '{}'),
          campaignType: 'APP',
          detectedUrlType: 'app',
          platform: 'ios',
          appId
        }));
        setIsDetecting(false);
        return;
      }

      // Step 3: Fall back to API-based detection for other URLs
      try {
        const response = await fetch('/api/url/detect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });

        if (response.ok) {
          const result = await response.json();
          setDetectedUrlType(result);

          // Auto-select campaign type based on URL detection
          if (result.suggestedCampaignType) {
            setCampaignType(result.suggestedCampaignType);
            localStorage.setItem('campaignData', JSON.stringify({
              ...JSON.parse(localStorage.getItem('campaignData') || '{}'),
              campaignType: result.suggestedCampaignType,
              detectedUrlType: result.type
            }));
          }

          // Fetch Merchant accounts if store detected - filtered by URL domain
          if (result.type === 'store' || result.suggestedCampaignType === 'SHOPPING') {
            fetchMerchantAccounts(url);
          }

          // Set app info if app detected
          if (result.type === 'app' && result.platform) {
            setSelectedOS(result.platform);
            if (result.appId) {
              setAppSearchQuery(result.appId);
            }
          }
        } else {
          // API failed or returned error - default to SEARCH/website
          console.log('⚠️ API detection failed, defaulting to SEARCH campaign type');
          setDetectedUrlType({
            type: 'website',
            suggestedCampaignType: 'SEARCH',
            details: { name: url }
          });
          setCampaignType('SEARCH');
          localStorage.setItem('campaignData', JSON.stringify({
            ...JSON.parse(localStorage.getItem('campaignData') || '{}'),
            campaignType: 'SEARCH',
            detectedUrlType: 'website'
          }));
        }
      } catch (apiError) {
        // API error (404, network error, etc.) - default to SEARCH/website
        console.log('⚠️ API detection error, defaulting to SEARCH campaign type:', apiError);
        setDetectedUrlType({
          type: 'website',
          suggestedCampaignType: 'SEARCH',
          details: { name: url }
        });
        setCampaignType('SEARCH');
        localStorage.setItem('campaignData', JSON.stringify({
          ...JSON.parse(localStorage.getItem('campaignData') || '{}'),
          campaignType: 'SEARCH',
          detectedUrlType: 'website'
        }));
      }
    } catch (error) {
      console.error('URL detection error:', error);
    } finally {
      setIsDetecting(false);
    }
  };

  // Fetch Merchant accounts - filtered by URL domain
  const fetchMerchantAccounts = async (urlToMatch?: string) => {
    setIsFetchingMerchants(true);
    try {
      // Use the same API that works in /integrations/google-merchant
      const response = await fetch('/api/merchant/accounts', {
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        console.log('📦 Merchant accounts response:', result);

        if (result.success && result.accounts) {
          // Also fetch linked accounts to check status
          let linkedIds: Set<string> = new Set();
          try {
            const linkedRes = await fetch('/api/merchant/connected', { credentials: 'include' });
            if (linkedRes.ok) {
              const linkedData = await linkedRes.json();
              if (linkedData.accounts) {
                linkedIds = new Set(linkedData.accounts.map((a: { merchant_id: string }) => a.merchant_id));
              }
            }
          } catch (e) {
            console.log('Could not fetch linked accounts');
          }

          // Map to our format with linked status
          const mappedAccounts = result.accounts.map((acc: { merchantId: string; name: string; websiteUrl?: string }) => ({
            id: acc.merchantId,
            name: acc.name || `Account ${acc.merchantId}`,
            linked: linkedIds.has(acc.merchantId),
            products: null,
            approvalRate: null,
            websiteUrl: acc.websiteUrl
          }));

          // Filter by URL domain if provided
          if (urlToMatch) {
            const extractDomain = (urlStr: string) => {
              try {
                let fullUrl = urlStr;
                if (!fullUrl.startsWith('http')) {
                  fullUrl = 'https://' + fullUrl;
                }
                const parsed = new URL(fullUrl);
                return parsed.hostname.replace(/^www\./, '').toLowerCase();
              } catch {
                return urlStr.toLowerCase()
                  .replace(/^https?:\/\//, '')
                  .replace(/^www\./, '')
                  .split('/')[0]
                  .split('?')[0];
              }
            };

            const enteredDomain = extractDomain(urlToMatch);
            console.log('🌐 Filtering by domain:', enteredDomain);

            const matchingAccounts = mappedAccounts.filter((account: { websiteUrl?: string }) => {
              if (!account.websiteUrl) return false;
              const accountDomain = extractDomain(account.websiteUrl);
              return enteredDomain === accountDomain ||
                enteredDomain.endsWith('.' + accountDomain) ||
                accountDomain.endsWith('.' + enteredDomain);
            });

            console.log('✅ Matching accounts after filter:', matchingAccounts.length);
            setMerchantAccounts(matchingAccounts);
          } else {
            console.log('✅ All merchant accounts (no filter):', mappedAccounts.length);
            setMerchantAccounts(mappedAccounts);
          }
        } else {
          console.warn('⚠️ No accounts in response or success=false:', result);
          setMerchantAccounts([]);
        }
      } else {
        console.error('❌ Failed to fetch merchant accounts:', response.status, await response.text());
        setMerchantAccounts([]);
      }
    } catch (error) {
      console.error('❌ Error fetching Merchant accounts:', error);
      setMerchantAccounts([]);
    } finally {
      setIsFetchingMerchants(false);
    }
  };

  // Search for apps
  const searchApps = async (query: string) => {
    if (!query || query.length < 2) return;

    setIsSearchingApps(true);
    try {
      const response = await fetch('/api/apps/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, platform: selectedOS })
      });

      if (response.ok) {
        const result = await response.json();
        setAppSearchResults(result.apps || []);
      }
    } catch (error) {
      console.error('Error searching apps:', error);
    } finally {
      setIsSearchingApps(false);
    }
  };

  // Debounced app search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (appSearchQuery) {
        searchApps(appSearchQuery);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [appSearchQuery, selectedOS]);

  // Search Videos Function
  const searchVideos = async (query: string) => {
    if (!query || query.length < 3) return;

    setIsVideoSearching(true);
    try {
      // Use relative URL to hit Next.js API (port 3000) instead of Python backend (port 5000)
      const response = await fetch('/api/youtube/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      if (data.videos) {
        // Filter out videos that are already selected
        setVideoSearchResults(data.videos);
      }
    } catch (error) {
      console.error('Error searching videos:', error);
      setVideoSearchResults([]);
    } finally {
      setIsVideoSearching(false);
    }
  };

  // Debounce Video Search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (videoSearchQuery) {
        searchVideos(videoSearchQuery);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [videoSearchQuery]);

  const handleNext = async () => {
    if (!websiteUrl) {
      return; // Button is disabled, but double-check
    }

    if (!isValidUrl || !isUrlVerified) {
      return; // Button is disabled, but double-check
    }

    // Check phone number for Call Ads campaigns
    if (campaignType === 'Call Ads' && !phoneNumber) {
      alert('Phone number is required for Call Ads campaigns');
      return;
    }

    try {
      // Save all data including detected type, Merchant, and App selections
      const campaignData = JSON.parse(localStorage.getItem('campaignData') || '{}');
      const fullUrl = `https://${websiteUrl}`;

      const updatedData = {
        ...campaignData,
        websiteUrl: fullUrl,
        phoneNumber: phoneNumber ? `${selectedCountryCode}${phoneNumber}` : null,
        // Save detected URL type
        detectedUrlType: detectedUrlType?.type || 'website',
        suggestedCampaignType: detectedUrlType?.suggestedCampaignType || 'SEARCH',
        // Save Merchant selection for Shopping campaigns
        selectedMerchantId: selectedMerchant,
        selectedMerchantName: merchantAccounts.find(m => m.id === selectedMerchant)?.name || null,
        // Save App selection for App campaigns
        selectedApp: selectedApp ? {
          id: selectedApp.id,
          name: selectedApp.name,
          packageName: selectedApp.packageName,
          platform: selectedApp.platform,
          icon: selectedApp.icon
        } : null,
        // Save Video selection for Video campaigns
        selectedVideos: selectedVideos.length > 0 ? selectedVideos : null,
        selectedOS: selectedOS,
        // Auto-set campaign type based on detection
        campaignType: detectedUrlType?.suggestedCampaignType || campaignData.campaignType || 'SEARCH'
      };

      localStorage.setItem('campaignData', JSON.stringify(updatedData));

      // Dispatch event to update sidebar
      window.dispatchEvent(new Event('campaignTypeChanged'));

      // Navigate to campaign type selection (new flow: website-url → new)
      router.push('/campaign/new');

      // ℹ️ Website analysis will be done in budget-scheduling page AFTER user selects locations
      // This ensures the API receives the correct target locations chosen by the user
      console.log('📍 Website URL saved. Full analysis will start after location selection in budget-scheduling page.');

      // Also detect language separately in background (optional, for UI display)
      fetch(getApiUrl('/api/ai-campaign/detect-website-language'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ website_url: fullUrl })
      })
        .then(response => response.json())
        .then(result => {
          if (result.success) {
            console.log(`✅ Background language detection: ${result.language_code} (ID: ${result.language_id})`);

            const currentData = JSON.parse(localStorage.getItem('campaignData') || '{}');
            const finalData = {
              ...currentData,
              detectedLanguageCode: result.language_code,
              detectedLanguageId: result.language_id,
              languageConfidence: result.confidence,
              selectedLanguage: result.language_id,
              selectedLanguageCode: result.language_code
            };

            localStorage.setItem('campaignData', JSON.stringify(finalData));
          }
        })
        .catch(error => {
          console.log('⚠️ Background language detection error:', error);
        });

    } catch (error) {
      console.log('⚠️ Error:', error);
      // Still navigate even if there's an error
      router.push('/campaign/location-targeting');
    }
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  return (
    <>
      {/* Prevent zoom on mobile input focus */}
      <style jsx global>{`
        @media screen and (max-width: 768px) {
          /* Prevent zoom on input focus - font-size 16px prevents iOS zoom */
          input[type="url"],
          input[type="text"],
          input[type="tel"] {
            font-size: 16px !important;
            transform: translateZ(0);
            -webkit-appearance: none;
          }
          
          /* Keep input container visible when keyboard opens */
          .url-input-container {
            position: relative;
            z-index: 10;
          }
        }
      `}</style>

      <div className="min-h-screen bg-black overflow-x-hidden" style={{
        position: 'relative',
        minHeight: '100dvh' // Use dynamic viewport height for mobile
      }}>
        {/* Fullscreen PlasmaGlobe Detection Animation Modal - Outside all transform containers */}
        {isDetecting && (
          <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black" style={{ paddingLeft: '240px' }}>
            {/* Large PlasmaGlobe Container - Centered */}
            <div className="relative w-[50vw] h-[45vh] max-w-xl max-h-[350px]">
              <PlasmaGlobe
                speed={1.0}
                intensity={1.3}
              />
            </div>
            {/* Text below PlasmaGlobe */}
            <div className="mt-6 text-center z-10">
              <p className="text-white font-bold text-2xl md:text-3xl animate-pulse drop-shadow-lg">
                {language === 'ar' ? '🔍 جاري تحليل الرابط بالذكاء الاصطناعي...' : '🔍 AI Analyzing URL...'}
              </p>
              <p className="text-white/70 text-lg mt-3 drop-shadow-md">
                {language === 'ar' ? 'اكتشاف نوع الحملة المناسب' : 'Detecting optimal campaign type'}
              </p>
            </div>
          </div>
        )}

        {/* Campaign Progress */}
        <CampaignProgress currentStep={0} totalSteps={3} />

        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8" dir="ltr" style={{
          position: 'relative',
          zIndex: 1
        }}>

          {/* Header */}
          <div className="text-center mb-3 sm:mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
              {language === 'ar' ? 'ما هو رابط موقعك الإلكتروني؟' : 'What is your website URL?'}
            </h2>
          </div>

          {/* Main Content */}
          <div className="max-w-2xl mx-auto url-input-container" style={{
            position: 'relative',
            zIndex: 2
          }}>
            {/* Dynamic Border Glow Effect - Like integrations cards */}
            <div className="relative group mb-8">
              {/* Glowing border effect */}
              <div 
                className="absolute -inset-0.5 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"
                style={{
                  background: effectiveCampaignType === 'SEARCH' 
                    ? 'linear-gradient(to right, rgb(245, 158, 11), rgb(234, 179, 8))'
                    : effectiveCampaignType === 'DISPLAY'
                      ? 'linear-gradient(to right, rgb(16, 185, 129), rgb(74, 222, 128))'
                      : effectiveCampaignType === 'SHOPPING'
                        ? 'linear-gradient(to right, rgb(59, 130, 246), rgb(6, 182, 212))'
                        : effectiveCampaignType === 'VIDEO'
                          ? 'linear-gradient(to right, rgb(239, 68, 68), rgb(244, 63, 94))'
                          : effectiveCampaignType === 'APP'
                            ? 'linear-gradient(to right, rgb(249, 115, 22), rgb(245, 158, 11))'
                            : 'linear-gradient(to right, rgb(168, 85, 247), rgb(139, 92, 246))', // Default purple
                }}
              />
              {/* URL Input Card - 3D rotation like integrations page */}
              <CardContainer containerClassName="w-full" speed="medium">
                <CardBody className={`!h-auto !w-full relative rounded-xl bg-gradient-to-br ${cardGradient} shadow-2xl ${cardShadowLight} ${cardShadowDark} border ${cardBorderLight} ${cardBorderDark} p-10 transition-all duration-300`} style={{
                  position: 'relative',
                  zIndex: 3
                }}>
                  {!isDetecting && (
                  <CardItem translateZ={80} className="!w-fit absolute top-4 right-6">
                    <Globe className="w-12 h-12 text-white/70 dark:text-white/60" strokeWidth={1.5} />
                  </CardItem>
                )}
                <div className={`space-y-6 ${isDetecting ? 'invisible' : ''}`}>
                  {/* Input Field */}
                  <div>
                    <CardItem translateZ={50}>
                      <label className="block text-sm font-semibold text-white mb-3 drop-shadow-md text-left">
                        {language === 'ar' ? 'رابط موقعك الإلكتروني' : 'Your Website URL'}
                      </label>
                    </CardItem>
                    <CardItem translateZ={60} as="div" className="!w-full">
                      <div className="flex gap-3">
                        {/* HTTPS Prefix - Matches input border state */}
                        <div className={`w-28 px-4 py-6 bg-white/20 backdrop-blur-sm border-2 rounded-xl text-white flex items-center justify-center transition-all duration-200 ${!isValidUrl && websiteUrl
                          ? 'border-red-300/50 ring-4 ring-red-300/30'
                          : isUrlVerified
                            ? 'border-white/50 bg-white/25'
                            : isFocused
                              ? 'border-white/70 ring-4 ring-white/30 bg-white/25'
                              : 'border-white/30'
                          }`}>
                          <span className="text-base font-medium">https://</span>
                        </div>

                        {/* URL Input with Icon */}
                        <div className="flex-1 relative">
                          {/* Link Icon */}
                          <LinkIcon className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${!isValidUrl && websiteUrl
                            ? 'text-red-300/70'
                            : isUrlVerified
                              ? 'text-white/80'
                              : 'text-white/50'
                            }`} />

                          <input
                            type="url"
                            value={websiteUrl}
                            onChange={handleUrlChange}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder={language === 'ar' ? 'example.com' : 'www.example.com'}
                            dir="ltr"
                            className={`w-full px-4 pl-12 pr-12 py-6 bg-white/20 backdrop-blur-sm border-2 rounded-xl text-white text-base placeholder-white/70 
                        focus:outline-none focus:ring-4 focus:bg-white/25 
                        transition-all duration-200 overflow-x-auto whitespace-nowrap
                        ${!isValidUrl && websiteUrl
                                ? 'border-red-300/50 focus:border-red-300/70 focus:ring-red-300/30'
                                : isUrlVerified
                                  ? 'border-white/50 focus:border-white/70 focus:ring-white/30'
                                  : 'border-white/30 focus:border-white/70 focus:ring-white/30'
                              }`}
                            autoFocus
                            style={{
                              textOverflow: 'clip',
                              fontSize: '16px', // Prevent zoom on iOS
                              transform: 'translateZ(0)', // Force hardware acceleration
                              WebkitAppearance: 'none' // Remove iOS styling
                            }}
                          />

                          {/* Status Icon */}
                          {websiteUrl && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                              {!isValidUrl ? (
                                <XCircle className="w-5 h-5 text-red-300" />
                              ) : isUrlVerified ? (
                                <CheckCircle2 className="w-5 h-5 text-white/80" />
                              ) : null}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardItem>

                    {/* Error Message */}
                    {!isValidUrl && websiteUrl && urlErrorMessage && (
                      <CardItem translateZ={40} as="div" className="!w-full">
                        <div className="mt-3 p-3 bg-red-500/20 border border-red-300/30 rounded-lg flex items-start gap-2 backdrop-blur-sm">
                          <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
                          <div className="text-left">
                            <p className="text-sm font-semibold text-red-200">{language === 'ar' ? 'رابط غير صحيح' : 'Invalid URL'}</p>
                            <p className="text-sm text-red-300">{urlErrorMessage}</p>
                          </div>
                        </div>
                      </CardItem>
                    )}

                    {/* Success Message - White style matching card */}
                    {isUrlVerified && (
                      <CardItem translateZ={40} as="div" className="!w-full">
                        <div className="mt-3 p-3 bg-white/10 border border-white/20 rounded-lg flex items-start gap-2 backdrop-blur-sm">
                          <CheckCircle2 className="w-5 h-5 text-white/80 flex-shrink-0 mt-0.5" />
                          <div className="text-left flex-1">
                            <p className="text-sm font-semibold text-white">{language === 'ar' ? 'رابط صحيح' : 'Valid URL'}</p>
                            <p className="text-sm text-white/80">{language === 'ar' ? 'تنسيق الرابط صحيح' : 'URL format is correct'}</p>
                          </div>
                          {/* Detected URL Type Badge */}
                          {isDetecting && (
                            <div className="flex items-center gap-2 text-white/70">
                              <div className="w-4 h-4 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
                              <span className="text-xs">{language === 'ar' ? 'جاري الكشف...' : 'Detecting...'}</span>
                            </div>
                          )}
                          {detectedUrlType && !isDetecting && (
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${detectedUrlType.type === 'app' ? 'bg-orange-500/30 text-orange-200' :
                              detectedUrlType.type === 'video' ? 'bg-purple-500/30 text-purple-200' :
                                detectedUrlType.type === 'store' ? 'bg-cyan-500/30 text-cyan-200' :
                                  'bg-blue-500/30 text-blue-200'
                              }`}>
                              {detectedUrlType.type === 'app' && <Smartphone className="w-3 h-3" />}
                              {detectedUrlType.type === 'video' && <Video className="w-3 h-3" />}
                              {detectedUrlType.type === 'store' && <Store className="w-3 h-3" />}
                              {detectedUrlType.type === 'website' && <Monitor className="w-3 h-3" />}
                              {detectedUrlType.type === 'app' ? (language === 'ar' ? 'تطبيق' : 'App') :
                                detectedUrlType.type === 'video' ? (language === 'ar' ? 'فيديو' : 'Video') :
                                  detectedUrlType.type === 'store' ? (language === 'ar' ? 'متجر' : 'Store') :
                                    (language === 'ar' ? 'موقع' : 'Website')}
                            </div>
                          )}
                        </div>
                      </CardItem>
                    )}

                    {/* Merchant Center Selection for Shopping Campaigns - Google Ads Style */}
                    {detectedUrlType && (detectedUrlType.type === 'store' || detectedUrlType.suggestedCampaignType === 'SHOPPING') && (
                      <CardItem translateZ={35} as="div" className="!w-full">
                        <div className="mt-4 p-5 bg-white/10 border border-cyan-400/30 rounded-xl backdrop-blur-sm">
                          {/* Info Message */}
                          <div className="flex items-start gap-3 mb-4 p-3 bg-blue-500/10 border border-blue-400/30 rounded-lg">
                            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                              <ShoppingCart className="w-4 h-4 text-blue-300" />
                            </div>
                            <p className="text-sm text-white/90">
                              {language === 'ar'
                                ? 'للإعلان عن منتجات على موقعك الإلكتروني، اختَر حسابًا على Merchant Center.'
                                : 'To advertise products on your website, choose a Merchant Center account.'}
                            </p>
                          </div>

                          {/* Search Box */}
                          <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                            <input
                              type="text"
                              placeholder={language === 'ar' ? 'اختيار حساب' : 'Search accounts'}
                              className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50"
                            />
                          </div>

                          {/* Table Header */}
                          <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-white/5 rounded-t-lg border-b border-white/10 text-xs font-semibold text-white/70">
                            <div className="col-span-5">{language === 'ar' ? 'Merchant Center' : 'Merchant Center'}</div>
                            <div className="col-span-2 text-center">{language === 'ar' ? 'المنتجات' : 'Products'}</div>
                            <div className="col-span-2 text-center">{language === 'ar' ? 'نسبة الموافقة' : 'Approval'}</div>
                            <div className="col-span-3 text-center">{language === 'ar' ? 'الحالة' : 'Status'}</div>
                          </div>

                          {/* Table Body */}
                          {isFetchingMerchants ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="w-6 h-6 border-2 border-cyan-400/50 border-t-transparent rounded-full animate-spin" />
                            </div>
                          ) : merchantAccounts.length > 0 ? (
                            <div className="max-h-60 overflow-y-auto">
                              {merchantAccounts.map((account, index) => (
                                <div
                                  key={account.id}
                                  onClick={() => {
                                    if (account.linked) {
                                      setSelectedMerchant(account.id);
                                      // Save to localStorage for campaign flow
                                      const currentData = JSON.parse(localStorage.getItem('campaignData') || '{}');
                                      localStorage.setItem('campaignData', JSON.stringify({
                                        ...currentData,
                                        selectedMerchantId: account.id,
                                        selectedMerchantName: account.name,
                                        merchantLinked: true
                                      }));
                                    }
                                  }}
                                  className={`grid grid-cols-12 gap-2 px-3 py-3 transition-all items-center ${index % 2 === 0 ? 'bg-white/5' : 'bg-transparent'
                                    } ${selectedMerchant === account.id
                                      ? 'bg-cyan-500/20 ring-1 ring-cyan-400/50'
                                      : account.linked ? 'hover:bg-white/10 cursor-pointer' : 'opacity-70'
                                    }`}
                                >
                                  {/* Merchant Info */}
                                  <div className="col-span-5 flex items-center gap-3">
                                    <div className="w-9 h-9 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                      <ShoppingCart className="w-4 h-4 text-cyan-300" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-white truncate">{account.name}</p>
                                      <p className="text-xs text-white/50">{account.id}</p>
                                    </div>
                                  </div>
                                  {/* Products Count */}
                                  <div className="col-span-2 text-center text-sm text-white/70">
                                    {account.products !== null ? account.products.toLocaleString() : '-'}
                                  </div>
                                  {/* Approval Rate */}
                                  <div className="col-span-2 text-center text-sm text-white/70">
                                    {account.approvalRate !== null ? `${account.approvalRate}%` : '-'}
                                  </div>
                                  {/* Status & Link Button */}
                                  <div className="col-span-3 text-center">
                                    {account.linked ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Linked
                                      </span>
                                    ) : (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // Save current campaign data before redirecting
                                          const currentData = JSON.parse(localStorage.getItem('campaignData') || '{}');
                                          localStorage.setItem('campaignData', JSON.stringify({
                                            ...currentData,
                                            pendingMerchantId: account.id,
                                            pendingMerchantName: account.name,
                                            returnUrl: '/campaign/website-url'
                                          }));
                                          // Redirect to merchant linking page
                                          window.location.href = '/integrations/google-merchant';
                                        }}
                                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/30 hover:bg-blue-500/50 text-blue-300 text-xs font-medium rounded-full transition-colors"
                                      >
                                        <LinkIcon className="w-3 h-3" />
                                        Link
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-white/60 text-sm">
                              <p>{language === 'ar' ? 'لا توجد حسابات Merchant Center متاحة' : 'No Merchant Center accounts available'}</p>
                              <button
                                onClick={() => window.location.href = '/integrations/google-merchant'}
                                className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/30 hover:bg-cyan-500/50 text-cyan-300 text-sm font-medium rounded-lg transition-colors"
                              >
                                <LinkIcon className="w-4 h-4" />
                                {language === 'ar' ? 'ربط حساب جديد' : 'Link New Account'}
                              </button>
                            </div>
                          )}

                          {/* Selected Confirmation */}
                          {selectedMerchant && (
                            <div className="mt-3 p-3 bg-green-500/20 border border-green-400/30 rounded-lg flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                              <span className="text-sm text-green-200">
                                {language === 'ar' ? 'تم اختيار الحساب' : 'Account selected'}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardItem>
                    )}

                    {/* App Campaign Selection */}
                    {detectedUrlType && detectedUrlType.type === 'app' && (
                      <CardItem translateZ={35} as="div" className="!w-full">
                        <div className="mt-4 p-4 bg-white/10 border border-orange-400/30 rounded-xl backdrop-blur-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <Smartphone className="w-5 h-5 text-orange-300" />
                            <p className="text-sm font-semibold text-white">
                              {language === 'ar' ? 'إعدادات حملة التطبيق' : 'App Campaign Settings'}
                            </p>
                          </div>

                          {/* OS Selection */}
                          <div className="flex gap-3 mb-4">
                            <button
                              onClick={() => setSelectedOS('android')}
                              className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${selectedOS === 'android'
                                ? 'bg-green-500/30 border border-green-400/50 text-green-200'
                                : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                                }`}
                            >
                              <span className="text-sm font-medium">Android</span>
                            </button>
                            <button
                              onClick={() => setSelectedOS('ios')}
                              className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${selectedOS === 'ios'
                                ? 'bg-blue-500/30 border border-blue-400/50 text-blue-200'
                                : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                                }`}
                            >
                              <span className="text-sm font-medium">iOS</span>
                            </button>
                          </div>

                          {/* App Search */}
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                            <input
                              type="text"
                              value={appSearchQuery}
                              onChange={(e) => setAppSearchQuery(e.target.value)}
                              placeholder={language === 'ar'
                                ? 'ادخل اسم التطبيق أو اسم الحزمة أو URL'
                                : 'Enter app name, package name, or store URL'}
                              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400/50"
                            />
                            {isSearchingApps && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="w-4 h-4 border-2 border-orange-400/50 border-t-transparent rounded-full animate-spin" />
                              </div>
                            )}
                          </div>

                          {/* App Search Results */}
                          {appSearchResults.length > 0 && (
                            <div className="mt-4">
                              {/* Results Header - Google Ads Style */}
                              <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                                <p className="text-sm text-white/80">
                                  {language === 'ar'
                                    ? `نتائج البحث عن تطبيقات ${selectedOS === 'ios' ? 'iOS' : 'Android'} في ${selectedOS === 'ios' ? 'Apple Store' : 'Google Play'} (${appSearchResults.length})`
                                    : `${selectedOS === 'ios' ? 'iOS' : 'Android'} apps from ${selectedOS === 'ios' ? 'Apple Store' : 'Google Play'} (${appSearchResults.length})`
                                  }
                                </p>
                              </div>

                              {/* Results List */}
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {appSearchResults.map((app) => (
                                  <div
                                    key={app.id}
                                    onClick={() => setSelectedApp(app)}
                                    className={`p-3 rounded-lg cursor-pointer transition-all flex items-center gap-4 ${selectedApp?.id === app.id
                                      ? 'bg-orange-500/30 border-2 border-orange-400/70'
                                      : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                                      }`}
                                  >
                                    {/* App Icon */}
                                    <div className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg">
                                      {app.icon ? (
                                        <img src={app.icon} alt={app.name} className="w-full h-full object-cover rounded-xl" />
                                      ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                                          <Smartphone className="w-6 h-6 text-white/60" />
                                        </div>
                                      )}
                                    </div>

                                    {/* App Info */}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-base font-semibold text-white truncate">{app.name}</p>
                                      <p className="text-sm text-white/60 truncate">{app.developer} - {app.id}</p>
                                    </div>

                                    {/* Selection Indicator */}
                                    {selectedApp?.id === app.id && (
                                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardItem>
                    )}

                    {/* Video Campaign Selection */}
                    {detectedUrlType && (detectedUrlType.type === 'video' || detectedUrlType.suggestedCampaignType === 'VIDEO') && (
                      <CardItem translateZ={35} as="div" className="!w-full">
                        <div className="mt-4 p-4 bg-white/10 border border-purple-400/30 rounded-xl backdrop-blur-sm">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Video className="w-5 h-5 text-purple-300" />
                              <p className="text-sm font-semibold text-white">
                                {language === 'ar' ? 'اختيار فيديوهات YouTube' : 'Select YouTube Videos'} (Max 5)
                              </p>
                            </div>
                            <span className="text-xs bg-purple-500/20 text-purple-200 px-2 py-1 rounded-full border border-purple-500/30">
                              {selectedVideos.length}/5
                            </span>
                          </div>

                          {/* Video Search Input */}
                          <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                            <input
                              type="text"
                              value={videoSearchQuery}
                              onChange={(e) => setVideoSearchQuery(e.target.value)}
                              placeholder={language === 'ar'
                                ? 'البحث عن فيديو أو لصق عنوان URL'
                                : 'Search video or paste YouTube URL'}
                              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                            />
                            {isVideoSearching && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="w-4 h-4 border-2 border-purple-400/50 border-t-transparent rounded-full animate-spin" />
                              </div>
                            )}
                          </div>

                          {/* Video Search Results */}
                          {videoSearchResults.length > 0 ? (
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                              {videoSearchResults.map((video) => {
                                const isSelected = selectedVideos.some(v => v.id === video.id);
                                return (
                                  <div
                                    key={video.id}
                                    onClick={() => {
                                      if (isSelected) {
                                        setSelectedVideos(prev => prev.filter(v => v.id !== video.id));
                                      } else {
                                        if (selectedVideos.length < 5) {
                                          setSelectedVideos(prev => [...prev, video]);
                                        }
                                      }
                                    }}
                                    className={`p-2 rounded-lg cursor-pointer transition-all flex items-start gap-3 ${isSelected
                                      ? 'bg-purple-500/30 border border-purple-400/70'
                                      : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                                      }`}
                                  >
                                    <div className="w-20 h-14 rounded-md overflow-hidden flex-shrink-0 relative">
                                      <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium text-white line-clamp-2 leading-snug mb-1" title={video.title}>
                                        {video.title}
                                      </p>
                                      <div className="flex items-center gap-2 text-[10px] text-white/50">
                                        <span className="truncate max-w-[80px]">{video.channelTitle}</span>
                                        <span>•</span>
                                        <span>{Number(video.viewCount).toLocaleString()} views</span>
                                      </div>
                                    </div>
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-purple-500 border-purple-500' : 'border-white/30'}`}>
                                      {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            !isVideoSearching && (
                              <div className="text-center py-6 text-white/40 text-xs">
                                {videoSearchQuery.length > 2
                                  ? (language === 'ar' ? 'لم يتم العثور على نتائج' : 'No videos found')
                                  : (language === 'ar' ? 'ابدأ بالبحث أو الصق رابط الفيديو' : 'Start by searching or pasting a video link')
                                }
                              </div>
                            )
                          )}
                        </div>
                      </CardItem>
                    )}
                  </div>

                </div>
              </CardBody>
            </CardContainer>
            </div>

            {/* Phone Number Card - Only show for Call Ads */}
            {campaignType === 'Call Ads' && (
              <div className="relative rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg p-8 mb-6">
                {/* Icon decoration */}
                <div className="absolute top-2 right-4">
                  <div className="text-4xl opacity-70 text-white">📞</div>
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="text-sm text-white/90 mb-4">
                      Your phone number is required for Call Ads campaigns
                    </div>

                    <div className="flex gap-3">
                      {/* Country Code Dropdown with Search */}
                      <div className="relative country-dropdown-container">
                        <div
                          onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                          className="w-24 px-4 py-5 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white cursor-pointer flex items-center justify-center hover:border-white/50 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            {allCountryCodes.find(c => c.code === selectedCountryCode)?.iso ? (
                              <ReactCountryFlag
                                countryCode={allCountryCodes.find(c => c.code === selectedCountryCode)?.iso || 'US'}
                                svg
                                style={{
                                  width: '1.2em',
                                  height: '1.2em',
                                }}
                                title={allCountryCodes.find(c => c.code === selectedCountryCode)?.country}
                              />
                            ) : (
                              <span className="text-lg">🌐</span>
                            )}
                            <span className="font-medium mr-3">{selectedCountryCode}</span>
                          </div>
                          <ChevronDown className={`w-5 h-5 text-white/60 transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>

                        {/* Dropdown Menu */}
                        {isCountryDropdownOpen && (
                          <div className="country-dropdown-container absolute z-[9999] top-full mt-2 w-72 bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg rounded-xl shadow-2xl border border-white/20 dark:border-gray-700/30 overflow-hidden">
                            {/* Search Input */}
                            <div className="p-3 border-b border-white/20 dark:border-gray-700/20">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                  type="text"
                                  value={countrySearchQuery}
                                  onChange={(e) => setCountrySearchQuery(e.target.value)}
                                  placeholder="Search country by name or code..."
                                  className="country-search-input w-full pl-10 pr-4 py-2 bg-white/20 dark:bg-gray-900/20 backdrop-blur-sm border border-white/30 dark:border-gray-600/30 rounded-lg text-sm text-white dark:text-white placeholder-white/60 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/50"
                                  autoFocus
                                />
                              </div>
                            </div>

                            {/* Countries List */}
                            <div className="max-h-64 overflow-y-auto">
                              {filteredCountries.length > 0 ? (
                                filteredCountries.map((country) => (
                                  <div
                                    key={country.iso}
                                    onClick={() => {
                                      setSelectedCountryCode(country.code);
                                      setIsCountryDropdownOpen(false);
                                      setCountrySearchQuery('');
                                    }}
                                    className="px-3 py-2 hover:bg-white/20 dark:hover:bg-gray-700/30 cursor-pointer flex items-center justify-between group transition-colors"
                                  >
                                    <div className="flex items-center gap-2">
                                      <ReactCountryFlag
                                        countryCode={country.iso}
                                        svg
                                        style={{
                                          width: '1.2em',
                                          height: '1.2em',
                                        }}
                                        title={country.country}
                                      />
                                      <div>
                                        <div className="text-sm font-medium text-white dark:text-white">
                                          {country.country}
                                        </div>
                                        <div className="text-xs text-white/70 dark:text-gray-300">
                                          {country.arabicName}
                                        </div>
                                      </div>
                                    </div>
                                    <span className="text-xs font-medium text-white/80 dark:text-gray-300 group-hover:text-white dark:group-hover:text-white">
                                      {country.code}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <div className="px-4 py-6 text-center text-sm text-white/70 dark:text-gray-300">
                                  No countries found
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Phone Number Input */}
                      <div className="flex-1">
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder="Enter your phone number"
                          className="w-full px-4 py-5 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/50 text-sm transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>





          {/* Navigation Buttons - Outside card */}
          <div className="flex justify-center items-center max-w-2xl mx-auto mt-8">
            <GlowButton
              onClick={handleNext}
              disabled={!websiteUrl || !isValidUrl || !isUrlVerified}
              variant="blue"
            >
              <span className="flex items-center gap-2">
                {language === 'ar' ? 'متابعة' : 'Continue'}
                <ArrowRight className="w-5 h-5" />
              </span>
            </GlowButton>
          </div>
        </div>
      </div>
    </>
  );
};

export default WebsiteUrlPage;