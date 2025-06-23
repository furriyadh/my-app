'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo, use } from "react";
import { GoogleMap, useLoadScript, Marker, Circle, StandaloneSearchBox } from "@react-google-maps/api";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Globe, Target, DollarSign, Upload, Play, Brain, Sparkles, Star, Zap, TrendingUp, BarChart3, Settings, Lightbulb, Rocket, Monitor, Smartphone, Tablet, Clock, Calendar, Award, Shield, CheckCircle, AlertCircle, Info, Phone, UploadCloud, FileText, Image as ImageIcon, Video as VideoIcon, Users, Eye, ShoppingBag, Plus, Search, X, Check, MapPin, Home, Map, LineChart, PieChart, Activity, Cpu, Sliders, Timer, Sun, Moon, Coffee, Trash2, Copy, PlusCircle, Globe2, Wand2, Key, Languages, UserCheck, Bot, BarChart, Maximize, ExternalLink } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler);

// إصلاح مشكلة toLowerCase
const safeToLowerCase = (value: any): string => {
  if (typeof value === 'string') return value.toLowerCase();
  if (value && typeof value.toString === 'function') return value.toString().toLowerCase();
  return 'unknown';
};

// ----------------------------------------
// TYPES & INTERFACES
// ----------------------------------------

type Libraries = ("places" | "geometry" | "visualization")[];
const libraries: Libraries = ["places", "geometry", "visualization"];

interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  population?: number;
  type: string;
  radius: number;
}

interface Keyword {
  id: string;
  text: string;
  searchVolume: number;
  competition: string;
  cpc: number;
  type: string;
  matchType: string;
}

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  days: string[];
}

interface AudienceItem {
  id: string;
  label: string;
  percentage: number;
  selected: boolean;
}

interface AudienceData {
  ageGroups: AudienceItem[];
  genders: AudienceItem[];
  interests: AudienceItem[];
}

interface AdAsset {
  id: string;
  type: 'headline' | 'description' | 'image' | 'video' | 'phone';
  content: string;
  file?: File;
  preview?: string;
  performance?: {
    ctr: number;
    impressions: number;
    clicks: number;
  };
}

interface CampaignGoal {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  metrics: string[];
}

interface CampaignType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
  bestFor: string[];
}

interface BiddingStrategy {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  pros: string[];
  cons: string[];
}

interface DevicePerformance {
  desktop: { impressions: number; clicks: number; ctr: number; cost: number };
  mobile: { impressions: number; clicks: number; ctr: number; cost: number };
  tablet: { impressions: number; clicks: number; ctr: number; cost: number };
}

interface PerformancePrediction {
  scenario: string;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  roas: number;
  confidence: number;
}

// ----------------------------------------
// CONSTANTS & DATA
// ----------------------------------------

const CAMPAIGN_GOALS: CampaignGoal[] = [
  {
    id: 'sales',
    name: 'زيادة المبيعات',
    description: 'تحويل الزوار إلى عملاء وزيادة الإيرادات',
    icon: <ShoppingBag className="w-6 h-6" />,
    color: 'from-green-500 to-emerald-500',
    metrics: ['التحويلات', 'قيمة الطلب', 'عائد الاستثمار']
  },
  {
    id: 'leads',
    name: 'جمع العملاء المحتملين',
    description: 'الحصول على معلومات العملاء المهتمين',
    icon: <Users className="w-6 h-6" />,
    color: 'from-blue-500 to-cyan-500',
    metrics: ['العملاء المحتملون', 'تكلفة العميل', 'معدل التحويل']
  },
  {
    id: 'traffic',
    name: 'زيادة زيارات الموقع',
    description: 'جذب المزيد من الزوار إلى موقعك',
    icon: <TrendingUp className="w-6 h-6" />,
    color: 'from-purple-500 to-pink-500',
    metrics: ['الزيارات', 'مدة الجلسة', 'معدل الارتداد']
  },
  {
    id: 'awareness',
    name: 'زيادة الوعي بالعلامة التجارية',
    description: 'تعريف الجمهور بعلامتك التجارية',
    icon: <Eye className="w-6 h-6" />,
    color: 'from-orange-500 to-red-500',
    metrics: ['مرات الظهور', 'الوصول', 'التفاعل']
  }
];

const CAMPAIGN_TYPES: CampaignType[] = [
  {
    id: 'search',
    name: 'حملة البحث',
    description: 'إعلانات نصية تظهر في نتائج البحث',
    icon: <Search className="w-6 h-6" />,
    color: 'from-blue-500 to-indigo-500',
    features: ['استهداف الكلمات المفتاحية', 'إعلانات نصية', 'روابط الموقع'],
    bestFor: ['البحث عن المنتجات', 'الخدمات المحلية', 'العلامات التجارية']
  },
  {
    id: 'display',
    name: 'حملة العرض',
    description: 'إعلانات مرئية على مواقع الشبكة',
    icon: <Monitor className="w-6 h-6" />,
    color: 'from-purple-500 to-pink-500',
    features: ['إعلانات مرئية', 'استهداف الاهتمامات', 'إعادة الاستهداف'],
    bestFor: ['زيادة الوعي', 'الوصول الواسع', 'العروض المرئية']
  },
  {
    id: 'shopping',
    name: 'حملة التسوق',
    description: 'عرض المنتجات مع الأسعار والصور',
    icon: <ShoppingBag className="w-6 h-6" />,
    color: 'from-green-500 to-teal-500',
    features: ['صور المنتجات', 'الأسعار', 'معلومات المتجر'],
    bestFor: ['التجارة الإلكترونية', 'المنتجات المادية', 'المقارنات']
  },
  {
    id: 'video',
    name: 'حملة الفيديو',
    description: 'إعلانات فيديو على يوتيوب والشبكة',
    icon: <VideoIcon className="w-6 h-6" />,
    color: 'from-red-500 to-orange-500',
    features: ['إعلانات فيديو', 'يوتيوب', 'تفاعل عالي'],
    bestFor: ['القصص المرئية', 'العروض التوضيحية', 'الترفيه']
  }
];

