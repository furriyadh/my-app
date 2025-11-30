'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Globe, Link as LinkIcon, Shield, Sparkles, Zap, Phone, Search, ChevronDown, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import ReactCountryFlag from 'react-country-flag';
import GlowButton from '@/components/ui/glow-button';
import { VerifyBadge } from '@/components/ui/verify-badge';
import { CardContainer, CardBody, CardItem } from '@/components/ui/3d-card';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/lib/hooks/useTranslation';
import CampaignProgress from '@/components/ui/campaign-progress';
import { getApiUrl } from '@/lib/config';

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
  const [isDetectingLanguage, setIsDetectingLanguage] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const { t, language, isRTL } = useTranslation();

  // Dynamic colors based on campaign type
  const campaignTypeColors = {
    'SEARCH': 'from-yellow-500 to-orange-600',
    'DISPLAY': 'from-green-500 to-emerald-600',
    'SHOPPING': 'from-blue-500 to-cyan-600',
    'VIDEO': 'from-purple-500 to-pink-600',
    'APP': 'from-orange-500 to-red-600',
    'PERFORMANCE_MAX': 'from-pink-500 to-rose-600',
    'DEMAND_GEN': 'from-red-500 to-pink-600'
  };

  // Dynamic shadow colors based on campaign type (for light mode)
  const campaignTypeShadowsLight = {
    'SEARCH': 'shadow-orange-300/40',
    'DISPLAY': 'shadow-emerald-300/40',
    'SHOPPING': 'shadow-cyan-300/40',
    'VIDEO': 'shadow-pink-300/40',
    'APP': 'shadow-red-300/40',
    'PERFORMANCE_MAX': 'shadow-rose-300/40',
    'DEMAND_GEN': 'shadow-pink-300/40'
  };

  // Dynamic shadow colors based on campaign type (for dark mode)
  const campaignTypeShadowsDark = {
    'SEARCH': 'dark:shadow-orange-500/30',
    'DISPLAY': 'dark:shadow-emerald-500/30',
    'SHOPPING': 'dark:shadow-cyan-500/30',
    'VIDEO': 'dark:shadow-pink-500/30',
    'APP': 'dark:shadow-red-500/30',
    'PERFORMANCE_MAX': 'dark:shadow-rose-500/30',
    'DEMAND_GEN': 'dark:shadow-pink-500/30'
  };

  // Dynamic border colors
  const campaignTypeBordersLight = {
    'SEARCH': 'border-orange-300/50',
    'DISPLAY': 'border-emerald-300/50',
    'SHOPPING': 'border-cyan-300/50',
    'VIDEO': 'border-pink-300/50',
    'APP': 'border-red-300/50',
    'PERFORMANCE_MAX': 'border-rose-300/50',
    'DEMAND_GEN': 'border-pink-300/50'
  };

  const campaignTypeBordersDark = {
    'SEARCH': 'dark:border-orange-400/30',
    'DISPLAY': 'dark:border-emerald-400/30',
    'SHOPPING': 'dark:border-cyan-400/30',
    'VIDEO': 'dark:border-pink-400/30',
    'APP': 'dark:border-red-400/30',
    'PERFORMANCE_MAX': 'dark:border-rose-400/30',
    'DEMAND_GEN': 'dark:border-pink-400/30'
  };

  const cardGradient = campaignTypeColors[campaignType as keyof typeof campaignTypeColors] || 'from-blue-500 to-cyan-500';
  const cardShadowLight = campaignTypeShadowsLight[campaignType as keyof typeof campaignTypeShadowsLight] || 'shadow-blue-300/40';
  const cardShadowDark = campaignTypeShadowsDark[campaignType as keyof typeof campaignTypeShadowsDark] || 'dark:shadow-blue-500/30';
  const cardBorderLight = campaignTypeBordersLight[campaignType as keyof typeof campaignTypeBordersLight] || 'border-blue-300/50';
  const cardBorderDark = campaignTypeBordersDark[campaignType as keyof typeof campaignTypeBordersDark] || 'dark:border-blue-400/30';

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
  };

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

    // Start detecting language
    setIsDetectingLanguage(true);
    setAnalyzeProgress(0);

    try {
      // Save basic data first
      const campaignData = JSON.parse(localStorage.getItem('campaignData') || '{}');
      const fullUrl = `https://${websiteUrl}`;
      
      const updatedData = {
        ...campaignData,
        websiteUrl: fullUrl,
        phoneNumber: phoneNumber ? `${selectedCountryCode}${phoneNumber}` : null
      };
      
      localStorage.setItem('campaignData', JSON.stringify(updatedData));
      
      // Simulate progress animation
      const progressInterval = setInterval(() => {
        setAnalyzeProgress(prev => {
          if (prev >= 95) return 95; // Stop at 95% until completion
          return prev + 5;
        });
      }, 150);
      
      // Analyze website and generate forecast (REAL API from google-ads-official)
      console.log('🚀 Analyzing website and generating forecast...');
      
      const startTime = Date.now();
      
      // Get selected locations from localStorage
      const selectedLocationsStr = localStorage.getItem('selectedLocations');
      let targetLocations: any[] = [];
      if (selectedLocationsStr) {
        try {
          targetLocations = JSON.parse(selectedLocationsStr);
        } catch (e) {
          console.warn('Failed to parse selectedLocations');
        }
      }
      
      // Get language preference
      const preferredLanguage = localStorage.getItem('preferredLanguage') || 'ar';
      const languageId = preferredLanguage === 'en' ? '1000' : '1019';
      
      // Get budget (default to $15 if not set yet)
      const storedCampaignData = JSON.parse(localStorage.getItem('campaignData') || '{}');
      const dailyBudget = storedCampaignData.dailyBudget || 15;
      
      // Start combined analysis (language detection + keyword generation + forecast)
      const analysisPromise = fetch(getApiUrl('/api/ai-campaign/analyze-website-and-forecast'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          website_url: fullUrl,
          target_locations: targetLocations,
          language_id: languageId,
          daily_budget_usd: dailyBudget
        })
      })
        .then(response => response.json())
        .then(result => {
          if (result.success) {
            console.log(`✅ Website Analysis Complete!`);
            console.log(`   📊 Generated ${result.keywords.length} keywords from website`);
            console.log(`   💰 Monthly Impressions: ${result.forecast.monthly.impressions.toLocaleString()}`);
            console.log(`   🖱️ Monthly Clicks: ${result.forecast.monthly.clicks.toLocaleString()}`);
            console.log(`   ✅ Monthly Conversions: ${result.forecast.monthly.conversions.toLocaleString()}`);
            
            // Save comprehensive data to localStorage
            const currentData = JSON.parse(localStorage.getItem('campaignData') || '{}');
            
            // Store keywords with competition data
            localStorage.setItem('generatedContent', JSON.stringify({
              keywords: result.keywords.map((kw: any) => kw.keyword),
              keywordsWithMetrics: result.keywords // Full data with competition
            }));
            
            // Store forecast data
            localStorage.setItem('forecastData', JSON.stringify(result.forecast));
            
            // Store initial estimates in budget page format
            localStorage.setItem('initialEstimates', JSON.stringify({
              impressions: result.forecast.monthly.impressions,
              clicks: result.forecast.monthly.clicks,
              conversions: result.forecast.monthly.conversions,
              avgCPC: result.forecast.monthly.avg_cpc
            }));
            
            const finalData = {
              ...currentData,
              websiteAnalyzed: true,
              forecastGenerated: true,
              keywordsGenerated: result.keywords.length
            };
            
            localStorage.setItem('campaignData', JSON.stringify(finalData));
            console.log('💾 Website analysis and forecast saved to localStorage');
          } else {
            console.log('⚠️ Website analysis failed:', result.error);
          }
        })
        .catch(error => {
          console.log('⚠️ Website analysis error:', error);
        });
      
      // Also detect language separately (optional, for UI display)
      const languageDetectionPromise = fetch(getApiUrl('/api/ai-campaign/detect-website-language'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ website_url: fullUrl })
      })
        .then(response => response.json())
        .then(result => {
          if (result.success) {
            console.log(`✅ Detected language: ${result.language_code} (ID: ${result.language_id})`);
            
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
          console.log('⚠️ Language detection error:', error);
        });
      
      // Wait for both promises (minimum 3 seconds for UX)
      await Promise.all([
        analysisPromise,
        languageDetectionPromise,
        new Promise(resolve => setTimeout(resolve, 3000))
      ]);
      
      // Complete progress
      clearInterval(progressInterval);
      setAnalyzeProgress(100);
      
      const totalTime = Date.now() - startTime;
      console.log(`✅ Complete analysis in ${totalTime}ms, navigating...`);
      
      // Small delay to show 100%
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Navigate to location targeting (language detected automatically)
      router.push('/campaign/location-targeting');
      
    } catch (error) {
      console.log('⚠️ Error:', error);
      // Still navigate even if detection fails
      router.push('/campaign/location-targeting');
    }
    // Note: Don't close modal here - let it stay until page navigation completes
  };

  const handleBack = () => {
    router.push('/campaign/new');
  };

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* Campaign Progress */}
      <CampaignProgress currentStep={0} totalSteps={3} />
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8" dir="ltr">
        
        {/* Header */}
          <div className="text-center mb-3 sm:mb-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
            {language === 'ar' ? 'ما هو رابط موقعك الإلكتروني؟' : 'What is your website URL?'}
          </h2>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          {/* URL Input Card - Dynamic colors based on campaign type */}
          <CardContainer containerClassName="w-full mb-8" speed="medium">
            <CardBody className={`!h-auto !w-full relative rounded-xl bg-gradient-to-br ${cardGradient} shadow-2xl ${cardShadowLight} ${cardShadowDark} border ${cardBorderLight} ${cardBorderDark} p-10 transition-all duration-300`}>
              <CardItem translateZ={80} className="!w-fit absolute top-4 right-6">
                <Globe className="w-12 h-12 text-white/70 dark:text-white/60" strokeWidth={1.5} />
              </CardItem>
            <div className="space-y-6">
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
                    <div className={`w-28 px-4 py-6 bg-white/20 backdrop-blur-sm border-2 rounded-xl text-white flex items-center justify-center transition-all duration-200 ${
                      !isValidUrl && websiteUrl 
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
                    <LinkIcon className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                      !isValidUrl && websiteUrl 
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
                        ${
                          !isValidUrl && websiteUrl 
                            ? 'border-red-300/50 focus:border-red-300/70 focus:ring-red-300/30' 
                            : isUrlVerified
                              ? 'border-white/50 focus:border-white/70 focus:ring-white/30'
                              : 'border-white/30 focus:border-white/70 focus:ring-white/30'
                        }`}
                      autoFocus
                      style={{ textOverflow: 'clip' }}
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
                      <div className="text-left">
                        <p className="text-sm font-semibold text-white">{language === 'ar' ? 'رابط صحيح' : 'Valid URL'}</p>
                        <p className="text-sm text-white/80">{language === 'ar' ? 'تنسيق الرابط صحيح' : 'URL format is correct'}</p>
                      </div>
                    </div>
                  </CardItem>
                )}
              </div>

            </div>
            </CardBody>
          </CardContainer>

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
        <div className="flex justify-between items-center max-w-2xl mx-auto mt-8">
            <GlowButton
              onClick={handleBack}
              variant="green"
            >
              <span className="flex items-center gap-2">
                <ArrowLeft className="w-5 h-5" />
                {language === 'ar' ? 'السابق' : 'Previous'}
              </span>
            </GlowButton>
            
            <GlowButton
              onClick={handleNext}
            disabled={!websiteUrl || !isValidUrl || !isUrlVerified || isDetectingLanguage}
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
  );
};

export default WebsiteUrlPage;