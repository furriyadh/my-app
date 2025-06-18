'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Target, 
  Globe, 
  DollarSign, 
  Zap, 
  TrendingUp, 
  Users, 
  Eye,
  MousePointer,
  BarChart3,
  Rocket,
  Star,
  CheckCircle,
  ArrowRight,
  Play,
  Pause,
  Settings,
  Calendar,
  MapPin,
  Languages,
  CreditCard,
  Building,
  Mail,
  Phone,
  FileText,
  Lightbulb,
  Brain,
  Wand2,
  Crown,
  Diamond,
  Flame,
  Heart,
  Shield,
  Award
} from 'lucide-react';

interface CampaignFormData {
  websiteUrl: string;
  campaignName: string;
  selectedLanguage: string;
  selectedLocation: string;
  selectedPlatform: string;
  selectedAccount: string;
  selectedBudget: number;
  targetAudience: string;
  campaignGoal: string;
  billingDetails: {
    companyName: string;
    country: string;
    city: string;
    postalCode: string;
    address: string;
    taxNumber: string;
  };
  paymentMethod: string;
}

const CreateCampaignPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CampaignFormData>({
    websiteUrl: '',
    campaignName: '',
    selectedLanguage: '',
    selectedLocation: '',
    selectedPlatform: '',
    selectedAccount: '',
    selectedBudget: 50,
    targetAudience: '',
    campaignGoal: '',
    billingDetails: {
      companyName: '',
      country: '',
      city: '',
      postalCode: '',
      address: '',
      taxNumber: ''
    },
    paymentMethod: ''
  });
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [estimatedResults, setEstimatedResults] = useState<any>(null);

  const totalSteps = 6;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      x: -50,
      transition: { duration: 0.3 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    hover: { 
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  };

  // Simulate AI analysis
  const analyzeWebsite = async () => {
    setIsAnalyzing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setAiInsights({
      industry: "التكنولوجيا والخدمات الرقمية",
      targetAudience: "الشركات الصغيرة والمتوسطة",
      suggestedKeywords: ["خدمات تقنية", "حلول رقمية", "تطوير مواقع", "استشارات تقنية"],
      competitorAnalysis: "منافسة متوسطة مع فرص نمو عالية",
      recommendedBudget: { min: 75, max: 150, optimal: 100 }
    });
    
    setEstimatedResults({
      expectedClicks: 450,
      expectedImpressions: 12500,
      expectedConversions: 23,
      estimatedCTR: 3.6,
      estimatedCPC: 2.8,
      projectedROI: 340
    });
    
    setIsAnalyzing(false);
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  // Step 1: Website Analysis
  const renderStep1 = () => (
    <motion.div
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-8"
    >
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="relative inline-block"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-full">
            <Brain className="w-12 h-12 text-white" />
          </div>
        </motion.div>
        
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            أطلق حملتك الإعلانية الذكية
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            دع الذكاء الاصطناعي يحلل موقعك ويصمم حملة إعلانية مخصصة تحقق أفضل النتائج
          </p>
        </div>
      </div>

      {/* Website URL Input */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        
        <div className="space-y-6">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-3 rounded-xl">
              <Globe className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">رابط موقعك الإلكتروني</h3>
              <p className="text-gray-600">سنحلل موقعك لإنشاء حملة مثالية</p>
            </div>
          </div>
          
          <div className="relative">
            <input
              type="url"
              value={formData.websiteUrl}
              onChange={(e) => setFormData({...formData, websiteUrl: e.target.value})}
              placeholder="https://example.com"
              className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-gray-50 focus:bg-white"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={analyzeWebsite}
              disabled={!formData.websiteUrl || isAnalyzing}
              className="absolute left-2 top-2 bottom-2 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300"
            >
              {isAnalyzing ? (
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>جاري التحليل...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Wand2 className="w-4 h-4" />
                  <span>تحليل بالذكاء الاصطناعي</span>
                </div>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* AI Analysis Results */}
      <AnimatePresence>
        {aiInsights && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid md:grid-cols-2 gap-6"
          >
            {/* Industry Analysis */}
            <motion.div
              variants={cardVariants}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200"
            >
              <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-blue-900">تحليل الصناعة</h4>
              </div>
              <p className="text-blue-800 font-semibold">{aiInsights.industry}</p>
              <p className="text-blue-600 text-sm mt-2">{aiInsights.competitorAnalysis}</p>
            </motion.div>

            {/* Target Audience */}
            <motion.div
              variants={cardVariants}
              className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200"
            >
              <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                <div className="bg-purple-600 p-2 rounded-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-purple-900">الجمهور المستهدف</h4>
              </div>
              <p className="text-purple-800 font-semibold">{aiInsights.targetAudience}</p>
            </motion.div>

            {/* Keywords */}
            <motion.div
              variants={cardVariants}
              className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200"
            >
              <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                <div className="bg-green-600 p-2 rounded-lg">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-green-900">الكلمات المفتاحية المقترحة</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {aiInsights.suggestedKeywords.map((keyword: string, index: number) => (
                  <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {keyword}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Budget Recommendation */}
            <motion.div
              variants={cardVariants}
              className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200"
            >
              <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                <div className="bg-orange-600 p-2 rounded-lg">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-orange-900">الميزانية المقترحة</h4>
              </div>
              <div className="space-y-2">
                <p className="text-orange-800">
                  <span className="font-semibold">${aiInsights.recommendedBudget.optimal}</span> يومياً (مثالي)
                </p>
                <p className="text-orange-600 text-sm">
                  النطاق: ${aiInsights.recommendedBudget.min} - ${aiInsights.recommendedBudget.max}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expected Results */}
      <AnimatePresence>
        {estimatedResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full translate-y-24 -translate-x-24"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-8">
                <div className="inline-flex items-center space-x-2 rtl:space-x-reverse bg-white bg-opacity-20 rounded-full px-4 py-2 mb-4">
                  <Rocket className="w-5 h-5" />
                  <span className="font-semibold">النتائج المتوقعة</span>
                </div>
                <h3 className="text-2xl font-bold">توقعات أداء حملتك</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{estimatedResults.expectedClicks.toLocaleString()}</div>
                  <div className="text-white text-opacity-80">نقرة متوقعة</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{estimatedResults.expectedImpressions.toLocaleString()}</div>
                  <div className="text-white text-opacity-80">مشاهدة متوقعة</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{estimatedResults.expectedConversions}</div>
                  <div className="text-white text-opacity-80">تحويل متوقع</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{estimatedResults.estimatedCTR}%</div>
                  <div className="text-white text-opacity-80">معدل النقر</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">${estimatedResults.estimatedCPC}</div>
                  <div className="text-white text-opacity-80">تكلفة النقرة</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{estimatedResults.projectedROI}%</div>
                  <div className="text-white text-opacity-80">العائد المتوقع</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  // Step 2: Campaign Details
  const renderStep2 = () => (
    <motion.div
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-8"
    >
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="relative inline-block"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-blue-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
          <div className="relative bg-gradient-to-r from-green-600 to-blue-600 p-6 rounded-full">
            <Settings className="w-12 h-12 text-white" />
          </div>
        </motion.div>
        
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          تفاصيل الحملة
        </h2>
        <p className="text-gray-600 max-w-xl mx-auto">
          حدد تفاصيل حملتك الإعلانية لتحقيق أفضل النتائج
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Campaign Name */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
        >
          <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-3 rounded-xl">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">اسم الحملة</h3>
              <p className="text-gray-600 text-sm">اختر اسماً وصفياً لحملتك</p>
            </div>
          </div>
          <input
            type="text"
            value={formData.campaignName}
            onChange={(e) => setFormData({...formData, campaignName: e.target.value})}
            placeholder="مثال: حملة الخدمات التقنية 2024"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
          />
        </motion.div>

        {/* Language Selection */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
        >
          <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
            <div className="bg-gradient-to-r from-green-100 to-blue-100 p-3 rounded-xl">
              <Languages className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">اللغة المستهدفة</h3>
              <p className="text-gray-600 text-sm">اختر لغة جمهورك المستهدف</p>
            </div>
          </div>
          <select
            value={formData.selectedLanguage}
            onChange={(e) => setFormData({...formData, selectedLanguage: e.target.value})}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300"
          >
            <option value="">اختر اللغة</option>
            <option value="ar">العربية</option>
            <option value="en">الإنجليزية</option>
            <option value="fr">الفرنسية</option>
          </select>
        </motion.div>

        {/* Location Targeting */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
        >
          <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-3 rounded-xl">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">الموقع الجغرافي</h3>
              <p className="text-gray-600 text-sm">حدد المنطقة المستهدفة</p>
            </div>
          </div>
          <select
            value={formData.selectedLocation}
            onChange={(e) => setFormData({...formData, selectedLocation: e.target.value})}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300"
          >
            <option value="">اختر الموقع</option>
            <option value="saudi-arabia">السعودية</option>
            <option value="uae">الإمارات</option>
            <option value="egypt">مصر</option>
            <option value="gulf">دول الخليج</option>
            <option value="mena">الشرق الأوسط وشمال أفريقيا</option>
          </select>
        </motion.div>

        {/* Platform Selection */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
        >
          <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
            <div className="bg-gradient-to-r from-orange-100 to-red-100 p-3 rounded-xl">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">منصة الإعلان</h3>
              <p className="text-gray-600 text-sm">اختر المنصة المناسبة</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'google', name: 'Google Ads', icon: '🔍', popular: true },
              { id: 'facebook', name: 'Facebook Ads', icon: '📘', popular: false },
              { id: 'instagram', name: 'Instagram Ads', icon: '📷', popular: false },
              { id: 'linkedin', name: 'LinkedIn Ads', icon: '💼', popular: false }
            ].map((platform) => (
              <motion.button
                key={platform.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFormData({...formData, selectedPlatform: platform.id})}
                className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                  formData.selectedPlatform === platform.id
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                {platform.popular && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                    الأكثر شعبية
                  </div>
                )}
                <div className="text-2xl mb-2">{platform.icon}</div>
                <div className="font-semibold text-sm">{platform.name}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Campaign Goals */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-200"
      >
        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
          <div className="bg-indigo-600 p-3 rounded-xl">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-indigo-900">هدف الحملة</h3>
            <p className="text-indigo-600">ما الذي تريد تحقيقه من هذه الحملة؟</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { id: 'traffic', name: 'زيادة الزيارات', icon: Eye, color: 'blue' },
            { id: 'leads', name: 'جذب العملاء المحتملين', icon: Users, color: 'green' },
            { id: 'sales', name: 'زيادة المبيعات', icon: DollarSign, color: 'purple' }
          ].map((goal) => (
            <motion.button
              key={goal.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFormData({...formData, campaignGoal: goal.id})}
              className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                formData.campaignGoal === goal.id
                  ? `border-${goal.color}-500 bg-${goal.color}-50`
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <goal.icon className={`w-8 h-8 mx-auto mb-3 ${
                formData.campaignGoal === goal.id ? `text-${goal.color}-600` : 'text-gray-400'
              }`} />
              <div className="font-semibold">{goal.name}</div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );

  // Step 3: Budget Configuration
  const renderStep3 = () => (
    <motion.div
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-8"
    >
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="relative inline-block"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
          <div className="relative bg-gradient-to-r from-yellow-500 to-orange-600 p-6 rounded-full">
            <DollarSign className="w-12 h-12 text-white" />
          </div>
        </motion.div>
        
        <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
          تحديد الميزانية
        </h2>
        <p className="text-gray-600 max-w-xl mx-auto">
          اختر الميزانية المناسبة لتحقيق أهدافك الإعلانية
        </p>
      </div>

      {/* Budget Slider */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-500 to-orange-500"></div>
        
        <div className="space-y-8">
          <div className="text-center">
            <div className="text-5xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">
              ${formData.selectedBudget}
            </div>
            <div className="text-gray-600">الميزانية اليومية</div>
          </div>
          
          <div className="relative">
            <input
              type="range"
              min="10"
              max="500"
              step="5"
              value={formData.selectedBudget}
              onChange={(e) => setFormData({...formData, selectedBudget: parseInt(e.target.value)})}
              className="w-full h-3 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>$10</span>
              <span>$500</span>
            </div>
          </div>
          
          {/* Budget Recommendations */}
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { range: '10-50', label: 'مبتدئ', description: 'مناسب للاختبار', icon: '🌱', color: 'green' },
              { range: '50-150', label: 'متوسط', description: 'نتائج جيدة ومستقرة', icon: '🚀', color: 'blue' },
              { range: '150+', label: 'متقدم', description: 'أقصى وصول وتأثير', icon: '👑', color: 'purple' }
            ].map((tier, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                  (tier.range === '10-50' && formData.selectedBudget <= 50) ||
                  (tier.range === '50-150' && formData.selectedBudget > 50 && formData.selectedBudget <= 150) ||
                  (tier.range === '150+' && formData.selectedBudget > 150)
                    ? `border-${tier.color}-500 bg-${tier.color}-50`
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="text-3xl mb-3">{tier.icon}</div>
                <div className="font-bold text-lg mb-1">{tier.label}</div>
                <div className="text-sm text-gray-600 mb-2">${tier.range}</div>
                <div className="text-sm">{tier.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Budget Impact Visualization */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200"
      >
        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
          <div className="bg-blue-600 p-3 rounded-xl">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-blue-900">تأثير الميزانية على النتائج</h3>
            <p className="text-blue-600">توقعات الأداء بناءً على الميزانية المختارة</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-900 mb-2">
              {Math.round(formData.selectedBudget * 15)}
            </div>
            <div className="text-blue-600 text-sm">نقرة متوقعة يومياً</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-900 mb-2">
              {Math.round(formData.selectedBudget * 400)}
            </div>
            <div className="text-blue-600 text-sm">مشاهدة متوقعة يومياً</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-900 mb-2">
              {Math.round(formData.selectedBudget * 0.8)}
            </div>
            <div className="text-blue-600 text-sm">تحويل متوقع يومياً</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-900 mb-2">
              {Math.round(formData.selectedBudget * 30)}
            </div>
            <div className="text-blue-600 text-sm">الميزانية الشهرية</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  // Step 4: Account Selection
  const renderStep4 = () => (
    <motion.div
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-8"
    >
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="relative inline-block"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
          <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-full">
            <Shield className="w-12 h-12 text-white" />
          </div>
        </motion.div>
        
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          اختيار نوع الحساب
        </h2>
        <p className="text-gray-600 max-w-xl mx-auto">
          اختر الطريقة المناسبة لإدارة حملتك الإعلانية
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Client Account Option */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          onClick={() => setFormData({...formData, selectedAccount: 'client'})}
          className={`relative cursor-pointer rounded-3xl p-8 border-2 transition-all duration-300 ${
            formData.selectedAccount === 'client'
              ? 'border-blue-500 bg-blue-50 shadow-2xl'
              : 'border-gray-200 bg-white hover:border-blue-300 shadow-xl'
          }`}
        >
          <div className="absolute top-4 right-4">
            {formData.selectedAccount === 'client' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-blue-500 text-white p-2 rounded-full"
              >
                <CheckCircle className="w-5 h-5" />
              </motion.div>
            )}
          </div>
          
          <div className="space-y-6">
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-6 rounded-2xl inline-block mb-4">
                <Building className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">حسابي الإعلاني</h3>
              <p className="text-gray-600">استخدم حسابك الإعلاني الحالي</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm">تحكم كامل في الفواتير</span>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm">ملكية البيانات والتاريخ</span>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm">مرونة في الإعدادات</span>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Eye className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-semibold text-blue-600">عرض فقط في لوحة التحكم</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Managed Account Option */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          onClick={() => setFormData({...formData, selectedAccount: 'managed'})}
          className={`relative cursor-pointer rounded-3xl p-8 border-2 transition-all duration-300 ${
            formData.selectedAccount === 'managed'
              ? 'border-purple-500 bg-purple-50 shadow-2xl'
              : 'border-gray-200 bg-white hover:border-purple-300 shadow-xl'
          }`}
        >
          <div className="absolute top-4 left-4">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-3 py-1 rounded-full font-bold">
              الأكثر شعبية
            </div>
          </div>
          
          <div className="absolute top-4 right-4">
            {formData.selectedAccount === 'managed' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-purple-500 text-white p-2 rounded-full"
              >
                <CheckCircle className="w-5 h-5" />
              </motion.div>
            )}
          </div>
          
          <div className="space-y-6">
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-2xl inline-block mb-4">
                <Crown className="w-12 h-12 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">حساب مُدار</h3>
              <p className="text-gray-600">دعنا نتولى كل شيء من أجلك</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm">إدارة احترافية كاملة</span>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm">تحسين مستمر للأداء</span>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm">دعم فني متخصص</span>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Eye className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-semibold text-purple-600">عرض فقط في لوحة التحكم</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Account Benefits Comparison */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">مقارنة المزايا</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-right py-3 px-4 font-semibold">الميزة</th>
                <th className="text-center py-3 px-4 font-semibold text-blue-600">حسابي الإعلاني</th>
                <th className="text-center py-3 px-4 font-semibold text-purple-600">حساب مُدار</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4">إعداد الحملة</td>
                <td className="text-center py-3 px-4">
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                </td>
                <td className="text-center py-3 px-4">
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                </td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4">التحكم في الحملة</td>
                <td className="text-center py-3 px-4 text-blue-600 font-semibold">عرض فقط</td>
                <td className="text-center py-3 px-4 text-purple-600 font-semibold">عرض فقط</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4">الإدارة والتحسين</td>
                <td className="text-center py-3 px-4 text-blue-600 font-semibold">Shown</td>
                <td className="text-center py-3 px-4 text-purple-600 font-semibold">Shown</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4">الدعم الفني</td>
                <td className="text-center py-3 px-4">
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                </td>
                <td className="text-center py-3 px-4">
                  <Crown className="w-5 h-5 text-yellow-500 mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4">التقارير والتحليلات</td>
                <td className="text-center py-3 px-4">
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                </td>
                <td className="text-center py-3 px-4">
                  <Crown className="w-5 h-5 text-yellow-500 mx-auto" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );

  // Step 5: Billing Details
  const renderStep5 = () => (
    <motion.div
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-8"
    >
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="relative inline-block"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
          <div className="relative bg-gradient-to-r from-emerald-600 to-teal-600 p-6 rounded-full">
            <CreditCard className="w-12 h-12 text-white" />
          </div>
        </motion.div>
        
        <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          تفاصيل الفواتير
        </h2>
        <p className="text-gray-600 max-w-xl mx-auto">
          أدخل تفاصيل الفواتير لإكمال إعداد حملتك
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Company Information */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 space-y-4"
        >
          <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
            <div className="bg-gradient-to-r from-emerald-100 to-teal-100 p-3 rounded-xl">
              <Building className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">معلومات الشركة</h3>
              <p className="text-gray-600 text-sm">تفاصيل الشركة للفواتير</p>
            </div>
          </div>
          
          <input
            type="text"
            placeholder="اسم الشركة"
            value={formData.billingDetails.companyName}
            onChange={(e) => setFormData({
              ...formData,
              billingDetails: {...formData.billingDetails, companyName: e.target.value}
            })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-300"
          />
          
          <input
            type="text"
            placeholder="رقم الضريبة (اختياري)"
            value={formData.billingDetails.taxNumber}
            onChange={(e) => setFormData({
              ...formData,
              billingDetails: {...formData.billingDetails, taxNumber: e.target.value}
            })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-300"
          />
        </motion.div>

        {/* Location Information */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 space-y-4"
        >
          <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-3 rounded-xl">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">معلومات الموقع</h3>
              <p className="text-gray-600 text-sm">عنوان الشركة</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <select
              value={formData.billingDetails.country}
              onChange={(e) => setFormData({
                ...formData,
                billingDetails: {...formData.billingDetails, country: e.target.value}
              })}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
            >
              <option value="">الدولة</option>
              <option value="SA">السعودية</option>
              <option value="AE">الإمارات</option>
              <option value="EG">مصر</option>
            </select>
            
            <input
              type="text"
              placeholder="المدينة"
              value={formData.billingDetails.city}
              onChange={(e) => setFormData({
                ...formData,
                billingDetails: {...formData.billingDetails, city: e.target.value}
              })}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
            />
          </div>
          
          <input
            type="text"
            placeholder="الرمز البريدي"
            value={formData.billingDetails.postalCode}
            onChange={(e) => setFormData({
              ...formData,
              billingDetails: {...formData.billingDetails, postalCode: e.target.value}
            })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
          />
          
          <textarea
            placeholder="العنوان التفصيلي"
            value={formData.billingDetails.address}
            onChange={(e) => setFormData({
              ...formData,
              billingDetails: {...formData.billingDetails, address: e.target.value}
            })}
            rows={3}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 resize-none"
          />
        </motion.div>
      </div>

      {/* Payment Method */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-200"
      >
        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
          <div className="bg-purple-600 p-3 rounded-xl">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-purple-900">طريقة الدفع</h3>
            <p className="text-purple-600">اختر طريقة الدفع المفضلة</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { id: 'card', name: 'بطاقة ائتمانية', icon: '💳', popular: true },
            { id: 'bank', name: 'تحويل بنكي', icon: '🏦', popular: false },
            { id: 'paypal', name: 'PayPal', icon: '💰', popular: false }
          ].map((method) => (
            <motion.button
              key={method.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFormData({...formData, paymentMethod: method.id})}
              className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${
                formData.paymentMethod === method.id
                  ? 'border-purple-500 bg-purple-100'
                  : 'border-gray-200 hover:border-purple-300 bg-white'
              }`}
            >
              {method.popular && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  الأكثر استخداماً
                </div>
              )}
              <div className="text-3xl mb-3">{method.icon}</div>
              <div className="font-semibold">{method.name}</div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );

  // Step 6: Review and Launch
  const renderStep6 = () => (
    <motion.div
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-8"
    >
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="relative inline-block"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
          <div className="relative bg-gradient-to-r from-pink-600 to-rose-600 p-6 rounded-full">
            <Rocket className="w-12 h-12 text-white" />
          </div>
        </motion.div>
        
        <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
          مراجعة وإطلاق الحملة
        </h2>
        <p className="text-gray-600 max-w-xl mx-auto">
          راجع تفاصيل حملتك قبل الإطلاق
        </p>
      </div>

      {/* Campaign Summary */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full translate-y-24 -translate-x-24"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 rtl:space-x-reverse bg-white bg-opacity-20 rounded-full px-4 py-2 mb-4">
              <Star className="w-5 h-5" />
              <span className="font-semibold">ملخص الحملة</span>
            </div>
            <h3 className="text-2xl font-bold">{formData.campaignName || 'حملة جديدة'}</h3>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">${formData.selectedBudget}</div>
              <div className="text-white text-opacity-80">الميزانية اليومية</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">{formData.selectedLocation || 'غير محدد'}</div>
              <div className="text-white text-opacity-80">الموقع المستهدف</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">{formData.selectedLanguage || 'غير محدد'}</div>
              <div className="text-white text-opacity-80">اللغة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">{formData.selectedAccount === 'managed' ? 'مُدار' : 'شخصي'}</div>
              <div className="text-white text-opacity-80">نوع الحساب</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Launch Button */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="text-center"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          className="relative inline-flex items-center space-x-4 rtl:space-x-reverse bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white px-12 py-6 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 flex items-center space-x-4 rtl:space-x-reverse">
            <Rocket className="w-8 h-8" />
            <span>إطلاق الحملة الآن</span>
            <ArrowRight className="w-6 h-6" />
          </div>
        </motion.button>
        
        <p className="text-gray-600 mt-4 text-sm">
          سيتم مراجعة حملتك وتفعيلها خلال 24 ساعة
        </p>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Progress Bar */}
      <div className="sticky top-0 z-50 bg-white bg-opacity-90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-gray-600">
              الخطوة {currentStep} من {totalSteps}
            </div>
            <div className="text-sm text-gray-500">
              {Math.round((currentStep / totalSteps) * 100)}% مكتمل
            </div>
          </div>
          
          <div className="relative">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
              />
            </div>
            
            <div className="flex justify-between mt-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    i + 1 <= currentStep
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {i + 1 < currentStep ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    i + 1
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="wait">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
            {currentStep === 6 && renderStep6()}
          </AnimatePresence>
        </motion.div>

        {/* Navigation Buttons */}
        {currentStep < totalSteps && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-between items-center mt-12"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 rtl:space-x-reverse px-6 py-3 border-2 border-gray-300 text-gray-600 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 transition-all duration-300"
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
              <span>السابق</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className="flex items-center space-x-2 rtl:space-x-reverse bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              <span>التالي</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(45deg, #f59e0b, #ea580c);
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(45deg, #f59e0b, #ea580c);
          cursor: pointer;
          border: none;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default CreateCampaignPage;