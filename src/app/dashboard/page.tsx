"use client";

import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { motion } from "motion/react";
import MagicBentoWrapper from "@/components/Dashboard/MagicBentoWrapper";
import AnimatedBackground from "@/components/Dashboard/AnimatedBackground";
import AIInsightsPanel from "@/components/Dashboard/AIInsightsPanel";
import DateRangePicker from "@/components/Dashboard/DateRangePicker";
import AdvancedFilters from "@/components/Dashboard/AdvancedFilters";
import ExportButton from "@/components/Dashboard/ExportButton";
import GoalsPanel from "@/components/Dashboard/GoalsPanel";
import NotificationsPanel from "@/components/Dashboard/NotificationsPanel";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/lightswind/chart";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart, ScatterChart, Scatter,
  RadialBarChart, RadialBar, Legend, LabelList,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip
} from "recharts";
import {
  Target, TrendingUp, Activity, Zap, DollarSign, Eye, MousePointer,
  Calendar, RefreshCw, Download, Plus, ArrowUpRight, BarChart3,
  PieChart as PieChartIcon, List, Edit, Play, Pause, CheckCircle,
  XCircle, Clock, Info, ChevronLeft, ChevronRight, Monitor, Star,
  Smartphone, Tablet, Laptop, Search, Video, ShoppingCart, Image as ImageIcon, Layers,
  MapPin, Filter, Users, Percent, TrendingDown, AlertTriangle
} from "lucide-react";

// Types
interface Campaign {
  id: string;
  name: string;
  type: 'SEARCH' | 'VIDEO' | 'SHOPPING' | 'DISPLAY' | 'PERFORMANCE_MAX';
  status: 'ENABLED' | 'PAUSED' | 'REMOVED';
  [key: string]: any;
}

