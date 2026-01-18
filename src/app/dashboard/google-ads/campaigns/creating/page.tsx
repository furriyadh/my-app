'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { useRouter } from 'next/navigation';
import { CheckCircle, Sparkles, Zap, Target, TrendingUp, Award } from 'lucide-react';

interface CreationStep {
  id: string;
  label_ar: string;
  label_en: string;
  icon: React.ComponentType<any>;
  status: 'pending' | 'processing' | 'completed';
}

export default function CampaignCreatingPage() {
  const router = useRouter();
  const { t, language, isRTL } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [campaignData, setCampaignData] = useState<any>(null);

  const [steps, setSteps] = useState<CreationStep[]>([
    {
      id: 'analyze',
      label_ar: 'تحليل البيانات',
      label_en: 'Analyzing Data',
      icon: Target,
      status: 'processing'
    },
    {
      id: 'optimize',
      label_ar: 'تحسين الاستراتيجية',
      label_en: 'Optimizing Strategy',
      icon: TrendingUp,
      status: 'pending'
    },
    {
      id: 'generate',
      label_ar: 'توليد المحتوى',
      label_en: 'Generating Content',
      icon: Sparkles,
      status: 'pending'
    },
    {
      id: 'finalize',
      label_ar: 'إتمام الإعداد',
      label_en: 'Finalizing Setup',
      icon: Zap,
      status: 'pending'
    },
    {
      id: 'launch',
      label_ar: 'إطلاق الحملة',
      label_en: 'Launching Campaign',
      icon: Award,
      status: 'pending'
    }
  ]);

  // Load campaign data on mount
  useEffect(() => {
    const data = localStorage.getItem('campaignData');
    if (data) {
      const parsed = JSON.parse(data);
      setCampaignData(parsed);
    }
  }, []);


  // Simulate campaign creation process
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          // Redirect to preview page after completion
          setTimeout(() => {
            localStorage.removeItem('creatingCampaign');
            router.push('/dashboard/google-ads/campaigns/preview');
          }, 1500);
          return prev;
        }

        // Update step status
        setSteps((prevSteps) => {
          const newSteps = [...prevSteps];
          if (prev < newSteps.length) {
            newSteps[prev].status = 'completed';
          }
          if (prev + 1 < newSteps.length) {
            newSteps[prev + 1].status = 'processing';
          }
          return newSteps;
        });

        return prev + 1;
      });
    }, 2000); // Each step takes 2 seconds

    return () => clearInterval(interval);
  }, [router, steps.length]);

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="flex items-center justify-center p-4" dir="ltr">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Main Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 md:p-12">

          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg shadow-primary-500/30 animate-pulse">
              <Sparkles className="w-10 h-10 text-white" />
            </div>

            <h5 className="!mb-0 text-lg sm:text-xl font-bold text-gray-900 dark:text-white" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {language === 'ar' ? 'جاري إنشاء حملتك' : 'Creating Your Campaign'}
            </h5>

            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {language === 'ar'
                ? 'الذكاء الاصطناعي يقوم بتحسين حملتك للحصول على أفضل النتائج'
                : 'AI is optimizing your campaign for the best results'}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {language === 'ar' ? 'التقدم' : 'Progress'}
              </span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {Math.round(progress)}%
              </span>
            </div>

            <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="absolute top-0 h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${progress}%`,
                  left: isRTL ? 'auto' : '0',
                  right: isRTL ? '0' : 'auto'
                }}
              >
                <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Steps List */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = step.status === 'completed';
              const isProcessing = step.status === 'processing';
              const isPending = step.status === 'pending';

              return (
                <div
                  key={step.id}
                  className={`
                    flex items-center gap-4 p-4 rounded-2xl transition-all duration-500
                    ${isProcessing ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 scale-105' : ''}
                    ${isCompleted ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500' : ''}
                    ${isPending ? 'bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 opacity-50' : ''}
                  `}
                >
                  {/* Icon */}
                  <div className={`
                    flex items-center justify-center w-12 h-12 rounded-xl shrink-0 transition-all duration-500
                    ${isProcessing ? 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/50 animate-pulse' : ''}
                    ${isCompleted ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/50' : ''}
                    ${isPending ? 'bg-gray-300 dark:bg-gray-700' : ''}
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <Icon className={`w-6 h-6 ${isProcessing || isCompleted ? 'text-white' : 'text-gray-500'}`} />
                    )}
                  </div>

                  {/* Label */}
                  <div className="flex-1">
                    <p className={`
                      font-semibold transition-all duration-500
                      ${isProcessing ? 'text-blue-700 dark:text-blue-300' : ''}
                      ${isCompleted ? 'text-green-700 dark:text-green-300' : ''}
                      ${isPending ? 'text-gray-500 dark:text-gray-500' : ''}
                    `} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      {language === 'ar' ? step.label_ar : step.label_en}
                    </p>
                  </div>

                  {/* Status Indicator */}
                  {isProcessing && (
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  )}

                  {isCompleted && (
                    <div className="text-green-600 dark:text-green-400 font-bold">
                      ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Campaign Info */}
          {campaignData && (
            <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">
                    {language === 'ar' ? 'نوع الحملة' : 'Campaign Type'}
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {campaignData.campaignType || 'SEARCH'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">
                    {language === 'ar' ? 'الميزانية اليومية' : 'Daily Budget'}
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    ${campaignData.dailyBudget || campaignData.dailyBudgetUSD || 15}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer Note */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {language === 'ar'
                ? '⏱️ قد تستغرق العملية بضع دقائق'
                : '⏱️ This process may take a few minutes'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

