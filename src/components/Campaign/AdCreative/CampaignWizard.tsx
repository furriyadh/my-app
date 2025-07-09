'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Target,
  Settings,
  Eye,
  Rocket
} from 'lucide-react';

import CampaignTypeSelector from '@/components/campaign/AdCreative/CampaignTypeSelector';
import CampaignSubtypeSelector from '@/components/campaign/AdCreative/CampaignSubtypeSelector';
import BasicInformationForm from '@/components/campaign/AdCreative/BasicInformationForm';
// import PreviewAndLaunch from '@/components/campaign/AdCreative/PreviewAndLaunch'; // سيتم إنشاؤه لاحقاً

interface CampaignType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  badge?: 'best' | 'popular' | 'recommended' | 'beginner' | 'advanced';
  color: string;
  gradient: string;
  features: string[];
  subtypes?: CampaignSubtype[];
  objectives?: string[];
}

interface CampaignSubtype {
  id: string;
  name: string;
  description: string;
  badge?: 'recommended' | 'beginner' | 'advanced';
  requirements: string[];
  autoObjective?: string;
}

interface CampaignBasicInfo {
  campaignName: string;
  websiteUrl?: string;
  phoneNumber?: string;
  appId?: string;
  merchantCenterId?: string;
  myBusinessId?: string;
  videoUrl?: string;
  businessName?: string;
  businessAddress?: string;
  targetLocation?: string;
}

interface CampaignWizardData {
  campaignType?: CampaignType;
  campaignSubtype?: CampaignSubtype;
  basicInfo?: CampaignBasicInfo;
  autoObjective?: string;
}

const steps = [
  {
    id: 1,
    title: 'نوع الحملة',
    description: 'اختر نوع الحملة الإعلانية',
    icon: <Target className="w-5 h-5" />
  },
  {
    id: 2,
    title: 'النوع الفرعي',
    description: 'حدد النوع الفرعي للحملة',
    icon: <Settings className="w-5 h-5" />
  },
  {
    id: 3,
    title: 'المعلومات الأساسية',
    description: 'أدخل المعلومات المطلوبة',
    icon: <CheckCircle className="w-5 h-5" />
  },
  {
    id: 4,
    title: 'المعاينة والإطلاق',
    description: 'راجع الحملة وأطلقها',
    icon: <Eye className="w-5 h-5" />
  }
];

