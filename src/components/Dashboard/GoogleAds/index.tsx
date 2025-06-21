'use client';
import AdAuctionInsights from '@/components/Dashboard/AdAuctionInsights';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import GoogleAdsKPI from "../GoogleAdsKPI";
import AudienceInsights from '@/components/Dashboard/AudienceInsights';
import GoogleAdsMapComponent from '@/components/Dashboard/GoogleAdsMapComponent';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  MousePointer, 
  DollarSign, 
  Users, 
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Search,
  Plus,
  MoreVertical,
  Play,
  Pause,
  Edit,
  Copy,
  Trash2,
  BarChart3,
  PieChart,
  Target,
  Globe,
  Smartphone,
  Monitor,
  AlertCircle,
  CheckCircle,
  Settings,
  Loader
} from 'lucide-react';

interface CampaignData {
  id: string;
  name: string;
  status: string | number;
  type?: string;
  budget?: number;
  budgetType?: string;
  spend?: number;
  impressions: number;
  clicks: number;
  ctr: number | string;
  avgCpc?: number;
  cpc?: string | number;
  cost: string | number;
  conversions?: number;
  conversionRate?: number;
  costPerConversion?: number;
  searchImpressionShare?: number;
  dates?: string[];
  platform?: string;
  currency?: string;
  dateRange?: string;
}

interface MetricCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  color: string;
}

interface ApiResponse {
  success: boolean;
  data?: any[];
  summary?: {
    totalCampaigns?: number;
    totalCost?: string | number;
    totalClicks?: number;
    totalImpressions?: number;
    avgCtr?: number | string;
    avgCpc?: number | string;
    dateRange?: string;
    currency?: string;
  };
  error?: string;
  message?: string;
}

interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
  direction: 'ltr' | 'rtl';
}

interface ExchangeRates {
  [key: string]: number;
}

const GoogleAdsDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Last 7 days');
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [metricCards, setMetricCards] = useState<MetricCard[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<boolean>(false);
  const [accountCurrency, setAccountCurrency] = useState<string>('EGP'); // Default to EGP as you mentioned account is in EGP
  const [showCurrencySelector, setShowCurrencySelector] = useState<boolean>(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('EGP'); // Default to EGP
  const [originalData, setOriginalData] = useState<{
    campaigns: CampaignData[],
    summary: {
      totalCost: number,
      totalClicks: number,
      totalImpressions: number,
      avgCtr: number,
      avgCpc: number
    }
  } | null>(null);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
  const [isLoadingRates, setIsLoadingRates] = useState<boolean>(true);
  const [ratesError, setRatesError] = useState<string | null>(null);
  const [lastRatesUpdate, setLastRatesUpdate] = useState<string>('');

  // Available currencies - All in English with fixed symbols
  const currencies: CurrencyOption[] = [
    { code: 'USD', name: 'US Dollar', symbol: 'USD', direction: 'ltr' },
    { code: 'EGP', name: 'Egyptian Pound', symbol: 'EGP', direction: 'ltr' },
    { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR', direction: 'ltr' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'AED', direction: 'ltr' },
    { code: 'TRY', name: 'Turkish Lira', symbol: 'TRY', direction: 'ltr' },
    { code: 'EUR', name: 'Euro', symbol: 'EUR', direction: 'ltr' },
    { code: 'GBP', name: 'British Pound', symbol: 'GBP', direction: 'ltr' },
    { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KWD', direction: 'ltr' },
    { code: 'QAR', name: 'Qatari Riyal', symbol: 'QAR', direction: 'ltr' },
    { code: 'BHD', name: 'Bahraini Dinar', symbol: 'BHD', direction: 'ltr' },
    { code: 'OMR', name: 'Omani Rial', symbol: 'OMR', direction: 'ltr' },
    { code: 'JOD', name: 'Jordanian Dinar', symbol: 'JOD', direction: 'ltr' },
    { code: 'LBP', name: 'Lebanese Pound', symbol: 'LBP', direction: 'ltr' },
    { code: 'IQD', name: 'Iraqi Dinar', symbol: 'IQD', direction: 'ltr' },
  ];

  // Fetch exchange rates from API
  const fetchExchangeRates = async () => {
    try {
      setIsLoadingRates(true);
      setRatesError(null);
      
      // Using ExchangeRate-API (free tier)
      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.rates) {
        setExchangeRates(data.rates);
        setLastRatesUpdate(new Date(data.time_last_update_utc).toLocaleString());
        console.log('✅ Exchange rates updated:', data.rates);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error("Error fetching exchange rates:", err);
      setRatesError(`Failed to fetch exchange rates: ${err.message}`);
      
      // Fallback to hardcoded rates if API fails
      setExchangeRates({
        USD: 1,
        EGP: 50.61, // Based on the Google search result
        EUR: 0.92,
        GBP: 0.78,
        SAR: 3.75,
        AED: 3.67,
        TRY: 32.5,
        KWD: 0.31,
        QAR: 3.64,
        BHD: 0.38,
        OMR: 0.39,
        JOD: 0.71,
        LBP: 15000,
        IQD: 1310
      });
      setLastRatesUpdate('Using fallback rates');
    } finally {
      setIsLoadingRates(false);
    }
  };

  // Function to convert amount between currencies using live exchange rates
  const convertCurrency = (amount: number | string, fromCurrency: string, toCurrency: string): number => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    // If currencies are the same, return the original amount
    if (fromCurrency === toCurrency) {
      return numericAmount;
    }
    
    // If we don't have exchange rates yet, return the original amount
    if (!exchangeRates || Object.keys(exchangeRates).length === 0) {
      return numericAmount;
    }
    
    // Get exchange rates
    const fromRate = exchangeRates[fromCurrency] || 1;
    const toRate = exchangeRates[toCurrency] || 1;
    
    // Convert to USD first (as base currency), then to target currency
    const amountInUSD = numericAmount / fromRate;
    return amountInUSD * toRate;
  };

  // Function to get currency symbol based on currency code
  const getCurrencySymbol = (currencyCode: string): string => {
    const currency = currencies.find(c => c.code === currencyCode);
    return currency ? currency.symbol : currencyCode;
  };

  // Function to get currency direction
  const getCurrencyDirection = (currencyCode: string): 'ltr' | 'rtl' => {
    const currency = currencies.find(c => c.code === currencyCode);
    return currency ? currency.direction : 'ltr';
  };

  // Function to format currency based on locale and currency code
  const formatCurrency = (amount: number | string, currencyCode: string): string => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    // Format number with thousands separators
    const formattedNumber = numericAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    
    // Add currency symbol in the appropriate position (always before for English display)
    const symbol = getCurrencySymbol(currencyCode);
    return `${symbol} ${formattedNumber}`;
  };

  // Function to get date range based on selected option
  const getDateRange = (option: string) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    switch (option) {
      case "Today":
        return { startDate: formatDate(today), endDate: formatDate(today) };
      case "Yesterday":
        return { startDate: formatDate(yesterday), endDate: formatDate(yesterday) };
      case "Last 7 days":
        const last7Days = new Date(today);
        last7Days.setDate(today.getDate() - 6);
        return { startDate: formatDate(last7Days), endDate: formatDate(today) };
      case "Last 14 days":
        const last14Days = new Date(today);
        last14Days.setDate(today.getDate() - 13);
        return { startDate: formatDate(last14Days), endDate: formatDate(today) };
      case "Last 30 days":
        const last30Days = new Date(today);
        last30Days.setDate(today.getDate() - 29);
        return { startDate: formatDate(last30Days), endDate: formatDate(today) };
      case "Last 90 days":
        const last90Days = new Date(today);
        last90Days.setDate(today.getDate() - 89);
        return { startDate: formatDate(last90Days), endDate: formatDate(today) };
      default:
        return { startDate: formatDate(today), endDate: formatDate(today) };
    }
  };

  // Calculate CTR from clicks and impressions
  const calculateCTR = (clicks: number, impressions: number): number => {
    if (impressions === 0) return 0;
    return (clicks / impressions) * 100;
  };

  // Safe JSON parsing function
  const safeJsonParse = (jsonString: any) => {
    try {
      if (typeof jsonString === 'string') {
        return JSON.parse(jsonString);
      }
      return jsonString;
    } catch (error) {
      console.error('JSON parsing error:', error);
      return null;
    }
  };

  // Fetch campaigns data from Google Ads API via Next.js API Route
  const fetchCampaignsData = async (timePeriod: string) => {
    try {
      setIsLoading(true);
      setApiError(null);
      setApiSuccess(false);
      
      const customerId = "3271710441"; // Customer ID (without dashes)
      const { startDate, endDate } = getDateRange(timePeriod);
      
      console.log('🚀 Calling Next.js API Route...');
      console.log('📅 Date range:', { startDate, endDate, customerId });
      
      // Call Next.js API Route instead of Supabase Edge Function
      const response = await fetch('/api/google-ads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          loginCustomerId: customerId,
          startDate: startDate,
          endDate: endDate,
          dataType: 'campaigns'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      // Safe JSON parsing
      const result = safeJsonParse(responseText);
      
      if (!result) {
        throw new Error('Invalid JSON response');
      }
      
      console.log('✅ API Response:', result);
      
      if (result && result.success) {
        // Process real Google Ads data
        let campaignsData: CampaignData[] = [];
        let summaryData = {
          totalCampaigns: 0,
          totalCost: 0,
          totalClicks: 0,
          totalImpressions: 0,
          avgCtr: 0,
          avgCpc: 0,
          dateRange: `${startDate} to ${endDate}`,
          currency: 'EGP' // Default to EGP as you mentioned account is in EGP
        };
        
        // Extract currency from data - IMPORTANT: Override API currency if it's wrong
        // Since you mentioned the account is in EGP but API shows USD
        let apiCurrency = 'EGP'; // Force EGP as the account currency
        
        setAccountCurrency(apiCurrency);
        
        // Check if we have data in the expected format
        if (result.data && Array.isArray(result.data) && result.data.length > 0) {
          campaignsData = result.data.map((item: any) => ({
            id: item.id || '',
            name: item.name || 'Unnamed Campaign',
            status: item.status || 'Unknown',
            type: item.type || 'Campaign',
            cost: item.cost || 0,
            clicks: item.clicks || 0,
            impressions: item.impressions || 0,
            ctr: item.ctr || calculateCTR(item.clicks || 0, item.impressions || 0),
            cpc: item.cpc || '0',
            dateRange: item.dateRange || '',
            dates: item.dates || [],
            platform: item.platform || 'google_ads',
            currency: apiCurrency // Force EGP as the currency
          }));
        }
        
        // Check if we have summary data
        if (result.summary) {
          summaryData = {
            totalCampaigns: result.summary.totalCampaigns || campaignsData.length,
            totalCost: parseFloat(String(result.summary.totalCost || 0)),
            totalClicks: result.summary.totalClicks || 0,
            totalImpressions: result.summary.totalImpressions || 0,
            avgCtr: parseFloat(String(result.summary.avgCtr || 0)),
            avgCpc: parseFloat(String(result.summary.avgCpc || 0)),
            dateRange: result.summary.dateRange || `${startDate} to ${endDate}`,
            currency: apiCurrency // Force EGP as the currency
          };
        } else {
          // Calculate summary from campaigns if no summary provided
          summaryData = {
            totalCampaigns: campaignsData.length,
            totalCost: campaignsData.reduce((sum, campaign) => sum + parseFloat(String(campaign.cost || 0)), 0),
            totalClicks: campaignsData.reduce((sum, campaign) => sum + (campaign.clicks || 0), 0),
            totalImpressions: campaignsData.reduce((sum, campaign) => sum + (campaign.impressions || 0), 0),
            avgCtr: 0,
            avgCpc: 0,
            dateRange: `${startDate} to ${endDate}`,
            currency: apiCurrency
          };
          
          // Calculate averages
          if (summaryData.totalImpressions > 0) {
            summaryData.avgCtr = (summaryData.totalClicks / summaryData.totalImpressions) * 100;
          }
          
          if (summaryData.totalClicks > 0) {
            summaryData.avgCpc = summaryData.totalCost / summaryData.totalClicks;
          }
        }
        
        // Store original data for currency conversion
        setOriginalData({
          campaigns: campaignsData,
          summary: {
            totalCost: summaryData.totalCost,
            totalClicks: summaryData.totalClicks,
            totalImpressions: summaryData.totalImpressions,
            avgCtr: summaryData.avgCtr || calculateCTR(summaryData.totalClicks, summaryData.totalImpressions),
            avgCpc: summaryData.avgCpc
          }
        });
        
        // Convert data to selected currency if different from account currency
        const convertedCampaigns = campaignsData.map(campaign => ({
          ...campaign,
          cost: selectedCurrency === apiCurrency ? campaign.cost : convertCurrency(campaign.cost, apiCurrency, selectedCurrency),
          cpc: campaign.cpc ? (selectedCurrency === apiCurrency ? campaign.cpc : convertCurrency(campaign.cpc, apiCurrency, selectedCurrency)) : undefined,
          avgCpc: campaign.avgCpc ? (selectedCurrency === apiCurrency ? campaign.avgCpc : convertCurrency(campaign.avgCpc, apiCurrency, selectedCurrency)) : undefined,
          currency: selectedCurrency
        }));
        
        const convertedSummary = {
          ...summaryData,
          totalCost: selectedCurrency === apiCurrency ? summaryData.totalCost : convertCurrency(summaryData.totalCost, apiCurrency, selectedCurrency),
          avgCpc: selectedCurrency === apiCurrency ? summaryData.avgCpc : convertCurrency(summaryData.avgCpc, apiCurrency, selectedCurrency),
          currency: selectedCurrency
        };
        
        setCampaigns(convertedCampaigns);
        setApiSuccess(true);
        
        // Calculate CTR for metrics card
        const calculatedCTR = summaryData.totalImpressions > 0 
          ? (summaryData.totalClicks / summaryData.totalImpressions) * 100 
          : 0;
        
        // Create metric cards from summary data
        const calculatedMetrics: MetricCard[] = [
          {
            title: 'Total Cost',
            value: formatCurrency(convertedSummary.totalCost, selectedCurrency),
            change: '+12.5%',
            trend: 'up',
            icon: <DollarSign className="w-6 h-6" />,
            color: 'bg-blue-500'
          },
          {
            title: 'Impressions',
            value: convertedSummary.totalImpressions.toLocaleString(),
            change: '+8.3%',
            trend: 'up',
            icon: <Eye className="w-6 h-6" />,
            color: 'bg-green-500'
          },
          {
            title: 'Clicks',
            value: convertedSummary.totalClicks.toLocaleString(),
            change: '+15.2%',
            trend: 'up',
            icon: <MousePointer className="w-6 h-6" />,
            color: 'bg-purple-500'
          },
          {
            title: 'CTR',
            value: `${calculatedCTR.toFixed(2)}%`,
            change: '+2.1%',
            trend: 'up',
            icon: <Target className="w-6 h-6" />,
            color: 'bg-orange-500'
          }
        ];
        
        setMetricCards(calculatedMetrics);
        
        // Show success message with currency info
        setApiSuccess(true);
        setApiError(null);
        
      } else {
        // Handle API error
        const errorMessage = result?.error || result?.message || 'Unknown error occurred';
        setApiError(`API Error: ${errorMessage}`);
        setApiSuccess(false);
        
        // Show demo data on error
        showDemoData();
      }
    } catch (error: any) {
      console.error('Error fetching campaigns:', error);
      setApiError(`Network Error: ${error.message}`);
      setApiSuccess(false);
      
      // Show demo data on error
      showDemoData();
    } finally {
      setIsLoading(false);
    }
  };

  // Show demo data when API fails
  const showDemoData = () => {
    const demoData: CampaignData[] = [
      {
        id: 'demo-1',
        name: 'Demo Campaign 1',
        status: 'ENABLED',
        cost: 1500,
        clicks: 120,
        impressions: 5000,
        ctr: calculateCTR(120, 5000),
        currency: selectedCurrency
      },
      {
        id: 'demo-2',
        name: 'Demo Campaign 2',
        status: 'PAUSED',
        cost: 800,
        clicks: 65,
        impressions: 3200,
        ctr: calculateCTR(65, 3200),
        currency: selectedCurrency
      }
    ];
    
    setCampaigns(demoData);
    
    const demoMetrics: MetricCard[] = [
      {
        title: 'Total Cost',
        value: formatCurrency(2300, selectedCurrency),
        change: '+12.5%',
        trend: 'up',
        icon: <DollarSign className="w-6 h-6" />,
        color: 'bg-blue-500'
      },
      {
        title: 'Impressions',
        value: '8,200',
        change: '+8.3%',
        trend: 'up',
        icon: <Eye className="w-6 h-6" />,
        color: 'bg-green-500'
      },
      {
        title: 'Clicks',
        value: '185',
        change: '+15.2%',
        trend: 'up',
        icon: <MousePointer className="w-6 h-6" />,
        color: 'bg-purple-500'
      },
      {
        title: 'CTR',
        value: '2.26%',
        change: '+2.1%',
        trend: 'up',
        icon: <Target className="w-6 h-6" />,
        color: 'bg-orange-500'
      }
    ];
    
    setMetricCards(demoMetrics);
  };

  // Handle currency change
  const handleCurrencyChange = (newCurrency: string) => {
    setSelectedCurrency(newCurrency);
    setShowCurrencySelector(false);
    
    // If we have original data, convert it to the new currency
    if (originalData) {
      const convertedCampaigns = originalData.campaigns.map(campaign => ({
        ...campaign,
        cost: convertCurrency(campaign.cost, accountCurrency, newCurrency),
        cpc: campaign.cpc ? convertCurrency(campaign.cpc, accountCurrency, newCurrency) : undefined,
        avgCpc: campaign.avgCpc ? convertCurrency(campaign.avgCpc, accountCurrency, newCurrency) : undefined,
        currency: newCurrency
      }));
      
      const convertedSummary = {
        ...originalData.summary,
        totalCost: convertCurrency(originalData.summary.totalCost, accountCurrency, newCurrency),
        avgCpc: convertCurrency(originalData.summary.avgCpc, accountCurrency, newCurrency),
        currency: newCurrency
      };
      
      setCampaigns(convertedCampaigns);
      
      // Update metric cards
      const updatedMetrics: MetricCard[] = [
        {
          title: 'Total Cost',
          value: formatCurrency(convertedSummary.totalCost, newCurrency),
          change: '+12.5%',
          trend: 'up',
          icon: <DollarSign className="w-6 h-6" />,
          color: 'bg-blue-500'
        },
        {
          title: 'Impressions',
          value: convertedSummary.totalImpressions.toLocaleString(),
          change: '+8.3%',
          trend: 'up',
          icon: <Eye className="w-6 h-6" />,
          color: 'bg-green-500'
        },
        {
          title: 'Clicks',
          value: convertedSummary.totalClicks.toLocaleString(),
          change: '+15.2%',
          trend: 'up',
          icon: <MousePointer className="w-6 h-6" />,
          color: 'bg-purple-500'
        },
        {
          title: 'CTR',
          value: `${convertedSummary.avgCtr.toFixed(2)}%`,
          change: '+2.1%',
          trend: 'up',
          icon: <Target className="w-6 h-6" />,
          color: 'bg-orange-500'
        }
      ];
      
      setMetricCards(updatedMetrics);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    fetchExchangeRates();
    fetchCampaignsData(selectedPeriod);
  }, []);

  // Refetch data when period changes
  useEffect(() => {
    if (!isLoadingRates) {
      fetchCampaignsData(selectedPeriod);
    }
  }, [selectedPeriod, isLoadingRates]);

  // Filter campaigns based on search and status
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || 
      (filterStatus === 'Active' && (campaign.status === 'ENABLED' || campaign.status === 2)) ||
      (filterStatus === 'Paused' && (campaign.status === 'PAUSED' || campaign.status === 3)) ||
      (filterStatus === 'Removed' && (campaign.status === 'REMOVED' || campaign.status === 5));
    
    return matchesSearch && matchesStatus;
  });

  // Get status display text and color
  const getStatusDisplay = (status: string | number) => {
    if (status === 'ENABLED' || status === 2) {
      return { text: 'Active', color: 'bg-green-100 text-green-800' };
    } else if (status === 'PAUSED' || status === 3) {
      return { text: 'Paused', color: 'bg-yellow-100 text-yellow-800' };
    } else if (status === 'REMOVED' || status === 5) {
      return { text: 'Removed', color: 'bg-red-100 text-red-800' };
    } else {
      return { text: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Google Ads Dashboard</h1>
          <p className="text-gray-600">Monitor and analyze your Google Ads performance</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Period Selector */}
          <div className="relative">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Today">Today</option>
              <option value="Yesterday">Yesterday</option>
              <option value="Last 7 days">Last 7 days</option>
              <option value="Last 14 days">Last 14 days</option>
              <option value="Last 30 days">Last 30 days</option>
              <option value="Last 90 days">Last 90 days</option>
            </select>
            <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Currency Selector */}
          <div className="relative">
            <button
              onClick={() => setShowCurrencySelector(!showCurrencySelector)}
              className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <DollarSign className="w-4 h-4" />
              {getCurrencySymbol(selectedCurrency)}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showCurrencySelector && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {currencies.map((currency) => (
                  <button
                    key={currency.code}
                    onClick={() => handleCurrencyChange(currency.code)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                      selectedCurrency === currency.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    <span>{currency.name}</span>
                    <span className="font-mono text-xs">{currency.symbol}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchCampaignsData(selectedPeriod)}
            disabled={isLoading}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* API Status Messages */}
      {apiSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-800 font-medium">
              Google Ads API Connected Successfully
            </span>
            <span className="text-green-600 ml-2">
              (Showing real data from your Google Ads account - {getCurrencySymbol(accountCurrency)} {accountCurrency})
            </span>
          </div>
          {lastRatesUpdate && (
            <p className="text-green-600 text-xs mt-1">
              Exchange rates last updated: {lastRatesUpdate}
            </p>
          )}
        </div>
      )}

      {apiError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800 font-medium">API Connection Error</span>
          </div>
          <p className="text-red-600 text-sm mt-1">{apiError}</p>
          <p className="text-red-600 text-xs mt-1">Showing demo data instead.</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading Google Ads data...</p>
          {isLoadingRates && (
            <p className="text-gray-500 text-sm mt-2">Fetching latest exchange rates...</p>
          )}
        </div>
      )}

      {/* Main Content */}
      {!isLoading && (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metricCards.map((card, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${card.color}`}>
                    <div className="text-white">
                      {card.icon}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  {card.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    card.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {card.change}
                  </span>
                  <span className="text-gray-500 text-sm ml-1">vs last period</span>
                </div>
              </div>
            ))}
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Campaigns</h2>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search campaigns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                  <option value="Removed">Removed</option>
                </select>
              </div>
            </div>

            {/* Campaigns Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clicks
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Impressions
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CTR
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCampaigns.map((campaign) => {
                    const statusDisplay = getStatusDisplay(campaign.status);
                    const ctrValue = typeof campaign.ctr === 'string' ? parseFloat(campaign.ctr) : campaign.ctr;
                    
                    return (
                      <tr key={campaign.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                          <div className="text-sm text-gray-500">{campaign.type || 'Campaign'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusDisplay.color}`}>
                            {statusDisplay.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatCurrency(campaign.cost, selectedCurrency)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {campaign.clicks.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {campaign.impressions.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {ctrValue.toFixed(2)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {filteredCampaigns.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No campaigns found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Insights Sections */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Ad Auction Insights */}
            <AdAuctionInsights selectedPeriod={selectedPeriod} />
            
            {/* Audience Insights */}
            <AudienceInsights selectedPeriod={selectedPeriod} />
          </div>

          {/* Geographic Performance Map */}
          <GoogleAdsMapComponent 
            selectedPeriod={selectedPeriod}
            currency={selectedCurrency}
          />
        </>
      )}
    </div>
  );
};

export default GoogleAdsDashboard;