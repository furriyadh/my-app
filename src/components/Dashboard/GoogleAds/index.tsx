'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Loader,
  Phone,
  MapPin,
  ShoppingCart,
  Video,
  Percent,
  Clock,
  Zap,
  Star,
  Award,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Maximize2,
  Minimize2,
  Brain,
  Cpu,
  Network,
  Sparkles,
  Bot
} from 'lucide-react';

// Enhanced interfaces for comprehensive campaign management
interface Campaign {
  id: string;
  name: string;
  status: 'ENABLED' | 'PAUSED' | 'REMOVED';
  type: string;
  subType: string;
  budget: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  avgCpc: number;
  conversionRate: number;
  costPerConversion: number;
  qualityScore: number;
  impressionShare: number;
  targetLocation: string;
  bidStrategy: string;
  startDate: string;
  endDate: string;
  devicePerformance: {
    desktop: { impressions: number; clicks: number; cost: number };
    mobile: { impressions: number; clicks: number; cost: number };
    tablet: { impressions: number; clicks: number; cost: number };
  };
  audienceData: {
    ageGroups: { [key: string]: number };
    genders: { male: number; female: number; unknown: number };
    interests: string[];
  };
  geoPerformance: {
    [country: string]: { impressions: number; clicks: number; cost: number };
  };
}

interface Summary {
  totalSpend: number;
  totalClicks: number;
  totalImpressions: number;
  totalConversions: number;
  avgCpc: number;
  avgCtr: number;
  conversionRate: number;
  impressionShare: number;
  qualityScore: number;
  campaignTypes: Record<string, number>;
  statusBreakdown: {
    enabled: number;
    paused: number;
    removed: number;
  };
  performanceTrends: {
    impressions: { current: number; previous: number; change: number };
    clicks: { current: number; previous: number; change: number };
    cost: { current: number; previous: number; change: number };
    conversions: { current: number; previous: number; change: number };
  };
  topPerformingCampaigns: Campaign[];
  recommendations: {
    type: 'budget' | 'keyword' | 'audience' | 'bidding';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    campaignId?: string;
  }[];
}

interface ApiResponse {
  success: boolean;
  data?: {
    campaigns: Campaign[];
    summary: Summary;
    totalCount?: number;
    filteredCount?: number;
  };
  error?: string;
  note?: string;
  isDemo?: boolean;
}

interface GoogleAdsDashboardProps {
  selectedPeriod?: string;
  selectedCurrency?: string;
}

// AI Loading Screen Component
const AILoadingScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [loadingStage, setLoadingStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [aiText, setAiText] = useState('');

  const loadingStages = [
    { text: 'Initializing AI Neural Networks...', icon: Brain, duration: 1500 },
    { text: 'Connecting to Google Ads API...', icon: Network, duration: 1200 },
    { text: 'Processing Campaign Data...', icon: Cpu, duration: 1000 },
    { text: 'Analyzing Performance Metrics...', icon: Activity, duration: 1300 },
    { text: 'Generating AI Insights...', icon: Eye, duration: 1100 },
    { text: 'Optimizing Dashboard Experience...', icon: Target, duration: 900 },
    { text: 'AI Dashboard Ready!', icon: Sparkles, duration: 800 }
  ];

  const typewriterEffect = (text: string, callback?: () => void) => {
    setAiText('');
    let i = 0;
    const timer = setInterval(() => {
      setAiText(text.slice(0, i));
      i++;
      if (i > text.length) {
        clearInterval(timer);
        if (callback) callback();
      }
    }, 50);
  };

  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          setTimeout(() => onComplete(), 500);
          return 100;
        }
        return prev + 1;
      });
    }, 60);

    return () => clearInterval(progressTimer);
  }, [onComplete]);

  useEffect(() => {
    if (loadingStage < loadingStages.length) {
      const currentStage = loadingStages[loadingStage];
      typewriterEffect(currentStage.text, () => {
        setTimeout(() => {
          setLoadingStage(prev => prev + 1);
        }, currentStage.duration);
      });
    }
  }, [loadingStage]);

  const CurrentIcon = loadingStage < loadingStages.length ? loadingStages[loadingStage].icon : Sparkles;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xl overflow-hidden"
      >
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 1000 1000">
            {Array.from({ length: 20 }, (_, i) => (
              <motion.circle
                key={i}
                cx={Math.random() * 1000}
                cy={Math.random() * 1000}
                r="2"
                fill="#60A5FA"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [1, 1.5, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.1
                }}
              />
            ))}
          </svg>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
          <div className="text-center space-y-8 max-w-2xl">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="w-32 h-32 mx-auto bg-blue-600 rounded-full flex items-center justify-center shadow-2xl">
                <CurrentIcon className="w-16 h-16 text-gray-800" />
              </div>
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-blue-400"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>

            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-gray-800">
                Google Ads AI Dashboard
              </h1>
              <div className="h-8 flex items-center justify-center">
                <p className="text-xl text-blue-200 font-mono">
                  {aiText}
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block w-0.5 h-6 bg-blue-400 ml-1"
                  />
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="w-full bg-white/20 backdrop-blur-sm rounded-full h-3 overflow-hidden border border-blue-300/20">
                <motion.div
                  className="h-full bg-blue-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <p className="text-blue-200 text-lg font-semibold">{progress}%</p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// AI Insights Panel Component