const BIDDING_STRATEGIES: BiddingStrategy[] = [
  {
    id: 'maximize_conversions',
    name: 'تعظيم التحويلات',
    description: 'الحصول على أكبر عدد من التحويلات ضمن الميزانية',
    icon: <Target className="w-6 h-6" />,
    color: 'from-green-500 to-emerald-500',
    pros: ['تحسين تلقائي', 'سهولة الإدارة', 'نتائج سريعة'],
    cons: ['تحكم أقل في التكلفة', 'يحتاج بيانات كافية']
  },
  {
    id: 'target_cpa',
    name: 'تكلفة الاكتساب المستهدفة',
    description: 'تحديد التكلفة المرغوبة لكل تحويل',
    icon: <DollarSign className="w-6 h-6" />,
    color: 'from-blue-500 to-cyan-500',
    pros: ['تحكم في التكلفة', 'قابلية التنبؤ', 'مناسب للميزانيات المحددة'],
    cons: ['قد يقلل الحجم', 'يحتاج تحسين مستمر']
  },
  {
    id: 'maximize_clicks',
    name: 'تعظيم النقرات',
    description: 'الحصول على أكبر عدد من النقرات ضمن الميزانية',
    icon: <Zap className="w-6 h-6" />,
    color: 'from-yellow-500 to-orange-500',
    pros: ['زيادة الزيارات', 'مناسب للمواقع الجديدة', 'بناء البيانات'],
    cons: ['جودة أقل للزيارات', 'تحويلات أقل']
  },
  {
    id: 'target_roas',
    name: 'عائد الإنفاق الإعلاني المستهدف',
    description: 'تحديد العائد المرغوب لكل ريال مُنفق',
    icon: <TrendingUp className="w-6 h-6" />,
    color: 'from-purple-500 to-pink-500',
    pros: ['تحسين الربحية', 'مناسب للتجارة الإلكترونية', 'قياس واضح'],
    cons: ['يحتاج بيانات تحويل دقيقة', 'معقد للمبتدئين']
  }
];

// ----------------------------------------
// MAIN COMPONENT
// ----------------------------------------

