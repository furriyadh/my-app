'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Save,
  AlertCircle,
  Info,
  Loader2,
  FileText,
  Target,
  DollarSign,
  Upload,
  Brain,
  Eye
} from 'lucide-react';

// Import step components
import BasicInfo from './BasicInfo';
import BudgetSettings from './BudgetSettings';
import TargetingOptions from './TargetingOptions';
import AssetUpload from './AssetUpload';
import AIAnalysis from './AIAnalysis';
import CampaignPreview from './CampaignPreview';

const CampaignWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [campaignData, setCampaignData] = useState({
    // Basic Info
    campaignName: '',
    campaignType: '',
    objective: '',
    description: '',
    
    // Budget Settings
    budgetType: 'DAILY',
    budgetAmount: 0,
    bidStrategy: 'MAXIMIZE_CLICKS',
    targetCpa: 0,
    targetRoas: 0,
    budgetDeliveryMethod: 'STANDARD',
    mobileBidAdjustment: 0,
    tabletBidAdjustment: 0,
    
    // Targeting Options
    locations: [],
    languages: ['en'],
    demographics: {
      ageGroups: [],
      genders: [],
      parentalStatus: [],
      householdIncome: []
    },
    audiences: [],
    keywords: [],
    negativeKeywords: [],
    
    // Asset Upload
    assets: {
      images: [],
      videos: [],
      headlines: [],
      descriptions: []
    },
    
    // AI Analysis
    aiRecommendations: null,
    optimizations: [],
    
    // Campaign Preview
    estimatedReach: null,
    estimatedCost: null,
    previewData: null
  });

  // Define wizard steps
  const steps = [
    {
      id: 'basic-info',
      title: 'Basic Information',
      description: 'Campaign name, type, and objective',
      icon: <FileText className="w-5 h-5" />,
      component: BasicInfo,
      required: true
    },
    {
      id: 'budget-settings',
      title: 'Budget & Bidding',
      description: 'Set your budget and bidding strategy',
      icon: <DollarSign className="w-5 h-5" />,
      component: BudgetSettings,
      required: true
    },
    {
      id: 'targeting-options',
      title: 'Targeting',
      description: 'Define your target audience',
      icon: <Target className="w-5 h-5" />,
      component: TargetingOptions,
      required: true
    },
    {
      id: 'asset-upload',
      title: 'Assets',
      description: 'Upload images, videos, and ad copy',
      icon: <Upload className="w-5 h-5" />,
      component: AssetUpload,
      required: false
    },
    {
      id: 'ai-analysis',
      title: 'AI Analysis',
      description: 'Get AI-powered recommendations',
      icon: <Brain className="w-5 h-5" />,
      component: AIAnalysis,
      required: false
    },
    {
      id: 'campaign-preview',
      title: 'Preview & Launch',
      description: 'Review and launch your campaign',
      icon: <Eye className="w-5 h-5" />,
      component: CampaignPreview,
      required: true
    }
  ];

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setInterval(() => {
      if (Object.keys(campaignData).length > 0) {
        saveDraft();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSave);
  }, [campaignData]);

  // Load saved draft on component mount
  useEffect(() => {
    loadDraft();
  }, []);

  // Save draft to localStorage
  const saveDraft = useCallback(async () => {
    try {
      setIsSaving(true);
      localStorage.setItem('campaignDraft', JSON.stringify({
        ...campaignData,
        lastSaved: new Date().toISOString()
      }));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error('Failed to save draft:', error);
    } finally {
      setIsSaving(false);
    }
  }, [campaignData]);

  // Load draft from localStorage
  const loadDraft = () => {
    try {
      const savedDraft = localStorage.getItem('campaignDraft');
      if (savedDraft) {
        const draftData = JSON.parse(savedDraft);
        setCampaignData(prev => ({ ...prev, ...draftData }));
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
  };

  // Update campaign data
  const updateCampaignData = (updates) => {
    setCampaignData(prev => ({ ...prev, ...updates }));
    setErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(updates).forEach(key => {
        if (newErrors[key]) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
  };

  // Validate current step
  const validateCurrentStep = () => {
    const currentStepData = steps[currentStep];
    const newErrors = {};

    switch (currentStepData.id) {
      case 'basic-info':
        if (!campaignData.campaignName?.trim()) {
          newErrors.campaignName = 'Campaign name is required';
        }
        if (!campaignData.campaignType) {
          newErrors.campaignType = 'Campaign type is required';
        }
        if (!campaignData.objective) {
          newErrors.objective = 'Campaign objective is required';
        }
        break;

      case 'budget-settings':
        if (!campaignData.budgetAmount || campaignData.budgetAmount <= 0) {
          newErrors.budgetAmount = 'Budget amount must be greater than 0';
        }
        if (campaignData.bidStrategy === 'TARGET_CPA' && (!campaignData.targetCpa || campaignData.targetCpa <= 0)) {
          newErrors.targetCpa = 'Target CPA must be greater than 0';
        }
        if (campaignData.bidStrategy === 'TARGET_ROAS' && (!campaignData.targetRoas || campaignData.targetRoas <= 0)) {
          newErrors.targetRoas = 'Target ROAS must be greater than 0';
        }
        break;

      case 'targeting-options':
        if (!campaignData.locations || campaignData.locations.length === 0) {
          newErrors.locations = 'At least one location must be selected';
        }
        if (campaignData.campaignType === 'SEARCH' && (!campaignData.keywords || campaignData.keywords.length === 0)) {
          newErrors.keywords = 'At least one keyword is required for Search campaigns';
        }
        break;

      case 'campaign-preview':
        // Final validation - check all required fields
        if (!campaignData.campaignName?.trim()) {
          newErrors.campaignName = 'Campaign name is required';
        }
        if (!campaignData.campaignType) {
          newErrors.campaignType = 'Campaign type is required';
        }
        if (!campaignData.budgetAmount || campaignData.budgetAmount <= 0) {
          newErrors.budgetAmount = 'Valid budget amount is required';
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Save current progress
      await saveDraft();
      
      // Move to next step
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error('Failed to proceed to next step:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle step click
  const handleStepClick = (stepIndex) => {
    // Only allow navigation to completed steps or the next step
    if (stepIndex <= currentStep + 1) {
      setCurrentStep(stepIndex);
    }
  };

  // Calculate progress percentage
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  // Get current step component
  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-800">
                Create New Campaign
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Follow the steps below to create your Google Ads campaign
              </p>
            </div>
            
            {/* Auto-save indicator */}
            <div className="flex items-center space-x-2">
              {isSaving && (
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </div>
              )}
              <button
                onClick={saveDraft}
                disabled={isSaving}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-white/15 backdrop-blur-md border border-blue-200/30 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>Save Draft</span>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/20 backdrop-blur-sm rounded-full h-2 mb-6">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Step Navigation */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="flex flex-col items-center cursor-pointer"
                onClick={() => handleStepClick(index)}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                    index < currentStep
                      ? 'bg-green-500 border-green-500 text-gray-800'
                      : index === currentStep
                      ? 'bg-blue-500 border-blue-500 text-gray-800'
                      : index === currentStep + 1
                      ? 'border-blue-300 dark:border-blue-600 text-blue-500 dark:text-blue-400 hover:border-blue-500 dark:hover:border-blue-400'
                      : 'border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.icon
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div
                    className={`text-sm font-medium ${
                      index <= currentStep
                        ? 'text-gray-900 dark:text-gray-800'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 max-w-24">
                    {step.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white/15 backdrop-blur-md border border-blue-200/30 rounded-lg shadow-lg">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                {steps[currentStep].icon}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-800">
                  {steps[currentStep].title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {steps[currentStep].description}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CurrentStepComponent
                  data={campaignData}
                  updateData={updateCampaignData}
                  errors={errors}
                  onValidate={validateCurrentStep}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="px-6 py-4 bg-white/10 backdrop-blur-md border border-blue-200/20 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center space-x-3">
              {/* Error indicator */}
              {Object.keys(errors).length > 0 && (
                <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Please fix the errors above</span>
                </div>
              )}

              {/* Step info */}
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Step {currentStep + 1} of {steps.length}
              </span>

              {/* Next/Finish button */}
              <button
                onClick={handleNext}
                disabled={isLoading || Object.keys(errors).length > 0}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-gray-800 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>
                  {currentStep === steps.length - 1 ? 'Launch Campaign' : 'Next'}
                </span>
                {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Need Help?
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Your progress is automatically saved. You can return to this wizard at any time to continue where you left off.
                If you need assistance, check our documentation or contact support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignWizard;