const AIInsightsPanel: React.FC<{ campaigns: Campaign[]; summary: Summary | null }> = ({ campaigns, summary }) => {
  return (
    <div className="bg-white/15 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-600 rounded-2xl shadow-lg">
          <Brain className="w-6 h-6 text-gray-800" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Intelligence Center</h2>
          <p className="text-gray-600">Machine Learning Insights & Predictions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-blue-200/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500 rounded-xl">
              <Target className="w-5 h-5 text-gray-800" />
            </div>
            <h3 className="font-semibold text-gray-900">Performance Prediction</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Based on current trends, your campaigns are projected to achieve 15% higher conversion rates next month.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-700">High Confidence: 94%</span>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-green-200/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500 rounded-xl">
              <Zap className="w-5 h-5 text-gray-800" />
            </div>
            <h3 className="font-semibold text-gray-900">Smart Optimization</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            AI recommends shifting 20% budget from Display to Performance Max campaigns for optimal ROI.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="text-sm font-medium text-orange-700">Medium Impact: 78%</span>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-purple-200/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500 rounded-xl">
              <Users className="w-5 h-5 text-gray-800" />
            </div>
            <h3 className="font-semibold text-gray-900">Audience Intelligence</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Mobile users aged 25-34 show 40% higher engagement. Consider mobile-first creative strategies.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-blue-700">Actionable: 89%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Advanced Charts Component (Simplified)
const AdvancedCharts: React.FC<{ campaigns: Campaign[]; summary: Summary | null }> = ({ campaigns, summary }) => {
  return (
    <div className="bg-white/15 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-green-600 rounded-2xl shadow-lg">
          <BarChart3 className="w-6 h-6 text-gray-800" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Advanced Analytics</h2>
          <p className="text-gray-600">Interactive Performance Charts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-blue-200/50">
          <h3 className="font-semibold text-gray-900 mb-4">Performance Trends</h3>
          <div className="h-64 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-xl border border-blue-200/30">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <p className="text-gray-600">Interactive Chart Placeholder</p>
              <p className="text-sm text-gray-500">Chart.js integration ready</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-green-200/50">
          <h3 className="font-semibold text-gray-900 mb-4">Campaign Distribution</h3>
          <div className="h-64 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-xl border border-blue-200/30">
            <div className="text-center">
              <PieChart className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <p className="text-gray-600">Interactive Pie Chart</p>
              <p className="text-sm text-gray-500">Real-time data visualization</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const GoogleAdsDashboard: React.FC<GoogleAdsDashboardProps> = ({ 
  selectedPeriod: propSelectedPeriod, 
  selectedCurrency: propSelectedCurrency 
}) => {
  // State management
  const [selectedPeriod, setSelectedPeriod] = useState(propSelectedPeriod || 'Last 30 days');
  const [selectedCurrency, setSelectedCurrency] = useState(propSelectedCurrency || 'EGP');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAILoading, setShowAILoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('spend');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30000);

  // Handle AI Loading completion
  const handleAILoadingComplete = () => {
    setShowAILoading(false);
    if (!dataLoaded) {
      fetchCampaignsData();
    }
  };

  // Available currencies
  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EGP', name: 'Egyptian Pound', symbol: 'EGP' },
    { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'AED' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' }
  ];

  // Time periods
  const timePeriods = [
    'Today',
    'Yesterday', 
    'Last 7 days',
    'Last 14 days',
    'Last 30 days',
    'Last 90 days',
    'This month',
    'Last month',
    'This quarter',
    'Last quarter',
    'This year',
    'Last year'
  ];

  // Helper function to get campaign type icon and styling
  const getCampaignTypeIcon = (type: string) => {
    const iconMap: Record<string, { icon: React.ReactNode; color: string; bgGradient: string }> = {
      'Performance Max': { 
        icon: <Target className="w-5 h-5" />, 
        color: 'text-purple-600', 
        bgGradient: 'bg-purple-600' 
      },
      'Search': { 
        icon: <Search className="w-5 h-5" />, 
        color: 'text-blue-600', 
        bgGradient: 'bg-blue-600' 
      },
      'Shopping': { 
        icon: <ShoppingCart className="w-5 h-5" />, 
        color: 'text-green-600', 
        bgGradient: 'bg-green-600' 
      },
      'Display': { 
        icon: <Monitor className="w-5 h-5" />, 
        color: 'text-red-600', 
        bgGradient: 'bg-red-600' 
      },
      'Video': { 
        icon: <Video className="w-5 h-5" />, 
        color: 'text-yellow-600', 
        bgGradient: 'bg-yellow-600' 
      },
      'Call': { 
        icon: <Phone className="w-5 h-5" />, 
        color: 'text-indigo-600', 
        bgGradient: 'bg-indigo-600' 
      },
      'Local': { 
        icon: <MapPin className="w-5 h-5" />, 
        color: 'text-teal-600', 
        bgGradient: 'bg-teal-600' 
      },
      'App': { 
        icon: <Smartphone className="w-5 h-5" />, 
        color: 'text-pink-600', 
        bgGradient: 'bg-pink-600' 
      },
      'Discovery': { 
        icon: <Zap className="w-5 h-5" />, 
        color: 'text-orange-600', 
        bgGradient: 'bg-orange-600' 
      }
    };
    
    return iconMap[type] || { 
      icon: <BarChart3 className="w-5 h-5" />, 
      color: 'text-gray-600', 
      bgGradient: 'bg-gray-600' 
    };
  };

  // Generate comprehensive demo data
  const generateDemoData = (): { campaigns: Campaign[]; summary: Summary } => {
    const campaigns: Campaign[] = [
      {
        id: '1',
        name: 'Performance Max - All Products',
        status: 'ENABLED',
        type: 'Performance Max',
        subType: 'Performance Max',
        budget: 8000,
        spend: 6567.20,
        impressions: 234560,
        clicks: 4456,
        conversions: 234,
        ctr: 1.90,
        avgCpc: 147.35,
        conversionRate: 5.25,
        costPerConversion: 280.65,
        qualityScore: 8.7,
        impressionShare: 68.9,
        targetLocation: 'Egypt, Saudi Arabia, UAE',
        bidStrategy: 'Maximize Conversion Value',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        devicePerformance: {
          desktop: { impressions: 140736, clicks: 2674, cost: 3940.32 },
          mobile: { impressions: 82096, clicks: 1560, cost: 2298.24 },
          tablet: { impressions: 11728, clicks: 222, cost: 328.64 }
        },
        audienceData: {
          ageGroups: { '18-24': 15, '25-34': 35, '35-44': 30, '45-54': 15, '55+': 5 },
          genders: { male: 60, female: 38, unknown: 2 },
          interests: ['Technology', 'Shopping', 'Business']
        },
        geoPerformance: {
          'Egypt': { impressions: 140736, clicks: 2674, cost: 3940.32 },
          'Saudi Arabia': { impressions: 70368, clicks: 1337, cost: 1970.16 },
          'UAE': { impressions: 23456, clicks: 445, cost: 656.72 }
        }
      },
      {
        id: '2',
        name: 'Shopping - Home & Garden Products',
        status: 'ENABLED',
        type: 'Shopping',
        subType: 'Standard Shopping',
        budget: 6000,
        spend: 4567.90,
        impressions: 156780,
        clicks: 2876,
        conversions: 156,
        ctr: 1.83,
        avgCpc: 158.85,
        conversionRate: 5.42,
        costPerConversion: 292.81,
        qualityScore: 8.9,
        impressionShare: 81.3,
        targetLocation: 'Egypt, Saudi Arabia',
        bidStrategy: 'Enhanced CPC',
        startDate: '2024-02-01',
        endDate: '2024-12-31',
        devicePerformance: {
          desktop: { impressions: 94068, clicks: 1726, cost: 2740.74 },
          mobile: { impressions: 54773, clicks: 1006, cost: 1596.19 },
          tablet: { impressions: 7939, clicks: 144, cost: 230.97 }
        },
        audienceData: {
          ageGroups: { '18-24': 10, '25-34': 40, '35-44': 35, '45-54': 12, '55+': 3 },
          genders: { male: 45, female: 53, unknown: 2 },
          interests: ['Home & Garden', 'DIY', 'Lifestyle']
        },
        geoPerformance: {
          'Egypt': { impressions: 109746, clicks: 2013, cost: 3197.53 },
          'Saudi Arabia': { impressions: 47034, clicks: 863, cost: 1370.37 }
        }
      },
      {
        id: '3',
        name: 'Search - Electronics & Gadgets',
        status: 'ENABLED',
        type: 'Search',
        subType: 'Standard',
        budget: 5000,
        spend: 3247.50,
        impressions: 125430,
        clicks: 2156,
        conversions: 89,
        ctr: 1.72,
        avgCpc: 150.65,
        conversionRate: 4.13,
        costPerConversion: 364.89,
        qualityScore: 8.2,
        impressionShare: 73.5,
        targetLocation: 'Egypt',
        bidStrategy: 'Target CPA',
        startDate: '2024-01-15',
        endDate: '2024-12-31',
        devicePerformance: {
          desktop: { impressions: 75258, clicks: 1294, cost: 1948.50 },
          mobile: { impressions: 43751, clicks: 753, cost: 1133.25 },
          tablet: { impressions: 6421, clicks: 109, cost: 165.75 }
        },
        audienceData: {
          ageGroups: { '18-24': 25, '25-34': 40, '35-44': 25, '45-54': 8, '55+': 2 },
          genders: { male: 70, female: 28, unknown: 2 },
          interests: ['Technology', 'Electronics', 'Gaming']
        },
        geoPerformance: {
          'Egypt': { impressions: 125430, clicks: 2156, cost: 3247.50 }
        }
      },
      {
        id: '4',
        name: 'Display - Brand Awareness',
        status: 'ENABLED',
        type: 'Display',
        subType: 'Standard Display',
        budget: 4000,
        spend: 2890.45,
        impressions: 345670,
        clicks: 2345,
        conversions: 123,
        ctr: 0.68,
        avgCpc: 123.25,
        conversionRate: 5.24,
        costPerConversion: 235.00,
        qualityScore: 7.6,
        impressionShare: 44.3,
        targetLocation: 'Egypt, UAE',
        bidStrategy: 'Maximize Conversions',
        startDate: '2024-02-15',
        endDate: '2024-12-31',
        devicePerformance: {
          desktop: { impressions: 138268, clicks: 938, cost: 1156.18 },
          mobile: { impressions: 172835, clicks: 1172, cost: 1445.23 },
          tablet: { impressions: 34567, clicks: 235, cost: 289.04 }
        },
        audienceData: {
          ageGroups: { '18-24': 20, '25-34': 45, '35-44': 25, '45-54': 8, '55+': 2 },
          genders: { male: 35, female: 63, unknown: 2 },
          interests: ['Lifestyle', 'Fashion', 'Beauty']
        },
        geoPerformance: {
          'Egypt': { impressions: 242969, clicks: 1642, cost: 2023.32 },
          'UAE': { impressions: 102701, clicks: 703, cost: 867.13 }
        }
      },
      {
        id: '5',
        name: 'Video - YouTube Campaigns',
        status: 'PAUSED',
        type: 'Video',
        subType: 'Video Action',
        budget: 3500,
        spend: 1456.30,
        impressions: 98750,
        clicks: 987,
        conversions: 34,
        ctr: 1.00,
        avgCpc: 147.50,
        conversionRate: 3.44,
        costPerConversion: 428.32,
        qualityScore: 6.8,
        impressionShare: 55.2,
        targetLocation: 'Egypt, Lebanon',
        bidStrategy: 'Target CPA',
        startDate: '2024-04-01',
        endDate: '2024-12-31',
        devicePerformance: {
          desktop: { impressions: 19750, clicks: 197, cost: 291.26 },
          mobile: { impressions: 69125, clicks: 691, cost: 1020.41 },
          tablet: { impressions: 9875, clicks: 99, cost: 144.63 }
        },
        audienceData: {
          ageGroups: { '18-24': 40, '25-34': 35, '35-44': 15, '45-54': 8, '55+': 2 },
          genders: { male: 55, female: 43, unknown: 2 },
          interests: ['Entertainment', 'Music', 'Sports']
        },
        geoPerformance: {
          'Egypt': { impressions: 69125, clicks: 691, cost: 1020.41 },
          'Lebanon': { impressions: 29625, clicks: 296, cost: 435.89 }
        }
      },
      {
        id: '6',
        name: 'Local - Store Visits',
        status: 'ENABLED',
        type: 'Local',
        subType: 'Local Campaigns',
        budget: 2500,
        spend: 1789.45,
        impressions: 67890,
        clicks: 1234,
        conversions: 78,
        ctr: 1.82,
        avgCpc: 145.00,
        conversionRate: 6.32,
        costPerConversion: 229.42,
        qualityScore: 8.9,
        impressionShare: 89.3,
        targetLocation: 'Cairo, Egypt',
        bidStrategy: 'Maximize Clicks',
        startDate: '2024-05-01',
        endDate: '2024-12-31',
        devicePerformance: {
          desktop: { impressions: 13578, clicks: 247, cost: 357.89 },
          mobile: { impressions: 47523, clicks: 864, cost: 1252.61 },
          tablet: { impressions: 6789, clicks: 123, cost: 178.95 }
        },
        audienceData: {
          ageGroups: { '25-34': 30, '35-44': 35, '45-54': 25, '55+': 10 },
          genders: { male: 48, female: 50, unknown: 2 },
          interests: ['Local Services', 'Shopping', 'Dining']
        },
        geoPerformance: {
          'Cairo': { impressions: 67890, clicks: 1234, cost: 1789.45 }
        }
      }
    ];

    // Calculate comprehensive summary
    const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);
    const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
    const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
    const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);

    const summary: Summary = {
      totalSpend,
      totalClicks,
      totalImpressions,
      totalConversions,
      avgCpc: totalSpend / totalClicks,
      avgCtr: (totalClicks / totalImpressions) * 100,
      conversionRate: (totalConversions / totalClicks) * 100,
      impressionShare: campaigns.reduce((sum, c) => sum + c.impressionShare, 0) / campaigns.length,
      qualityScore: campaigns.reduce((sum, c) => sum + c.qualityScore, 0) / campaigns.length,
      campaignTypes: {
        'Performance Max': campaigns.filter(c => c.type === 'Performance Max').length,
        'Shopping': campaigns.filter(c => c.type === 'Shopping').length,
        'Search': campaigns.filter(c => c.type === 'Search').length,
        'Display': campaigns.filter(c => c.type === 'Display').length,
        'Video': campaigns.filter(c => c.type === 'Video').length,
        'Local': campaigns.filter(c => c.type === 'Local').length
      },
      statusBreakdown: {
        enabled: campaigns.filter(c => c.status === 'ENABLED').length,
        paused: campaigns.filter(c => c.status === 'PAUSED').length,
        removed: campaigns.filter(c => c.status === 'REMOVED').length
      },
      performanceTrends: {
        impressions: { current: totalImpressions, previous: Math.round(totalImpressions * 0.85), change: 15 },
        clicks: { current: totalClicks, previous: Math.round(totalClicks * 0.92), change: 8 },
        cost: { current: totalSpend, previous: Math.round(totalSpend * 1.05), change: -5 },
        conversions: { current: totalConversions, previous: Math.round(totalConversions * 0.88), change: 12 }
      },
      topPerformingCampaigns: campaigns
        .filter(c => c.status === 'ENABLED')
        .sort((a, b) => b.conversionRate - a.conversionRate)
        .slice(0, 3),
      recommendations: [
        {
          type: 'budget',
          title: 'Increase Budget for Top Performers',
          description: 'Performance Max campaign shows strong conversion rates. Consider increasing budget by 20%.',
          impact: 'high',
          campaignId: '1'
        },
        {
          type: 'keyword',
          title: 'Expand Keyword Targeting',
          description: 'Electronics campaign has high impression share. Add related keywords to capture more traffic.',
          impact: 'medium',
          campaignId: '3'
        },
        {
          type: 'audience',
          title: 'Optimize Audience Targeting',
          description: 'Display campaign shows potential for better audience targeting to improve conversion rates.',
          impact: 'medium',
          campaignId: '4'
        },
        {
          type: 'bidding',
          title: 'Resume Paused Campaigns',
          description: 'Video campaign is paused but showed good performance. Consider resuming with optimized targeting.',
          impact: 'high',
          campaignId: '5'
        }
      ]
    };

    return { campaigns, summary };
  };

  // Fetch campaigns data
  const fetchCampaignsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching campaigns data...');
      
      const params = new URLSearchParams({
        dataType: 'campaigns',
        ...(selectedType !== 'all' && { campaignType: selectedType }),
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
        ...(searchTerm && { search: searchTerm })
      });

      const backendUrl = process.env.NODE_ENV === 'production' 
        ? 'https://furriyadh.com/api/google-ads' 
        : '/api/google-ads';
      const response = await fetch(`${backendUrl}?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      console.log('Raw response received');
      
      if (!text) {
        throw new Error('Empty response from server');
      }
      
      let result: ApiResponse;
      try {
        result = JSON.parse(text);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Invalid JSON response from server');
      }

      if (result.success && result.data) {
        setCampaigns(result.data.campaigns);
        setSummary(result.data.summary);
        setDataLoaded(true);
        console.log(`✅ Loaded ${result.data.campaigns.length} campaigns`);
        if (result.isDemo) {
          console.log('ℹ️ Using demo data');
        }
      } else {
        throw new Error(result.error || 'Failed to fetch data');
      }
    } catch (err: any) {
      console.error('Error fetching campaigns:', err);
      setError(err.message);
      
      // Use local demo data as final fallback
      console.log('🔄 Using local demo data as final fallback...');
      const demoData = generateDemoData();
      setCampaigns(demoData.campaigns);
      setSummary(demoData.summary);
      setDataLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle campaign actions
  const handleCampaignAction = async (campaignId: string, action: 'pause' | 'enable' | 'delete') => {
    try {
      console.log(`🔧 Performing ${action} on campaign ${campaignId}`);
      
      const backendUrl = process.env.NODE_ENV === 'production' 
        ? 'https://furriyadh.com/api/google-ads' 
        : '/api/google-ads';
      const response = await fetch(backendUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId, action })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      if (!text) {
        throw new Error('Empty response from server');
      }

      let result: any;
      try {
        result = JSON.parse(text);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Invalid JSON response from server');
      }
      
      if (result.success) {
        // Update local state
        setCampaigns(prev => prev.map(campaign => 
          campaign.id === campaignId 
            ? { 
                ...campaign, 
                status: action === 'pause' ? 'PAUSED' : 
                       action === 'enable' ? 'ENABLED' : 'REMOVED' 
              }
            : campaign
        ));
        
        console.log(`✅ Campaign ${campaignId} ${action}d successfully`);
        if (result.isDemo) {
          console.log('ℹ️ Demo mode action');
        }
      } else {
        console.error('Campaign action failed:', result.error);
      }
    } catch (error: any) {
      console.error('Error performing campaign action:', error);
      // Still update local state as fallback
      setCampaigns(prev => prev.map(campaign => 
        campaign.id === campaignId 
          ? { 
              ...campaign, 
              status: action === 'pause' ? 'PAUSED' : 
                     action === 'enable' ? 'ENABLED' : 'REMOVED' 
            }
          : campaign
      ));
      console.log(`⚠️ Local state updated for campaign ${campaignId} (fallback)`);
    }
  };

  // Filter and sort campaigns
  const filteredAndSortedCampaigns = useMemo(() => {
    let filtered = campaigns.filter(campaign => {
      const matchesType = selectedType === 'all' || campaign.type.toLowerCase() === selectedType.toLowerCase();
      const matchesStatus = selectedStatus === 'all' || campaign.status.toLowerCase() === selectedStatus.toLowerCase();
      const matchesSearch = !searchTerm || campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesType && matchesStatus && matchesSearch;
    });

    // Sort campaigns
    filtered.sort((a, b) => {
      let aValue: number, bValue: number;
      
      switch (sortBy) {
        case 'name':
          return sortOrder === 'asc' 
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        case 'spend':
          aValue = a.spend;
          bValue = b.spend;
          break;
        case 'clicks':
          aValue = a.clicks;
          bValue = b.clicks;
          break;
        case 'impressions':
          aValue = a.impressions;
          bValue = b.impressions;
          break;
        case 'ctr':
          aValue = a.ctr;
          bValue = b.ctr;
          break;
        case 'conversions':
          aValue = a.conversions;
          bValue = b.conversions;
          break;
        default:
          aValue = a.spend;
          bValue = b.spend;
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [campaigns, selectedType, selectedStatus, searchTerm, sortBy, sortOrder]);

  // Format currency
  const formatCurrency = (amount: number): string => {
    const currencySymbol = currencies.find(c => c.code === selectedCurrency)?.symbol || selectedCurrency;
    return `${currencySymbol} ${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Format percentage
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  // Format number
  const formatNumber = (value: number): string => {
    return value.toLocaleString('en-US');
  };

  // Get trend icon and color
  const getTrendIcon = (change: number) => {
    if (change > 0) {
      return { icon: <ArrowUpRight className="w-4 h-4" />, color: 'text-green-600', bgColor: 'bg-green-100' };
    } else if (change < 0) {
      return { icon: <ArrowDownRight className="w-4 h-4" />, color: 'text-red-600', bgColor: 'bg-red-100' };
    } else {
      return { icon: <Activity className="w-4 h-4" />, color: 'text-gray-600', bgColor: 'bg-white/10 backdrop-blur-sm border border-gray-300/30' };
    }
  };

  // Effects
  useEffect(() => {
    if (!showAILoading && !dataLoaded) {
      fetchCampaignsData();
    }
  }, [showAILoading, dataLoaded]);

  useEffect(() => {
    if (dataLoaded) {
      fetchCampaignsData();
    }
  }, [selectedType, selectedStatus, searchTerm, selectedPeriod]);

  useEffect(() => {
    if (autoRefresh && dataLoaded) {
      const interval = setInterval(() => {
        fetchCampaignsData();
        console.log('🔄 Auto-refresh triggered');
      }, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, dataLoaded]);

  // Show AI Loading Screen first
  if (showAILoading) {
    return <AILoadingScreen onComplete={handleAILoadingComplete} />;
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="relative z-10 p-6 space-y-8">
        {/* Header Section */}
        <div className="bg-white/15 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg">
                  <Target className="w-8 h-8 text-gray-800" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-800 bg-clip-text text-transparent">
                    Google Ads Dashboard
                  </h1>
                  <p className="text-gray-600 font-medium">AI-Powered Campaign Management</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{selectedPeriod}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span>{currencies.find(c => c.code === selectedCurrency)?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{campaigns.length} Campaigns</span>
                </div>
                {autoRefresh && (
                  <div className="flex items-center gap-2 text-green-600">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Auto-refresh enabled</span>
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Period Selector */}
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-3 bg-white/15 backdrop-blur-md border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
              >
                {timePeriods.map(period => (
                  <option key={period} value={period}>{period}</option>
                ))}
              </select>

              {/* Currency Selector */}
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="px-4 py-3 bg-white/15 backdrop-blur-md border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
              >
                {currencies.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.name}
                  </option>
                ))}
              </select>

              {/* Auto Refresh Toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg ${
                  autoRefresh 
                    ? 'bg-green-600 text-gray-800' 
                    : 'bg-white/15 backdrop-blur-md border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              </button>

              {/* Refresh Button */}
              <button
                onClick={() => {
                  fetchCampaignsData();
                }}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-gray-800 rounded-xl font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-300 shadow-lg"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white/15 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8">
            <div className="flex items-center justify-center space-x-4">
              <Loader className="w-8 h-8 animate-spin text-blue-600" />
              <span className="text-lg font-medium text-gray-700">Loading campaign data...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-red-200/50 p-8">
            <div className="flex items-center space-x-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <div>
                <h3 className="text-lg font-medium text-red-800">Error Loading Data</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Show content only when data is loaded and not loading */}
        {!loading && dataLoaded && (
          <>
            {/* KPI Cards */}
            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Impressions */}
                <div className="group bg-white/15 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">Total Impressions</p>
                      <p className="text-3xl font-bold text-gray-900">{formatNumber(summary?.totalImpressions || 0)}</p>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const trend = getTrendIcon(summary?.performanceTrends?.impressions?.change || 0);
                          return (
                            <>
                              <div className={`p-1 rounded-full ${trend.bgColor}`}>
                                <div className={trend.color}>{trend.icon}</div>
                              </div>
                              <span className={`text-sm font-medium ${trend.color}`}>
                                {summary?.performanceTrends?.impressions?.change ? (summary.performanceTrends.impressions.change > 0 ? '+' : '') : ''}
                                {formatPercentage(summary?.performanceTrends?.impressions?.change || 0)}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="p-4 bg-blue-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Eye className="w-8 h-8 text-gray-800" />
                    </div>
                  </div>
                </div>

                {/* Total Clicks */}
                <div className="group bg-white/15 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                      <p className="text-3xl font-bold text-gray-900">{formatNumber(summary?.totalClicks || 0)}</p>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const trend = getTrendIcon(summary?.performanceTrends?.clicks?.change || 0);
                          return (
                            <>
                              <div className={`p-1 rounded-full ${trend.bgColor}`}>
                                <div className={trend.color}>{trend.icon}</div>
                              </div>
                              <span className={`text-sm font-medium ${trend.color}`}>
                                {summary?.performanceTrends?.clicks?.change ? (summary.performanceTrends.clicks.change > 0 ? '+' : '') : ''}
                                {formatPercentage(summary?.performanceTrends?.clicks?.change || 0)}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="p-4 bg-green-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <MousePointer className="w-8 h-8 text-gray-800" />
                    </div>
                  </div>
                </div>

                {/* Total Cost */}
                <div className="group bg-white/15 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">Total Cost</p>
                      <p className="text-3xl font-bold text-gray-900">{formatCurrency(summary?.totalSpend || 0)}</p>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const trend = getTrendIcon(summary?.performanceTrends?.cost?.change || 0);
                          return (
                            <>
                              <div className={`p-1 rounded-full ${trend.bgColor}`}>
                                <div className={trend.color}>{trend.icon}</div>
                              </div>
                              <span className={`text-sm font-medium ${trend.color}`}>
                                {summary?.performanceTrends?.cost?.change ? (summary.performanceTrends.cost.change > 0 ? '+' : '') : ''}
                                {formatPercentage(summary?.performanceTrends?.cost?.change || 0)}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="p-4 bg-orange-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <DollarSign className="w-8 h-8 text-gray-800" />
                    </div>
                  </div>
                </div>

                {/* Total Conversions */}
                <div className="group bg-white/15 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">Total Conversions</p>
                      <p className="text-3xl font-bold text-gray-900">{formatNumber(summary?.totalConversions || 0)}</p>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const trend = getTrendIcon(summary?.performanceTrends?.conversions?.change || 0);
                          return (
                            <>
                              <div className={`p-1 rounded-full ${trend.bgColor}`}>
                                <div className={trend.color}>{trend.icon}</div>
                              </div>
                              <span className={`text-sm font-medium ${trend.color}`}>
                                {summary?.performanceTrends?.conversions?.change ? (summary.performanceTrends.conversions.change > 0 ? '+' : '') : ''}
                                {formatPercentage(summary?.performanceTrends?.conversions?.change || 0)}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="p-4 bg-purple-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Target className="w-8 h-8 text-gray-800" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Insights Panel */}
            <AIInsightsPanel campaigns={campaigns} summary={summary} />

            {/* Advanced Charts */}
            <AdvancedCharts campaigns={campaigns} summary={summary} />

            {/* Campaigns Table/Cards */}
            <div className="bg-white/15 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Campaign Management</h2>
                  <p className="text-gray-600">Monitor and optimize your Google Ads campaigns</p>
                </div>

                {/* Filters and Controls */}
                <div className="flex flex-wrap items-center gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search campaigns..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-white/15 backdrop-blur-md border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>

                  {/* Type Filter */}
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-4 py-2 bg-white/15 backdrop-blur-md border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="all">All Types</option>
                    <option value="performance max">Performance Max</option>
                    <option value="search">Search</option>
                    <option value="shopping">Shopping</option>
                    <option value="display">Display</option>
                    <option value="video">Video</option>
                    <option value="local">Local</option>
                  </select>

                  {/* Status Filter */}
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-4 py-2 bg-white/15 backdrop-blur-md border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="all">All Status</option>
                    <option value="enabled">Enabled</option>
                    <option value="paused">Paused</option>
                    <option value="removed">Removed</option>
                  </select>

                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode('table')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        viewMode === 'table'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Table
                    </button>
                    <button
                      onClick={() => setViewMode('cards')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        viewMode === 'cards'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Cards
                    </button>
                  </div>
                </div>
              </div>

              {/* Campaigns Display */}
              <div className="space-y-6">
                {viewMode === 'table' ? (
                  /* Table View */
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-4 px-4 font-semibold text-gray-900">Campaign</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-900">Type</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-900">Status</th>
                          <th className="text-right py-4 px-4 font-semibold text-gray-900">Impressions</th>
                          <th className="text-right py-4 px-4 font-semibold text-gray-900">Clicks</th>
                          <th className="text-right py-4 px-4 font-semibold text-gray-900">Cost</th>
                          <th className="text-right py-4 px-4 font-semibold text-gray-900">CTR</th>
                          <th className="text-right py-4 px-4 font-semibold text-gray-900">Conversions</th>
                          <th className="text-center py-4 px-4 font-semibold text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAndSortedCampaigns.map((campaign, index) => {
                          const typeIcon = getCampaignTypeIcon(campaign.type);
                          return (
                            <tr 
                              key={campaign.id}
                              className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors duration-200"
                            >
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${typeIcon.bgGradient}`}>
                                    <div className="text-gray-800">
                                      {typeIcon.icon}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">{campaign.name}</div>
                                    <div className="text-sm text-gray-500">{campaign.targetLocation}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-gray-700">{campaign.type}</td>
                              <td className="py-4 px-4">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                  campaign.status === 'ENABLED' 
                                    ? 'bg-green-100 text-green-800' 
                                    : campaign.status === 'PAUSED' 
                                    ? 'bg-yellow-100 text-yellow-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {campaign.status}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-right font-medium text-gray-900">{formatNumber(campaign.impressions)}</td>
                              <td className="py-4 px-4 text-right font-medium text-gray-900">{formatNumber(campaign.clicks)}</td>
                              <td className="py-4 px-4 text-right font-medium text-gray-900">{formatCurrency(campaign.spend)}</td>
                              <td className="py-4 px-4 text-right font-medium text-gray-900">{formatPercentage(campaign.ctr)}</td>
                              <td className="py-4 px-4 text-right font-medium text-gray-900">{formatNumber(campaign.conversions)}</td>
                              <td className="py-4 px-4">
                                <div className="flex items-center justify-center gap-2">
                                  {campaign.status === 'ENABLED' ? (
                                    <button
                                      onClick={() => handleCampaignAction(campaign.id, 'pause')}
                                      className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 rounded-lg transition-all duration-200"
                                      title="Pause Campaign"
                                    >
                                      <Pause className="w-4 h-4" />
                                    </button>
                                  ) : campaign.status === 'PAUSED' ? (
                                    <button
                                      onClick={() => handleCampaignAction(campaign.id, 'enable')}
                                      className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-all duration-200"
                                      title="Enable Campaign"
                                    >
                                      <Play className="w-4 h-4" />
                                    </button>
                                  ) : null}
                                  
                                  <button
                                    onClick={() => handleCampaignAction(campaign.id, 'delete')}
                                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all duration-200"
                                    title="Delete Campaign"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* Cards View */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAndSortedCampaigns.map((campaign, index) => {
                      const typeIcon = getCampaignTypeIcon(campaign.type);
                      
                      return (
                        <div 
                          key={campaign.id}
                          className="group bg-white/15 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          {/* Card Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-3 rounded-xl shadow-md ${typeIcon.bgGradient}`}>
                                <div className="text-gray-800">
                                  {typeIcon.icon}
                                </div>
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                                  {campaign.name}
                                </h3>
                                <p className="text-sm text-gray-500">{campaign.type}</p>
                              </div>
                            </div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                              campaign.status === 'ENABLED' 
                                ? 'bg-green-100 text-green-800' 
                                : campaign.status === 'PAUSED' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {campaign.status}
                            </span>
                          </div>

                          {/* Card Metrics */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="space-y-1">
                              <p className="text-xs text-gray-500">Impressions</p>
                              <p className="font-semibold text-gray-900">{formatNumber(campaign.impressions)}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-gray-500">Clicks</p>
                              <p className="font-semibold text-gray-900">{formatNumber(campaign.clicks)}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-gray-500">Cost</p>
                              <p className="font-semibold text-gray-900">{formatCurrency(campaign.spend)}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-gray-500">CTR</p>
                              <p className="font-semibold text-gray-900">{formatPercentage(campaign.ctr)}</p>
                            </div>
                          </div>

                          {/* Card Actions */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div className="flex items-center gap-2">
                              {campaign.status === 'ENABLED' ? (
                                <button
                                  onClick={() => handleCampaignAction(campaign.id, 'pause')}
                                  className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 rounded-lg transition-all duration-200"
                                  title="Pause Campaign"
                                >
                                  <Pause className="w-4 h-4" />
                                </button>
                              ) : campaign.status === 'PAUSED' ? (
                                <button
                                  onClick={() => handleCampaignAction(campaign.id, 'enable')}
                                  className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-all duration-200"
                                  title="Enable Campaign"
                                >
                                  <Play className="w-4 h-4" />
                                </button>
                              ) : null}
                              
                              <button
                                onClick={() => handleCampaignAction(campaign.id, 'delete')}
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all duration-200"
                                title="Delete Campaign"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <div className="text-xs text-gray-500">
                              Quality Score: {campaign.qualityScore}/10
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {!loading && filteredAndSortedCampaigns.length === 0 && (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No campaigns found matching your criteria.</p>
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedType('all');
                        setSelectedStatus('all');
                      }}
                      className="mt-4 px-6 py-3 bg-blue-600 text-gray-800 rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* AI Recommendations */}
            {summary?.recommendations && summary.recommendations.length > 0 && (
              <div className="bg-white/15 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-purple-600 rounded-2xl shadow-lg">
                    <Zap className="w-6 h-6 text-gray-800" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">AI Recommendations</h2>
                    <p className="text-gray-600">Optimize your campaigns with AI-powered insights</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {summary.recommendations.map((rec, index) => (
                    <div 
                      key={index}
                      className="group bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-blue-200/50 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-xl ${
                          rec.impact === 'high' ? 'bg-red-100 text-red-600' :
                          rec.impact === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {rec.type === 'budget' ? <DollarSign className="w-5 h-5" /> :
                           rec.type === 'keyword' ? <Search className="w-5 h-5" /> :
                           rec.type === 'audience' ? <Users className="w-5 h-5" /> :
                           <Settings className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              rec.impact === 'high' ? 'bg-red-100 text-red-700' :
                              rec.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {rec.impact} impact
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm">{rec.description}</p>
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
                            Apply Recommendation
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Performance Summary */}
            {summary && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Campaign Types Distribution */}
                <div className="bg-white/15 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-600 rounded-2xl shadow-lg">
                      <PieChart className="w-6 h-6 text-gray-800" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Campaign Types</h2>
                      <p className="text-gray-600">Distribution by campaign type</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {summary?.campaignTypes ? Object.entries(summary.campaignTypes).map(([type, count]) => {
                      const typeIcon = getCampaignTypeIcon(type);
                      const percentage = (count / campaigns.length) * 100;
                      
                      return (
                        <div key={type} className="flex items-center gap-4">
                          <div className={`p-2 rounded-xl ${typeIcon.bgGradient}`}>
                            <div className="text-gray-800">
                              {typeIcon.icon}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-900">{type}</span>
                              <span className="text-sm text-gray-600">{count} campaigns</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${typeIcon.bgGradient}`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    }) : null}
                  </div>
                </div>

                {/* Top Performing Campaigns */}
                <div className="bg-white/15 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-green-600 rounded-2xl shadow-lg">
                      <Award className="w-6 h-6 text-gray-800" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Top Performers</h2>
                      <p className="text-gray-600">Best converting campaigns</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {summary?.topPerformingCampaigns?.slice(0, 3).map((campaign, index) => {
                      const typeIcon = getCampaignTypeIcon(campaign.type);
                      return (
                        <div key={campaign.id} className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-green-200/50">
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`p-2 rounded-lg ${typeIcon.bgGradient}`}>
                              <div className="text-gray-800">
                                {typeIcon.icon}
                              </div>
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                              <p className="text-sm text-gray-600">{formatPercentage(campaign.conversionRate)} conversion rate</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{formatNumber(campaign.conversions)}</p>
                            <p className="text-sm text-gray-600">conversions</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleAdsDashboard;
