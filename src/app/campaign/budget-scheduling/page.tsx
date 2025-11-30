'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, DollarSign, X, Eye, MousePointer, Check, Star } from 'lucide-react';
import { CountUp } from '@/components/lightswind/count-up';
import GlowButton from '@/components/ui/glow-button';
import { CardContainer, CardBody, CardItem } from '@/components/ui/3d-card';
import { useTranslation } from '@/lib/hooks/useTranslation';
import CampaignProgress from '@/components/ui/campaign-progress';
import { getApiUrl } from '@/lib/config';
import ModernLoader from '@/components/ui/modern-loader';

const BudgetSchedulingPage: React.FC = () => {
  const router = useRouter();
  const [selectedBudgetUSD, setSelectedBudgetUSD] = useState<number>(15); // Store budget in USD
  const [customBudget, setCustomBudget] = useState<string>('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customBudgetError, setCustomBudgetError] = useState('');
  const [currency, setCurrency] = useState('SAR');
  const [campaignData, setCampaignData] = useState<any>(null);
  // Initialize with default estimates immediately (not 0)
  const [estimates, setEstimates] = useState({ 
    impressions: 7500,  // Default for $15/day budget
    clicks: 300, 
    conversions: 9 
  });
  const [isLoadingEstimates, setIsLoadingEstimates] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  
  const [keywordData, setKeywordData] = useState<any>(null);
  const { t, language, isRTL } = useTranslation();
  
  // Check if desktop on mount
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1280);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);
  
  // Competition indicators from Google Ads Historical Metrics
  const [competitionData, setCompetitionData] = useState<{
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNSPECIFIED';
    distribution: { LOW: number; MEDIUM: number; HIGH: number; UNSPECIFIED: number };
    avgMonthlySearches: number;
    realCPC: number;
  } | null>(null);
  
  // Real CPC المحسوب من Google Ads Historical Metrics (لكل حملة) - يتم جلبه مرة واحدة ثم إعادة استخدامه
  const [historicalCPC, setHistoricalCPC] = useState<number | null>(null);

  // Currency info from Google Ads API (based on location)
  const [currencyInfo, setCurrencyInfo] = useState<{
    code: string;
    symbol: string;
    name: string;
    to_usd: number;
  } | null>(null);
  
  // Debug: Log estimates on every render
  console.log('🎯 Current estimates state:', estimates);
  console.log('🎯 Estimates values:', {
    impressions: estimates.impressions,
    clicks: estimates.clicks,
    conversions: estimates.conversions
  });
  
  // Available currencies
  const currencies = ['SAR', 'AED', 'USD', 'EGP', 'EUR', 'GBP', 'INR', 'BRL'];
  
  // Currency symbols (defined once, outside of render cycle)
  const currencySymbols = useMemo(() => ({
    'SAR': 'SR ',
    'AED': 'Dh ',
    'USD': '$',
    'EGP': 'EGP ',
    'EUR': '€',
    'GBP': '£',
    'INR': '₹',
    'BRL': 'R$'
  }), []);
  
  // Conversion rates (base: USD) - معدلات تقريبية للعرض، سيتم استخدام الأسعار الحية عند الرفع
  const conversionRates = useMemo(() => ({
    'SAR': 3.75,
    'AED': 3.67,
    'USD': 1.0,
    'EGP': 47.22,
    'EUR': 0.92,
    'GBP': 0.79,
    'INR': 83.12,
    'BRL': 4.97
  }), []);
  
  // Helper functions to get currency symbol and rate with fallback to USD
  const getCurrencySymbol = useCallback((curr: string) => {
    return currencySymbols[curr as keyof typeof currencySymbols] || '$';
  }, [currencySymbols]);
  
  const getConversionRate = useCallback((curr: string) => {
    return conversionRates[curr as keyof typeof conversionRates] || 1.0;
  }, [conversionRates]);
  
  // Budget options in USD with translations
  const budgetOptionsUSD = useMemo(() => [
    { 
      amount: 5, 
      label: 'This is the least you must spend. Otherwise, there will be no results.',
      labelAr: 'هذا هو الحد الأدنى الذي يجب أن تنفقه. وإلا فلن تكون هناك نتائج.'
    },
    { 
      amount: 15, 
      label: 'We recommend to start with this amount for the most optimal results.', 
      labelAr: 'نوصي بالبدء بهذا المبلغ للحصول على أفضل النتائج.',
      recommended: true 
    },
    { 
      amount: 25, 
      label: 'This is the best price if you are looking for fast and better results.',
      labelAr: 'هذا هو أفضل سعر إذا كنت تبحث عن نتائج سريعة وأفضل.'
    }
  ], []);
  
  // Convert budget options to selected currency
  const budgetOptions = useMemo(() => 
    budgetOptionsUSD.map(option => ({
      ...option,
      amountUSD: option.amount,
      amount: Math.round(option.amount * getConversionRate(currency))
    }))
  , [currency, getConversionRate, budgetOptionsUSD]);
  
  // Calculate displayed budget based on currency
  const selectedBudget = useMemo(() => 
    Math.round(selectedBudgetUSD * getConversionRate(currency))
  , [selectedBudgetUSD, currency, getConversionRate]);
  

  // Load campaign data and initial estimates on mount
  useEffect(() => {
    const data = localStorage.getItem('campaignData');
    if (data) {
      setCampaignData(JSON.parse(data));
    }
    
    // Load initial estimates from website analysis (if available)
    const initialEstimatesStr = localStorage.getItem('initialEstimates');
    if (initialEstimatesStr) {
      try {
        const initialEstimates = JSON.parse(initialEstimatesStr);
        console.log('📊 Loading REAL estimates from website analysis:', initialEstimates);
      setEstimates({
          impressions: initialEstimates.impressions,
          clicks: initialEstimates.clicks,
          conversions: initialEstimates.conversions
        });
      } catch (e) {
        console.warn('Failed to parse initialEstimates');
      }
    }
  }, []);

  // تحويل المستخدم تلقائياً إلى صفحة إنشاء الحملة بعد 5 دقائق من البقاء في صفحة الميزانية
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        router.push('/campaign/creating');
      } catch (e) {
        console.error('❌ Failed to redirect to campaign creating page:', e);
      }
    }, 5 * 60 * 1000); // 5 دقائق

    return () => {
      clearTimeout(timeoutId);
    };
  }, [router]);

  // Calculate realistic estimates based on location, industry, keywords, and campaign type
  const calculateFallbackEstimates = useCallback((budgetUSD: number) => {
    console.log('🔄 Calculating estimates for budget:', budgetUSD);
    
    // Get selected locations to determine CPC
    const selectedLocationsStr = localStorage.getItem('selectedLocations') || '[]';
    let selectedLocations = [];
    try {
      selectedLocations = JSON.parse(selectedLocationsStr);
    } catch (e) {
      console.warn('Failed to parse selectedLocations');
      selectedLocations = [];
    }
    
    // CPC varies by country (real industry averages for Google Ads 2024)
    const cpcByCountry: { [key: string]: number } = {
      // Middle East (higher CPC due to competition and purchasing power)
      'SA': 2.8,  // Saudi Arabia - High competition
      'AE': 2.6,  // UAE - Very competitive market
      'KW': 2.5,  // Kuwait
      'QA': 2.4,  // Qatar
      'BH': 2.2,  // Bahrain
      'OM': 2.0,  // Oman
      'JO': 1.3,  // Jordan
      'LB': 1.4,  // Lebanon
      'EG': 0.9,  // Egypt - Lower purchasing power
      'IQ': 1.1,  // Iraq
      'YE': 0.5,  // Yemen
      'SY': 0.6,  // Syria
      
      // Western countries (high CPC)
      'US': 2.9,  // United States - Very competitive
      'GB': 2.7,  // United Kingdom
      'CA': 2.4,  // Canada
      'AU': 2.6,  // Australia
      'DE': 2.3,  // Germany
      'FR': 2.2,  // France
      'ES': 1.7,  // Spain
      'IT': 1.8,  // Italy
      'NL': 2.4,  // Netherlands
      'CH': 2.9,  // Switzerland
      'SE': 2.5,  // Sweden
      'NO': 2.6,  // Norway
      'DK': 2.5,  // Denmark
      
      // Asia Pacific
      'IN': 0.6,  // India - Very low CPC
      'PK': 0.5,  // Pakistan
      'BD': 0.4,  // Bangladesh
      'SG': 2.5,  // Singapore - High CPC
      'MY': 1.2,  // Malaysia
      'TH': 1.0,  // Thailand
      'PH': 0.8,  // Philippines
      'ID': 0.7,  // Indonesia
      'VN': 0.6,  // Vietnam
      'JP': 2.8,  // Japan
      'KR': 2.4,  // South Korea
      'CN': 1.5,  // China
      'HK': 2.6,  // Hong Kong
      'TW': 1.8,  // Taiwan
      
      // Latin America
      'BR': 0.9,  // Brazil
      'MX': 1.0,  // Mexico
      'AR': 0.7,  // Argentina
      'CL': 1.2,  // Chile
      'CO': 0.8,  // Colombia
      'PE': 0.9,  // Peru
      'VE': 0.3,  // Venezuela
      
      // Africa
      'ZA': 1.3,  // South Africa
      'NG': 0.7,  // Nigeria
      'KE': 0.8,  // Kenya
      'MA': 1.0,  // Morocco
      'TN': 0.9,  // Tunisia
      'DZ': 0.8,  // Algeria
    };
    
    // Industry/Vertical CPC multipliers (based on Google Ads 2024 benchmarks)
    // Comprehensive list covering ALL major industries worldwide
    const getIndustryCPCMultiplier = () => {
      // Get keywords from localStorage to detect industry
      const cpcDataStr = localStorage.getItem('cpcData');
      const generatedContentStr = localStorage.getItem('generatedContent');
      const campaignDataStr = localStorage.getItem('campaignData');
      
      let keywords: string[] = [];
      let websiteUrl = '';
      
      // Get keywords from CPC data
      if (cpcDataStr) {
        try {
          const cpcData = JSON.parse(cpcDataStr);
          if (cpcData.keywords && Array.isArray(cpcData.keywords)) {
            keywords = cpcData.keywords.map((kw: any) => (kw.keyword || kw.text || '').toLowerCase());
          }
        } catch (e) {
          console.warn('Failed to parse cpcData');
        }
      }
      
      // Get keywords from generated content
      if (keywords.length === 0 && generatedContentStr) {
        try {
          const generatedContent = JSON.parse(generatedContentStr);
          if (generatedContent.keywords && Array.isArray(generatedContent.keywords)) {
            keywords = generatedContent.keywords.map((kw: string) => kw.toLowerCase());
          }
        } catch (e) {
          console.warn('Failed to parse generatedContent');
        }
      }
      
      // Get website URL
      if (campaignDataStr) {
        try {
          const campaignData = JSON.parse(campaignDataStr);
          websiteUrl = (campaignData.websiteUrl || '').toLowerCase();
        } catch (e) {
          console.warn('Failed to parse campaignData for URL');
        }
      }
      
      // Combine keywords and URL for comprehensive detection
      const allText = (keywords.join(' ') + ' ' + websiteUrl).toLowerCase();
      
      console.log('🔍 Industry Detection - Keywords:', keywords.slice(0, 10));
      console.log('🌐 Website URL:', websiteUrl);
      
      // ========================================
      // ULTRA HIGH CPC INDUSTRIES ($50-150)
      // ========================================
      
      if (allText.match(/mesothelioma|asbestos|structured settlement/i)) {
        return { multiplier: 20.0, industry: 'Mesothelioma/Legal (Ultra-Premium)' };
      }
      
      // ========================================
      // VERY HIGH CPC INDUSTRIES ($20-50)
      // ========================================
      
      // Legal Services
      if (allText.match(/lawyer|attorney|legal|law firm|litigation|court|قانون|محامي|محاماة|وكيل|tribunal/i)) {
        return { multiplier: 10.0, industry: 'Legal Services (القانون)' };
      }
      
      // Insurance
      if (allText.match(/insurance|life insurance|health insurance|auto insurance|تأمين|страхование|assurance/i)) {
        return { multiplier: 9.0, industry: 'Insurance (التأمين)' };
      }
      
      // Loans & Mortgages
      if (allText.match(/loan|mortgage|refinance|debt|credit card|قرض|رهن|تمويل|crédit/i)) {
        return { multiplier: 8.5, industry: 'Loans & Mortgages (القروض)' };
      }
      
      // Addiction & Recovery
      if (allText.match(/rehab|addiction|recovery|treatment center|drug|alcohol|rehabilitation/i)) {
        return { multiplier: 8.0, industry: 'Rehab & Recovery' };
      }
      
      // ========================================
      // HIGH CPC INDUSTRIES ($10-20)
      // ========================================
      
      // Banking & Finance
      if (allText.match(/bank|banking|investment|trading|forex|stock|wealth|financial advisor|مصرف|بنك|استثمار/i)) {
        return { multiplier: 7.0, industry: 'Banking & Finance (المصرفية)' };
      }
      
      // Medical & Healthcare
      if (allText.match(/medical|healthcare|doctor|hospital|clinic|surgery|طبي|صحة|عيادة|مستشفى|دكتور|hôpital/i)) {
        return { multiplier: 6.5, industry: 'Healthcare & Medical (الرعاية الصحية)' };
      }
      
      // Dental Services
      if (allText.match(/dental|dentist|orthodontist|implant|teeth|أسنان|طب الأسنان/i)) {
        return { multiplier: 6.0, industry: 'Dental Services (طب الأسنان)' };
      }
      
      // Senior Care & Assisted Living
      if (allText.match(/senior care|assisted living|nursing home|elderly|retirement home|رعاية المسنين/i)) {
        return { multiplier: 5.5, industry: 'Senior Care' };
      }
      
      // ========================================
      // MEDIUM-HIGH CPC INDUSTRIES ($5-10)
      // ========================================
      
      // Real Estate
      if (allText.match(/real estate|property|apartment|house|rent|للبيع|عقار|عقارات|недвижимость|immobilier/i)) {
        return { multiplier: 4.5, industry: 'Real Estate (العقارات)' };
      }
      
      // Education & E-learning
      if (allText.match(/university|college|degree|course|training|education|online learning|تعليم|جامعة|دورات|université/i)) {
        return { multiplier: 4.0, industry: 'Education (التعليم)' };
      }
      
      // B2B Software & SaaS
      if (allText.match(/software|saas|enterprise|cloud|b2b|crm|erp|برمجيات|سحابة|logiciel/i)) {
        return { multiplier: 3.8, industry: 'B2B Software/SaaS (البرمجيات)' };
      }
      
      // Marketing & Advertising Agencies
      if (allText.match(/marketing|advertising|agency|seo|sem|digital marketing|تسويق|إعلان|وكالة/i)) {
        return { multiplier: 3.5, industry: 'Marketing & Advertising (التسويق)' };
      }
      
      // Accounting & Tax Services
      if (allText.match(/accounting|tax|cpa|bookkeeping|محاسبة|ضرائب|comptabilité/i)) {
        return { multiplier: 3.3, industry: 'Accounting & Tax (المحاسبة)' };
      }
      
      // Web Design & Development
      if (allText.match(/web design|web development|website|app development|تصميم مواقع|تطوير/i)) {
        return { multiplier: 3.0, industry: 'Web Design & Development' };
      }
      
      // ========================================
      // MEDIUM CPC INDUSTRIES ($2-5)
      // ========================================
      
      // Automotive Sales & Services
      if (allText.match(/car|auto|vehicle|automotive|repair|سيارات|مركبات|automobile/i)) {
        return { multiplier: 2.8, industry: 'Automotive (السيارات)' };
      }
      
      // Home Services & Contractors
      if (allText.match(/plumber|electrician|hvac|contractor|roofing|سباكة|كهرباء|صيانة/i)) {
        return { multiplier: 2.6, industry: 'Home Services (خدمات منزلية)' };
      }
      
      // Travel & Tourism
      if (allText.match(/travel|hotel|flight|vacation|booking|tour|tourism|سفر|فندق|سياحة|voyage/i)) {
        return { multiplier: 2.4, industry: 'Travel & Tourism (السياحة)' };
      }
      
      // E-commerce & Retail
      if (allText.match(/ecommerce|shop|store|buy|sell|متجر|تسوق|بيع|boutique/i)) {
        return { multiplier: 2.2, industry: 'E-commerce & Retail (التجارة الإلكترونية)' };
      }
      
      // Consulting Services
      if (allText.match(/consulting|consultant|advisory|business consulting|استشارات|conseil/i)) {
        return { multiplier: 2.0, industry: 'Consulting (الاستشارات)' };
      }
      
      // Photography & Videography
      if (allText.match(/photography|photographer|videography|wedding photo|تصوير|مصور/i)) {
        return { multiplier: 1.9, industry: 'Photography & Video' };
      }
      
      // Event Planning & Catering
      if (allText.match(/event|catering|wedding|party|conference|حفلات|مناسبات|événement/i)) {
        return { multiplier: 1.8, industry: 'Events & Catering' };
      }
      
      // Fitness & Wellness
      if (allText.match(/fitness|gym|workout|wellness|yoga|personal trainer|لياقة|رياضة/i)) {
        return { multiplier: 1.7, industry: 'Fitness & Wellness (اللياقة)' };
      }
      
      // Beauty & Cosmetics
      if (allText.match(/beauty|salon|cosmetics|makeup|spa|جمال|صالون|تجميل|beauté/i)) {
        return { multiplier: 1.6, industry: 'Beauty & Cosmetics (التجميل)' };
      }
      
      // Pet Services
      if (allText.match(/pet|veterinary|vet|dog|cat|grooming|حيوانات أليفة|بيطري/i)) {
        return { multiplier: 1.5, industry: 'Pet Services' };
      }
      
      // ========================================
      // MEDIUM-LOW CPC INDUSTRIES ($1-2)
      // ========================================
      
      // Restaurants & Food
      if (allText.match(/restaurant|food|menu|delivery|dining|cafe|pizza|burger|مطعم|طعام|مقهى/i)) {
        return { multiplier: 1.4, industry: 'Food & Restaurants (المطاعم)' };
      }
      
      // Fashion & Apparel
      if (allText.match(/fashion|clothing|apparel|shoes|accessories|ملابس|أزياء|mode/i)) {
        return { multiplier: 1.3, industry: 'Fashion & Apparel (الأزياء)' };
      }
      
      // Jewelry & Watches
      if (allText.match(/jewelry|jewellery|watch|diamond|gold|مجوهرات|ساعات/i)) {
        return { multiplier: 1.2, industry: 'Jewelry & Watches' };
      }
      
      // Home Decor & Furniture
      if (allText.match(/furniture|decor|interior|design|furnishing|أثاث|ديكور/i)) {
        return { multiplier: 1.1, industry: 'Home Decor & Furniture' };
      }
      
      // Electronics & Gadgets
      if (allText.match(/electronics|gadget|phone|computer|tech|إلكترونيات|هاتف/i)) {
        return { multiplier: 1.0, industry: 'Electronics & Tech' };
      }
      
      // ========================================
      // LOW CPC INDUSTRIES ($0.50-1)
      // ========================================
      
      // Entertainment & Media
      if (allText.match(/entertainment|game|gaming|movie|music|concert|ترفيه|ألعاب|divertissement/i)) {
        return { multiplier: 0.9, industry: 'Entertainment & Gaming (الترفيه)' };
      }
      
      // Arts & Crafts
      if (allText.match(/art|craft|handmade|creative|فنون|حرف يدوية/i)) {
        return { multiplier: 0.8, industry: 'Arts & Crafts' };
      }
      
      // Books & Publishing
      if (allText.match(/book|ebook|publishing|author|library|كتب|مكتبة/i)) {
        return { multiplier: 0.7, industry: 'Books & Publishing' };
      }
      
      // Non-Profit & Charity
      if (allText.match(/nonprofit|charity|donation|ngo|foundation|خيرية|جمعية/i)) {
        return { multiplier: 0.6, industry: 'Non-Profit & Charity' };
      }
      
      // Blogs & Content Sites
      if (allText.match(/blog|blogger|content|article|news|مدونة|أخبار/i)) {
        return { multiplier: 0.5, industry: 'Blogs & Media' };
      }
      
      // ========================================
      // ADDITIONAL SPECIALIZED INDUSTRIES
      // ========================================
      
      // Agriculture & Farming
      if (allText.match(/agriculture|farming|crop|livestock|زراعة|مزرعة/i)) {
        return { multiplier: 1.2, industry: 'Agriculture & Farming' };
      }
      
      // Manufacturing & Industrial
      if (allText.match(/manufacturing|industrial|factory|wholesale|تصنيع|صناعة/i)) {
        return { multiplier: 1.8, industry: 'Manufacturing & Industrial' };
      }
      
      // Transportation & Logistics
      if (allText.match(/transportation|logistics|shipping|freight|نقل|لوجستي/i)) {
        return { multiplier: 1.6, industry: 'Transportation & Logistics' };
      }
      
      // Construction & Engineering
      if (allText.match(/construction|engineering|building|contractor|إنشاءات|هندسة/i)) {
        return { multiplier: 2.3, industry: 'Construction & Engineering' };
      }
      
      // Telecommunications
      if (allText.match(/telecom|mobile|internet|broadband|اتصالات|إنترنت/i)) {
        return { multiplier: 2.1, industry: 'Telecommunications' };
      }
      
      // Security Services
      if (allText.match(/security|guard|surveillance|alarm|أمن|حراسة/i)) {
        return { multiplier: 1.9, industry: 'Security Services' };
      }
      
      // Cleaning Services
      if (allText.match(/cleaning|janitorial|maid|housekeeping|تنظيف|نظافة/i)) {
        return { multiplier: 1.5, industry: 'Cleaning Services' };
      }
      
      // Moving & Storage
      if (allText.match(/moving|storage|relocation|warehouse|نقل أثاث|تخزين/i)) {
        return { multiplier: 1.7, industry: 'Moving & Storage' };
      }
      
      // Wedding Services
      if (allText.match(/wedding|bride|groom|marriage|زفاف|عروس|mariage/i)) {
        return { multiplier: 2.5, industry: 'Wedding Services' };
      }
      
      // Childcare & Daycare
      if (allText.match(/childcare|daycare|preschool|kindergarten|حضانة|روضة/i)) {
        return { multiplier: 2.0, industry: 'Childcare & Daycare' };
      }
      
      // ========================================
      // DEFAULT (GENERAL BUSINESS)
      // ========================================
      
      console.log('⚠️ No specific industry detected, using default multiplier');
      return { multiplier: 1.0, industry: 'General Business / Other' };
    };
    
    const industryData = getIndustryCPCMultiplier();
    console.log('🏢 Industry detected:', industryData.industry, `(${industryData.multiplier}x multiplier)`);
    
    // Determine average CPC based on selected locations
    let avgCPC = 1.5; // Default fallback
    
    if (selectedLocations.length > 0) {
      const locationCPCs = selectedLocations
        .map((loc: any) => cpcByCountry[loc.countryCode] || 1.5)
        .filter((cpc: number) => cpc > 0);
      
      if (locationCPCs.length > 0) {
        avgCPC = locationCPCs.reduce((sum: number, cpc: number) => sum + cpc, 0) / locationCPCs.length;
      }
      
      console.log('🌍 Selected locations CPC:', selectedLocations.map((loc: any) => 
        `${loc.name} (${loc.countryCode}) - CPC: $${(cpcByCountry[loc.countryCode] || 1.5).toFixed(2)}`
      ));
    }
    
    // Apply industry multiplier to base CPC
    avgCPC = avgCPC * industryData.multiplier;
    
    // Adjust CPC based on campaign type
    let campaignTypeMultiplier = 1.0;
    // Get campaign type from localStorage if campaignData is not available yet
    let campaignType = 'SEARCH';
    if (campaignData?.campaignType) {
      campaignType = campaignData.campaignType;
    } else {
      try {
        const storedData = localStorage.getItem('campaignData');
        if (storedData) {
          const parsed = JSON.parse(storedData);
          campaignType = parsed.campaignType || 'SEARCH';
        }
      } catch (e) {
        console.warn('Failed to get campaign type from localStorage');
      }
    }
    
    if (campaignType === 'DISPLAY') {
      campaignTypeMultiplier = 0.65; // Display ads are cheaper (CPM model often)
    } else if (campaignType === 'VIDEO') {
      campaignTypeMultiplier = 0.55; // Video ads use CPV (Cost Per View)
    } else if (campaignType === 'SHOPPING') {
      campaignTypeMultiplier = 1.25; // Shopping ads more expensive due to intent
    }
    
    avgCPC = avgCPC * campaignTypeMultiplier;
    
    // Adjust CTR based on campaign type and language
    let avgCTR = 0.04; // Base 4% for search ads
    
    if (campaignType === 'DISPLAY') {
      avgCTR = 0.006; // 0.6% for display ads
    } else if (campaignType === 'VIDEO') {
      avgCTR = 0.015; // 1.5% for video ads
    } else if (campaignType === 'SHOPPING') {
      avgCTR = 0.06; // 6% for shopping ads (higher intent)
    }
    
    // Adjust conversion rate based on campaign type
    let avgConversionRate = 0.03; // Base 3% for search
    
    if (campaignType === 'DISPLAY') {
      avgConversionRate = 0.015; // 1.5% for display
    } else if (campaignType === 'VIDEO') {
      avgConversionRate = 0.02; // 2% for video
    } else if (campaignType === 'SHOPPING') {
      avgConversionRate = 0.04; // 4% for shopping (highest intent)
    }
    
    // Monthly calculations (30 days)
    const monthlyBudgetUSD = budgetUSD * 30;
    
    // Calculate clicks: budget / CPC
    const monthlyClicks = Math.round(monthlyBudgetUSD / avgCPC);
    
    // Calculate impressions: clicks / CTR
    const monthlyImpressions = Math.round(monthlyClicks / avgCTR);
    
    // Calculate conversions: clicks * conversion rate
    const monthlyConversions = Math.max(1, Math.round(monthlyClicks * avgConversionRate));
    
    console.log('📊 Realistic Estimates (Location + Industry + Campaign Type):', {
      dailyBudgetUSD: budgetUSD,
      monthlyBudgetUSD,
      '🏢 Industry': industryData.industry,
      '📈 Industry Multiplier': `${industryData.multiplier}x`,
      '🌍 Locations': selectedLocations.map((loc: any) => `${loc.name} (${loc.countryCode})`),
      '🎯 Campaign Type': campaignType,
      '💰 Final CPC': `$${avgCPC.toFixed(2)}`,
      '📊 CTR': `${(avgCTR * 100).toFixed(2)}%`,
      '✅ Conversion Rate': `${(avgConversionRate * 100).toFixed(2)}%`,
      '👁️ Monthly Impressions': monthlyImpressions.toLocaleString(),
      '👆 Monthly Clicks': monthlyClicks.toLocaleString(),
      '🎯 Monthly Conversions': monthlyConversions.toLocaleString()
    });
    
    console.log('✅ Final Estimates:', {
      impressions: monthlyImpressions,
      clicks: monthlyClicks,
      conversions: monthlyConversions
    });
    
    return {
      impressions: monthlyImpressions,
      clicks: monthlyClicks,
      conversions: monthlyConversions
    };
  }, []); // No dependencies - reads from localStorage directly
  
  // Initialize estimates immediately on mount and when budget changes
  useEffect(() => {
    console.log('🚀 useEffect running - calculating estimates for budget:', selectedBudgetUSD);
    // Calculate immediately, don't wait for campaignData
    const fallbackEstimates = calculateFallbackEstimates(selectedBudgetUSD);
    console.log('📊 Calculated estimates:', fallbackEstimates);
    
    // Only update if we have valid values
    if (fallbackEstimates.impressions > 0 && fallbackEstimates.clicks > 0 && fallbackEstimates.conversions > 0) {
      console.log('✅ Setting valid estimates:', fallbackEstimates);
      setEstimates(fallbackEstimates);
    } else {
      console.warn('⚠️ Calculated estimates are invalid (zeros or NaN), keeping default estimates');
    }
  }, [selectedBudgetUSD, calculateFallbackEstimates]);
  
  // Fetch keyword data and calculate real estimates based on actual CPC
  const fetchKeywordDataAndCalculateEstimates = useCallback(async () => {
    if (!selectedBudgetUSD || selectedBudgetUSD <= 0 || !campaignData) return;
    
    setIsLoadingEstimates(true);
    
    try {
      console.log('🔍 Fetching keyword data for accurate estimates...');
      
      // Get target locations from localStorage
      const selectedLocationsStr = localStorage.getItem('selectedLocations') || '[]';
      const selectedLocations = JSON.parse(selectedLocationsStr);
      
      const target_locations = selectedLocations.map((loc: any) => ({
        name: loc.name,
        formatted_address: loc.country || loc.secondaryText || loc.name,
        place_id: loc.id,
        country_code: loc.countryCode,
        location_type: loc.locationType || 'city',
        coordinates: loc.coordinates,
        radius: loc.radius || 10
      }));
      
      // Call API to get keyword CPC data
      const response = await fetch(getApiUrl('/api/ai-campaign/get-keyword-cpc-data'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website_url: campaignData.websiteUrl,
          campaign_type: campaignData.campaignType,
          daily_budget: selectedBudgetUSD,
          target_locations: target_locations,
          language_id: campaignData.selectedLanguage || '1019'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch keyword data');
      }
      
        const data = await response.json();
      console.log('📊 Keyword data received:', data);
      
      setKeywordData(data);
      
      // Calculate real estimates based on keyword data
      if (data.keywords && data.keywords.length > 0) {
        // Calculate average CPC from keywords
        const totalCPC = data.keywords.reduce((sum: number, kw: any) => 
          sum + (kw.average_cpc || 0), 0
        );
        const avgCPC = totalCPC / data.keywords.length;
        
        // Calculate average search volume
        const totalSearchVolume = data.keywords.reduce((sum: number, kw: any) => 
          sum + (kw.search_volume || 0), 0
        );
        
        console.log('💡 Real Keyword Data from Google Ads API:', {
          avgCPC: `$${avgCPC.toFixed(2)}`,
          totalSearchVolume: totalSearchVolume.toLocaleString(),
          keywordsCount: data.keywords.length,
          note: '✅ Using REAL CPC data from Google Ads (most accurate!)'
        });
        
        // Calculate monthly estimates (30 days)
        const dailyBudgetUSD = selectedBudgetUSD;
        const monthlyBudgetUSD = dailyBudgetUSD * 30;
        
        // Estimate daily clicks based on budget and CPC
        const dailyClicks = avgCPC > 0 ? dailyBudgetUSD / avgCPC : 0;
        const monthlyClicks = Math.round(dailyClicks * 30);
        
        // Estimate impressions based on CTR (typical 3-5% for search ads)
        const estimatedCTR = 0.04; // 4% average CTR
        const monthlyImpressions = Math.round(monthlyClicks / estimatedCTR);
        
        // Estimate conversions based on typical conversion rate (2-5%)
        const estimatedConversionRate = 0.03; // 3% average conversion rate
        const monthlyConversions = Math.round(monthlyClicks * estimatedConversionRate);
        
        console.log('📈 Real Estimates (Monthly):', {
          dailyBudgetUSD,
          monthlyBudgetUSD,
          avgCPC: avgCPC.toFixed(2),
          dailyClicks: Math.round(dailyClicks),
          monthlyClicks,
          monthlyImpressions,
          monthlyConversions
        });
        
        setEstimates({
          impressions: monthlyImpressions,
          clicks: monthlyClicks,
          conversions: monthlyConversions
        });
      } else {
        // Fallback to realistic calculation if no keyword data
        console.warn('⚠️ No real keyword data from API, using industry benchmarks (Location + Industry + Campaign Type)');
        const fallbackEstimates = calculateFallbackEstimates(selectedBudgetUSD);
        setEstimates(fallbackEstimates);
      }
      
    } catch (error) {
      console.error('❌ Error fetching keyword data:', error);
      // Fallback to realistic calculation
      const fallbackEstimates = calculateFallbackEstimates(selectedBudgetUSD);
      setEstimates(fallbackEstimates);
    } finally {
      setIsLoadingEstimates(false);
    }
  }, [selectedBudgetUSD, campaignData, calculateFallbackEstimates]);
  
  // Fetch real Google Ads Historical Metrics (Last Month Real Data)
  const fetchRealEstimates = useCallback(async () => {
    if (!campaignData) {
      console.log('⚠️ No campaign data available, skipping historical metrics');
      return;
    }
    
    // Helper: استخدم CPC المخزن لحساب التقديرات بدون استدعاء API
    const calculateEstimatesFromCPC = (cpc: number) => {
      const monthlyBudgetUSD = selectedBudgetUSD * 30;
      const realAvgCPC = cpc > 0 ? cpc : 0.5;
      const monthlyClicks = Math.floor(monthlyBudgetUSD / realAvgCPC);
      const estimatedCTR = 0.04; // 4% average CTR for search campaigns
      const monthlyImpressions = Math.floor(monthlyClicks / estimatedCTR);
      const monthlyConversions = Math.max(1, Math.floor(monthlyClicks * 0.03));

      const calculatedEstimates = {
        impressions: Math.max(monthlyImpressions, monthlyClicks),
        clicks: monthlyClicks,
        conversions: monthlyConversions
      };

      setEstimates(calculatedEstimates);

      console.log('📊 Calculated estimates using CACHED Historical CPC:', {
        cpc: realAvgCPC,
        ...calculatedEstimates
      });
    };

    // إذا كان لدينا CPC مخزون في الذاكرة، نستخدمه مباشرة بدون استدعاء API
    if (historicalCPC !== null && historicalCPC > 0) {
      console.log('ℹ️ Using in-memory historicalCPC without calling backend:', historicalCPC);
      calculateEstimatesFromCPC(historicalCPC);
      return;
    }

    // محاولة قراءة CPC من localStorage قبل استدعاء API
    try {
      const cacheKey = campaignData.websiteUrl
        ? `historicalMetrics_${campaignData.websiteUrl}`
        : 'historicalMetrics_default';

      const cachedStr = localStorage.getItem(cacheKey);
      if (cachedStr) {
        try {
          const cached = JSON.parse(cachedStr);
          if (typeof cached.avg_cpc === 'number' && cached.avg_cpc > 0) {
            console.log('💾 Loaded historical CPC from cache:', cached);
            setHistoricalCPC(cached.avg_cpc);
            calculateEstimatesFromCPC(cached.avg_cpc);
            return;
          }
        } catch (e) {
          console.warn('⚠️ Failed to parse historicalMetrics cache:', e);
        }
      }
    } catch (e) {
      console.warn('⚠️ Error accessing localStorage for historicalMetrics:', e);
    }

    // لم نجد CPC مخزن → استدعاء API مرة واحدة فقط لهذه الحملة
    setIsLoadingEstimates(true);
    
    try {
      console.log('🚀 Fetching REAL Google Ads Historical Metrics (Last Month Data) from backend...');
      
      // Get keywords from localStorage
      const generatedContentStr = localStorage.getItem('generatedContent');
      const cpcDataStr = localStorage.getItem('cpcData');
      
      let keywords: string[] = [];
      
      if (generatedContentStr) {
        try {
          const generatedContent = JSON.parse(generatedContentStr);
          if (generatedContent.keywords && Array.isArray(generatedContent.keywords)) {
            keywords = generatedContent.keywords.slice(0, 10); // Limit to 10
          }
        } catch (e) {
          console.warn('Failed to parse generatedContent');
        }
      }
      
      if (keywords.length === 0 && cpcDataStr) {
        try {
          const cpcData = JSON.parse(cpcDataStr);
          if (cpcData.keywords && Array.isArray(cpcData.keywords)) {
            keywords = cpcData.keywords.map((kw: any) => kw.keyword || kw.text || '').slice(0, 10);
          }
        } catch (e) {
          console.warn('Failed to parse cpcData');
        }
      }
      
      if (keywords.length === 0) {
        console.warn('⚠️ No keywords available - skipping historical metrics API call');
        console.log('ℹ️ Using fallback estimates instead');
        const fallbackEstimates = calculateFallbackEstimates(selectedBudgetUSD);
        setEstimates(fallbackEstimates);
        setIsLoadingEstimates(false);
        return;
      }
      
      // Get selected locations
      const selectedLocationsStr = localStorage.getItem('selectedLocations');
      let targetLocations: any[] = [];
      
      if (selectedLocationsStr) {
        try {
          targetLocations = JSON.parse(selectedLocationsStr);
        } catch (e) {
          console.warn('Failed to parse selectedLocations');
        }
      }
      
      if (targetLocations.length === 0) {
        console.warn('⚠️ No locations available - skipping historical metrics API call');
        console.log('ℹ️ Using fallback estimates instead');
        const fallbackEstimates = calculateFallbackEstimates(selectedBudgetUSD);
        setEstimates(fallbackEstimates);
        setIsLoadingEstimates(false);
        return;
      }
      
      // Get language ID
      const languageId = campaignData.languageCode === 'en' ? '1000' : '1019'; // English or Arabic
      
      console.log('📦 Historical Metrics API Request:', {
        keywords: keywords.length,
        locations: targetLocations.length,
        language: languageId,
        dailyBudget: selectedBudgetUSD
      });
      
      let historicalData = null;
      
      try {
        console.log('🔍 Fetching Historical Metrics from backend...');
        const apiUrl = getApiUrl('/api/ai-campaign/get-historical-metrics');
        console.log('   🌐 API URL:', apiUrl);
        console.log('   📦 Request data:', {
          keywords_count: keywords.length,
          website_url: campaignData.websiteUrl,
          target_locations_count: targetLocations.length,
          language_id: languageId
        });
        
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        let histResponse: Response;
        try {
          histResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              keywords,
              website_url: campaignData.websiteUrl,
              target_locations: targetLocations,
              language_id: languageId
            }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);
        } catch (fetchErr) {
          clearTimeout(timeoutId);
          console.error('❌ Fetch failed:', fetchErr);
          throw fetchErr;
        }
        
        if (!histResponse.ok) {
          throw new Error(`HTTP error! status: ${histResponse.status}`);
        }
        
        historicalData = await histResponse.json();
        
        if (historicalData.success && historicalData.summary) {
          // Store currency info from API
          if (historicalData.currency) {
            setCurrencyInfo(historicalData.currency);
            setCurrency(historicalData.currency.code);
            console.log(`💱 Currency detected: ${historicalData.currency.code} (${historicalData.currency.symbol})`);
          }
          
          console.log('✅ Historical Metrics received with REAL CPC calculation:');
          console.log(`   💰 Avg CPC (USD): $${historicalData.summary.avg_cpc}`);
          if (historicalData.currency && historicalData.summary.avg_cpc_local) {
            console.log(`   💰 Avg CPC (${historicalData.currency.code}): ${historicalData.currency.symbol}${historicalData.summary.avg_cpc_local}`);
          }
          console.log(`   📈 CPC Range (USD): $${historicalData.summary.low_cpc} - $${historicalData.summary.high_cpc}`);
          console.log(`   📊 Avg Monthly Searches: ${historicalData.summary.avg_monthly_searches.toLocaleString()}`);
          console.log(`   🎯 Competition: ${historicalData.summary.competition}`);
          
          const avgCpc = historicalData.summary.avg_cpc;
          
          // تخزين CPC في الذاكرة وفي localStorage لاستخدامه في المرات القادمة
          setHistoricalCPC(avgCpc);
          try {
            const cacheKey = campaignData.websiteUrl
              ? `historicalMetrics_${campaignData.websiteUrl}`
              : 'historicalMetrics_default';
            localStorage.setItem(cacheKey, JSON.stringify({
              avg_cpc: avgCpc,
              fetched_at: new Date().toISOString()
            }));
            console.log('💾 Saved historical CPC to cache:', { avg_cpc: avgCpc });
          } catch (e) {
            console.warn('⚠️ Failed to save historical CPC to cache:', e);
          }
          
          // حساب التقديرات باستخدام CPC الحقيقي من Google Ads
          calculateEstimatesFromCPC(avgCpc);
          
          // Store competition data
          const realAvgCPC = avgCpc > 0 ? avgCpc : 0.5;
          setCompetitionData({
            level: historicalData.summary.competition,
            distribution: historicalData.summary.competition_distribution,
            avgMonthlySearches: historicalData.summary.avg_monthly_searches,
            realCPC: realAvgCPC
          });
          
          // Save real CPC to localStorage for campaign creation
          localStorage.setItem('realCPC', realAvgCPC.toString());
          console.log(`💾 Saved Real CPC to localStorage: $${realAvgCPC.toFixed(2)}`);
        }
      } catch (histError) {
        console.error('❌ Error fetching historical metrics:', histError);
        
        // Check if it's a network error
        if (histError instanceof TypeError && histError.message === 'Failed to fetch') {
          console.error('🔌 Network error: Backend is not responding. Please ensure:');
          console.error('   1. Backend server is running and reachable from the frontend environment');
          console.error('   2. No CORS issues between frontend and backend');
          console.error('   3. The endpoint /api/ai-campaign/get-historical-metrics exists on the backend');
        }
        
        // Set fallback estimates if API fails
        console.warn('⚠️ Using fallback estimates due to API error');
        const monthlyBudgetUSD = selectedBudgetUSD * 30;
        const fallbackCPC = 0.5;
        const fallbackClicks = Math.floor(monthlyBudgetUSD / fallbackCPC);
        
        setEstimates({
          impressions: fallbackClicks * 25,
          clicks: fallbackClicks,
          conversions: Math.max(1, Math.floor(fallbackClicks * 0.03))
        });
      }
      
    } catch (error) {
      console.error('❌ Error fetching historical metrics:', error);
    } finally {
      setIsLoadingEstimates(false);
    }
  }, [campaignData, selectedBudgetUSD]);
  
  // Fetch real estimates when campaign data is available OR budget changes
  useEffect(() => {
    if (campaignData && selectedBudgetUSD > 0) {
      // Debounce budget changes to avoid too many API calls
      const timeoutId = setTimeout(() => {
        fetchRealEstimates();
      }, 500); // Wait 500ms after last budget change
      
      return () => clearTimeout(timeoutId);
    }
  }, [campaignData, selectedBudgetUSD, fetchRealEstimates]);
  
  // Fetch keyword data and calculate estimates when budget or campaign data changes
  // DISABLED: We're using fallback estimates immediately instead
  // useEffect(() => {
  //   if (campaignData && selectedBudgetUSD > 0) {
  //     fetchKeywordDataAndCalculateEstimates();
  //   }
  // }, [selectedBudgetUSD, campaignData, fetchKeywordDataAndCalculateEstimates]);

  const handleCustomBudgetSave = () => {
    const amount = parseFloat(customBudget);
    const minAmount = Math.round(5 * getConversionRate(currency)); // 5 USD minimum converted to current currency
    
    if (isNaN(amount) || amount < minAmount) {
      setCustomBudgetError(language === 'ar' 
        ? `الحد الأدنى للمبلغ هو ${getCurrencySymbol(currency)}${minAmount}` 
        : `Minimum amount to add is ${getCurrencySymbol(currency)}${minAmount}`);
      return;
    }
    
    // Convert to USD and store
    const amountInUSD = amount / getConversionRate(currency);
    setSelectedBudgetUSD(amountInUSD);
    setShowCustomModal(false);
    setCustomBudget('');
    setCustomBudgetError('');
  };



  return (
    <div className="min-h-screen bg-black overflow-x-hidden" dir="ltr">
      {/* Campaign Progress */}
      <CampaignProgress currentStep={2} totalSteps={3} />
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-5xl">
        
        {/* Header */}
        <div className="text-center mb-3 sm:mb-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {language === 'ar' ? 'أطلق إعلاناتك باختيار ميزانية إعلانية يومية' : 'Launch your ads by selecting a daily ad budget'}
          </h2>
        </div>

        {/* Currency Tabs */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-10 max-w-4xl mx-auto">
          {currencies.map((curr) => (
            <button
              key={curr}
              onClick={() => setCurrency(curr)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-sm sm:text-base transition-all duration-200 ${
                currency === curr
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/40 scale-105 ring-2 ring-blue-400/50'
                  : 'bg-gray-200/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 hover:scale-105 border border-gray-300/50 dark:border-gray-600/50'
              }`}
            >
              {curr}
            </button>
          ))}
          <button
            onClick={() => setShowCustomModal(true)}
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-sm sm:text-base ml-1 sm:ml-2 transition-all duration-200 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/40 hover:shadow-xl hover:shadow-cyan-500/40 hover:scale-110 active:scale-95 ring-1 ring-blue-400/30"
          >
            {language === 'ar' ? 'ميزانية مخصصة' : 'Custom budget'}
          </button>
        </div>

        {/* Budget Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 md:mb-12 relative max-w-4xl mx-auto px-2 sm:px-0">
          {budgetOptions.map((option, index) => {
            const gradients = [
              'bg-gradient-to-br from-yellow-500 to-orange-600',      // $5
              'bg-gradient-to-br from-purple-500 to-pink-600',        // $15 (recommended)
              'bg-gradient-to-br from-blue-500 to-cyan-600'           // $25
            ];
            
            const shadowsLight = [
              'shadow-orange-300/40',
              'shadow-pink-300/40',
              'shadow-cyan-300/40'
            ];
            
            const shadowsDark = [
              'dark:shadow-orange-500/30',
              'dark:shadow-pink-500/30',
              'dark:shadow-cyan-500/30'
            ];
            
            const bordersLight = [
              'border-orange-300/50',
              'border-pink-300/50',
              'border-cyan-300/50'
            ];
            
            const bordersDark = [
              'dark:border-orange-400/30',
              'dark:border-pink-400/30',
              'dark:border-cyan-400/30'
            ];

            const ringsLight = [
              'ring-orange-400/40',
              'ring-pink-400/40',
              'ring-cyan-400/40'
            ];
            
            const ringsDark = [
              'dark:ring-orange-500/40',
              'dark:ring-pink-500/40',
              'dark:ring-cyan-500/40'
            ];
            
            const isSelected = selectedBudget === option.amount;
            
            return (
              <CardContainer 
                key={`${currency}-${option.amount}-${index}`}
                containerClassName="w-full h-full"
                speed="fast"
              >
                <CardBody 
                  onClick={() => setSelectedBudgetUSD(option.amountUSD)}
                  className={`!h-auto !w-full relative p-4 sm:p-5 md:p-6 ${gradients[index]} rounded-lg sm:rounded-xl cursor-pointer transition-shadow duration-300 border ${
                    isSelected 
                      ? `ring-2 sm:ring-4 ${ringsLight[index]} ${ringsDark[index]} shadow-xl sm:shadow-2xl ${shadowsLight[index]} ${shadowsDark[index]} ${bordersLight[index].replace('/50', '/70')} ${bordersDark[index].replace('/30', '/50')} brightness-110` 
                      : `shadow-md sm:shadow-lg ${shadowsLight[index]} ${shadowsDark[index]} hover:shadow-xl sm:hover:shadow-2xl hover:brightness-105 ${bordersLight[index]} ${bordersDark[index]}`
              }`}
            >
              {option.recommended && (
                    <CardItem 
                      translateZ={30}
                      className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2 animate-in fade-in slide-in-from-top-2 duration-500"
                    >
                      <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold shadow-lg flex items-center gap-1 sm:gap-1.5 hover:shadow-xl hover:scale-105 transition-all duration-200">
                        <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current animate-pulse" />
                        {language === 'ar' ? 'موصى به' : 'Recommended'}
                  </span>
                    </CardItem>
                  )}
                  
                  <CardItem translateZ={50} className="text-center w-full">
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3 drop-shadow-md">
                      {getCurrencySymbol(currency)}{option.amount}
                      <span className="text-sm sm:text-base md:text-lg font-normal text-white/90">{language === 'ar' ? '/يوم' : '/day'}</span>
                </div>
                    <p className="text-xs sm:text-sm text-white/90 leading-relaxed sm:leading-relaxed drop-shadow">
                      {language === 'ar' ? option.labelAr : option.label}
                    </p>
                  </CardItem>
                  
                  {isSelected && (
                    <CardItem 
                      translateZ={40}
                      className="absolute top-2 sm:top-3 right-2 sm:right-3 animate-in fade-in zoom-in duration-300"
                    >
                      <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-600/60 dark:shadow-green-500/50 ring-2 ring-white/30 animate-pulse">
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 text-white" strokeWidth={3} />
              </div>
                    </CardItem>
                  )}
                </CardBody>
              </CardContainer>
            );
          })}
          
          {/* Custom Budget Modal - Positioned inside grid */}
          {showCustomModal && (
            <div 
              className="absolute inset-0 flex items-center justify-center z-50"
              onClick={() => {
                setShowCustomModal(false);
                setCustomBudget('');
                setCustomBudgetError('');
              }}
            >
              <div className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm rounded-xl"></div>
              <CardContainer containerClassName="w-[450px] max-w-[90%]">
                <CardBody
                  className="!h-auto !w-full relative bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-8 shadow-2xl shadow-pink-500/40 border border-white/20"
                  onClick={(e) => e.stopPropagation()}
                >
                <CardItem translateZ={50}>
                {/* Modal Header */}
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-white drop-shadow-lg">
                      {language === 'ar' ? 'ميزانية مخصصة' : 'Custom Budget'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowCustomModal(false);
                      setCustomBudget('');
                      setCustomBudgetError('');
                    }}
                      className="text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
        </div>
                </CardItem>

                {/* Budget Input */}
                <div className="mb-8">
                  <CardItem translateZ={60} as="div" className="!w-full">
                  <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-3xl text-white/70 pointer-events-none">{getCurrencySymbol(currency)}</span>
                    <input
                      type="number"
                      value={customBudget}
                      onChange={(e) => {
                        const value = e.target.value;
                        setCustomBudget(value);
                        const numValue = parseFloat(value);
                          const minAmount = Math.round(5 * getConversionRate(currency));
                          if (value && !isNaN(numValue) && numValue < minAmount) {
                            setCustomBudgetError(language === 'ar' 
                              ? `الحد الأدنى للمبلغ هو ${getCurrencySymbol(currency)}${minAmount}` 
                              : `Minimum amount to add is ${getCurrencySymbol(currency)}${minAmount}`);
                        } else {
                          setCustomBudgetError('');
                        }
                      }}
                      placeholder="0"
                        dir="ltr"
                        className={`w-full pl-12 pr-4 py-4 text-3xl text-center border-2 rounded-xl focus:outline-none focus:ring-4 bg-white/20 backdrop-blur-sm text-white font-bold placeholder-white/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none cursor-text ${
                        customBudgetError 
                            ? 'border-red-300/50 focus:ring-red-300/30' 
                            : 'border-white/30 focus:ring-white/20'
                      }`}
                      autoFocus
                    />
    </div>
                  </CardItem>
                  
                  {/* Error or Help Text */}
                  {customBudgetError ? (
                    <p className="text-sm mt-3 text-red-200 font-medium">
                      {customBudgetError}
                    </p>
                  ) : (
                    <p className="text-sm mt-3 text-white/80">
                      {language === 'ar' 
                        ? `الحد الأدنى للمبلغ اليومي هو ${getCurrencySymbol(currency)}${Math.round(5 * getConversionRate(currency))}`
                        : `The minimum daily amount you can add is ${getCurrencySymbol(currency)}${Math.round(5 * getConversionRate(currency))}`}
                    </p>
                  )}
        </div>

                <CardItem translateZ={50}>
                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleCustomBudgetSave}
                      className="w-full py-4 bg-white text-purple-600 hover:bg-white/90 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                      {language === 'ar' ? 'حفظ' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setShowCustomModal(false);
                      setCustomBudget('');
                      setCustomBudgetError('');
                    }}
                      className="w-full py-3 text-white/90 hover:text-white font-medium transition-colors"
                  >
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
        </div>
                </CardItem>
                </CardBody>
              </CardContainer>
            </div>
          )}
            </div>

        {/* Estimated Results */}
        <CardContainer containerClassName="max-w-4xl mx-auto mb-8 w-full px-4 sm:px-0">
          <CardBody className="!h-auto !w-full relative overflow-hidden rounded-2xl p-6 sm:p-8 shadow-2xl hover:shadow-3xl transition-all duration-500
            bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 
            dark:from-gray-900 dark:via-blue-950/20 dark:to-purple-950/20
            border-2 border-blue-200/40 dark:border-blue-800/30 backdrop-blur-xl">
            
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 via-purple-400/5 to-pink-400/5 animate-gradient-xy"></div>
            
            {/* Glowing Orbs */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
            
            <CardItem translateZ={30} className="!w-full relative z-10">
              <p className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent drop-shadow-sm">
                {language === 'ar' ? 'النتائج الشهرية المقدرة' : 'Estimated Monthly Results'}
              </p>
            </CardItem>
          {isLoadingEstimates ? (
              <div className="flex flex-col items-center justify-center py-12 gap-6">
                {/* AI Loading Animation */}
                <div className="relative">
                  {/* Outer rotating ring */}
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-500 animate-spin"></div>
                  {/* Middle rotating ring */}
                  <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 border-r-pink-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                  {/* Inner pulsing circle */}
                  <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 animate-pulse"></div>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
                    {language === 'ar' ? '🤖 الذكاء الاصطناعي يحلل بياناتك...' : '🤖 AI is analyzing your data...'}
                  </p>
                </div>
            </div>
          ) : (
              <div className="flex flex-col sm:flex-row justify-around gap-4 sm:gap-8 relative z-10">
                <CardItem translateZ={50} className="!w-auto flex flex-col items-center gap-2 sm:gap-3 flex-1 group">
                  <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300
                    bg-gradient-to-br from-blue-500/20 via-blue-400/10 to-transparent
                    dark:from-blue-500/30 dark:via-blue-400/20 dark:to-transparent
                    shadow-lg shadow-blue-500/20 dark:shadow-blue-500/30 group-hover:shadow-xl group-hover:shadow-blue-500/40">
                    <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400 drop-shadow-lg" />
                    <div className="absolute inset-0 bg-blue-500/5 rounded-2xl animate-pulse"></div>
      </div>
                  <div className="text-center">
                    <p className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1 drop-shadow">
                      {language === 'ar' ? 'مرات الظهور' : 'Impressions'}
                    </p>
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-800 dark:text-blue-200 drop-shadow-lg">
                      {(() => {
                        console.log('🖼️ Rendering Impressions:', estimates.impressions);
                        return estimates.impressions.toLocaleString();
                      })()}
                </div>
              </div>
                </CardItem>
                
                <div className="w-px h-px sm:h-auto sm:w-px bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-600 to-transparent hidden sm:block"></div>
                
                <CardItem translateZ={50} className="!w-auto flex flex-col items-center gap-2 sm:gap-3 flex-1 group">
                  <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300
                    bg-gradient-to-br from-purple-500/20 via-purple-400/10 to-transparent
                    dark:from-purple-500/30 dark:via-purple-400/20 dark:to-transparent
                    shadow-lg shadow-purple-500/20 dark:shadow-purple-500/30 group-hover:shadow-xl group-hover:shadow-purple-500/40">
                    <MousePointer className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400 drop-shadow-lg" />
                    <div className="absolute inset-0 bg-purple-500/5 rounded-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </div>
                  <div className="text-center">
                    <p className="text-xs sm:text-sm font-semibold text-purple-700 dark:text-purple-300 mb-1 drop-shadow">
                      {language === 'ar' ? 'النقرات' : 'Clicks'}
                    </p>
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-800 dark:text-purple-200 drop-shadow-lg">
                      {(() => {
                        console.log('🖱️ Rendering Clicks:', estimates.clicks);
                        return estimates.clicks.toLocaleString();
                      })()}
                </div>
              </div>
                </CardItem>
                
                <div className="w-px h-px sm:h-auto sm:w-px bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-600 to-transparent hidden sm:block"></div>
                
                <CardItem translateZ={50} className="!w-auto flex flex-col items-center gap-2 sm:gap-3 flex-1 group">
                  <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300
                    bg-gradient-to-br from-green-500/20 via-green-400/10 to-transparent
                    dark:from-green-500/30 dark:via-green-400/20 dark:to-transparent
                    shadow-lg shadow-green-500/20 dark:shadow-green-500/30 group-hover:shadow-xl group-hover:shadow-green-500/40">
                    <Check className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400 drop-shadow-lg" />
                    <div className="absolute inset-0 bg-green-500/5 rounded-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-300 mb-1 drop-shadow">
                      {language === 'ar' ? 'التحويلات' : 'Conversions'}
                    </p>
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-800 dark:text-green-200 drop-shadow-lg">
                      {(() => {
                        console.log('✅ Rendering Conversions:', estimates.conversions);
                        return estimates.conversions.toLocaleString();
                      })()}
                    </div>
                  </div>
                </CardItem>
            </div>
          )}
            
            {/* Competition Indicator - Show when data is available */}
            {competitionData && (
              <CardItem translateZ={40} className="!w-full mt-8 pt-6 border-t border-gradient-to-r from-transparent via-blue-300/50 dark:via-blue-800/30 to-transparent relative z-10">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`px-6 py-2.5 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 hover:scale-105 ${
                      competitionData.level === 'LOW' 
                        ? 'bg-gradient-to-r from-green-200 to-emerald-200 dark:from-green-800 dark:to-emerald-800 text-green-900 dark:text-green-100 shadow-green-300/50 dark:shadow-green-900/50 border-2 border-green-300 dark:border-green-600' 
                        : competitionData.level === 'MEDIUM'
                        ? 'bg-gradient-to-r from-yellow-200 to-amber-200 dark:from-yellow-800 dark:to-amber-800 text-yellow-900 dark:text-yellow-100 shadow-yellow-300/50 dark:shadow-yellow-900/50 border-2 border-yellow-300 dark:border-yellow-600'
                        : competitionData.level === 'HIGH'
                        ? 'bg-gradient-to-r from-red-200 to-rose-200 dark:from-red-800 dark:to-rose-800 text-red-900 dark:text-red-100 shadow-red-300/50 dark:shadow-red-900/50 border-2 border-red-300 dark:border-red-600'
                        : 'bg-gradient-to-r from-gray-200 to-slate-200 dark:from-gray-700 dark:to-slate-700 text-gray-900 dark:text-gray-100 border-2 border-gray-300 dark:border-gray-600'
                    }`}>
                      {competitionData.level === 'LOW' && (language === 'ar' ? '🟢 منافسة منخفضة' : '🟢 Low Competition')}
                      {competitionData.level === 'MEDIUM' && (language === 'ar' ? '🟡 منافسة متوسطة' : '🟡 Medium Competition')}
                      {competitionData.level === 'HIGH' && (language === 'ar' ? '🔴 منافسة عالية' : '🔴 High Competition')}
                      {competitionData.level === 'UNSPECIFIED' && (language === 'ar' ? '⚪ غير محدد' : '⚪ Unspecified')}
                    </div>
        </div>
                  
                  {/* Additional metrics */}
                  <div className="flex gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{language === 'ar' ? 'متوسط البحث الشهري:' : 'Avg Monthly Searches:'}</span>
                      <span className="font-bold text-blue-700 dark:text-blue-300">{competitionData.avgMonthlySearches.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{language === 'ar' ? 'متوسط CPC:' : 'Avg CPC:'}</span>
                      <span className="font-bold text-purple-700 dark:text-purple-300">
                        {getCurrencySymbol(currency)}{(competitionData.realCPC * getConversionRate(currency)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Competition distribution */}
                  <div className="w-full max-w-md">
                    <p className="text-xs text-center font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      {language === 'ar' ? 'توزيع المنافسة للكلمات المفتاحية' : 'Competition Distribution'}
                    </p>
                    <div className="flex w-full h-3 rounded-full overflow-hidden bg-gray-200/50 dark:bg-gray-700/50 shadow-inner backdrop-blur-sm">
                      {competitionData.distribution.LOW > 0 && (
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-400 dark:to-emerald-400 shadow-lg shadow-green-500/30 transition-all duration-500 hover:brightness-110" 
                          style={{ width: `${(competitionData.distribution.LOW / Object.values(competitionData.distribution).reduce((a, b) => a + b, 0)) * 100}%` }}
                          title={`Low: ${competitionData.distribution.LOW}`}
                        ></div>
                      )}
                      {competitionData.distribution.MEDIUM > 0 && (
                        <div 
                          className="bg-gradient-to-r from-yellow-500 to-amber-500 dark:from-yellow-400 dark:to-amber-400 shadow-lg shadow-yellow-500/30 transition-all duration-500 hover:brightness-110" 
                          style={{ width: `${(competitionData.distribution.MEDIUM / Object.values(competitionData.distribution).reduce((a, b) => a + b, 0)) * 100}%` }}
                          title={`Medium: ${competitionData.distribution.MEDIUM}`}
                        ></div>
                      )}
                      {competitionData.distribution.HIGH > 0 && (
                        <div 
                          className="bg-gradient-to-r from-red-500 to-rose-500 dark:from-red-400 dark:to-rose-400 shadow-lg shadow-red-500/30 transition-all duration-500 hover:brightness-110" 
                          style={{ width: `${(competitionData.distribution.HIGH / Object.values(competitionData.distribution).reduce((a, b) => a + b, 0)) * 100}%` }}
                          title={`High: ${competitionData.distribution.HIGH}`}
                        ></div>
                      )}
                      {competitionData.distribution.UNSPECIFIED > 0 && (
                        <div 
                          className="bg-gradient-to-r from-gray-400 to-slate-400 dark:from-gray-500 dark:to-slate-500 transition-all duration-500 hover:brightness-110" 
                          style={{ width: `${(competitionData.distribution.UNSPECIFIED / Object.values(competitionData.distribution).reduce((a, b) => a + b, 0)) * 100}%` }}
                          title={`Unspecified: ${competitionData.distribution.UNSPECIFIED}`}
                        ></div>
                      )}
                    </div>
                    <div className="flex justify-between mt-2 text-xs font-medium">
                      <span className="text-green-700 dark:text-green-300">{language === 'ar' ? `منخفض: ${competitionData.distribution.LOW}` : `Low: ${competitionData.distribution.LOW}`}</span>
                      <span className="text-yellow-700 dark:text-yellow-300">{language === 'ar' ? `متوسط: ${competitionData.distribution.MEDIUM}` : `Medium: ${competitionData.distribution.MEDIUM}`}</span>
                      <span className="text-red-700 dark:text-red-300">{language === 'ar' ? `عالي: ${competitionData.distribution.HIGH}` : `High: ${competitionData.distribution.HIGH}`}</span>
                    </div>
                  </div>
                  
                </div>
              </CardItem>
            )}
          </CardBody>
        </CardContainer>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between items-center max-w-xl mx-auto mt-8 px-4 sm:px-0">
          <GlowButton
            onClick={() => router.push('/campaign/location-targeting')}
            variant="green"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              {language === 'ar' ? 'الخطوة السابقة' : 'Previous Step'}
            </span>
          </GlowButton>
          
          <GlowButton
            onClick={async () => {
              // Show loading modal immediately
              setIsGeneratingContent(true);
              console.log('🚀 Starting content generation - showing loader...');
              
              // Track start time to ensure minimum 5 seconds display
              const startTime = Date.now();
              const MIN_LOADER_TIME = 5000; // 5 seconds minimum
              
              try {
                // Get real CPC from localStorage (calculated from real Google Ads data)
                const realCPC = localStorage.getItem('realCPC');
                const realCPCValue = realCPC ? parseFloat(realCPC) : null;
                
                const updatedData = {
                  ...campaignData,
                  dailyBudget: selectedBudget, // Display budget in selected currency
                  dailyBudgetUSD: selectedBudgetUSD, // Store budget in USD for calculations
                  currency: currency,
                  realCPC: realCPCValue, // Real CPC from Google Ads Historical Metrics
                  maxCpcBid: realCPCValue // Use real CPC as max bid for campaign creation
                };
                
                console.log('💰 Campaign Data with Real CPC:', {
                  dailyBudgetUSD: selectedBudgetUSD,
                  realCPC: realCPCValue,
                  maxCpcBid: realCPCValue
                });
                
                localStorage.setItem('campaignData', JSON.stringify(updatedData));
                
                // Get keywords from localStorage
                const generatedContentStr = localStorage.getItem('generatedContent') || '{}';
                const generatedContent = JSON.parse(generatedContentStr);
                const keywordsList = generatedContent.keywords || [];
                
                // Re-read campaignData from localStorage to get the latest detected language
                const latestCampaignDataStr = localStorage.getItem('campaignData') || '{}';
                const latestCampaignData = JSON.parse(latestCampaignDataStr);
                const targetLanguage = latestCampaignData.selectedLanguageCode || latestCampaignData.detectedLanguageCode || 'ar';
                
                console.log('🌍 Target language for ad generation:', targetLanguage);
                
                // Generate ad content (headlines and descriptions) for SEARCH campaigns
                const needsContentGeneration = campaignData?.campaignType === 'SEARCH' && 
                  (!generatedContent.headlines || generatedContent.headlines.length === 0 || 
                   !generatedContent.descriptions || generatedContent.descriptions.length === 0);
                
                if (needsContentGeneration) {
                  console.log('🎨 Generating ad content for SEARCH campaign...');
                  
                  const contentResponse = await fetch(getApiUrl('/api/ai-campaign/generate-campaign-content'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      website_url: latestCampaignData.websiteUrl || campaignData.websiteUrl,
                      campaign_type: 'SEARCH',
                      budget: selectedBudgetUSD,
                      keywords_list: keywordsList,
                      target_language: targetLanguage
                    })
                  });
                  
                  if (contentResponse.ok) {
                    const contentResult = await contentResponse.json();
                    console.log('✅ Ad content generated:', contentResult);
                    
                    if (contentResult.success && contentResult.content) {
                      const updatedGeneratedContent = {
                        ...generatedContent,
                        headlines: contentResult.content.headlines || [],
                        descriptions: contentResult.content.descriptions || [],
                        keywords: keywordsList.length > 0 ? keywordsList : (contentResult.content.keywords || [])
                      };
                      
                      localStorage.setItem('generatedContent', JSON.stringify(updatedGeneratedContent));
                      console.log('💾 Saved generated content');
                    }
                  }
                } else {
                  console.log('ℹ️ Content already exists, skipping generation');
                }
                
                // Ensure loader shows for at least 5 seconds
                const elapsedTime = Date.now() - startTime;
                if (elapsedTime < MIN_LOADER_TIME) {
                  const remainingTime = MIN_LOADER_TIME - elapsedTime;
                  console.log(`⏳ Waiting ${remainingTime}ms to complete 5 seconds...`);
                  await new Promise(resolve => setTimeout(resolve, remainingTime));
                }
                
                // Set flag and navigate
                localStorage.setItem('creatingCampaign', 'true');
                console.log('✅ Done! Navigating to preview...');
                router.push('/campaign/preview');
              } catch (error) {
                console.error('❌ Error:', error);
                localStorage.setItem('creatingCampaign', 'true');
                router.push('/campaign/preview');
              } finally {
                setIsGeneratingContent(false);
              }
            }}
            variant="purple"
            disabled={isGeneratingContent}
          >
            <span className="flex items-center gap-2">
              {language === 'ar' ? 'الخطوة التالية' : 'Next Step'}
              <ArrowRight className="w-5 h-5" />
            </span>
          </GlowButton>
        </div>

      </div>
      
      {/* Modern Loader Modal - Centered with sidebar offset */}
      {isGeneratingContent && (
        <div 
          className="fixed inset-0 z-[9999] backdrop-blur-xl flex items-center justify-center"
          style={{ 
            background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.1), rgba(0, 0, 0, 0.98))',
            paddingLeft: isDesktop ? (isRTL ? '0' : '280px') : '0',
            paddingRight: isDesktop ? (isRTL ? '280px' : '0') : '0'
          }}
        >
          <ModernLoader 
            words={language === 'ar' ? [
              'جاري التفكير...',
              'كتابة نص الإعلان...',
              'تحليل الموقع...',
              'إنشاء العناوين...',
              'تحسين الأوصاف...',
              'جلب الكلمات المفتاحية...',
              'تحضير الحملة...',
              'معالجة الذكاء الاصطناعي...',
              'تلميع المحتوى...',
              'جاري الانتهاء...'
            ] : [
              'Thinking…',
              'Writing ad copy…',
              'Analyzing website…',
              'Generating headlines…',
              'Optimizing descriptions…',
              'Fetching keywords…',
              'Preparing campaign…',
              'AI processing…',
              'Polishing content…',
              'Almost ready…'
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default BudgetSchedulingPage;