const DashboardPage: React.FC = () => {
  const router = useRouter();
  const { t, isRTL } = useTranslation();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState('30');
  const [dateRange, setDateRange] = useState<any>(null);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCampaignType, setSelectedCampaignType] = useState<string>('all');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
  const [filters, setFilters] = useState<any>({
    campaignTypes: [],
    statuses: [],
    searchQuery: '',
    performanceFilters: {}
  });
  const [dataSource, setDataSource] = useState<'cache' | 'api'>('cache');
  const [activeChartTab, setActiveChartTab] = useState<string>('all');
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [showQuickEdit, setShowQuickEdit] = useState<string | null>(null);
  const [campaignNotes, setCampaignNotes] = useState<Record<string, string[]>>({});
  const [campaignTags, setCampaignTags] = useState<Record<string, string[]>>({});
  const [showComparison, setShowComparison] = useState(false);
  const [showActivityFeed, setShowActivityFeed] = useState(true);
  const [googleRecommendations, setGoogleRecommendations] = useState<any[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const campaignsPerPage = 10;

  // مفتاح الكاش في localStorage
  const CACHE_KEY = 'dashboard_cache';
  const CACHE_EXPIRY_MS = 60 * 60 * 1000; // ساعة واحدة

  // دالة لحفظ البيانات في الكاش
  const saveToCache = (data: { campaigns: Campaign[], metrics: any, performanceData: any[] }) => {
    try {
      const cacheData = {
        ...data,
        timestamp: Date.now(),
        timeRange
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      console.log('💾 تم حفظ البيانات في الكاش');
    } catch (e) {
      console.warn('⚠️ فشل في حفظ الكاش:', e);
    }
  };

  // دالة لجلب البيانات من الكاش
  const loadFromCache = (): { campaigns: Campaign[], metrics: any, performanceData: any[], timestamp: number, timeRange: string } | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        return data;
      }
    } catch (e) {
      console.warn('⚠️ فشل في قراءة الكاش:', e);
    }
    return null;
  };

  // التحقق من صلاحية الكاش
  const isCacheValid = (cacheTimestamp: number, cacheTimeRange: string): boolean => {
    const now = Date.now();
    const age = now - cacheTimestamp;
    return age < CACHE_EXPIRY_MS && cacheTimeRange === timeRange;
  };

  // جلب البيانات مع دعم الكاش
  useEffect(() => {
    const initializeData = async () => {
      // محاولة جلب البيانات من الكاش أولاً
      const cachedData = loadFromCache();
      
      if (cachedData && isCacheValid(cachedData.timestamp, cachedData.timeRange)) {
        // الكاش صالح - استخدامه مباشرة
        console.log('📦 استخدام البيانات من الكاش (عمر الكاش:', Math.round((Date.now() - cachedData.timestamp) / 60000), 'دقيقة)');
        setCampaigns(cachedData.campaigns || []);
        setMetrics(cachedData.metrics || {});
        setPerformanceData(cachedData.performanceData || []);
        setLastUpdated(new Date(cachedData.timestamp));
        setDataSource('cache');
        setIsLoading(false);
      } else {
        // الكاش غير صالح أو غير موجود - جلب من API
        console.log('🌐 جلب البيانات من API (الكاش منتهي أو غير موجود)');
        setDataSource('api');
        await fetchAllData();
      }
    };
    
    initializeData();
  }, [timeRange]);

  // التحديث التلقائي كل ساعة (فقط إذا كان مفعّل)
  useEffect(() => {
    if (!autoRefreshEnabled) return;
    
    const interval = setInterval(() => {
      console.log('🔄 تحديث تلقائي للبيانات (كل ساعة)...');
      fetchAllData();
      setLastUpdated(new Date());
    }, 60 * 60 * 1000); // ساعة واحدة
    
    return () => clearInterval(interval);
  }, [autoRefreshEnabled, timeRange]);

  // Global Mouse Spotlight Effect
  useEffect(() => {
    const spotlight = document.getElementById('mouse-spotlight');
    if (!spotlight) return;

    const handleMouseMove = (e: MouseEvent) => {
      spotlight.style.left = `${e.clientX}px`;
      spotlight.style.top = `${e.clientY}px`;
      spotlight.style.opacity = '1';
    };

    const handleMouseLeave = () => {
      spotlight.style.opacity = '0';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Skip if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      // Cmd/Ctrl + N for new campaign
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        router.push('/campaign/new');
      }
      // R for refresh (without modifier)
      if (e.key === 'r' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault();
        fetchAllData();
      }
      // Escape to clear selection
      if (e.key === 'Escape') {
        setSelectedCampaigns([]);
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [router]);

  // Mouse tracking and particles for chart cards and stat items
  useEffect(() => {
    const cards = document.querySelectorAll('.chart-card, .stat-item');
    const intervals = new Map<HTMLElement, NodeJS.Timeout>();
    
    const handleMouseMove = (e: MouseEvent, card: HTMLElement) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate percentage position
      const xPercent = (x / rect.width) * 100;
      const yPercent = (y / rect.height) * 100;
      
      card.style.setProperty('--glow-x', `${xPercent}%`);
      card.style.setProperty('--glow-y', `${yPercent}%`);
      card.style.setProperty('--glow-intensity', '1');
    };
    
    const createParticle = (card: HTMLElement) => {
      const rect = card.getBoundingClientRect();
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;
      
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: rgba(132, 0, 255, 1);
        box-shadow: 0 0 6px rgba(132, 0, 255, 0.6);
        pointer-events: none;
        z-index: 100;
        left: ${x}px;
        top: ${y}px;
      `;
      
      const tx = (Math.random() - 0.5) * 100;
      const ty = (Math.random() - 0.5) * 100;
      particle.style.setProperty('--tx', `${tx}px`);
      particle.style.setProperty('--ty', `${ty}px`);
      
      card.appendChild(particle);
      
      setTimeout(() => {
        if (particle.parentNode) {
          particle.remove();
        }
      }, 2000);
    };
    
    cards.forEach((card) => {
      const cardElement = card as HTMLElement;
      
      const mouseMoveHandler = (e: MouseEvent) => handleMouseMove(e, cardElement);
      
      const mouseEnterHandler = () => {
        cardElement.style.setProperty('--glow-intensity', '1');
        
        // Create particles continuously
        const interval = setInterval(() => {
          createParticle(cardElement);
        }, 150);
        
        intervals.set(cardElement, interval);
      };
      
      const mouseLeaveHandler = () => {
        cardElement.style.setProperty('--glow-intensity', '0');
        
        const interval = intervals.get(cardElement);
        if (interval) {
          clearInterval(interval);
          intervals.delete(cardElement);
        }
        
        // Clean up particles
        const particles = cardElement.querySelectorAll('.particle');
        particles.forEach(p => p.remove());
      };
      
      cardElement.addEventListener('mousemove', mouseMoveHandler);
      cardElement.addEventListener('mouseenter', mouseEnterHandler);
      cardElement.addEventListener('mouseleave', mouseLeaveHandler);
    });
    
    return () => {
      intervals.forEach(interval => clearInterval(interval));
      intervals.clear();
    };
  }, [campaigns, performanceData]);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      setDataSource('api');
      
      const [campaignsResult, performanceResult] = await Promise.all([
        fetchCampaigns(),
        fetchPerformanceData()
      ]);
      
      // حفظ البيانات في الكاش بعد الجلب الناجح
      if (campaignsResult || performanceResult) {
        saveToCache({
          campaigns: campaignsResult?.campaigns || campaigns,
          metrics: campaignsResult?.metrics || metrics,
          performanceData: performanceResult || performanceData
        });
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCampaigns = async (): Promise<{ campaigns: Campaign[], metrics: any } | null> => {
    try {
      const response = await fetch(`/api/campaigns?timeRange=${timeRange}`);
      const data = await response.json();
      
      if (data.success) {
        setCampaigns(data.campaigns || []);
        setMetrics(data.metrics || {});
        return { campaigns: data.campaigns || [], metrics: data.metrics || {} };
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
    return null;
  };

  const fetchPerformanceData = async (): Promise<any[] | null> => {
    try {
      const response = await fetch(`/api/campaigns/performance?timeRange=${timeRange}`);
      const data = await response.json();
      
      if (data.success) {
        setPerformanceData(data.data || []);
        return data.data || [];
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
    }
    return null;
  };

  const handleRefresh = async () => {
    console.log('🔄 تحديث يدوي للبيانات...');
    await fetchAllData();
  };

  const handleDateRangeChange = async (range: any, comparison?: any) => {
    setDateRange(range);
    setComparisonData(comparison);
    
    // Calculate days difference
    const days = Math.ceil((range.endDate - range.startDate) / (1000 * 60 * 60 * 24));
    const newTimeRange = days.toString();
    
    // تحديث الفترة الزمنية
    setTimeRange(newTimeRange);
    
    // جلب البيانات الجديدة مباشرة
    console.log(`📅 تغيير الفترة الزمنية إلى ${days} يوم`);
    
    try {
      setIsLoading(true);
      setDataSource('api');
      
      const [campaignsResult, performanceResult] = await Promise.all([
        fetch(`/api/campaigns?timeRange=${newTimeRange}`).then(res => res.json()),
        fetch(`/api/campaigns/performance?days=${newTimeRange}`).then(res => res.json())
      ]);
      
      if (campaignsResult.success) {
        setCampaigns(campaignsResult.campaigns || []);
        setMetrics(campaignsResult.metrics || {});
      }
      
      if (performanceResult.success) {
        setPerformanceData(performanceResult.data || []);
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching data for new date range:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCampaignStatus = async (campaignId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ENABLED' ? 'PAUSED' : 'ENABLED';
    // Update locally first for instant feedback
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId ? { ...c, status: newStatus } : c
    ));
    
    // TODO: Call backend API to update campaign status
    console.log(`Toggle campaign ${campaignId} to ${newStatus}`);
  };

  // Calculate campaign types distribution
  const campaignTypesData = useMemo(() => {
    if (!campaigns.length) return [];
    
    const types = campaigns.reduce((acc: any, campaign) => {
      acc[campaign.type] = (acc[campaign.type] || 0) + 1;
      return acc;
    }, {});
    
    const colors = {
      SEARCH: '#3b82f6',
      VIDEO: '#ef4444',
      SHOPPING: '#10b981',
      DISPLAY: '#f59e0b',
      PERFORMANCE_MAX: '#8b5cf6'
    };
    
    return Object.entries(types).map(([type, count]) => ({
      name: type.replace('_', ' '),
      value: count,
      color: colors[type as keyof typeof colors]
    }));
  }, [campaigns]);

  // Check which campaign types exist
  const hasSearchCampaigns = campaigns.some(c => c.type === 'SEARCH');
  const hasVideoCampaigns = campaigns.some(c => c.type === 'VIDEO');
  const hasShoppingCampaigns = campaigns.some(c => c.type === 'SHOPPING');
  const hasDisplayCampaigns = campaigns.some(c => c.type === 'DISPLAY');

  // Device performance data
  const devicePerformanceData = useMemo(() => {
    if (!campaigns.length) return [];
    
    const aggregated = campaigns.reduce((acc: any, campaign) => {
      if (campaign.devicePerformance) {
        Object.entries(campaign.devicePerformance).forEach(([device, data]: [string, any]) => {
          if (!acc[device]) {
            acc[device] = { device, impressions: 0, clicks: 0, conversions: 0, cost: 0 };
          }
          acc[device].impressions += data.impressions || 0;
          acc[device].clicks += data.clicks || 0;
          acc[device].conversions += data.conversions || 0;
          acc[device].cost += data.cost || 0;
        });
      }
      return acc;
    }, {});
    
    return Object.values(aggregated).map((d: any) => ({
      ...d,
      device: d.device.charAt(0).toUpperCase() + d.device.slice(1)
    }));
  }, [campaigns]);

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    let filtered = campaigns;
    
    // تصفية حسب نوع الحملة المحدد من القائمة
    if (selectedCampaignType !== 'all') {
      filtered = filtered.filter(c => c.type === selectedCampaignType);
    }
    
    // تصفية حسب أنواع الحملات من الفلاتر المتقدمة
    if (filters.campaignTypes && filters.campaignTypes.length > 0) {
      filtered = filtered.filter(c => filters.campaignTypes.includes(c.type));
    }
    
    // تصفية حسب الحالة
    if (filters.statuses && filters.statuses.length > 0) {
      filtered = filtered.filter(c => filters.statuses.includes(c.status));
    }
    
    // تصفية حسب البحث
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.id.toLowerCase().includes(query)
      );
    }
    
    // تصفية حسب الأداء
    if (filters.performanceFilters) {
      if (filters.performanceFilters.minROAS !== undefined) {
        filtered = filtered.filter(c => (c.roas || 0) >= filters.performanceFilters.minROAS!);
      }
      if (filters.performanceFilters.minCTR !== undefined) {
        filtered = filtered.filter(c => (c.ctr || 0) >= filters.performanceFilters.minCTR!);
      }
      if (filters.performanceFilters.minConversions !== undefined) {
        filtered = filtered.filter(c => (c.conversions || 0) >= filters.performanceFilters.minConversions!);
      }
    }
    
    return filtered;
  }, [campaigns, selectedCampaignType, filters]);

  // Paginate campaigns
  const paginatedCampaigns = useMemo(() => {
    const start = (currentPage - 1) * campaignsPerPage;
    const end = start + campaignsPerPage;
    return filteredCampaigns.slice(start, end);
  }, [filteredCampaigns, currentPage]);

  const totalPages = Math.ceil(filteredCampaigns.length / campaignsPerPage);

  // Bulk Actions Handlers
  const toggleSelectCampaign = (id: string) => {
    setSelectedCampaigns(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedCampaigns.length === paginatedCampaigns.length) {
      setSelectedCampaigns([]);
    } else {
      setSelectedCampaigns(paginatedCampaigns.map(c => c.id));
    }
  };

  const handleBulkAction = async (action: 'enable' | 'pause' | 'delete') => {
    console.log(`Bulk ${action} for:`, selectedCampaigns);
    // API call would go here
    setSelectedCampaigns([]);
  };

  // Clear filters
  const clearAllFilters = () => {
    setFilters({
      campaignTypes: [],
      statuses: [],
      searchQuery: '',
      performanceFilters: {}
    });
  };

  const removeFilter = (type: 'type' | 'status', value: string) => {
    if (type === 'type') {
      setFilters((prev: any) => ({
        ...prev,
        campaignTypes: prev.campaignTypes.filter((t: string) => t !== value)
      }));
    } else {
      setFilters((prev: any) => ({
        ...prev,
        statuses: prev.statuses.filter((s: string) => s !== value)
      }));
    }
  };

  // Stats calculations - Enhanced with Google Ads metrics
  const statsData = useMemo(() => {
    const totalRevenue = metrics.conversionsValue || 0;
    const totalSpend = metrics.totalSpend || 0;
    const roas = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(2) : '0';
    const ctr = metrics.ctr || 0;
    const clicks = metrics.clicks || 0;
    const conversions = metrics.conversions || 0;
    
    // Calculate CPC and Conversion Rate
    const cpc = clicks > 0 ? (totalSpend / clicks).toFixed(2) : '0';
    const conversionRate = clicks > 0 ? ((conversions / clicks) * 100).toFixed(2) : '0';
    const costPerConversion = conversions > 0 ? (totalSpend / conversions).toFixed(2) : '0';
    
    // التغييرات تكون صفر إذا لم توجد بيانات مقارنة (سيتم حسابها من API لاحقاً)
    const hasData = totalSpend > 0 || totalRevenue > 0 || clicks > 0;
    
    return {
      revenue: totalRevenue,
      revenueChange: hasData ? (metrics.revenueChange || 0) : 0,
      spend: totalSpend,
      spendChange: hasData ? (metrics.spendChange || 0) : 0,
      roas: roas,
      roasChange: hasData ? (metrics.roasChange || 0) : 0,
      ctr: ctr,
      ctrChange: hasData ? (metrics.ctrChange || 0) : 0,
      cpc: cpc,
      cpcChange: hasData ? (metrics.cpcChange || 0) : 0,
      conversionRate: conversionRate,
      conversionRateChange: hasData ? (metrics.conversionRateChange || 0) : 0,
      costPerConversion: costPerConversion,
      costPerConversionChange: hasData ? (metrics.costPerConversionChange || 0) : 0
    };
  }, [metrics]);

  // Campaign Health Score Calculator
  const calculateHealthScore = (campaign: Campaign): number => {
    let score = 50; // Base score
    
    // Quality Score contribution (0-30 points)
    const qualityScore = campaign.qualityScore || 5;
    score += (qualityScore / 10) * 30;
    
    // CTR contribution (0-20 points)
    const ctr = campaign.ctr || 0;
    if (ctr > 5) score += 20;
    else if (ctr > 3) score += 15;
    else if (ctr > 1) score += 10;
    else score += 5;
    
    // ROAS contribution (0-20 points)
    const roas = campaign.roas || 0;
    if (roas > 4) score += 20;
    else if (roas > 2) score += 15;
    else if (roas > 1) score += 10;
    else score += 0;
    
    return Math.min(100, Math.round(score));
  };

  // Get health score color
  const getHealthColor = (score: number): string => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  // Add tag to campaign
  const addTagToCampaign = (campaignId: string, tag: string) => {
    setCampaignTags(prev => ({
      ...prev,
      [campaignId]: [...(prev[campaignId] || []), tag]
    }));
  };

  // Remove tag from campaign
  const removeTagFromCampaign = (campaignId: string, tag: string) => {
    setCampaignTags(prev => ({
      ...prev,
      [campaignId]: (prev[campaignId] || []).filter(t => t !== tag)
    }));
  };

  // Fetch Google Ads Recommendations
  const fetchGoogleRecommendations = async () => {
    setLoadingRecommendations(true);
    try {
      const response = await fetch('/api/campaigns/recommendations');
      const data = await response.json();
      if (data.success) {
        setGoogleRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  // Apply recommendation
  const applyRecommendation = async (recommendation: any) => {
    try {
      const response = await fetch('/api/campaigns/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recommendationId: recommendation.id,
          action: recommendation.suggestedAction
        })
      });
      
      if (response.ok) {
        // Remove from list after applying
        setGoogleRecommendations(prev => prev.filter(r => r.id !== recommendation.id));
        console.log('✅ Recommendation applied:', recommendation.title);
      }
    } catch (error) {
      console.error('Error applying recommendation:', error);
    }
  };

  // Dismiss recommendation
  const dismissRecommendation = async (recommendationId: string) => {
    try {
      await fetch(`/api/campaigns/recommendations?id=${recommendationId}`, {
        method: 'DELETE'
      });
      setGoogleRecommendations(prev => prev.filter(r => r.id !== recommendationId));
    } catch (error) {
      console.error('Error dismissing recommendation:', error);
    }
  };

  // Fetch recommendations on mount
  useEffect(() => {
    fetchGoogleRecommendations();
  }, []);

  // AI Recommendations (simulated - would come from API)
  const aiRecommendations = useMemo(() => {
    const recommendations: any[] = [];
    
    // Check for low CTR campaigns
    campaigns.forEach(campaign => {
      if ((campaign.ctr || 0) < 2) {
        recommendations.push({
          type: 'warning',
          campaign: campaign.name,
          title: isRTL ? 'معدل نقر منخفض' : 'Low CTR Alert',
          description: isRTL 
            ? `حملة "${campaign.name}" لديها CTR أقل من 2%. فكر في تحسين نص الإعلان.`
            : `Campaign "${campaign.name}" has CTR below 2%. Consider improving ad copy.`,
          action: isRTL ? 'تحسين الإعلانات' : 'Optimize Ads'
        });
      }
      
      // Check for high CPC
      if ((campaign.cpc || 0) > 5) {
        recommendations.push({
          type: 'info',
          campaign: campaign.name,
          title: isRTL ? 'تكلفة نقرة مرتفعة' : 'High CPC',
          description: isRTL 
            ? `حملة "${campaign.name}" لديها CPC مرتفع. راجع استراتيجية المزايدة.`
            : `Campaign "${campaign.name}" has high CPC. Review bidding strategy.`,
          action: isRTL ? 'مراجعة المزايدة' : 'Review Bidding'
        });
      }
      
      // Check for budget nearly depleted
      if (campaign.budgetRemaining && campaign.budgetRemaining < 20) {
        recommendations.push({
          type: 'alert',
          campaign: campaign.name,
          title: isRTL ? 'الميزانية تنفد' : 'Budget Running Low',
          description: isRTL 
            ? `حملة "${campaign.name}" استنفدت ${100 - campaign.budgetRemaining}% من الميزانية.`
            : `Campaign "${campaign.name}" has used ${100 - campaign.budgetRemaining}% of budget.`,
          action: isRTL ? 'زيادة الميزانية' : 'Increase Budget'
        });
      }
    });
    
    return recommendations.slice(0, 5); // Show top 5
  }, [campaigns, isRTL]);


  // Chart colors - Enhanced
  // Unified Purple Theme Colors
  const CHART_COLORS = {
    primary: '#8B5CF6',      // Purple
    secondary: '#EC4899',    // Pink
    tertiary: '#06B6D4',     // Cyan
    quaternary: '#A855F7',   // Light Purple
    quinary: '#F472B6',      // Light Pink
    senary: '#22D3EE',       // Light Cyan
    accent1: '#C084FC',      // Soft Purple
    accent2: '#F9A8D4',      // Soft Pink
    gradient1: 'url(#purpleGradient)',
    gradient2: 'url(#pinkGradient)',
    gradient3: 'url(#cyanGradient)'
  };

  // Format large numbers for better readability
  const formatLargeNumber = (num: number): string => {
    if (!num || isNaN(num)) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  // Format currency
  const formatCurrency = (num: number): string => {
    if (!num || isNaN(num)) return '$0';
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
    return `$${num.toFixed(0)}`;
  };

  // Format percentage
  const formatPercentage = (num: number): string => {
    if (!num || isNaN(num)) return '0%';
    return `${num.toFixed(1)}%`;
  };

  // Custom Tooltip Component - Enhanced with better styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    
        return (
      <div className="bg-[#060010] border-2 border-purple-500/50 rounded-xl p-4 shadow-2xl backdrop-blur-sm">
        <p className="text-white font-bold text-base mb-3 border-b border-purple-500/30 pb-2">{label}</p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-300">{entry.name}:</span>
            </div>
              <span className="text-base font-bold" style={{ color: entry.color }}>
                {typeof entry.value === 'number' && entry.value >= 1000 
                  ? formatLargeNumber(entry.value)
                  : entry.value}
              </span>
                  </div>
          ))}
                  </div>
                  </div>
    );
  };

  // ✨ Purple Loader Component - All Purple Gradient
  const PurpleLoader = () => {
    const transition = (x: number) => {
      return {
        duration: 1,
        repeat: Infinity,
        repeatType: "loop" as const,
        delay: x * 0.2,
        ease: "easeInOut" as const,
      };
    };
    return (
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: [0, 12, 0] }}
          transition={transition(0)}
          className="h-5 w-5 rounded-full border border-purple-300 bg-gradient-to-b from-purple-400 to-violet-500 shadow-lg shadow-purple-500/60"
        />
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: [0, 12, 0] }}
          transition={transition(1)}
          className="h-5 w-5 rounded-full border border-violet-300 bg-gradient-to-b from-violet-400 to-purple-600 shadow-lg shadow-violet-500/60"
        />
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: [0, 12, 0] }}
          transition={transition(2)}
          className="h-5 w-5 rounded-full border border-purple-300 bg-gradient-to-b from-purple-500 to-indigo-500 shadow-lg shadow-purple-500/60"
        />
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black relative overflow-hidden">
        {/* Background glow effect */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.3) 0%, rgba(236, 72, 153, 0.15) 40%, transparent 70%)'
          }}
        />
        
        {/* Purple Loader */}
        <div className="relative z-10">
          <PurpleLoader />
        </div>
      </div>
    );
  }

        return (
    <div className="relative min-h-screen bg-black dashboard-container">
      <AnimatedBackground />
      
      {/* Global Mouse Spotlight */}
      <div id="mouse-spotlight" style={{
        position: 'fixed',
        width: '1000px',
        height: '1000px',
        borderRadius: '50%',
        pointerEvents: 'none',
        background: `radial-gradient(circle,
          rgba(132, 0, 255, 0.25) 0%,
          rgba(132, 0, 255, 0.18) 15%,
          rgba(132, 0, 255, 0.12) 25%,
          rgba(132, 0, 255, 0.08) 40%,
          rgba(132, 0, 255, 0.04) 55%,
          rgba(132, 0, 255, 0.02) 65%,
          transparent 75%
        )`,
        zIndex: 9999,
        opacity: 0,
        transform: 'translate(-50%, -50%)',
        mixBlendMode: 'screen',
        filter: 'blur(40px)',
        transition: 'opacity 0.3s ease'
      }} />
      
      <style jsx>{`
        .chart-card {
          --glow-x: 50%;
          --glow-y: 50%;
          --glow-intensity: 0;
          --glow-radius: 200px;
          --glow-color: 132, 0, 255;
          --border-color: #4c3d6b;
          --background-dark: #060010;
          --white: hsl(0, 0%, 100%);
          --purple-primary: rgba(132, 0, 255, 1);
          --purple-glow: rgba(132, 0, 255, 0.2);
          --purple-border: rgba(132, 0, 255, 0.8);
          --text-primary: #ffffff;
          --text-secondary: #c4b5fd;
          --text-muted: #a78bfa;
          --grid-color: #4c3d6b;
          --axis-color: #9f8fd4;
          
          background-color: var(--background-dark);
          border-color: var(--border-color);
          color: var(--white);
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease-in-out;
          font-weight: 300;
          border-radius: 20px;
          direction: ltr;
          padding: 1rem;
          box-sizing: border-box;
        }
        
        /* Prevent content overflow */
        .chart-card * {
          box-sizing: border-box;
        }
        
        .chart-card > div {
          max-width: 100%;
          overflow: visible;
        }
        
        /* Border glow effect */
        .chart-card::after {
          content: '';
          position: absolute;
          inset: 0;
          padding: 6px;
          background: radial-gradient(var(--glow-radius) circle at var(--glow-x) var(--glow-y),
              rgba(var(--glow-color), calc(var(--glow-intensity) * 0.8)) 0%,
              rgba(var(--glow-color), calc(var(--glow-intensity) * 0.4)) 30%,
              transparent 60%);
          border-radius: inherit;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: subtract;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          pointer-events: none;
          transition: opacity 0.3s ease;
          z-index: 1;
          opacity: 0;
        }
        
        /* Spotlight effect on hover */
        .chart-card::before {
          content: '';
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          pointer-events: none;
          background: radial-gradient(circle,
            rgba(132, 0, 255, 0.15) 0%,
            rgba(132, 0, 255, 0.08) 15%,
            rgba(132, 0, 255, 0.04) 25%,
            transparent 50%);
          left: calc(var(--glow-x) - 300px);
          top: calc(var(--glow-y) - 300px);
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 0;
        }
        
        .chart-card:hover::before {
          opacity: 1;
        }
        
        .chart-card:hover {
          border-color: var(--purple-border) !important;
          box-shadow: 
            0 4px 20px rgba(46, 24, 78, 0.6), 
            0 0 40px rgba(132, 0, 255, 0.4),
            0 0 60px rgba(132, 0, 255, 0.3),
            0 0 80px rgba(132, 0, 255, 0.2) !important;
          transform: translateY(-2px);
        }
        
        .chart-card:hover::after {
          opacity: 1;
        }
        
        /* Particles on hover */
        .chart-card .particle {
          animation: particle-float 2s ease-out forwards;
        }
        
        @keyframes particle-float {
          0% {
            opacity: 0;
            transform: translate(0, 0) scale(0);
          }
          10% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
          90% {
            opacity: 0.8;
          }
          100% {
            opacity: 0;
            transform: translate(var(--tx), var(--ty)) scale(0.5);
          }
        }
        
        /* Chart titles styling - Compact */
        .chart-card h3 {
          font-weight: 700;
          font-size: 1.125rem;
          margin: 0 0 0.75rem 0;
          padding: 0;
          color: var(--text-primary);
          position: relative;
          z-index: 2;
          letter-spacing: 0.025em;
          text-align: center;
          line-height: 1.4;
        }
        
        /* Chart subtitle/description - Compact */
        .chart-card .chart-description {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-align: center;
          margin-bottom: 0.75rem;
          padding: 0;
          line-height: 1.3;
        }
        
        /* Chart container relative positioning */
        .chart-card > * {
          position: relative;
          z-index: 2;
        }
        
        /* Center chart containers - Force center alignment */
        .chart-card .recharts-wrapper {
          margin: 0 auto !important;
          display: block !important;
          text-align: center !important;
        }
        
        /* Ensure chart content is centered */
        .chart-card > div {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
        }
        
        /* Center ResponsiveContainer */
        .chart-card .recharts-responsive-container {
          margin: 0 auto !important;
        }
        
        /* Force SVG centering */
        .chart-card svg {
          margin: 0 auto !important;
          display: block !important;
        }
        
        /* Center all chart children */
        .chart-card [class*="recharts-"] {
          text-align: center !important;
        }
        
        .table-card {
          --glow-x: 50%;
          --glow-y: 50%;
          --glow-intensity: 0;
          --glow-radius: 200px;
          --glow-color: 132, 0, 255;
          --border-color: #392e4e;
          --background-dark: #060010;
          --white: hsl(0, 0%, 100%);
          
          background-color: var(--background-dark);
          border-color: var(--border-color);
          color: var(--white);
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease-in-out;
          font-weight: 300;
          border-radius: 20px;
          padding: 1.5rem;
          box-sizing: border-box;
        }
        
        .table-card:hover {
          box-shadow: 
            0 4px 20px rgba(46, 24, 78, 0.6), 
            0 0 40px rgba(132, 0, 255, 0.4),
            0 0 60px rgba(132, 0, 255, 0.3),
            0 0 80px rgba(132, 0, 255, 0.2);
        }
        
        /* ===== RECHARTS ENHANCEMENTS ===== */
        
        /* Transparency fixes */
        .recharts-wrapper,
        .recharts-surface,
        .recharts-wrapper svg,
        [data-chart],
        .chart-card svg {
          background: transparent !important;
        }
        
        /* Enhanced tooltip styling */
        .recharts-tooltip-wrapper {
          outline: none !important;
          z-index: 999 !important;
        }
        
        .recharts-default-tooltip {
          background: #060010 !important;
          border: 2px solid rgba(132, 0, 255, 0.5) !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 40px rgba(132, 0, 255, 0.3) !important;
          padding: 12px !important;
        }
        
        /* Enhanced text styling - Compact */
        .recharts-text {
          fill: var(--axis-color) !important;
          font-size: 12px !important;
          font-weight: 500 !important;
        }
        
        .recharts-cartesian-axis-tick-value {
          fill: #9f8fd4 !important;
          font-size: 11px !important;
          font-weight: 500 !important;
        }
        
        .recharts-label {
          fill: var(--text-secondary) !important;
          font-size: 12px !important;
          font-weight: 600 !important;
        }
        
        /* Grid lines more visible */
        .recharts-cartesian-grid-horizontal line,
        .recharts-cartesian-grid-vertical line {
          stroke: #4c3d6b !important;
          stroke-opacity: 0.6 !important;
        }
        
        /* Legend styling - Compact */
        .recharts-legend-wrapper {
          margin-top: 12px !important;
        }
        
        .recharts-legend-item-text {
          color: #c4b5fd !important;
          font-size: 12px !important;
          font-weight: 500 !important;
        }
        
        /* Pie chart labels - Compact */
        .recharts-pie-label-text {
          fill: #ffffff !important;
          font-size: 11px !important;
          font-weight: 600 !important;
        }
        
        /* Enhanced bar/line stroke width */
        .recharts-bar-rectangle {
          stroke-width: 0 !important;
        }
        
        /* Data label styling - Compact */
        .recharts-label-list text {
          fill: #ffffff !important;
          font-size: 11px !important;
          font-weight: 600 !important;
        }
        
        /* ===== CHART ALIGNMENT FIX - COMPLETE CENTER ===== */
        
        /* Ensure all chart containers are centered */
        .chart-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
        }
        
        /* Center all direct children */
        .chart-card > * {
          margin-left: auto;
          margin-right: auto;
          text-align: center;
        }
        
        /* Center ChartContainer component */
        .chart-card > div[class*="h-"],
        .chart-card > div {
          margin: 0 auto;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        /* Ensure ResponsiveContainer centers its content */
        .recharts-responsive-container {
          margin-left: auto !important;
          margin-right: auto !important;
          display: block !important;
        }
        
        /* Override RTL text alignment in charts */
        [dir="rtl"] .chart-card .recharts-wrapper,
        [dir="rtl"] .chart-card svg,
        [dir="rtl"] .chart-card .recharts-surface,
        [dir="rtl"] .chart-card .recharts-responsive-container {
          direction: ltr !important;
          text-align: center !important;
        }
        
        /* Center the entire chart area */
        .chart-card .recharts-surface {
          margin: 0 auto !important;
          display: block !important;
        }
        
        /* Force center for chart wrapper */
        .chart-card .recharts-wrapper {
          margin-left: auto !important;
          margin-right: auto !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
        }
        
        /* Center SVG content */
        .chart-card svg {
          display: block !important;
          margin-left: auto !important;
          margin-right: auto !important;
        }
        
        /* ===== GLOBAL MOUSE GLOW ===== */
        
        .dashboard-container {
          position: relative;
          overflow-x: hidden;
        }
        
        /* Enhanced glow on all interactive elements */
        .chart-card,
        .table-card,
        button,
        .card {
          position: relative;
        }
        
        .chart-card::before,
        .table-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: radial-gradient(
            600px circle at var(--glow-x, 50%) var(--glow-y, 50%),
            rgba(132, 0, 255, calc(var(--glow-intensity, 0) * 0.1)),
            transparent 40%
          );
          pointer-events: none;
          z-index: 0;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .chart-card:hover::before,
        .table-card:hover::before {
          opacity: 1;
        }
        
        /* ===== NEW DASHBOARD ENHANCEMENTS ===== */
        
        /* Background gradient overlay */
        .dashboard-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 600px;
          background: radial-gradient(
            ellipse at top center,
            rgba(132, 0, 255, 0.12) 0%,
            transparent 60%
          );
          pointer-events: none;
          z-index: 0;
        }
        
        /* Stats Summary Bar */
        .stats-summary {
          padding: 0;
          background: transparent;
          border-radius: 0;
          border: none;
          backdrop-filter: none;
        }
        
        .stat-item {
          position: relative;
          display: flex;
          gap: 0.75rem;
          padding: 1rem;
          background: linear-gradient(145deg, rgba(6, 0, 16, 0.95), rgba(20, 5, 40, 0.9));
          border-radius: 16px;
          transition: all 0.3s ease;
          border: 1px solid rgba(132, 0, 255, 0.2);
          overflow: hidden;
        }
        
        /* Glow effect on hover */
        .stat-item::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(
            400px circle at var(--glow-x, 50%) var(--glow-y, 50%),
            rgba(132, 0, 255, 0.15) 0%,
            transparent 60%
          );
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        
        .stat-item:hover::before {
          opacity: 1;
        }
        
        .stat-item:hover {
          background: linear-gradient(145deg, rgba(20, 5, 40, 0.95), rgba(40, 10, 60, 0.9));
          border-color: rgba(132, 0, 255, 0.5);
          transform: translateY(-3px);
          box-shadow: 
            0 10px 40px rgba(132, 0, 255, 0.15),
            0 0 20px rgba(132, 0, 255, 0.1);
        }
        
        /* Particles */
        .stat-item::after {
          content: '';
          position: absolute;
          width: 4px;
          height: 4px;
          background: rgba(132, 0, 255, 0.6);
          border-radius: 50%;
          top: 20%;
          right: 15%;
          opacity: 0;
          filter: blur(1px);
          transition: opacity 0.3s;
        }
        
        .stat-item:hover::after {
          opacity: 1;
          animation: float-particle 2s ease-in-out infinite;
        }
        
        @keyframes float-particle {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-5px, -8px); }
        }
        
        .stat-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(132, 0, 255, 0.2), rgba(236, 72, 153, 0.1));
          border-radius: 14px;
          border: 1px solid rgba(132, 0, 255, 0.2);
          flex-shrink: 0;
        }
        
        .stat-item:hover .stat-icon {
          background: linear-gradient(135deg, rgba(132, 0, 255, 0.3), rgba(236, 72, 153, 0.2));
          border-color: rgba(132, 0, 255, 0.4);
          box-shadow: 0 0 20px rgba(132, 0, 255, 0.2);
        }
        
        .stat-value {
          font-size: 1.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #a78bfa, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1.2;
        }
        
        .stat-label {
          font-size: 0.75rem;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .stat-change {
          font-size: 0.7rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        
        .stat-change.positive { color: #10b981; }
        .stat-change.negative { color: #ef4444; }
        
        /* Quick Actions */
        .quick-action {
          padding: 0.5rem 1rem;
          background: linear-gradient(145deg, #1a0b2e, #2d1b4e);
          border: 1px solid rgba(132, 0, 255, 0.3);
          border-radius: 10px;
          color: white;
          font-size: 0.8rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .quick-action:hover {
          background: linear-gradient(145deg, #2d1b4e, #3d2b5e);
          border-color: rgba(132, 0, 255, 0.6);
          box-shadow: 0 0 25px rgba(132, 0, 255, 0.3);
          transform: translateY(-2px);
        }
        
        /* Charts Tabs */
        .charts-tabs {
          display: flex;
          gap: 0.5rem;
          padding: 0.5rem;
          background: rgba(132, 0, 255, 0.05);
          border-radius: 12px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        
        .charts-tabs::-webkit-scrollbar {
          display: none;
        }
        
        .chart-tab {
          padding: 0.5rem 1.25rem;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 8px;
          color: #9ca3af;
          font-size: 0.85rem;
          font-weight: 500;
          white-space: nowrap;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .chart-tab:hover {
          color: #c4b5fd;
          background: rgba(132, 0, 255, 0.1);
        }
        
        .chart-tab.active {
          background: linear-gradient(145deg, #2d1b4e, #3d2b5e);
          border-color: rgba(132, 0, 255, 0.5);
          color: white;
          box-shadow: 0 0 20px rgba(132, 0, 255, 0.2);
        }
        
        /* Filter Chips */
        .filter-chip {
          padding: 0.25rem 0.75rem;
          background: rgba(132, 0, 255, 0.2);
          border: 1px solid rgba(132, 0, 255, 0.4);
          border-radius: 20px;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #c4b5fd;
          transition: all 0.2s ease;
        }
        
        .filter-chip:hover {
          background: rgba(132, 0, 255, 0.3);
          border-color: rgba(132, 0, 255, 0.6);
        }
        
        .clear-filters-btn {
          padding: 0.25rem 0.75rem;
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.4);
          border-radius: 20px;
          font-size: 0.75rem;
          color: #fca5a5;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .clear-filters-btn:hover {
          background: rgba(239, 68, 68, 0.3);
        }
        
        /* Empty State */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
          background: linear-gradient(145deg, #0a0015, #150025);
          border-radius: 24px;
          border: 2px dashed rgba(132, 0, 255, 0.3);
        }
        
        .empty-state-icon {
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(132, 0, 255, 0.1);
          border-radius: 50%;
          margin-bottom: 1.5rem;
        }
        
        .create-campaign-btn {
          padding: 0.875rem 2rem;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          border-radius: 12px;
          color: white;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .create-campaign-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 50px rgba(139, 92, 246, 0.4);
        }
        
        /* Breadcrumbs */
        .breadcrumbs {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          margin-bottom: 0.5rem;
        }
        
        .breadcrumb-link {
          color: #8b5cf6;
          text-decoration: none;
          transition: color 0.2s;
        }
        
        .breadcrumb-link:hover {
          color: #a78bfa;
        }
        
        .breadcrumb-separator {
          color: #4b5563;
        }
        
        .breadcrumb-current {
          color: #9ca3af;
        }
        
        /* Keyboard Shortcuts Hint */
        .shortcuts-hint {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          padding: 0.5rem 1rem;
          background: rgba(10, 0, 20, 0.9);
          border: 1px solid rgba(132, 0, 255, 0.3);
          border-radius: 10px;
          font-size: 0.75rem;
          color: #9ca3af;
          backdrop-filter: blur(10px);
          z-index: 100;
          display: none;
        }
        
        @media (min-width: 1024px) {
          .shortcuts-hint {
            display: block;
          }
        }
        
        .shortcuts-hint kbd {
          padding: 0.15rem 0.4rem;
          background: rgba(132, 0, 255, 0.2);
          border: 1px solid rgba(132, 0, 255, 0.3);
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.7rem;
          color: #c4b5fd;
        }
        
        /* Bulk Actions */
        .bulk-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: rgba(132, 0, 255, 0.1);
          border-radius: 10px;
          border: 1px solid rgba(132, 0, 255, 0.2);
        }
        
        .bulk-action-btn {
          padding: 0.4rem 0.75rem;
          background: rgba(132, 0, 255, 0.2);
          border: 1px solid rgba(132, 0, 255, 0.3);
          border-radius: 6px;
          font-size: 0.75rem;
          color: #c4b5fd;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .bulk-action-btn:hover {
          background: rgba(132, 0, 255, 0.3);
          border-color: rgba(132, 0, 255, 0.5);
        }
        
        .bulk-action-btn.danger {
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(239, 68, 68, 0.3);
          color: #fca5a5;
        }
        
        .bulk-action-btn.danger:hover {
          background: rgba(239, 68, 68, 0.3);
        }
        
        /* Section divider */
        .section-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(132, 0, 255, 0.3), transparent);
          margin: 2rem 0;
        }
        
        /* Button ripple effect */
        @keyframes btn-ripple {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(4); opacity: 0; }
        }
        
        .ripple-btn {
          position: relative;
          overflow: hidden;
        }
        
        .ripple-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: radial-gradient(circle, rgba(132, 0, 255, 0.3) 0%, transparent 70%);
          transform: scale(0);
          opacity: 0;
        }
        
        .ripple-btn:active::after {
          animation: btn-ripple 0.6s ease-out;
        }
        
        /* Custom scrollbar for dashboard */
        .dashboard-container::-webkit-scrollbar {
          width: 8px;
        }
        
        .dashboard-container::-webkit-scrollbar-track {
          background: #0a0015;
        }
        
        .dashboard-container::-webkit-scrollbar-thumb {
          background: rgba(132, 0, 255, 0.3);
          border-radius: 4px;
        }
        
        .dashboard-container::-webkit-scrollbar-thumb:hover {
          background: rgba(132, 0, 255, 0.5);
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .stats-summary {
            grid-template-columns: 1fr 1fr !important;
          }
          
          .stat-value {
            font-size: 1.25rem;
          }
          
          .quick-actions-group {
            display: none;
          }
          
          .shortcuts-hint {
            display: none !important;
          }
        }
        
        @media (max-width: 480px) {
          .stats-summary {
            grid-template-columns: 1fr !important;
          }
        }
        
        /* ===== AI FEATURES ===== */
        
        /* Health Score Badge */
        .health-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          font-weight: 700;
          font-size: 0.75rem;
        }
        
        .health-excellent { background: rgba(16, 185, 129, 0.2); color: #10b981; }
        .health-good { background: rgba(234, 179, 8, 0.2); color: #eab308; }
        .health-fair { background: rgba(249, 115, 22, 0.2); color: #f97316; }
        .health-poor { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        
        /* AI Recommendation Card */
        .ai-rec-card {
          transition: all 0.3s ease;
        }
        
        .ai-rec-card:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 20px rgba(132, 0, 255, 0.2);
        }
        
        /* Campaign Tags */
        .campaign-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.15rem 0.5rem;
          background: rgba(132, 0, 255, 0.2);
          border: 1px solid rgba(132, 0, 255, 0.3);
          border-radius: 12px;
          font-size: 0.65rem;
          color: #c4b5fd;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .campaign-tag:hover {
          background: rgba(132, 0, 255, 0.3);
        }
        
        .campaign-tag.removable:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(239, 68, 68, 0.4);
          color: #fca5a5;
        }
        
        /* Notes Indicator */
        .notes-indicator {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          background: rgba(132, 0, 255, 0.2);
          border-radius: 50%;
          font-size: 0.6rem;
          color: #c4b5fd;
          cursor: pointer;
        }
        
        /* Performance Sparkline */
        .sparkline-container {
          width: 60px;
          height: 24px;
          display: inline-block;
        }
        
        /* Prediction Card */
        .prediction-card {
          background: linear-gradient(145deg, rgba(132, 0, 255, 0.1), rgba(236, 72, 153, 0.05));
          border: 1px solid rgba(132, 0, 255, 0.3);
          border-radius: 12px;
          padding: 1rem;
        }
        
        .prediction-value {
          font-size: 1.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .confidence-bar {
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
        }
        
        .confidence-fill {
          height: 100%;
          background: linear-gradient(90deg, #8b5cf6, #ec4899);
          border-radius: 2px;
          transition: width 0.5s ease;
        }
      `}</style>
      
      <div className="relative z-10 container mx-auto px-4 py-8 space-y-8">
        {/* Breadcrumbs */}
        <nav className="breadcrumbs">
          <a href="/" className="breadcrumb-link">{isRTL ? 'الرئيسية' : 'Home'}</a>
          <ChevronRight className="w-4 h-4 breadcrumb-separator" />
          <span className="breadcrumb-current">{isRTL ? 'لوحة التحكم' : 'Dashboard'}</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              {t.dashboard?.title || 'Dashboard Overview'}
              </h1>
            <p className="text-purple-200/70 text-sm">
              {(t.dashboard as any)?.subtitle || 'Monitor your advertising performance and manage campaigns'}
              </p>
            </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            {/* Date Range Picker */}
            <DateRangePicker 
              onDateRangeChange={handleDateRangeChange}
              enableComparison={true}
            />
            
            {/* Last Updated + Data Source Indicator */}
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-400 bg-purple-900/20 border border-purple-900/30 rounded-lg">
              <Clock className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">
                {isRTL ? 'آخر تحديث' : 'Updated'}:
              </span>
              <span className="font-medium text-purple-300">
                {lastUpdated.toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
              {dataSource === 'cache' && (
                <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-300 rounded text-[10px] font-medium">
                  {isRTL ? 'مخزن' : 'Cached'}
                </span>
              )}
              {isLoading && (
                <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded text-[10px] font-medium animate-pulse">
                  {isRTL ? 'جاري التحديث...' : 'Updating...'}
                </span>
              )}
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className={`p-2 border rounded-lg transition-all backdrop-blur-sm ${
                isLoading 
                  ? 'bg-blue-500/20 border-blue-400/40 cursor-wait' 
                  : 'bg-purple-900/30 hover:bg-purple-900/50 border-purple-900/50'
              }`}
              title={isRTL ? 'تحديث البيانات من Google Ads' : 'Refresh data from Google Ads'}
            >
              <RefreshCw className={`w-5 h-5 text-purple-300 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            
            {/* Auto Refresh Toggle (كل ساعة) */}
            <button
              onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
              className={`p-2 border rounded-lg transition-all backdrop-blur-sm flex items-center gap-1 ${
                autoRefreshEnabled 
                  ? 'bg-green-600/30 border-green-500/50 text-green-300' 
                  : 'bg-purple-900/30 border-purple-900/50 text-purple-300 hover:bg-purple-900/50'
              }`}
              title={isRTL ? (autoRefreshEnabled ? 'إيقاف التحديث التلقائي (كل ساعة)' : 'تفعيل التحديث التلقائي (كل ساعة)') : (autoRefreshEnabled ? 'Disable Auto-Refresh (hourly)' : 'Enable Auto-Refresh (hourly)')}
            >
              <Activity className="w-5 h-5" />
              {autoRefreshEnabled && <span className="text-[10px] hidden sm:inline">1h</span>}
            </button>
            
            {/* Advanced Filters */}
            <AdvancedFilters 
              onFiltersChange={setFilters}
            />
            
            {/* Export Button */}
            <ExportButton 
              campaigns={campaigns}
              metrics={metrics}
              performanceData={performanceData}
            />
            
            {/* Notifications */}
            <NotificationsPanel />
            
            {/* New Campaign Button */}
            <button
              onClick={() => router.push('/campaign/new')}
              className="ripple-btn px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-purple-600/50 hover:shadow-purple-600/70"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">{(t.dashboard as any)?.newCampaign || 'New Campaign'}</span>
            </button>
          </div>
                </div>

        {/* Quick Actions Bar */}
        <div className="flex items-center gap-3 mt-4 quick-actions-group">
          <button className="quick-action" onClick={() => router.push('/campaign/new')}>
            <Zap className="w-4 h-4 text-yellow-400" />
            {isRTL ? 'حملة سريعة' : 'Quick Campaign'}
          </button>
          <button className="quick-action" onClick={() => {}}>
            <Download className="w-4 h-4 text-blue-400" />
            {isRTL ? 'تقرير' : 'Report'}
          </button>
          <button className="quick-action" onClick={() => {}}>
            <BarChart3 className="w-4 h-4 text-green-400" />
            {isRTL ? 'تحليلات' : 'Analytics'}
          </button>
              </div>

        {/* Stats Summary Bar - Row 1 */}
        <div className="stats-summary grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          <div className="stat-item">
            <div className="stat-icon">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex flex-col">
              <span className="stat-label">{isRTL ? 'الإيرادات' : 'Revenue'}</span>
              <span className="stat-value">${formatLargeNumber(statsData.revenue)}</span>
              <span className={`stat-change ${statsData.revenueChange >= 0 ? 'positive' : 'negative'}`}>
                {statsData.revenueChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(statsData.revenueChange)}%
              </span>
          </div>
            </div>
            
          <div className="stat-item">
            <div className="stat-icon">
              <Target className="w-5 h-5 text-purple-400" />
              </div>
            <div className="flex flex-col">
              <span className="stat-label">{isRTL ? 'الإنفاق' : 'Spend'}</span>
              <span className="stat-value">${formatLargeNumber(statsData.spend)}</span>
              <span className={`stat-change ${statsData.spendChange <= 0 ? 'positive' : 'negative'}`}>
                {statsData.spendChange <= 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                {Math.abs(statsData.spendChange)}%
              </span>
                    </div>
              </div>
          
          <div className="stat-item">
            <div className="stat-icon">
              <Activity className="w-5 h-5 text-blue-400" />
                    </div>
            <div className="flex flex-col">
              <span className="stat-label">ROAS</span>
              <span className="stat-value">{statsData.roas}x</span>
              <span className={`stat-change ${statsData.roasChange >= 0 ? 'positive' : 'negative'}`}>
                {statsData.roasChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(statsData.roasChange)}%
              </span>
                    </div>
                  </div>
          
          <div className="stat-item">
            <div className="stat-icon">
              <MousePointer className="w-5 h-5 text-pink-400" />
                </div>
            <div className="flex flex-col">
              <span className="stat-label">CTR</span>
              <span className="stat-value">{statsData.ctr}%</span>
              <span className={`stat-change ${statsData.ctrChange >= 0 ? 'positive' : 'negative'}`}>
                {statsData.ctrChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(statsData.ctrChange)}%
              </span>
              </div>
            </div>
          </div>

        {/* Stats Summary Bar - Row 2 (Google Ads Specific Metrics) */}
        <div className="stats-summary grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
          <div className="stat-item">
            <div className="stat-icon">
              <DollarSign className="w-5 h-5 text-orange-400" />
            </div>
            <div className="flex flex-col">
              <span className="stat-label">CPC</span>
              <span className="stat-value">${statsData.cpc}</span>
              <span className={`stat-change ${statsData.cpcChange <= 0 ? 'positive' : 'negative'}`}>
                {statsData.cpcChange <= 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                {Math.abs(statsData.cpcChange)}%
              </span>
            </div>
            </div>
            
          <div className="stat-item">
            <div className="stat-icon">
              <Percent className="w-5 h-5 text-cyan-400" />
                    </div>
            <div className="flex flex-col">
              <span className="stat-label">{isRTL ? 'معدل التحويل' : 'Conv. Rate'}</span>
              <span className="stat-value">{statsData.conversionRate}%</span>
              <span className={`stat-change ${statsData.conversionRateChange >= 0 ? 'positive' : 'negative'}`}>
                {statsData.conversionRateChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(statsData.conversionRateChange)}%
              </span>
                    </div>
                  </div>
          
          <div className="stat-item">
            <div className="stat-icon">
              <Zap className="w-5 h-5 text-yellow-400" />
                    </div>
            <div className="flex flex-col">
              <span className="stat-label">{isRTL ? 'تكلفة التحويل' : 'Cost/Conv.'}</span>
              <span className="stat-value">${statsData.costPerConversion}</span>
              <span className={`stat-change ${statsData.costPerConversionChange <= 0 ? 'positive' : 'negative'}`}>
                {statsData.costPerConversionChange <= 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                {Math.abs(statsData.costPerConversionChange)}%
              </span>
                    </div>
                  </div>
          
          <div className="stat-item">
            <div className="stat-icon">
              <Star className="w-5 h-5 text-amber-400" />
                    </div>
            <div className="flex flex-col">
              <span className="stat-label">{isRTL ? 'جودة الإعلان' : 'Quality Score'}</span>
              <span className="stat-value">{metrics.qualityScore || 0}/10</span>
              <span className={`stat-change ${(metrics.qualityScore || 0) >= 7 ? 'positive' : (metrics.qualityScore || 0) >= 5 ? '' : 'negative'}`}>
                {(metrics.qualityScore || 0) >= 7 ? <TrendingUp className="w-3 h-3" /> : (metrics.qualityScore || 0) >= 5 ? null : <TrendingDown className="w-3 h-3" />}
                {(metrics.qualityScore || 0) >= 7 ? (isRTL ? 'جيد' : 'Good') : (metrics.qualityScore || 0) >= 5 ? (isRTL ? 'متوسط' : 'Average') : (isRTL ? 'لا توجد بيانات' : 'N/A')}
              </span>
                    </div>
                  </div>
                </div>

        {/* Active Filters Display */}
        {(filters.campaignTypes?.length > 0 || filters.statuses?.length > 0) && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-sm text-gray-400">{isRTL ? 'فلاتر نشطة:' : 'Active Filters:'}</span>
            {filters.campaignTypes?.map((type: string) => (
              <div key={type} className="filter-chip">
                {type}
                <XCircle className="w-3 h-3 cursor-pointer hover:text-red-400" onClick={() => removeFilter('type', type)} />
              </div>
            ))}
            {filters.statuses?.map((status: string) => (
              <div key={status} className="filter-chip">
                {status}
                <XCircle className="w-3 h-3 cursor-pointer hover:text-red-400" onClick={() => removeFilter('status', status)} />
            </div>
            ))}
            <button className="clear-filters-btn" onClick={clearAllFilters}>
              {isRTL ? 'مسح الكل' : 'Clear All'}
            </button>
          </div>
        )}

        <div className="section-divider" />

        {/* 🤖 AI Insights - Compact */}
        <div className="flex items-baseline gap-3 mb-3">
          <span className="text-3xl" style={{ lineHeight: 1, transform: 'translateY(-2px)' }}>🤖</span>
          <h3 className="text-xl font-bold text-white">{isRTL ? 'رؤى AI' : 'AI Insights'}</h3>
        </div>
        <div className="space-y-1.5">
          {campaigns.length > 0 ? (
            <>
              {/* Best Campaign */}
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-green-500/5 border-l-2 border-green-500">
                <TrendingUp className="w-4 h-4 text-green-400 flex-shrink-0" />
                <p className="text-xs text-gray-300 truncate">
                  {(() => {
                    const best = campaigns.reduce((a, b) => (a.roas || 0) > (b.roas || 0) ? a : b, campaigns[0]);
                    return isRTL 
                      ? `أفضل: "${best?.name}" - ROAS ${(best?.roas || 0).toFixed(1)}x`
                      : `Top: "${best?.name}" - ${(best?.roas || 0).toFixed(1)}x ROAS`;
                  })()}
                </p>
              </div>
              {/* Low CTR */}
              {campaigns.some(c => (c.ctr || 0) < 2) && (
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-yellow-500/5 border-l-2 border-yellow-500">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  <p className="text-xs text-gray-300 truncate">
                    {isRTL 
                      ? `${campaigns.filter(c => (c.ctr || 0) < 2).length} حملات CTR < 2%`
                      : `${campaigns.filter(c => (c.ctr || 0) < 2).length} campaigns CTR < 2%`}
                  </p>
                </div>
              )}
              {/* Spend */}
              {metrics.totalSpend > 0 && (
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-blue-500/5 border-l-2 border-blue-500">
                  <DollarSign className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <p className="text-xs text-gray-300 truncate">
                    {isRTL 
                      ? `الإنفاق: $${formatLargeNumber(metrics.totalSpend)} | CPA: $${metrics.conversions > 0 ? (metrics.totalSpend / metrics.conversions).toFixed(0) : '0'}`
                      : `Spend: $${formatLargeNumber(metrics.totalSpend)} | CPA: $${metrics.conversions > 0 ? (metrics.totalSpend / metrics.conversions).toFixed(0) : '0'}`}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-purple-500/5 border-l-2 border-purple-500">
              <Zap className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <p className="text-xs text-gray-400">
                {isRTL ? 'أنشئ حملتك الأولى لرؤية البيانات' : 'Create your first campaign to see insights'}
              </p>
            </div>
          )}
            </div>
            
        {/* AI Recommendations Panel */}
        {aiRecommendations.length > 0 && (
          <div className="chart-card backdrop-blur-sm border border-solid p-4 mt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
                </div>
              <h3 className="text-lg font-bold text-white">
                {isRTL ? 'توصيات الذكاء الاصطناعي' : 'AI Recommendations'}
                </h3>
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                {aiRecommendations.length} {isRTL ? 'توصيات' : 'suggestions'}
              </span>
            </div>
            
            <div className="space-y-3">
              {aiRecommendations.map((rec, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border transition-all hover:scale-[1.01] ${
                    rec.type === 'alert' 
                      ? 'bg-red-500/10 border-red-500/30' 
                      : rec.type === 'warning'
                        ? 'bg-yellow-500/10 border-yellow-500/30'
                        : 'bg-blue-500/10 border-blue-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {rec.type === 'alert' ? (
                          <XCircle className="w-4 h-4 text-red-400" />
                        ) : rec.type === 'warning' ? (
                          <Info className="w-4 h-4 text-yellow-400" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-blue-400" />
                        )}
                        <span className="font-semibold text-white text-sm">{rec.title}</span>
                      </div>
                      <p className="text-gray-400 text-xs leading-relaxed">{rec.description}</p>
                    </div>
                    <button className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg transition-colors whitespace-nowrap">
                      {rec.action}
                </button>
              </div>
            </div>
              ))}
          </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            <span>{(t.dashboard as any)?.performanceAnalytics || 'Performance Analytics'}</span>
          </h2>

            {/* Charts Tabs */}
            <div className="charts-tabs">
              <button 
                className={`chart-tab ${activeChartTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveChartTab('all')}
              >
                {isRTL ? 'الكل' : 'All'}
              </button>
              <button 
                className={`chart-tab ${activeChartTab === 'performance' ? 'active' : ''}`}
                onClick={() => setActiveChartTab('performance')}
              >
                {isRTL ? 'الأداء' : 'Performance'}
              </button>
              <button 
                className={`chart-tab ${activeChartTab === 'demographics' ? 'active' : ''}`}
                onClick={() => setActiveChartTab('demographics')}
              >
                {isRTL ? 'الديموغرافيا' : 'Demographics'}
              </button>
              <button 
                className={`chart-tab ${activeChartTab === 'financial' ? 'active' : ''}`}
                onClick={() => setActiveChartTab('financial')}
              >
                {isRTL ? 'المالية' : 'Financial'}
              </button>
            </div>
            </div>

          {/* Essential Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Trends - Line Chart */}
            <div className="chart-card backdrop-blur-sm border border-solid">
              <h3>Performance Trends</h3>
              <p className="chart-description">Daily performance metrics overview</p>
              <div className="flex justify-center items-center w-full">
              <ChartContainer
                config={{
                  impressions: { label: "Impressions", color: CHART_COLORS.primary },
                  clicks: { label: "Clicks", color: CHART_COLORS.secondary },
                  conversions: { label: "Conversions", color: CHART_COLORS.quaternary }
                }}
                className="h-[320px]"
              >
                <ResponsiveContainer width="100%" height="100%" style={{ margin: '0 auto' }}>
                  <LineChart data={performanceData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4c3d6b" />
                    <XAxis dataKey="day" stroke="#9f8fd4" fontSize={12} fontWeight={500} />
                    <YAxis stroke="#9f8fd4" fontSize={12} fontWeight={500} tickFormatter={(value) => formatLargeNumber(value)} />
                    <Tooltip content={<CustomTooltip />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line type="monotone" dataKey="impressions" stroke={CHART_COLORS.primary} strokeWidth={2} dot={{ fill: CHART_COLORS.primary, r: 3 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="clicks" stroke={CHART_COLORS.secondary} strokeWidth={2} dot={{ fill: CHART_COLORS.secondary, r: 3 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="conversions" stroke={CHART_COLORS.quaternary} strokeWidth={2} dot={{ fill: CHART_COLORS.quaternary, r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
                </div>
            </div>
            
            {/* Revenue & Spend - Area Chart with Purple Theme */}
            <div className="chart-card backdrop-blur-sm border border-solid">
              <h3>Revenue vs Spend</h3>
              <p className="chart-description">Financial performance comparison</p>
              <ChartContainer
                config={{
                  cost: { label: "Spend", color: CHART_COLORS.secondary },
                  conversionsValue: { label: "Revenue", color: CHART_COLORS.primary }
                }}
                className="h-[320px]"
              >
                <ResponsiveContainer width="100%" height="100%" style={{ margin: '0 auto' }}>
                  <AreaChart data={performanceData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="pinkGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EC4899" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#EC4899" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4c3d6b" />
                    <XAxis dataKey="day" stroke="#9f8fd4" fontSize={12} fontWeight={500} />
                    <YAxis stroke="#9f8fd4" fontSize={12} fontWeight={500} tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip content={<CustomTooltip />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area type="monotone" dataKey="cost" stroke={CHART_COLORS.secondary} strokeWidth={2} fillOpacity={1} fill="url(#pinkGradient)" />
                    <Area type="monotone" dataKey="conversionsValue" stroke={CHART_COLORS.primary} strokeWidth={2} fillOpacity={1} fill="url(#purpleGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
            
          {/* Conditional Charts based on Campaign Types */}
          {(hasSearchCampaigns || hasVideoCampaigns || hasShoppingCampaigns || hasDisplayCampaigns) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Search Campaigns: Quality Score Radar */}
              {hasSearchCampaigns && (
                <div className="chart-card backdrop-blur-sm border border-solid">
              <div className="flex items-center gap-2 justify-center mb-1">
                <Search className="w-4 h-4 text-blue-400 opacity-80" />
                    <h3 className="!text-center">Quality Score Components</h3>
                    </div>
                  <p className="chart-description">Search campaign quality metrics</p>
                  <ChartContainer
                    config={{
                      value: { label: "Score", color: CHART_COLORS.primary }
                    }}
                    className="h-[320px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={[
                        { metric: 'Creative', value: 8 },
                        { metric: 'Landing Page', value: 7 },
                        { metric: 'CTR', value: 9 },
                        { metric: 'Relevance', value: 8 },
                        { metric: 'Mobile UX', value: 7 }
                      ]}>
                        <PolarGrid stroke="#4c3d6b" strokeWidth={1.5} />
                        <PolarAngleAxis dataKey="metric" stroke="#9f8fd4" fontSize={11} fontWeight={500} />
                        <PolarRadiusAxis angle={90} domain={[0, 10]} stroke="#9f8fd4" fontSize={12} fontWeight={500} />
                        <Radar name="Quality Score" dataKey="value" stroke={CHART_COLORS.primary} strokeWidth={2} fill={CHART_COLORS.primary} fillOpacity={0.5} />
                        <Tooltip content={<CustomTooltip />} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                    </div>
              )}

              {/* Video Campaigns: Video Performance */}
              {hasVideoCampaigns && (
                <div className="chart-card backdrop-blur-sm border border-solid">
                  <div className="flex items-center gap-2 justify-center mb-1">
                    <Video className="w-4 h-4 text-red-400 opacity-80" />
                    <h3 className="!text-center">Video Completion Rates</h3>
                  </div>
                  <p className="chart-description">Video engagement by quartile</p>
                  <ChartContainer
                    config={{
                      rate: { label: "Completion %", color: CHART_COLORS.quaternary }
                    }}
                    className="h-[320px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { stage: '25%', rate: 85 },
                        { stage: '50%', rate: 65 },
                        { stage: '75%', rate: 45 },
                        { stage: '100%', rate: 30 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4c3d6b" />
                        <XAxis dataKey="stage" stroke="#9f8fd4" fontSize={12} fontWeight={500} />
                        <YAxis stroke="#9f8fd4" fontSize={12} fontWeight={500} tickFormatter={(value) => `${value}%`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="rate" fill={CHART_COLORS.quaternary} radius={[10, 10, 0, 0]}>
                          <LabelList dataKey="rate" position="top" className="fill-white" fontSize={11} fontWeight={600} formatter={(value: number) => `${value}%`} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                    </div>
              )}

              {/* Shopping Campaigns: E-commerce Metrics */}
              {hasShoppingCampaigns && (
                <div className="chart-card backdrop-blur-sm border border-solid">
                  <div className="flex items-center gap-2 justify-center mb-1">
                    <ShoppingCart className="w-4 h-4 text-green-400 opacity-80" />
                    <h3 className="!text-center">E-commerce Metrics</h3>
                  </div>
                  <p className="chart-description">Shopping campaign financials</p>
                  <ChartContainer
                    config={{
                      value: { label: "Amount", color: CHART_COLORS.secondary }
                    }}
                    className="h-[320px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { metric: 'Revenue', value: 61250 },
                        { metric: 'Profit', value: 30625 },
                        { metric: 'COGS', value: 30625 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4c3d6b" />
                        <XAxis dataKey="metric" stroke="#9f8fd4" fontSize={12} fontWeight={500} />
                        <YAxis stroke="#9f8fd4" fontSize={12} fontWeight={500} tickFormatter={(value) => formatCurrency(value)} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" fill={CHART_COLORS.secondary} radius={[10, 10, 0, 0]}>
                          <LabelList dataKey="value" position="top" className="fill-white" fontSize={11} fontWeight={600} formatter={(value: number) => formatCurrency(value)} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                    </div>
              )}

              {/* Display Campaigns: Active View */}
              {hasDisplayCampaigns && (
                <div className="chart-card backdrop-blur-sm border border-solid">
                  <div className="flex items-center gap-2 justify-center mb-1">
                    <ImageIcon className="w-4 h-4 text-yellow-400 opacity-80" />
                    <h3 className="!text-center">Active View Metrics</h3>
                  </div>
                  <p className="chart-description">Display ad viewability scores</p>
                  <ChartContainer
                    config={{
                      percentage: { label: "Percentage", color: CHART_COLORS.tertiary }
                    }}
                    className="h-[320px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart 
                        cx="50%" 
                        cy="50%" 
                        innerRadius="30%" 
                        outerRadius="100%"
                        data={[
                          { name: 'Viewability', value: 90, fill: CHART_COLORS.secondary },
                          { name: 'Measurability', value: 95, fill: CHART_COLORS.tertiary }
                        ]}
                      >
                        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                        <RadialBar background dataKey="value" angleAxisId={0} label={{ position: 'insideStart', fill: '#fff', fontSize: 12, fontWeight: 600 }} />
                        <Legend iconSize={12} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px', fontWeight: 500 }} />
                        <Tooltip content={<CustomTooltip />} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              )}
            </div>
          )}

          {/* Device Performance - Bar Chart */}
          {devicePerformanceData.length > 0 && (
            <div className="chart-card backdrop-blur-sm border border-solid">
              <h3>Device Performance</h3>
              <p className="chart-description">Metrics breakdown by device type</p>
              <ChartContainer
                config={{
                  impressions: { label: "Impressions", color: CHART_COLORS.primary },
                  clicks: { label: "Clicks", color: CHART_COLORS.secondary },
                  conversions: { label: "Conversions", color: CHART_COLORS.quaternary }
                }}
                className="h-[320px]"
              >
                <ResponsiveContainer width="100%" height="100%" style={{ margin: '0 auto' }}>
                  <BarChart data={devicePerformanceData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4c3d6b" />
                    <XAxis dataKey="device" stroke="#9f8fd4" fontSize={12} fontWeight={500} />
                    <YAxis stroke="#9f8fd4" fontSize={12} fontWeight={500} tickFormatter={(value) => formatLargeNumber(value)} />
                    <Tooltip content={<CustomTooltip />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="impressions" fill={CHART_COLORS.primary} radius={[10, 10, 0, 0]} />
                    <Bar dataKey="clicks" fill={CHART_COLORS.secondary} radius={[10, 10, 0, 0]} />
                    <Bar dataKey="conversions" fill={CHART_COLORS.quaternary} radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          )}

          {/* Additional Advanced Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conversion Funnel - Purple Gradient */}
            <div className="chart-card backdrop-blur-sm border border-solid">
              <div className="flex items-center gap-2 justify-center mb-1">
                <Filter className="w-4 h-4 text-purple-400 opacity-80" />
                <h3 className="!text-center">Conversion Funnel</h3>
              </div>
              <p className="chart-description">User journey from impression to conversion</p>
              {/* البيانات تأتي من API - إذا لم توجد بيانات يظهر رسالة */}
              {metrics.impressions > 0 ? (
              <ChartContainer
                config={{
                  value: { label: "Count", color: CHART_COLORS.primary }
                }}
                className="h-[320px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={[
                      { stage: 'Impressions', value: metrics.impressions || 0, percentage: 100 },
                      { stage: 'Clicks', value: metrics.clicks || 0, percentage: metrics.impressions > 0 ? ((metrics.clicks || 0) / metrics.impressions * 100).toFixed(1) : 0 },
                      { stage: 'Conversions', value: metrics.conversions || 0, percentage: metrics.clicks > 0 ? ((metrics.conversions || 0) / metrics.clicks * 100).toFixed(1) : 0 }
                    ]}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#4c3d6b" />
                    <XAxis type="number" stroke="#9f8fd4" fontSize={12} fontWeight={500} tickFormatter={(value) => formatLargeNumber(value)} />
                    <YAxis type="category" dataKey="stage" stroke="#9f8fd4" fontSize={12} fontWeight={500} width={120} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 10, 10, 0]}>
                      {[0, 1, 2].map((index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#8B5CF6' : index === 1 ? '#A855F7' : '#C084FC'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
              ) : (
                <div className="h-[320px] flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Filter className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No funnel data available</p>
                  </div>
                </div>
              )}
            </div>

            {/* CTR vs CPC Trend - Purple/Cyan Theme */}
            <div className="chart-card backdrop-blur-sm border border-solid">
              <div className="flex items-center gap-2 justify-center mb-1">
                <Percent className="w-4 h-4 text-purple-400 opacity-80" />
                <h3 className="!text-center">CTR vs CPC Trend</h3>
          </div>
              <p className="chart-description">Click rate vs cost per click correlation</p>
              {performanceData.length > 0 ? (
              <ChartContainer
                config={{
                  ctr: { label: "CTR %", color: CHART_COLORS.tertiary },
                  cpc: { label: "CPC $", color: CHART_COLORS.secondary }
                }}
                className="h-[320px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={performanceData.slice(0, 15)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4c3d6b" />
                    <XAxis dataKey="day" stroke="#9f8fd4" fontSize={12} fontWeight={500} />
                    <YAxis yAxisId="left" stroke="#9f8fd4" fontSize={12} fontWeight={500} tickFormatter={(value) => `${value}%`} />
                    <YAxis yAxisId="right" orientation="right" stroke="#9f8fd4" fontSize={12} fontWeight={500} tickFormatter={(value) => `$${value}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line yAxisId="left" type="monotone" dataKey="ctr" stroke="#06B6D4" strokeWidth={2} dot={{ r: 3, fill: '#06B6D4' }} />
                    <Bar yAxisId="right" dataKey="cpc" fill="#EC4899" radius={[6, 6, 0, 0]} opacity={0.8} />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartContainer>
              ) : (
                <div className="h-[320px] flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Percent className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No CTR/CPC data available</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Impression Share Breakdown - Purple Gradient */}
            <div className="chart-card backdrop-blur-sm border border-solid">
              <div className="flex items-center gap-2 justify-center mb-1">
                <TrendingUp className="w-4 h-4 text-purple-400 opacity-80" />
                <h3 className="!text-center">Impression Share Breakdown</h3>
              </div>
              <p className="chart-description">Lost opportunities analysis</p>
              {/* البيانات تأتي من API - إذا لم توجد بيانات يظهر رسالة */}
              {metrics.impressionShare && parseFloat(metrics.impressionShare) > 0 ? (
              <ChartContainer
                config={{
                  value: { label: "Percentage", color: CHART_COLORS.primary }
                }}
                className="h-[320px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={[
                      { metric: 'Search IS', value: parseFloat(metrics.impressionShare) || 0 },
                      { metric: 'Top IS', value: parseFloat(metrics.topImpressionShare) || 0 },
                      { metric: 'Abs Top IS', value: parseFloat(metrics.absTopImpressionShare) || 0 },
                      { metric: 'Lost (Budget)', value: parseFloat(metrics.budgetLostImpressionShare) || 0 },
                      { metric: 'Lost (Rank)', value: parseFloat(metrics.rankLostImpressionShare) || 0 }
                    ]}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#4c3d6b" />
                    <XAxis type="number" domain={[0, 100]} stroke="#9f8fd4" fontSize={12} fontWeight={500} tickFormatter={(value) => `${value}%`} />
                    <YAxis type="category" dataKey="metric" stroke="#9f8fd4" fontSize={12} fontWeight={500} width={120} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 10, 10, 0]}>
                      {[0, 1, 2, 3, 4].map((index, i) => (
                        <Cell key={`cell-${index}`} fill={
                          i === 0 ? '#8B5CF6' :
                          i === 1 ? '#A855F7' :
                          i === 2 ? '#06B6D4' :
                          i === 3 ? '#EC4899' : '#F472B6'
                        } />
                      ))}
                      <LabelList dataKey="value" position="right" className="fill-white" fontSize={11} fontWeight={600} formatter={(value: number) => `${value}%`} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
              ) : (
                <div className="h-[320px] flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No impression share data available</p>
                  </div>
                </div>
              )}
                </div>

            {/* Cost Analysis Over Time - Purple Theme */}
            <div className="chart-card backdrop-blur-sm border border-solid">
              <div className="flex items-center gap-2 justify-center mb-1">
                <DollarSign className="w-4 h-4 text-purple-400 opacity-80" />
                <h3 className="!text-center">Cost Analysis</h3>
              </div>
              <p className="chart-description">Spending trends and optimization</p>
              {performanceData.length > 0 ? (
              <ChartContainer
                config={{
                  cpc: { label: "Avg CPC", color: '#8B5CF6' },
                  cpm: { label: "Avg CPM", color: '#EC4899' },
                  costPerConversion: { label: "Cost/Conv", color: '#06B6D4' }
                }}
                className="h-[320px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData.slice(0, 15).map(d => ({
                    ...d,
                    cpm: d.impressions > 0 ? (d.cost / d.impressions * 1000).toFixed(2) : 0,
                    costPerConversion: d.conversions > 0 ? (d.cost / d.conversions).toFixed(2) : 0
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4c3d6b" />
                    <XAxis dataKey="day" stroke="#9f8fd4" fontSize={12} fontWeight={500} />
                    <YAxis stroke="#9f8fd4" fontSize={12} fontWeight={500} />
                    <Tooltip content={<CustomTooltip />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line type="monotone" dataKey="cpc" stroke="#8B5CF6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="cpm" stroke="#EC4899" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="costPerConversion" stroke="#06B6D4" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
              ) : (
                <div className="h-[320px] flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No cost data available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Geographic Performance - Cyan Gradient */}
            <div className="chart-card backdrop-blur-sm border border-solid">
              <div className="flex items-center gap-2 justify-center mb-1">
                <MapPin className="w-4 h-4 text-cyan-400 opacity-80" />
                <h3 className="!text-center">Top Locations</h3>
          </div>
              <p className="chart-description">Performance by geographic region</p>
              {/* البيانات تأتي من API - إذا لم توجد بيانات يظهر رسالة */}
              {metrics.locationData && metrics.locationData.length > 0 ? (
              <ChartContainer
                config={{
                  conversions: { label: "Conversions", color: '#06B6D4' }
                }}
                className="h-[320px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={metrics.locationData}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#4c3d6b" />
                    <XAxis type="number" stroke="#9f8fd4" fontSize={12} fontWeight={500} />
                    <YAxis type="category" dataKey="location" stroke="#9f8fd4" fontSize={12} fontWeight={500} width={80} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="conversions" radius={[0, 10, 10, 0]}>
                      {(metrics.locationData || []).map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={`rgba(6, 182, 212, ${1 - index * 0.15})`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
              ) : (
                <div className="h-[320px] flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No location data available</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Budget Pacing - Purple/Pink Theme */}
            <div className="chart-card backdrop-blur-sm border border-solid">
              <div className="flex items-center gap-2 justify-center mb-1">
                <TrendingDown className="w-4 h-4 text-purple-400 opacity-80" />
                <h3 className="!text-center">Budget Pacing</h3>
              </div>
              <p className="chart-description">Daily budget consumption rate</p>
              {performanceData.length > 0 ? (
              <ChartContainer
                config={{
                  actual: { label: "Actual Spend", color: '#EC4899' },
                  planned: { label: "Planned Budget", color: '#8B5CF6' }
                }}
                className="h-[320px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData.slice(0, 15).map((d, i) => ({
                    day: d.day,
                    actual: d.cost * (i + 1),
                    planned: (metrics.totalSpend || 0) / performanceData.length * (i + 1)
                  }))}>
                    <defs>
                      <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EC4899" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#EC4899" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="plannedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4c3d6b" />
                    <XAxis dataKey="day" stroke="#9f8fd4" fontSize={12} fontWeight={500} />
                    <YAxis stroke="#9f8fd4" fontSize={12} fontWeight={500} />
                    <Tooltip content={<CustomTooltip />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area type="monotone" dataKey="planned" stroke="#8B5CF6" fillOpacity={1} fill="url(#plannedGrad)" strokeDasharray="5 5" />
                    <Area type="monotone" dataKey="actual" stroke="#EC4899" fillOpacity={1} fill="url(#actualGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
              ) : (
                <div className="h-[320px] flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <TrendingDown className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No budget data available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Audience Demographics - Purple/Pink Bars */}
            <div className="chart-card backdrop-blur-sm border border-solid">
              <div className="flex items-center gap-2 justify-center mb-1">
                <Users className="w-4 h-4 text-purple-400 opacity-80" />
                <h3 className="!text-center">Audience Demographics</h3>
          </div>
              <p className="chart-description">Audience breakdown by age and gender</p>
              {/* البيانات تأتي من API - إذا لم توجد بيانات يظهر رسالة */}
              {metrics.demographicsData && metrics.demographicsData.length > 0 ? (
              <ChartContainer
                config={{
                  male: { label: "Male", color: '#8B5CF6' },
                  female: { label: "Female", color: '#EC4899' }
                }}
                className="h-[320px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.demographicsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4c3d6b" />
                    <XAxis dataKey="ageGroup" stroke="#9f8fd4" fontSize={12} fontWeight={500} />
                    <YAxis stroke="#9f8fd4" fontSize={12} fontWeight={500} />
                    <Tooltip content={<CustomTooltip />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="male" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="female" fill="#EC4899" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
              ) : (
                <div className="h-[320px] flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No demographics data available</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* ROAS Trend - Purple Gradient */}
            <div className="chart-card backdrop-blur-sm border border-solid">
              <div className="flex items-center gap-2 justify-center mb-1">
                <Activity className="w-4 h-4 text-purple-400 opacity-80" />
                <h3 className="!text-center">ROAS Trend</h3>
              </div>
              <p className="chart-description">Return on ad spend over time</p>
              {performanceData.length > 0 ? (
              <ChartContainer
                config={{
                  roas: { label: "ROAS", color: '#A855F7' }
                }}
                className="h-[320px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData.slice(0, 15)}>
                    <defs>
                      <linearGradient id="roasGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#A855F7" stopOpacity={0.8}/>
                        <stop offset="50%" stopColor="#EC4899" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#EC4899" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4c3d6b" />
                    <XAxis dataKey="day" stroke="#9f8fd4" fontSize={12} fontWeight={500} />
                    <YAxis stroke="#9f8fd4" fontSize={12} fontWeight={500} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="roas" stroke="#A855F7" strokeWidth={2} fillOpacity={1} fill="url(#roasGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
              ) : (
                <div className="h-[320px] flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No ROAS data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Campaigns Table */}
        {campaigns.length === 0 && !isLoading ? (
          /* Empty State */
          <div className="empty-state">
            <div className="empty-state-icon">
              <BarChart3 className="w-10 h-10 text-purple-400 opacity-60" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {isRTL ? 'لا توجد حملات بعد' : 'No Campaigns Yet'}
            </h3>
            <p className="text-gray-400 mb-6 max-w-md">
              {isRTL 
                ? 'أنشئ أول حملة إعلانية لبدء تتبع الأداء وتحقيق أهدافك التسويقية'
                : 'Create your first advertising campaign to start tracking performance and achieve your marketing goals'
              }
            </p>
            <button className="create-campaign-btn" onClick={() => router.push('/campaign/new')}>
              <Plus className="w-5 h-5" />
              {isRTL ? 'إنشاء حملة جديدة' : 'Create Campaign'}
            </button>
          </div>
        ) : (
        <div className="table-card backdrop-blur-sm border border-solid">
          {/* Bulk Actions */}
          {selectedCampaigns.length > 0 && (
            <div className="bulk-actions mb-4">
              <span className="text-sm text-gray-400">
                {selectedCampaigns.length} {isRTL ? 'محدد' : 'selected'}
              </span>
              <button className="bulk-action-btn" onClick={() => handleBulkAction('enable')}>
                <Play className="w-3 h-3" />
                {isRTL ? 'تفعيل' : 'Enable'}
              </button>
              <button className="bulk-action-btn" onClick={() => handleBulkAction('pause')}>
                <Pause className="w-3 h-3" />
                {isRTL ? 'إيقاف' : 'Pause'}
              </button>
              <button className="bulk-action-btn danger" onClick={() => handleBulkAction('delete')}>
                <XCircle className="w-3 h-3" />
                {isRTL ? 'حذف' : 'Delete'}
              </button>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
              <List className="w-6 h-6 text-purple-400" />
              <span>{(t.dashboard as any)?.allCampaigns || 'All Campaigns'}</span>
            </h2>
            
            {/* Campaign Type Filter */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedCampaignType('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedCampaignType === 'all'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/50'
                    : 'bg-purple-900/30 text-purple-300 hover:bg-purple-900/50 border border-purple-900/30'
                }`}
              >
                All
              </button>
              {['SEARCH', 'VIDEO', 'SHOPPING', 'DISPLAY', 'PERFORMANCE_MAX'].map(type => {
                const count = campaigns.filter(c => c.type === type).length;
                if (count === 0) return null;
                
        return (
                  <button
                    key={type}
                    onClick={() => setSelectedCampaignType(type)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedCampaignType === type
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/50'
                        : 'bg-purple-900/30 text-purple-300 hover:bg-purple-900/50 border border-purple-900/30'
                    }`}
                  >
                    {type.replace('_', ' ')} ({count})
                  </button>
                );
              })}
            </div>
            </div>
            
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#392e4e]">
                  <th className="py-4 px-2 w-10">
                    <input 
                      type="checkbox" 
                      checked={selectedCampaigns.length === paginatedCampaigns.length && paginatedCampaigns.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-purple-500 bg-transparent text-purple-600 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
                    />
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-white/70">Status</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-white/70">Campaign</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-white/70">Type</th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-white/70">Impressions</th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-white/70">Clicks</th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-white/70">CTR</th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-white/70">Conversions</th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-white/70">Spend</th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-white/70">ROAS</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-white/70">{isRTL ? 'الصحة' : 'Health'}</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-white/70">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCampaigns.map((campaign) => (
                  <tr 
                    key={campaign.id} 
                    className={`border-b border-[#392e4e]/50 hover:bg-[#392e4e]/20 transition-colors ${
                      selectedCampaigns.includes(campaign.id) ? 'bg-purple-900/20' : ''
                    }`}
                  >
                    <td className="py-4 px-2">
                      <input 
                        type="checkbox" 
                        checked={selectedCampaigns.includes(campaign.id)}
                        onChange={() => toggleSelectCampaign(campaign.id)}
                        className="w-4 h-4 rounded border-purple-500 bg-transparent text-purple-600 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => toggleCampaignStatus(campaign.id, campaign.status)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          campaign.status === 'ENABLED' ? 'bg-green-600' : 'bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            campaign.status === 'ENABLED' ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm font-medium text-white">{campaign.name}</div>
                      <div className="text-xs text-gray-500">ID: {campaign.id}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-300">
                        {campaign.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right text-sm text-white">
                      {(campaign.impressions || 0).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right text-sm text-white">
                      {(campaign.clicks || 0).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right text-sm text-white">
                      {(campaign.ctr || 0).toFixed(2)}%
                    </td>
                    <td className="py-4 px-4 text-right text-sm text-white">
                      {(campaign.conversions || 0).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right text-sm text-white">
                      ${(campaign.cost || 0).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className={`text-sm font-medium ${
                        (campaign.roas || 0) >= 3 ? 'text-green-400' : 
                        (campaign.roas || 0) >= 1 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {(campaign.roas || 0).toFixed(2)}x
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-lg font-bold ${getHealthColor(calculateHealthScore(campaign))}`}>
                          {calculateHealthScore(campaign)}
                        </span>
                        <div className="w-12 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              calculateHealthScore(campaign) >= 80 ? 'bg-green-500' :
                              calculateHealthScore(campaign) >= 60 ? 'bg-yellow-500' :
                              calculateHealthScore(campaign) >= 40 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${calculateHealthScore(campaign)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => router.push(`/campaign/edit-ads?campaignId=${campaign.id}`)}
                          className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                          title="Edit campaign"
                        >
                          <Edit className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => toggleCampaignStatus(campaign.id, campaign.status)}
                          className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                          title={campaign.status === 'ENABLED' ? 'Pause' : 'Resume'}
                        >
                          {campaign.status === 'ENABLED' ? (
                            <Pause className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Play className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#392e4e]">
              <div className="text-sm text-white/60">
                Showing {((currentPage - 1) * campaignsPerPage) + 1} to {Math.min(currentPage * campaignsPerPage, filteredCampaigns.length)} of {filteredCampaigns.length} campaigns
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 hover:bg-purple-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-purple-900/30"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-400" />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      currentPage === page
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/50'
                        : 'hover:bg-purple-900/30 text-purple-300 border border-purple-900/30'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 hover:bg-purple-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-purple-900/30"
                >
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          )}
          </div>
        )}
        
        {/* Keyboard Shortcuts Hint */}
        <div className="shortcuts-hint">
          <kbd>⌘N</kbd> {isRTL ? 'حملة جديدة' : 'New Campaign'} · <kbd>R</kbd> {isRTL ? 'تحديث' : 'Refresh'} · <kbd>Esc</kbd> {isRTL ? 'إلغاء' : 'Cancel'}
          </div>
      </div>
    </div>
  );
};

export default DashboardPage;