const EnhancedNewCampaignMasterFinal: React.FC = () => {
  // ----------------------------------------
  // STATE MANAGEMENT
  // ----------------------------------------
  
  const [currentStep, setCurrentStep] = useState(1);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [extractedKeywords, setExtractedKeywords] = useState<Keyword[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<Location[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [selectedCampaignType, setSelectedCampaignType] = useState<string>('');
  const [selectedBiddingStrategy, setSelectedBiddingStrategy] = useState<string>('');
  const [budget, setBudget] = useState<number>(100);
  const [budgetType, setBudgetType] = useState<'daily' | 'total'>('daily');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [audienceData, setAudienceData] = useState<AudienceData>({
    ageGroups: [],
    genders: [],
    interests: []
  });
  const [adAssets, setAdAssets] = useState<AdAsset[]>([]);
  const [performancePredictions, setPerformancePredictions] = useState<PerformancePrediction[]>([]);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  // Google Maps
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ----------------------------------------
  // UTILITY FUNCTIONS
  // ----------------------------------------

  const generateStars = () => {
    return Array.from({ length: 50 }, (_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-white rounded-full opacity-70"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          opacity: [0.3, 1, 0.3],
          scale: [0.5, 1, 0.5],
        }}
        transition={{
          duration: Math.random() * 3 + 2,
          repeat: Infinity,
          delay: Math.random() * 2,
        }}
      />
    ));
  };

  const generateFloatingParticles = () => {
    return Array.from({ length: 20 }, (_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-60"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [0, -100, 0],
          x: [0, Math.random() * 50 - 25, 0],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: Math.random() * 10 + 5,
          repeat: Infinity,
          delay: Math.random() * 5,
        }}
      />
    ));
  };

  // ----------------------------------------
  // ANALYSIS FUNCTIONS
  // ----------------------------------------

  const analyzeWebsite = async () => {
    if (!websiteUrl) return;
    
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setShowAnalysisModal(true);
    
    // Simulate analysis progress
    const progressSteps = [
      { progress: 20, message: 'فحص بنية الموقع...' },
      { progress: 40, message: 'استخراج الكلمات المفتاحية...' },
      { progress: 60, message: 'تحليل المحتوى...' },
      { progress: 80, message: 'تحليل المنافسين...' },
      { progress: 100, message: 'اكتمل التحليل!' }
    ];
    
    for (const step of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalysisProgress(step.progress);
    }
    
    // Generate mock keywords
    const mockKeywords: Keyword[] = [
      { id: '1', text: 'خدمات تقنية', searchVolume: 12000, competition: 'متوسط', cpc: 2.5, type: 'broad', matchType: 'واسع' },
      { id: '2', text: 'تطوير مواقع', searchVolume: 8500, competition: 'عالي', cpc: 4.2, type: 'phrase', matchType: 'عبارة' },
      { id: '3', text: 'تصميم تطبيقات', searchVolume: 6200, competition: 'منخفض', cpc: 1.8, type: 'exact', matchType: 'مطابق' },
      { id: '4', text: 'استشارات تقنية', searchVolume: 4100, competition: 'متوسط', cpc: 3.1, type: 'broad', matchType: 'واسع' },
      { id: '5', text: 'حلول برمجية', searchVolume: 9800, competition: 'عالي', cpc: 5.0, type: 'phrase', matchType: 'عبارة' }
    ];
    
    setExtractedKeywords(mockKeywords);
    setAnalysisComplete(true);
    setIsAnalyzing(false);
    
    setTimeout(() => {
      setShowAnalysisModal(false);
    }, 2000);
  };

  // ----------------------------------------
  // STEP NAVIGATION
  // ----------------------------------------

  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // ----------------------------------------
  // STEP 1: تحليل الموقع الإلكتروني
  // ----------------------------------------
  
  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/50 to-purple-900/50 p-8 backdrop-blur-sm border border-blue-500/20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="absolute inset-0">{generateStars()}</div>
        
        <motion.div
          className="relative z-10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-center mb-4">
            <motion.div
              className="p-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg"
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Brain className="w-8 h-8 text-white" />
            </motion.div>
          </div>
          
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            تحليل الموقع الإلكتروني بالذكاء الاصطناعي
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            دعنا نحلل موقعك الإلكتروني بتقنيات الذكاء الاصطناعي المتطورة لاستخراج أفضل الكلمات المفتاحية وفهم جمهورك المستهدف
          </p>
        </motion.div>
      </div>

      {/* Website Analysis */}
      <div className="bg-gradient-to-br from-gray-900/80 to-blue-900/40 rounded-2xl p-8 backdrop-blur-sm border border-blue-500/20">
        <div className="flex items-center mb-6">
          <Globe className="w-6 h-6 text-blue-400 ml-3" />
          <h3 className="text-2xl font-bold text-white">تحليل الموقع الإلكتروني</h3>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              رابط الموقع الإلكتروني
            </label>
            <div className="relative">
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
          
          <motion.button
            onClick={analyzeWebsite}
            disabled={!websiteUrl || isAnalyzing}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isAnalyzing ? (
              <>
                <motion.div
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span>جاري التحليل...</span>
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                <span>تحليل الموقع بالذكاء الاصطناعي</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Analysis Results */}
      {analysisComplete && extractedKeywords.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-900/40 to-blue-900/40 rounded-2xl p-8 backdrop-blur-sm border border-green-500/20"
        >
          <div className="flex items-center mb-6">
            <CheckCircle className="w-6 h-6 text-green-400 ml-3" />
            <h3 className="text-2xl font-bold text-white">نتائج التحليل</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {extractedKeywords.map((keyword) => (
              <motion.div
                key={keyword.id}
                className="p-4 bg-gray-800/50 rounded-xl border border-gray-600"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white">{keyword.text}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    keyword.competition === 'عالي' ? 'bg-red-500/20 text-red-400' :
                    keyword.competition === 'متوسط' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {keyword.competition}
                  </span>
                </div>
                <div className="text-sm text-gray-400 space-y-1">
                  <div>حجم البحث: {keyword.searchVolume.toLocaleString()}</div>
                  <div>تكلفة النقرة: {keyword.cpc} ر.س</div>
                  <div>نوع المطابقة: {keyword.matchType}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );

  // ----------------------------------------
  // STEP 2: الكلمات المفتاحية الذكية
  // ----------------------------------------
  
  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-900/50 to-teal-900/50 p-8 backdrop-blur-sm border border-green-500/20">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-teal-600/10" />
        <div className="absolute inset-0">{generateStars()}</div>
        
        <motion.div
          className="relative z-10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-center mb-4">
            <motion.div
              className="p-4 rounded-full bg-gradient-to-r from-green-500 to-teal-500 shadow-lg"
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Key className="w-8 h-8 text-white" />
            </motion.div>
          </div>
          
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
            الكلمات المفتاحية الذكية
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            اختر الكلمات المفتاحية الأكثر فعالية لحملتك الإعلانية بناءً على تحليل الذكاء الاصطناعي
          </p>
        </motion.div>
      </div>

      {/* Keywords Selection */}
      <div className="bg-gradient-to-br from-gray-900/80 to-green-900/40 rounded-2xl p-8 backdrop-blur-sm border border-green-500/20">
        <div className="flex items-center mb-6">
          <Key className="w-6 h-6 text-green-400 ml-3" />
          <h3 className="text-2xl font-bold text-white">اختيار الكلمات المفتاحية</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {extractedKeywords.map((keyword) => (
            <motion.div
              key={keyword.id}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                selectedKeywords.includes(keyword.id)
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-gray-600 bg-gray-800/50 hover:border-green-400'
              }`}
              onClick={() => {
                setSelectedKeywords(prev => 
                  prev.includes(keyword.id)
                    ? prev.filter(id => id !== keyword.id)
                    : [...prev, keyword.id]
                );
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-white">{keyword.text}</span>
                {selectedKeywords.includes(keyword.id) && (
                  <Check className="w-5 h-5 text-green-400" />
                )}
              </div>
              <div className="text-sm text-gray-400 space-y-1">
                <div className="flex justify-between">
                  <span>حجم البحث:</span>
                  <span className="text-white">{keyword.searchVolume.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>تكلفة النقرة:</span>
                  <span className="text-white">{keyword.cpc} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span>المنافسة:</span>
                  <span className={`${
                    keyword.competition === 'عالي' ? 'text-red-400' :
                    keyword.competition === 'متوسط' ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {keyword.competition}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {selectedKeywords.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl"
          >
            <div className="flex items-center mb-2">
              <CheckCircle className="w-5 h-5 text-green-400 ml-2" />
              <span className="text-white font-semibold">تم اختيار {selectedKeywords.length} كلمة مفتاحية</span>
            </div>
            <p className="text-sm text-gray-300">
              الكلمات المختارة ستساعد في استهداف الجمهور المناسب وتحقيق أفضل النتائج لحملتك الإعلانية
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );

  // ----------------------------------------
  // STEP 3: الاستهداف الجغرافي
  // ----------------------------------------
  
  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/50 to-pink-900/50 p-8 backdrop-blur-sm border border-purple-500/20">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10" />
        <div className="absolute inset-0">{generateStars()}</div>
        
        <motion.div
          className="relative z-10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-center mb-4">
            <motion.div
              className="p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg"
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <MapPin className="w-8 h-8 text-white" />
            </motion.div>
          </div>
          
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            الاستهداف الجغرافي الذكي
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            حدد المناطق الجغرافية التي تريد استهدافها بدقة عالية باستخدام خرائط Google التفاعلية
          </p>
        </motion.div>
      </div>

      {/* Google Maps Integration */}
      <div className="bg-gradient-to-br from-gray-900/80 to-purple-900/40 rounded-2xl p-8 backdrop-blur-sm border border-purple-500/20">
        <div className="flex items-center mb-6">
          <Map className="w-6 h-6 text-purple-400 ml-3" />
          <h3 className="text-2xl font-bold text-white">خريطة الاستهداف التفاعلية</h3>
        </div>
        
        {isLoaded ? (
          <div className="space-y-6">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="ابحث عن مدينة أو منطقة..."
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            
            <div className="h-96 rounded-xl overflow-hidden border border-gray-600">
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={{ lat: 24.7136, lng: 46.6753 }} // Riyadh
                zoom={6}
                onLoad={setMap}
                options={{
                  styles: [
                    {
                      featureType: "all",
                      elementType: "geometry",
                      stylers: [{ color: "#1f2937" }]
                    },
                    {
                      featureType: "water",
                      elementType: "geometry",
                      stylers: [{ color: "#374151" }]
                    },
                    {
                      featureType: "road",
                      elementType: "geometry",
                      stylers: [{ color: "#4b5563" }]
                    }
                  ]
                }}
              >
                {searchInputRef.current && (
                  <StandaloneSearchBox
                    onLoad={setSearchBox}
                    onPlacesChanged={() => {
                      if (searchBox) {
                        const places = searchBox.getPlaces();
                        if (places && places.length > 0) {
                          const place = places[0];
                          if (place.geometry?.location) {
                            map?.panTo(place.geometry.location);
                            map?.setZoom(10);
                          }
                        }
                      }
                    }}
                  >
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="ابحث عن مدينة أو منطقة..."
                      className="hidden"
                    />
                  </StandaloneSearchBox>
                )}
                
                {selectedLocations.map((location) => (
                  <React.Fragment key={location.id}>
                    <Marker
                      position={{ lat: location.lat, lng: location.lng }}
                      title={location.name}
                    />
                    <Circle
                      center={{ lat: location.lat, lng: location.lng }}
                      radius={location.radius * 1000}
                      options={{
                        fillColor: '#8b5cf6',
                        fillOpacity: 0.2,
                        strokeColor: '#8b5cf6',
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                      }}
                    />
                  </React.Fragment>
                ))}
              </GoogleMap>
            </div>
          </div>
        ) : (
          <div className="h-96 bg-gray-800/50 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <motion.div
                className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p className="text-gray-400">جاري تحميل الخريطة...</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Location Selection */}
      <div className="bg-gradient-to-br from-gray-900/80 to-purple-900/40 rounded-2xl p-8 backdrop-blur-sm border border-purple-500/20">
        <div className="flex items-center mb-6">
          <Globe2 className="w-6 h-6 text-purple-400 ml-3" />
          <h3 className="text-2xl font-bold text-white">المدن الرئيسية</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { name: 'الرياض', lat: 24.7136, lng: 46.6753, population: 7000000 },
            { name: 'جدة', lat: 21.4858, lng: 39.1925, population: 4000000 },
            { name: 'مكة المكرمة', lat: 21.3891, lng: 39.8579, population: 2000000 },
            { name: 'المدينة المنورة', lat: 24.5247, lng: 39.5692, population: 1500000 },
            { name: 'الدمام', lat: 26.4207, lng: 50.0888, population: 1000000 },
            { name: 'الطائف', lat: 21.2703, lng: 40.4164, population: 600000 },
            { name: 'تبوك', lat: 28.3998, lng: 36.5700, population: 500000 },
            { name: 'أبها', lat: 18.2164, lng: 42.5047, population: 400000 }
          ].map((city) => (
            <motion.button
              key={city.name}
              onClick={() => {
                const newLocation: Location = {
                  id: city.name,
                  name: city.name,
                  lat: city.lat,
                  lng: city.lng,
                  population: city.population,
                  type: 'city',
                  radius: 50
                };
                
                setSelectedLocations(prev => {
                  const exists = prev.find(loc => loc.id === city.name);
                  if (exists) {
                    return prev.filter(loc => loc.id !== city.name);
                  } else {
                    return [...prev, newLocation];
                  }
                });
                
                if (map) {
                  map.panTo({ lat: city.lat, lng: city.lng });
                  map.setZoom(10);
                }
              }}
              className={`p-4 rounded-xl border-2 transition-all duration-300 text-right ${
                selectedLocations.find(loc => loc.id === city.name)
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-gray-600 bg-gray-800/50 hover:border-purple-400'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="font-semibold text-white mb-1">{city.name}</div>
              <div className="text-sm text-gray-400">
                {(city.population / 1000000).toFixed(1)} مليون نسمة
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );

  // ----------------------------------------
  // STEP 4: نوع الحملة والاستراتيجية
  // ----------------------------------------
  
  const renderStep4 = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-900/50 to-orange-900/50 p-8 backdrop-blur-sm border border-red-500/20">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-orange-600/10" />
        <div className="absolute inset-0">{generateStars()}</div>
        
        <motion.div
          className="relative z-10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-center mb-4">
            <motion.div
              className="p-4 rounded-full bg-gradient-to-r from-red-500 to-orange-500 shadow-lg"
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Target className="w-8 h-8 text-white" />
            </motion.div>
          </div>
          
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            نوع الحملة والاستراتيجية
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            اختر نوع الحملة الإعلانية واستراتيجية المزايدة المناسبة لأهدافك التسويقية
          </p>
        </motion.div>
      </div>

      {/* Campaign Goals */}
      <div className="bg-gradient-to-br from-gray-900/80 to-red-900/40 rounded-2xl p-8 backdrop-blur-sm border border-red-500/20">
        <div className="flex items-center mb-6">
          <Target className="w-6 h-6 text-red-400 ml-3" />
          <h3 className="text-2xl font-bold text-white">هدف الحملة</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CAMPAIGN_GOALS.map((goal) => (
            <motion.div
              key={goal.id}
              onClick={() => setSelectedGoal(goal.id)}
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                selectedGoal === goal.id
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-gray-600 bg-gray-800/50 hover:border-red-400'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center mb-4">
                <div className={`p-3 rounded-full bg-gradient-to-r ${goal.color} mr-4`}>
                  {goal.icon}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">{goal.name}</h4>
                  <p className="text-gray-400">{goal.description}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h5 className="font-semibold text-white">المقاييس الرئيسية:</h5>
                <div className="flex flex-wrap gap-2">
                  {goal.metrics.map((metric, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-700/50 rounded-full text-sm text-gray-300"
                    >
                      {metric}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Campaign Types */}
      <div className="bg-gradient-to-br from-gray-900/80 to-red-900/40 rounded-2xl p-8 backdrop-blur-sm border border-red-500/20">
        <div className="flex items-center mb-6">
          <Rocket className="w-6 h-6 text-red-400 ml-3" />
          <h3 className="text-2xl font-bold text-white">نوع الحملة</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CAMPAIGN_TYPES.map((type) => (
            <motion.div
              key={type.id}
              onClick={() => setSelectedCampaignType(type.id)}
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                selectedCampaignType === type.id
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-gray-600 bg-gray-800/50 hover:border-red-400'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center mb-4">
                <div className={`p-3 rounded-full bg-gradient-to-r ${type.color} mr-4`}>
                  {type.icon}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">{type.name}</h4>
                  <p className="text-gray-400">{type.description}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold text-white mb-2">الميزات:</h5>
                  <div className="space-y-1">
                    {type.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-300">
                        <Check className="w-4 h-4 text-green-400 ml-2" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h5 className="font-semibold text-white mb-2">الأنسب لـ:</h5>
                  <div className="flex flex-wrap gap-2">
                    {type.bestFor.map((item, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-700/50 rounded-full text-sm text-gray-300"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bidding Strategies */}
      <div className="bg-gradient-to-br from-gray-900/80 to-red-900/40 rounded-2xl p-8 backdrop-blur-sm border border-red-500/20">
        <div className="flex items-center mb-6">
          <DollarSign className="w-6 h-6 text-red-400 ml-3" />
          <h3 className="text-2xl font-bold text-white">استراتيجية المزايدة</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {BIDDING_STRATEGIES.map((strategy) => (
            <motion.div
              key={strategy.id}
              onClick={() => setSelectedBiddingStrategy(strategy.id)}
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                selectedBiddingStrategy === strategy.id
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-gray-600 bg-gray-800/50 hover:border-red-400'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center mb-4">
                <div className={`p-3 rounded-full bg-gradient-to-r ${strategy.color} mr-4`}>
                  {strategy.icon}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">{strategy.name}</h4>
                  <p className="text-gray-400">{strategy.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-semibold text-green-400 mb-2">المزايا:</h5>
                  <div className="space-y-1">
                    {strategy.pros.map((pro, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-300">
                        <Plus className="w-4 h-4 text-green-400 ml-2" />
                        {pro}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h5 className="font-semibold text-red-400 mb-2">العيوب:</h5>
                  <div className="space-y-1">
                    {strategy.cons.map((con, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-300">
                        <X className="w-4 h-4 text-red-400 ml-2" />
                        {con}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  // ----------------------------------------
  // STEP 5: الميزانية الذكية والجدولة
  // ----------------------------------------
  
  const renderStep5 = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-900/50 to-orange-900/50 p-8 backdrop-blur-sm border border-yellow-500/20">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/10 to-orange-600/10" />
        <div className="absolute inset-0">{generateStars()}</div>
        
        <motion.div
          className="relative z-10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-center mb-4">
            <motion.div
              className="p-4 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg"
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <DollarSign className="w-8 h-8 text-white" />
            </motion.div>
          </div>
          
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            الميزانية الذكية والجدولة
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            حدد ميزانيتك وجدولة عرض إعلاناتك بذكاء لتحقيق أفضل عائد على الاستثمار
          </p>
        </motion.div>
      </div>

      {/* Budget Settings */}
      <div className="bg-gradient-to-br from-gray-900/80 to-yellow-900/40 rounded-2xl p-8 backdrop-blur-sm border border-yellow-500/20">
        <div className="flex items-center mb-6">
          <DollarSign className="w-6 h-6 text-yellow-400 ml-3" />
          <h3 className="text-2xl font-bold text-white">إعدادات الميزانية</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Budget Type */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">نوع الميزانية</h4>
            <div className="space-y-3">
              <motion.button
                onClick={() => setBudgetType('daily')}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-right ${
                  budgetType === 'daily'
                    ? 'border-yellow-500 bg-yellow-500/10'
                    : 'border-gray-600 bg-gray-800/50 hover:border-yellow-400'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">ميزانية يومية</div>
                    <div className="text-sm text-gray-400">مبلغ ثابت يومياً</div>
                  </div>
                  <Calendar className="w-5 h-5 text-yellow-400" />
                </div>
              </motion.button>
              
              <motion.button
                onClick={() => setBudgetType('total')}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-right ${
                  budgetType === 'total'
                    ? 'border-yellow-500 bg-yellow-500/10'
                    : 'border-gray-600 bg-gray-800/50 hover:border-yellow-400'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">ميزانية إجمالية</div>
                    <div className="text-sm text-gray-400">مبلغ إجمالي للحملة</div>
                  </div>
                  <DollarSign className="w-5 h-5 text-yellow-400" />
                </div>
              </motion.button>
            </div>
          </div>
          
          {/* Budget Amount */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">مبلغ الميزانية</h4>
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-center text-2xl font-bold"
                  min="10"
                  max="100000"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-400 font-semibold">
                  ر.س
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {[100, 500, 1000].map((amount) => (
                  <motion.button
                    key={amount}
                    onClick={() => setBudget(amount)}
                    className="p-2 bg-yellow-600/20 border border-yellow-500/30 rounded-lg text-white hover:bg-yellow-600/30 transition-all text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {amount} ر.س
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Budget Recommendations */}
        <div className="mt-8 p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <div className="flex items-center mb-4">
            <Lightbulb className="w-5 h-5 text-yellow-400 ml-2" />
            <span className="text-white font-semibold">توصيات الميزانية الذكية</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-green-400">محافظة</div>
              <div className="text-sm text-gray-400 mb-2">50-100 ر.س يومياً</div>
              <div className="text-xs text-gray-500">للاختبار والتعلم</div>
            </div>
            
            <div className="text-center p-4 bg-gray-800/50 rounded-lg border-2 border-yellow-500/30">
              <div className="text-2xl font-bold text-yellow-400">متوسطة</div>
              <div className="text-sm text-gray-400 mb-2">100-500 ر.س يومياً</div>
              <div className="text-xs text-gray-500">للنمو المستقر</div>
            </div>
            
            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-red-400">عدوانية</div>
              <div className="text-sm text-gray-400 mb-2">500+ ر.س يومياً</div>
              <div className="text-xs text-gray-500">للتوسع السريع</div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Settings */}
      <div className="bg-gradient-to-br from-gray-900/80 to-yellow-900/40 rounded-2xl p-8 backdrop-blur-sm border border-yellow-500/20">
        <div className="flex items-center mb-6">
          <Clock className="w-6 h-6 text-yellow-400 ml-3" />
          <h3 className="text-2xl font-bold text-white">جدولة الحملة</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Date Range */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">فترة الحملة</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  تاريخ البداية
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  تاريخ النهاية (اختياري)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          
          {/* Time Scheduling */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">أوقات العرض</h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    من الساعة
                  </label>
                  <select className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {i.toString().padStart(2, '0')}:00
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    إلى الساعة
                  </label>
                  <select className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {i.toString().padStart(2, '0')}:00
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  أيام الأسبوع
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map((day) => (
                    <motion.button
                      key={day}
                      className="p-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white hover:border-yellow-400 transition-all text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {day}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Predictions */}
      <div className="bg-gradient-to-br from-gray-900/80 to-yellow-900/40 rounded-2xl p-8 backdrop-blur-sm border border-yellow-500/20">
        <div className="flex items-center mb-6">
          <TrendingUp className="w-6 h-6 text-yellow-400 ml-3" />
          <h3 className="text-2xl font-bold text-white">توقعات الأداء الذكية</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              scenario: 'متحفظ',
              impressions: 15000,
              clicks: 450,
              conversions: 23,
              cost: budget * 0.8,
              roas: 2.1,
              confidence: 85,
              color: 'from-blue-500 to-cyan-500'
            },
            {
              scenario: 'متوقع',
              impressions: 25000,
              clicks: 750,
              conversions: 45,
              cost: budget,
              roas: 3.2,
              confidence: 70,
              color: 'from-yellow-500 to-orange-500'
            },
            {
              scenario: 'متفائل',
              impressions: 40000,
              clicks: 1200,
              conversions: 78,
              cost: budget * 1.2,
              roas: 4.8,
              confidence: 55,
              color: 'from-green-500 to-emerald-500'
            }
          ].map((prediction, index) => (
            <motion.div
              key={index}
              className="p-6 bg-gray-800/50 rounded-xl border border-gray-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="text-center mb-4">
                <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${prediction.color} text-white font-bold text-lg`}>
                  {prediction.scenario}
                </div>
                <div className="text-sm text-gray-400 mt-2">
                  ثقة {prediction.confidence}%
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">مرات الظهور:</span>
                  <span className="text-white font-semibold">{prediction.impressions.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">النقرات:</span>
                  <span className="text-white font-semibold">{prediction.clicks.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">التحويلات:</span>
                  <span className="text-white font-semibold">{prediction.conversions}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">التكلفة:</span>
                  <span className="text-white font-semibold">{prediction.cost.toFixed(0)} ر.س</span>
                </div>
                
                <div className="flex justify-between border-t border-gray-600 pt-3">
                  <span className="text-gray-400">عائد الاستثمار:</span>
                  <span className={`font-bold ${prediction.roas > 3 ? 'text-green-400' : prediction.roas > 2 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {prediction.roas.toFixed(1)}x
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  // ----------------------------------------
  // STEP 6: الأصول الإعلانية والإطلاق
  // ----------------------------------------
  
  const renderStep6 = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900/50 to-purple-900/50 p-8 backdrop-blur-sm border border-indigo-500/20">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10" />
        <div className="absolute inset-0">{generateStars()}</div>
        
        <motion.div
          className="relative z-10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-center mb-4">
            <motion.div
              className="p-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg"
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Rocket className="w-8 h-8 text-white" />
            </motion.div>
          </div>
          
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            الأصول الإعلانية والإطلاق
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            أضف الأصول الإعلانية وقم بإطلاق حملتك مع اختبار A/B المتطور لتحقيق أفضل النتائج
          </p>
        </motion.div>
      </div>

      {/* Ad Assets Creation */}
      <div className="bg-gradient-to-br from-gray-900/80 to-indigo-900/40 rounded-2xl p-8 backdrop-blur-sm border border-indigo-500/20">
        <div className="flex items-center mb-6">
          <Upload className="w-6 h-6 text-indigo-400 ml-3" />
          <h3 className="text-2xl font-bold text-white">إنشاء الأصول الإعلانية</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Headlines */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white flex items-center">
              <FileText className="w-5 h-5 text-indigo-400 ml-2" />
              العناوين الرئيسية
            </h4>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="relative">
                  <input
                    type="text"
                    placeholder={`العنوان ${i}`}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    maxLength={30}
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                    30
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Descriptions */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white flex items-center">
              <FileText className="w-5 h-5 text-indigo-400 ml-2" />
              الأوصاف
            </h4>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="relative">
                  <textarea
                    placeholder={`الوصف ${i}`}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    rows={3}
                    maxLength={90}
                  />
                  <div className="absolute left-3 bottom-3 text-xs text-gray-500">
                    90
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Media Assets */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white flex items-center">
              <ImageIcon className="w-5 h-5 text-indigo-400 ml-2" />
              الوسائط
            </h4>
            <div className="space-y-3">
              <motion.div
                className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center hover:border-indigo-400 transition-all cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">اسحب الصور هنا أو انقر للتحميل</p>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG (حتى 5MB)</p>
              </motion.div>
              
              <motion.div
                className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center hover:border-indigo-400 transition-all cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <VideoIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">تحميل فيديو</p>
                <p className="text-xs text-gray-500 mt-1">MP4 (حتى 50MB)</p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* A/B Testing Setup */}
      <div className="bg-gradient-to-br from-gray-900/80 to-indigo-900/40 rounded-2xl p-8 backdrop-blur-sm border border-indigo-500/20">
        <div className="flex items-center mb-6">
          <BarChart3 className="w-6 h-6 text-indigo-400 ml-3" />
          <h3 className="text-2xl font-bold text-white">إعداد اختبار A/B</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">عناصر الاختبار</h4>
            <div className="space-y-3">
              {[
                { id: 'headlines', label: 'العناوين الرئيسية', icon: FileText },
                { id: 'descriptions', label: 'الأوصاف', icon: FileText },
                { id: 'images', label: 'الصور', icon: ImageIcon },
                { id: 'audiences', label: 'الجماهير', icon: Users }
              ].map((item) => (
                <motion.div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-600"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center">
                    <item.icon className="w-5 h-5 text-indigo-400 ml-3" />
                    <span className="text-white">{item.label}</span>
                  </div>
                  <motion.button
                    className="w-6 h-6 rounded border-2 border-gray-600 flex items-center justify-center hover:border-indigo-400 transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Check className="w-4 h-4 text-indigo-400" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">إعدادات الاختبار</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  مدة الاختبار
                </label>
                <select className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option value="7">7 أيام</option>
                  <option value="14">14 يوم</option>
                  <option value="30">30 يوم</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  توزيع الحركة
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="text-sm text-gray-400 mb-1">النسخة A</div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '50%' }}></div>
                    </div>
                  </div>
                  <div className="text-white font-semibold">50%</div>
                </div>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex-1">
                    <div className="text-sm text-gray-400 mb-1">النسخة B</div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '50%' }}></div>
                    </div>
                  </div>
                  <div className="text-white font-semibold">50%</div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  مقياس النجاح
                </label>
                <select className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option value="ctr">معدل النقر (CTR)</option>
                  <option value="conversions">التحويلات</option>
                  <option value="cpa">تكلفة الاكتساب</option>
                  <option value="roas">عائد الإنفاق الإعلاني</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Summary */}
      <div className="bg-gradient-to-br from-gray-900/80 to-indigo-900/40 rounded-2xl p-8 backdrop-blur-sm border border-indigo-500/20">
        <div className="flex items-center mb-6">
          <CheckCircle className="w-6 h-6 text-indigo-400 ml-3" />
          <h3 className="text-2xl font-bold text-white">ملخص الحملة</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-gray-800/50 rounded-xl">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-lg font-semibold text-white">الهدف</div>
            <div className="text-sm text-gray-400">
              {CAMPAIGN_GOALS.find(g => g.id === selectedGoal)?.name || 'غير محدد'}
            </div>
          </div>
          
          <div className="text-center p-6 bg-gray-800/50 rounded-xl">
            <div className="text-3xl mb-2">📱</div>
            <div className="text-lg font-semibold text-white">نوع الحملة</div>
            <div className="text-sm text-gray-400">
              {CAMPAIGN_TYPES.find(t => t.id === selectedCampaignType)?.name || 'غير محدد'}
            </div>
          </div>
          
          <div className="text-center p-6 bg-gray-800/50 rounded-xl">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-lg font-semibold text-white">الميزانية</div>
            <div className="text-sm text-gray-400">
              {budget} ر.س {budgetType === 'daily' ? 'يومياً' : 'إجمالي'}
            </div>
          </div>
          
          <div className="text-center p-6 bg-gray-800/50 rounded-xl">
            <div className="text-3xl mb-2">🔑</div>
            <div className="text-lg font-semibold text-white">الكلمات المفتاحية</div>
            <div className="text-sm text-gray-400">
              {selectedKeywords.length} كلمة مختارة
            </div>
          </div>
        </div>
        
        {/* Launch Button */}
        <div className="mt-8 text-center">
          <motion.button
            className="px-12 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-3 mx-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Rocket className="w-6 h-6" />
            <span>إطلاق الحملة الآن</span>
            <Sparkles className="w-6 h-6" />
          </motion.button>
          
          <p className="text-sm text-gray-400 mt-4">
            ستبدأ حملتك في العمل خلال 15-30 دقيقة من الإطلاق
          </p>
        </div>
      </div>
    </motion.div>
  );

  // ----------------------------------------
  // ANALYSIS MODAL
  // ----------------------------------------
  
  const renderAnalysisModal = () => (
    <AnimatePresence>
      {showAnalysisModal && (
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-2xl p-8 max-w-md w-full border border-blue-500/20"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <div className="text-center">
              <motion.div
                className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Brain className="w-8 h-8 text-white" />
              </motion.div>
              
              <h3 className="text-2xl font-bold text-white mb-4">
                تحليل الموقع بالذكاء الاصطناعي
              </h3>
              
              <div className="space-y-4">
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${analysisProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                
                <p className="text-gray-300">
                  {analysisProgress < 20 && 'فحص بنية الموقع...'}
                  {analysisProgress >= 20 && analysisProgress < 40 && 'استخراج الكلمات المفتاحية...'}
                  {analysisProgress >= 40 && analysisProgress < 60 && 'تحليل المحتوى...'}
                  {analysisProgress >= 60 && analysisProgress < 80 && 'تحليل المنافسين...'}
                  {analysisProgress >= 80 && analysisProgress < 100 && 'إنشاء التوصيات...'}
                  {analysisProgress === 100 && 'اكتمل التحليل!'}
                </p>
                
                <div className="text-sm text-gray-400">
                  {analysisProgress}% مكتمل
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ----------------------------------------
  // MAIN RENDER
  // ----------------------------------------

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">خطأ في تحميل الخرائط</h2>
          <p className="text-gray-400">تأكد من صحة مفتاح Google Maps API</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {generateFloatingParticles()}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20" />
      </div>
      
      {/* Neural Network Background */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 1000 1000">
          {Array.from({ length: 50 }, (_, i) => (
            <motion.circle
              key={i}
              cx={Math.random() * 1000}
              cy={Math.random() * 1000}
              r="2"
              fill="white"
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
          {Array.from({ length: 30 }, (_, i) => (
            <motion.line
              key={i}
              x1={Math.random() * 1000}
              y1={Math.random() * 1000}
              x2={Math.random() * 1000}
              y2={Math.random() * 1000}
              stroke="white"
              strokeWidth="0.5"
              animate={{
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: Math.random() * 4 + 3,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.h1
            className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            إنشاء حملة إعلانية جديدة
          </motion.h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            أنشئ حملتك الإعلانية بتقنيات الذكاء الاصطناعي المتطورة وحقق أفضل النتائج
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-4 mb-8">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <React.Fragment key={step}>
                <motion.div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 transition-all duration-300 ${
                    currentStep === step
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-blue-500 text-white shadow-lg'
                      : currentStep > step
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'bg-gray-800 border-gray-600 text-gray-400'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  animate={currentStep === step ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {currentStep > step ? <Check className="w-6 h-6" /> : step}
                </motion.div>
                
                {step < 6 && (
                  <div
                    className={`w-16 h-1 rounded-full transition-all duration-300 ${
                      currentStep > step ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              {currentStep === 1 && 'تحليل الموقع الإلكتروني'}
              {currentStep === 2 && 'الكلمات المفتاحية الذكية'}
              {currentStep === 3 && 'الاستهداف الجغرافي'}
              {currentStep === 4 && 'نوع الحملة والاستراتيجية'}
              {currentStep === 5 && 'الميزانية الذكية والجدولة'}
              {currentStep === 6 && 'الأصول الإعلانية والإطلاق'}
            </h2>
            <p className="text-gray-400">
              الخطوة {currentStep} من 6
            </p>
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
          {currentStep === 6 && renderStep6()}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12">
          <motion.button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft className="w-5 h-5" />
            <span>السابق</span>
          </motion.button>
          
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">التقدم</div>
            <div className="w-64 bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / 6) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="text-sm text-gray-400 mt-1">
              {Math.round((currentStep / 6) * 100)}% مكتمل
            </div>
          </div>
          
          <motion.button
            onClick={nextStep}
            disabled={currentStep === 6}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>التالي</span>
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Analysis Modal */}
      {renderAnalysisModal()}
    </div>
  );
};

export default EnhancedNewCampaignMasterFinal;

