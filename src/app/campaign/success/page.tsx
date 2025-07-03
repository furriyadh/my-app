'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCampaignData } from '@/lib/hooks/useBudgetEstimates';
import { AccountSelectionModal } from '@/components/campaign/AccountSelection/AccountSelectionModal';
import { SuccessModal } from '@/components/common/SuccessModal';
import { ConfettiEffect } from '@/components/common/ConfettiEffect';
import { Button } from '@/components/ui/Button';
import { CheckCircle, Rocket, ArrowRight } from 'lucide-react';

const CampaignSuccessPage: React.FC = () => {
  const router = useRouter();
  const { campaignData, saveCampaign, resetCampaignData } = useCampaignData();
  
  const [showAccountSelection, setShowAccountSelection] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string>('');

  // التحقق من اكتمال البيانات
  useEffect(() => {
    if (!campaignData) {
      router.push('/campaign/new');
      return;
    }
  }, [campaignData, router]);

  // معالجة اختيار الحساب الإعلاني
  const handleAccountSelection = async (accountChoice: 'existing' | 'new', accountId?: string) => {
    setIsCreating(true);
    setError('');

    try {
      // تحديث بيانات الحملة مع اختيار الحساب
      const updatedCampaign = {
        ...campaignData!,
        accountChoice,
        selectedAccountId: accountId
      };

      // إنشاء الحملة
      await saveCampaign();

      // إخفاء نافذة اختيار الحساب وإظهار نافذة النجاح
      setShowAccountSelection(false);
      setShowSuccess(true);

    } catch (error) {
      console.error('Error creating campaign:', error);
      setError('فشل في إنشاء الحملة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsCreating(false);
    }
  };

  // معالجة إغلاق نافذة النجاح
  const handleSuccessClose = () => {
    setShowSuccess(false);
    resetCampaignData();
    router.push('/dashboard');
  };

  if (!campaignData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto p-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">الحملة جاهزة للإطلاق!</h1>
          <p className="text-gray-600">اختر الحساب الإعلاني لإطلاق حملتك</p>
        </div>

        {/* ملخص الحملة */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">ملخص الحملة</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* المعلومات الأساسية */}
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">اسم الحملة</div>
                <div className="font-medium text-gray-800">{campaignData.name}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">نوع الإعلان</div>
                <div className="font-medium text-gray-800">{getAdTypeName(campaignData.type)}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">الموقع المستهدف</div>
                <div className="font-medium text-gray-800">{campaignData.targetLocation?.name}</div>
              </div>
            </div>

            {/* الميزانية والجدولة */}
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">الميزانية اليومية</div>
                <div className="font-medium text-gray-800">
                  ${campaignData.budget?.dailyAmount} {campaignData.budget?.currency}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">النقرات المتوقعة</div>
                <div className="font-medium text-gray-800">
                  {campaignData.budget?.estimatedClicks} نقرة يومياً
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">الوصول المتوقع</div>
                <div className="font-medium text-gray-800">
                  {campaignData.budget?.estimatedReach?.toLocaleString()} شخص
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* رسالة الخطأ */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="text-red-800 text-sm">{error}</div>
          </div>
        )}

        {/* أزرار الإجراء */}
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={isCreating}
          >
            تعديل الحملة
          </Button>
          
          <Button
            onClick={() => setShowAccountSelection(true)}
            disabled={isCreating}
            className="flex items-center gap-2"
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                جاري الإنشاء...
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4" />
                إطلاق الحملة
              </>
            )}
          </Button>
        </div>

      </div>

      {/* نافذة اختيار الحساب الإعلاني */}
      <AccountSelectionModal
        isOpen={showAccountSelection}
        onClose={() => setShowAccountSelection(false)}
        onSelect={handleAccountSelection}
        isLoading={isCreating}
      />

      {/* نافذة النجاح */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={handleSuccessClose}
        campaignName={campaignData.name}
      />

      {/* تأثير الكونفيتي */}
      {showSuccess && <ConfettiEffect />}

    </div>
  );
};

// دالة مساعدة لترجمة أسماء أنواع الإعلانات
const getAdTypeName = (type: string): string => {
  const names: {[key: string]: string} = {
    call: 'إعلانات الاتصال',
    search: 'إعلانات البحث',
    text: 'الإعلانات النصية',
    youtube: 'إعلانات YouTube',
    gmail: 'إعلانات Gmail'
  };
  return names[type] || type;
};

export default CampaignSuccessPage;

