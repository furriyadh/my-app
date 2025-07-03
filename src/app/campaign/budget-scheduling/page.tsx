'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCampaignContext } from '@/lib/context/CampaignContext';
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
  const { state, updateCampaignData } = useCampaignContext();
  const { getBudgetEstimates, getAccountBudget, formatCurrency } = useBudgetEstimates();
  
  const [budgetData, setBudgetData] = useState<BudgetData>({
    dailyAmount: state.campaignData?.budget?.dailyAmount || 50,
    currency: state.campaignData?.budget?.currency || 'SAR',
    estimatedReach: 0,
    estimatedClicks: 0,
    avgCPC: 0
  });

  const [scheduleData, setScheduleData] = useState<ScheduleData>({
    type: state.campaignData?.schedule?.type || 'preset',
    preset: state.campaignData?.schedule?.preset || 'peak',
    timezone: state.campaignData?.targetLocation?.timezone || 'Asia/Riyadh'
  });

  const [estimates, setEstimates] = useState(null);
  const [accountBudget, setAccountBudget] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // تحديث التقديرات عند تغيير الميزانية
  useEffect(() => {
    const updateEstimates = async () => {
      setIsLoading(true);
      try {
        const newEstimates = await getBudgetEstimates(
          budgetData.dailyAmount,
          state.campaignData?.targetLocation?.name,
          state.campaignData?.type
        );
        setEstimates(newEstimates);
        
        // تحديث بيانات الميزانية مع التقديرات
        setBudgetData(prev => ({
          ...prev,
          estimatedReach: newEstimates.estimatedReach,
          estimatedClicks: newEstimates.estimatedClicks,
          avgCPC: newEstimates.averageCpc
        }));
      } catch (err) {
        setError('فشل في الحصول على تقديرات الميزانية');
      } finally {
        setIsLoading(false);
      }
    };

    updateEstimates();
  }, [budgetData.dailyAmount, getBudgetEstimates, state.campaignData?.targetLocation?.name, state.campaignData?.type]);

  // تحميل ميزانية الحساب
  useEffect(() => {
    const loadAccountBudget = async () => {
      try {
        const budget = await getAccountBudget();
        setAccountBudget(budget);
      } catch (err) {
        console.error('فشل في تحميل ميزانية الحساب:', err);
      }
    };

    loadAccountBudget();
  }, [getAccountBudget]);

  // تحديث الميزانية
  const handleBudgetChange = (amount: number) => {
    setBudgetData(prev => ({
      ...prev,
      dailyAmount: amount
    }));
  };

  // تحديث الجدولة
  const handleScheduleChange = (newSchedule: Partial<ScheduleData>) => {
    setScheduleData(prev => ({
      ...prev,
      ...newSchedule
    }));
  };

  // التنقل للخطوة التالية
  const handleNext = () => {
    // تحديث بيانات الحملة
    updateCampaignData({
      budget: budgetData,
      schedule: scheduleData
    });

    router.push('/campaign/ad-creative');
  };

  // التنقل للخطوة السابقة
  const handlePrevious = () => {
    router.push('/campaign/location-targeting');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* مؤشر التقدم */}
        <div className="mb-8">
          <ProgressIndicator currentStep={3} totalSteps={4} />
        </div>

        {/* العنوان الرئيسي */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            الميزانية والجدولة
          </h1>
          <p className="text-gray-600">
            حدد ميزانيتك اليومية وأوقات عرض الإعلان
          </p>
        </div>

        {/* ميزانية الحساب المتاحة */}
        {accountBudget && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              الميزانية المتاحة في الحساب
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(accountBudget.totalBudget, accountBudget.currency)}
                </div>
                <div className="text-sm text-green-700">إجمالي الميزانية</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(accountBudget.availableBudget, accountBudget.currency)}
                </div>
                <div className="text-sm text-blue-700">المتاح للإنفاق</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(accountBudget.totalBudget - accountBudget.availableBudget, accountBudget.currency)}
                </div>
                <div className="text-sm text-orange-700">المُستخدم</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* قسم الميزانية */}
          <div className="space-y-6">
            {/* شريط الميزانية */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                الميزانية اليومية
              </h2>
              
              <BudgetSlider
                value={budgetData.dailyAmount}
                onChange={handleBudgetChange}
                min={3}
                max={10000}
                currency={budgetData.currency}
              />
            </div>

            {/* الإحصائيات */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                التقديرات المتوقعة
              </h3>
              
              <StatsDisplay
                budget={budgetData.dailyAmount}
                estimates={estimates}
                currency={budgetData.currency}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* قسم الجدولة */}
          <div className="space-y-6">
            {/* الجدولة المسبقة */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                جدولة الإعلان
              </h2>
              
              <PresetSchedules
                selectedPreset={scheduleData.preset}
                onPresetSelect={(preset) => handleScheduleChange({ type: 'preset', preset })}
                timezone={scheduleData.timezone}
              />
            </div>

            {/* الجدولة المخصصة */}
            {scheduleData.type === 'custom' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  جدولة مخصصة
                </h3>
                
                <CustomSchedule
                  schedule={scheduleData.custom}
                  onChange={(custom) => handleScheduleChange({ custom })}
                  timezone={scheduleData.timezone}
                />
              </div>
            )}

            {/* زر الجدولة المخصصة */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <Button
                variant={scheduleData.type === 'custom' ? 'default' : 'outline'}
                onClick={() => handleScheduleChange({ 
                  type: scheduleData.type === 'custom' ? 'preset' : 'custom' 
                })}
                className="w-full"
              >
                {scheduleData.type === 'custom' ? 'العودة للجدولة المسبقة' : 'جدولة مخصصة'}
              </Button>
            </div>
          </div>
        </div>

        {/* رسائل الخطأ */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* أزرار التنقل */}
        <div className="flex justify-between items-center mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            السابق
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              الخطوة 3 من 4
            </p>
          </div>

          <Button
            onClick={handleNext}
            className="flex items-center gap-2"
          >
            التالي
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* نصائح مفيدة */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6">
          <h3 className="font-semibold text-green-800 mb-3">💡 نصائح للميزانية والجدولة:</h3>
          <ul className="text-green-700 space-y-2 text-sm">
            <li>• ابدأ بميزانية صغيرة واختبر الأداء</li>
            <li>• اختر أوقات الذروة للحصول على أفضل النتائج</li>
            <li>• راقب الإحصائيات وعدل الميزانية حسب الحاجة</li>
            <li>• استخدم الجدولة المخصصة لاستهداف أوقات محددة</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BudgetSchedulingPage;