export default function CampaignWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<CampaignWizardData>({});
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleCampaignTypeSelect = (campaignType: CampaignType) => {
    setWizardData(prev => ({ 
      ...prev, 
      campaignType,
      campaignSubtype: undefined, // Reset subtype when type changes
      basicInfo: undefined // Reset basic info when type changes
    }));
    
    // If campaign type has no subtypes, skip to step 3
    if (!campaignType.subtypes || campaignType.subtypes.length === 0) {
      setCurrentStep(3);
    } else {
      setCurrentStep(2);
    }
  };

  const handleCampaignSubtypeSelect = (campaignSubtype: CampaignSubtype) => {
    setWizardData(prev => ({ 
      ...prev, 
      campaignSubtype,
      autoObjective: campaignSubtype.autoObjective,
      basicInfo: undefined // Reset basic info when subtype changes
    }));
    setCurrentStep(3);
  };

  const handleBasicInfoSubmit = (basicInfo: CampaignBasicInfo) => {
    setWizardData(prev => ({ ...prev, basicInfo }));
    setCurrentStep(4);
  };

  const handleStepChange = (step: number) => {
    if (step < currentStep || canNavigateToStep(step)) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(step);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const canNavigateToStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return true;
      case 2:
        return !!wizardData.campaignType;
      case 3:
        return !!wizardData.campaignType && (
          !wizardData.campaignType.subtypes || 
          wizardData.campaignType.subtypes.length === 0 || 
          !!wizardData.campaignSubtype
        );
      case 4:
        return !!wizardData.campaignType && !!wizardData.basicInfo;
      default:
        return false;
    }
  };

  const getStepStatus = (step: number): 'completed' | 'current' | 'upcoming' => {
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'current';
    return 'upcoming';
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <CampaignTypeSelector
            onSelect={handleCampaignTypeSelect}
            selectedType={wizardData.campaignType?.id}
          />
        );
      
      case 2:
        if (!wizardData.campaignType?.subtypes) {
          return <div>لا توجد أنواع فرعية لهذا النوع من الحملات</div>;
        }
        return (
          <CampaignSubtypeSelector
            campaignType={wizardData.campaignType.id}
            subtypes={wizardData.campaignType.subtypes}
            onSelect={handleCampaignSubtypeSelect}
            selectedSubtype={wizardData.campaignSubtype?.id}
          />
        );
      
      case 3:
        if (!wizardData.campaignType) {
          return <div>يرجى اختيار نوع الحملة أولاً</div>;
        }
        return (
          <BasicInformationForm
            campaignType={wizardData.campaignType.id}
            campaignSubtype={wizardData.campaignSubtype?.id || 'default'}
            onSubmit={handleBasicInfoSubmit}
            initialData={wizardData.basicInfo}
          />
        );
      
      case 4:
        return (
          <div className="text-center p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <Rocket className="w-16 h-16 mx-auto text-blue-500 mb-4" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              المعاينة والإطلاق
            </h2>
            <p className="text-gray-600 mb-8">
              سيتم إضافة صفحة المعاينة والإطلاق قريباً
            </p>
            
            {/* Campaign Summary */}
            <div className="bg-gray-50 rounded-lg p-6 text-right">
              <h3 className="text-lg font-semibold mb-4">ملخص الحملة:</h3>
              <div className="space-y-2">
                <p><strong>نوع الحملة:</strong> {wizardData.campaignType?.name}</p>
                {wizardData.campaignSubtype && (
                  <p><strong>النوع الفرعي:</strong> {wizardData.campaignSubtype.name}</p>
                )}
                {wizardData.basicInfo?.campaignName && (
                  <p><strong>اسم الحملة:</strong> {wizardData.basicInfo.campaignName}</p>
                )}
                {wizardData.autoObjective && (
                  <p><strong>الهدف التلقائي:</strong> {wizardData.autoObjective}</p>
                )}
              </div>
            </div>
          </div>
        );
      
      default:
        return <div>خطوة غير معروفة</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Steps */}
            <div className="flex items-center space-x-8 space-x-reverse">
              {steps.map((step, index) => {
                const status = getStepStatus(step.id);
                const isClickable = canNavigateToStep(step.id);
                
                return (
                  <motion.div
                    key={step.id}
                    className={`flex items-center cursor-pointer ${
                      isClickable ? 'hover:opacity-80' : 'cursor-not-allowed opacity-50'
                    }`}
                    onClick={() => isClickable && handleStepChange(step.id)}
                    whileHover={isClickable ? { scale: 1.02 } : {}}
                    whileTap={isClickable ? { scale: 0.98 } : {}}
                  >
                    {/* Step Circle */}
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                      status === 'completed' 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : status === 'current'
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'bg-white border-gray-300 text-gray-500'
                    }`}>
                      {status === 'completed' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        step.icon
                      )}
                    </div>
                    
                    {/* Step Info */}
                    <div className="mr-3">
                      <div className={`text-sm font-medium ${
                        status === 'current' ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {step.description}
                      </div>
                    </div>
                    
                    {/* Connector */}
                    {index < steps.length - 1 && (
                      <div className={`w-8 h-0.5 mx-4 ${
                        step.id < currentStep ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-4">
              {currentStep > 1 && (
                <motion.button
                  onClick={() => handleStepChange(currentStep - 1)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>السابق</span>
                </motion.button>
              )}
              
              {currentStep < 4 && canNavigateToStep(currentStep + 1) && (
                <motion.button
                  onClick={() => handleStepChange(currentStep + 1)}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>التالي</span>
                  <ArrowLeft className="w-4 h-4" />
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className={isTransitioning ? 'pointer-events-none' : ''}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Campaign Data Debug (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-sm">
          <h4 className="font-bold mb-2">Wizard Data (Dev Only):</h4>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(wizardData, (key, value) => {
              if (typeof value === 'object' && value !== null && 'constructor' in value) {
                return '[Object]';
              }
              return value;
            }, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

