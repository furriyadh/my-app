'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCampaignData } from '@/lib/hooks/useCampaignData';
import { useBudgetEstimates } from '@/lib/hooks/useBudgetEstimates';
import { BudgetSlider } from '@/components/campaign/BudgetScheduling/BudgetSlider';
import { StatsDisplay } from '@/components/campaign/BudgetScheduling/StatsDisplay';
import { PresetSchedules } from '@/components/campaign/BudgetScheduling/PresetSchedules';
import { CustomSchedule } from '@/components/campaign/BudgetScheduling/CustomSchedule';
import { Button } from '@/components/ui/Button';
import { ProgressIndicator } from '@/components/common/ProgressIndicator';
import { ArrowLeft, ArrowRight, DollarSign, Calendar } from 'lucide-react';
import { BudgetData, ScheduleData } from '@/lib/types/campaign';

const BudgetSchedulingPage: React.FC = () => {
  const router = useRouter();
  const { campaignData, updateBudgetAndSchedule } = useCampaignData();
  const { getBudgetEstimates, getAccountBudget } = useBudgetEstimates();
  
  const [budgetData, setBudgetData] = useState<BudgetData>({
    dailyAmount: campaignData?.budget?.dailyAmount || 50,
    currency: campaignData?.budget?.currency || 'USD',
    estimatedReach: 0,
    estimatedClicks: 0,
    avgCPC: 0
  });

  const [scheduleData, setScheduleData] = useState<ScheduleData>({
    type: campaignData?.schedule?.type || 'preset',
    preset: campaignData?.schedule?.preset || 'peak',
    timezone: campaignData?.targetLocation?.timezone || 'UTC'
  });

  const [accountBudget, setAccountBudget] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // جلب ميزانية الحساب المتاحة
  useEffect(() => {
    const fetchAccountBudget = async () => {
      try {
        const budget = await getAccountBudget();
        setAccountBudget(budget);
      } catch (error) {
        console.error('Error fetching account budget:', error);
      }
    };

    fetchAccountBudget();
  }, [getAccountBudget]);

  // تحديث تقديرات الميزانية عند تغيير المبلغ
  useEffect(() => {
    const updateEstimates = async () => {
      if (!campaignData?.targetLocation || !campaignData?.type) return;

      try {
        const estimates = await getBudgetEstimates({
          dailyBudget: budgetData.dailyAmount,
          location: campaignData.targetLocation,
          adType: campaignData.type
        });

        setBudgetData(prev => ({
          ...prev,
          estimatedReach: estimates.estimatedReach,
          estimatedClicks: estimates.estimatedClicks,
          avgCPC: estimates.avgCPC
        }));
      } catch (error) {
        console.error('Error getting budget estimates:', error);
      }
    };

    updateEstimates();
  }, [budgetData.dailyAmount, campaignData, getBudgetEstimates]);

  // معالجة تغيير الميزانية
  const handleBudgetChange = (amount: number) => {
    setBudgetData(prev => ({
      ...prev,
      dailyAmount: amount
    }));
  };

  // معالجة تغيير الجدولة
  const handleScheduleChange = (schedule: Partial<ScheduleData>) => {
    setScheduleData(prev => ({
      ...prev,
      ...schedule
    }));
  };

  // التحقق من صحة البيانات
  const validateData = (): boolean => {
    if (budgetData.dailyAmount < 3) {
      setError('الميزانية اليومية يجب أن تكون 3$ على الأقل');
      return false;
    }

    if (accountBudget && budgetData.dailyAmount > accountBudget) {
      setError(`الميزانية اليومية تتجاوز الرصيد المتاح (${accountBudget}$)`);
      return false;
    }

    if (!scheduleData.type) {
      setError('يجب تحديد جدولة الإعلانات');
      return false;
    }

    setError('');
    return true;
  };

  // الانتقال للخطوة التالية
  const handleNext = async () => {
    if (!validateData()) return;

    setIsLoading(true);
    try {
      await updateBudgetAndSchedule(budgetData, scheduleData);
      router.push('/campaign/ad-creative');
    } catch (error) {
      console.error('Error saving budget and schedule:', error);
      setError('فشل في حفظ بيانات الميزانية والجدولة');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto p-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">الميزانية والجدولة</h1>
            <p className="text-gray-600 mt-1">الخطوة 3 من 4: تحديد الميزانية وجدولة العرض</p>
          </div>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator currentStep={3} totalSteps={4} className="mb-8" />

        {/* عرض ميزانية الحساب */}
        {accountBudget && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium text-blue-800">الميزانية المتاحة في الحساب</div>
                <div className="text-2xl font-bold text-blue-900">${accountBudget.toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* قسم الميزانية */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">الميزانية اليومية</h2>
            </div>

            {/* شريط الميزانية */}
            <BudgetSlider
              value={budgetData.dailyAmount}
              onChange={handleBudgetChange}
              min={3}
              max={10000}
              currency={budgetData.currency}
              className="mb-8"
            />

            {/* عرض الإحصائيات */}
            <StatsDisplay
              budget={budgetData}
              isLoading={isLoading}
            />
          </div>

          {/* قسم الجدولة */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">جدولة الحملة</h2>
            </div>

            {/* عرض المنطقة الزمنية */}
            {campaignData?.targetLocation && (
              <div className="bg-blue-50 p-3 rounded-lg mb-6">
                <div className="text-sm text-blue-700">
                  التوقيت المحلي: {campaignData.targetLocation.name} ({scheduleData.timezone})
                </div>
              </div>
            )}

            {/* الجدولة المسبقة */}
            <PresetSchedules
              selectedPreset={scheduleData.preset}
              onSelect={(preset) => handleScheduleChange({ type: 'preset', preset })}
              timezone={scheduleData.timezone}
              className="mb-6"
            />

            {/* الجدولة المخصصة */}
            <CustomSchedule
              isActive={scheduleData.type === 'custom'}
              data={scheduleData.custom}
              onChange={(custom) => handleScheduleChange({ type: 'custom', custom })}
              timezone={scheduleData.timezone}
            />
          </div>

        </div>

        {/* رسالة الخطأ */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
            <div className="text-red-800 text-sm">{error}</div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            السابق
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                جاري الحفظ...
              </>
            ) : (
              <>
                التالي
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>

      </div>
    </div>
  );
};

export default BudgetSchedulingPage;

