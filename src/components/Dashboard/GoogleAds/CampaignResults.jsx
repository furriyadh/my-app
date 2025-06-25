// components/Dashboard/GoogleAds/CampaignResults.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  DollarSign,
  Users,
  Calendar,
  Edit3,
  Play,
  Pause,
  BarChart3,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Copy,
  ExternalLink,
  Download,
  Share2
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Progress } from '../../ui/progress';
import { Separator } from '../../ui/separator';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import './CampaignResults.css';

const CampaignResults = ({ 
  campaign, 
  onLaunchCampaign, 
  onEditCampaign,
  onNext,
  isLaunching,
  error 
}) => {
  const [selectedAd, setSelectedAd] = useState(0);
  const [showMetrics, setShowMetrics] = useState(false);

  // Sample estimated metrics data
  const metricsData = [
    { name: 'الأسبوع 1', impressions: 1200, clicks: 48, cost: 120 },
    { name: 'الأسبوع 2', impressions: 1800, clicks: 72, cost: 180 },
    { name: 'الأسبوع 3', impressions: 2200, clicks: 88, cost: 220 },
    { name: 'الأسبوع 4', impressions: 2800, clicks: 112, cost: 280 },
  ];

  const performanceData = [
    { name: 'النقرات', value: 320, color: '#3b82f6' },
    { name: 'الظهور', value: 8000, color: '#10b981' },
    { name: 'التحويلات', value: 24, color: '#f59e0b' },
  ];

  // Default campaign data if not provided
  const defaultCampaign = {
    id: 'camp_001',
    name: 'حملة ذكية - ' + (campaign?.website?.title || 'موقع إلكتروني'),
    status: 'DRAFT',
    budget: 500,
    targetLocations: ['السعودية', 'الإمارات', 'الكويت'],
    keywords: ['خدمات', 'منتجات', 'شراء', 'أفضل', 'جودة'],
    ads: [
      {
        id: 'ad_a',
        type: 'A',
        headline1: 'أفضل الخدمات المتميزة',
        headline2: 'جودة عالية وأسعار منافسة',
        headline3: 'اطلب الآن واحصل على خصم',
        description1: 'نقدم لك أفضل الخدمات بجودة عالية وأسعار تنافسية. فريق محترف وخبرة واسعة.',
        description2: 'اتصل بنا اليوم واحصل على استشارة مجانية وعرض خاص.',
        finalUrl: campaign?.website?.url || 'https://example.com',
        displayUrl: 'example.com'
      },
      {
        id: 'ad_b',
        type: 'B',
        headline1: 'حلول مبتكرة لاحتياجاتك',
        headline2: 'خبرة تزيد عن 10 سنوات',
        headline3: 'ضمان الجودة والسرعة',
        description1: 'نحن نفهم احتياجاتك ونقدم حلول مخصصة تناسب متطلباتك الخاصة.',
        description2: 'تواصل معنا الآن للحصول على عرض سعر مجاني وخدمة استثنائية.',
        finalUrl: campaign?.website?.url || 'https://example.com',
        displayUrl: 'example.com'
      },
      {
        id: 'ad_c',
        type: 'C',
        headline1: 'خدمات احترافية بأسعار مميزة',
        headline2: 'نتائج مضمونة ورضا العملاء',
        headline3: 'عروض خاصة لفترة محدودة',
        description1: 'احصل على خدمات احترافية من فريق خبير يضمن لك أفضل النتائج.',
        description2: 'لا تفوت الفرصة! عروض خاصة متاحة لفترة محدودة فقط.',
        finalUrl: campaign?.website?.url || 'https://example.com',
        displayUrl: 'example.com'
      }
    ],
    estimatedMetrics: {
      impressions: 8000,
      clicks: 320,
      ctr: 4.0,
      cpc: 2.5,
      cost: 800,
      conversions: 24,
      conversionRate: 7.5
    }
  };

  const campaignData = campaign || defaultCampaign;

  // Show metrics after component mounts
  useEffect(( ) => {
    const timer = setTimeout(() => {
      setShowMetrics(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Handle ad selection
  const handleAdSelect = (index) => {
    setSelectedAd(index);
  };

  // Handle campaign launch
  const handleLaunch = () => {
    onLaunchCampaign?.(campaignData);
  };

  // Copy ad text
  const copyAdText = (ad) => {
    const text = `${ad.headline1}\n${ad.headline2}\n${ad.headline3}\n\n${ad.description1}\n${ad.description2}`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="campaign-results">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mb-4"
          >
            <Trophy className="w-8 h-8 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4"
          >
            حملتك الإعلانية جاهزة!
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            تم إنشاء حملة إعلانية ذكية مع 3 إعلانات متنوعة وتوقعات أداء ممتازة
          </motion.p>
        </div>

        {/* Campaign Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-green-800">{campaignData.name}</CardTitle>
                  <CardDescription className="text-green-600">
                    حملة إعلانية ذكية تم إنشاؤها بالذكاء الاصطناعي
                  </CardDescription>
                </div>
                <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
                  مسودة
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">${campaignData.budget}</div>
                  <div className="text-sm text-muted-foreground">الميزانية الشهرية</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{campaignData.ads.length}</div>
                  <div className="text-sm text-muted-foreground">إعلانات مُنشأة</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{campaignData.keywords.length}</div>
                  <div className="text-sm text-muted-foreground">كلمة مفتاحية</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{campaignData.targetLocations.length}</div>
                  <div className="text-sm text-muted-foreground">منطقة مستهدفة</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* سأكمل باقي الملف في الرسالة التالية */}
      </motion.div>
    </div>
  );
};

export default CampaignResults;
