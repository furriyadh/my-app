'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCampaignData } from '@/lib/hooks/useCampaignData';
import { CallAdsForm } from '@/components/campaign/AdCreative/CallAdsForm';
import { SearchAdsForm } from '@/components/campaign/AdCreative/SearchAdsForm';
import { TextAdsForm } from '@/components/campaign/AdCreative/TextAdsForm';
import { YouTubeAdsForm } from '@/components/campaign/AdCreative/YouTubeAdsForm';
import { GmailAdsForm } from '@/components/campaign/AdCreative/GmailAdsForm';
import { ValidationDisplay } from '@/components/campaign/AdCreative/ValidationDisplay';
import { Button } from '@/components/ui/Button';
import { ProgressIndicator } from '@/components/common/ProgressIndicator';
import { ArrowLeft, ArrowRight, Palette } from 'lucide-react';
import { AdCreativeData, AdType } from '@/lib/types/campaign';

const AdCreativePage: React.FC = () => {
  const router = useRouter();
  const { campaignData, updateAdCreative, validateStep } = useCampaignData();
  
  const [adCreativeData, setAdCreativeData] = useState<AdCreativeData>({
    headlines: campaignData?.adCreative?.headlines || [],
    descriptions: campaignData?.adCreative?.descriptions || [],
    finalUrl: campaignData?.websiteUrl || '',
    phoneNumber: campaignData?.adCreative?.phoneNumber || '',
    businessName: campaignData?.adCreative?.businessName || '',
    callToAction: campaignData?.adCreative?.callToAction || '',
    images: campaignData?.adCreative?.images || [],
    logo: campaignData?.adCreative?.logo || undefined
  });

  const [validation, setValidation] = useState<{isValid: boolean; errors: string[]}>({
    isValid: false,
    errors: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // التحقق من صحة البيانات عند تغييرها
  useEffect(() => {
    const validateData = () => {
      const errors: string[] = [];
      const adType = campaignData?.type;

      if (!adType) {
        errors.push('نوع الإعلان غير محدد');
        setValidation({ isValid: false, errors });
        return;
      }

      // التحقق من المتطلبات الأساسية
      if (!adCreativeData.headlines.length) {
        errors.push('يجب إضافة عنوان واحد على الأقل');
      }

      if (!adCreativeData.descriptions.length) {
        errors.push('يجب إضافة وصف واحد على الأقل');
      }

      if (!adCreativeData.finalUrl.trim()) {
        errors.push('رابط الموقع مطلوب');
      }

      // التحقق من متطلبات نوع الإعلان المحدد
      switch (adType) {
        case 'call':
          if (!adCreativeData.phoneNumber?.trim()) {
            errors.push('رقم الهاتف مطلوب لإعلانات الاتصال');
          }
          if (!adCreativeData.businessName?.trim()) {
            errors.push('اسم النشاط التجاري مطلوب');
          }
          break;

        case 'youtube':
          if (!adCreativeData.logo) {
            errors.push('شعار النشاط التجاري مطلوب لإعلانات YouTube');
          }
          break;

        case 'gmail':
          if (!adCreativeData.logo) {
            errors.push('شعار النشاط التجاري مطلوب لإعلانات Gmail');
          }
          if (!adCreativeData.images?.length) {
            errors.push('صورة واحدة على الأقل مطلوبة لإعلانات Gmail');
          }
          break;
      }

      setValidation({
        isValid: errors.length === 0,
        errors
      });
    };

    validateData();
  }, [adCreativeData, campaignData?.type]);

  // معالجة تغيير البيانات
  const handleDataChange = (field: keyof AdCreativeData, value: any) => {
    setAdCreativeData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // رندر النموذج المناسب حسب نوع الإعلان
  const renderAdForm = () => {
    const adType = campaignData?.type;

    switch (adType) {
      case 'call':
        return (
          <CallAdsForm
            data={adCreativeData}
            onChange={handleDataChange}
          />
        );
      case 'search':
        return (
          <SearchAdsForm
            data={adCreativeData}
            onChange={handleDataChange}
          />
        );
      case 'text':
        return (
          <TextAdsForm
            data={adCreativeData}
            onChange={handleDataChange}
          />
        );
      case 'youtube':
        return (
          <YouTubeAdsForm
            data={adCreativeData}
            onChange={handleDataChange}
          />
        );
      case 'gmail':
        return (
          <GmailAdsForm
            data={adCreativeData}
            onChange={handleDataChange}
          />
        );
      default:
        return (
          <div className="text-center py-8">
            <div className="text-gray-500">نوع الإعلان غير محدد</div>
          </div>
        );
    }
  };

  // الانتقال للخطوة التالية
  const handleNext = async () => {
    if (!validation.isValid) return;

    setIsSubmitting(true);
    try {
      await updateAdCreative(adCreativeData);
      router.push('/campaign/success');
    } catch (error) {
      console.error('Error saving ad creative:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto p-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">تصميم الإعلان</h1>
            <p className="text-gray-600 mt-1">الخطوة 4 من 4: إنشاء محتوى الإعلان</p>
          </div>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator currentStep={4} totalSteps={4} className="mb-8" />

        {/* نوع الإعلان المختار */}
        {campaignData?.type && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Palette className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">
                تصميم {getAdTypeName(campaignData.type)}
              </h2>
            </div>
            <div className="text-gray-600">
              قم بإنشاء محتوى إعلانك وفقاً لمتطلبات {getAdTypeName(campaignData.type)}
            </div>
          </div>
        )}

        {/* نموذج تصميم الإعلان */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          {renderAdForm()}
        </div>

        {/* عرض التحقق من الصحة */}
        <ValidationDisplay
          validation={validation}
          adType={campaignData?.type}
          className="mb-8"
        />

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
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
            disabled={!validation.isValid || isSubmitting}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                جاري الحفظ...
              </>
            ) : (
              <>
                إطلاق الحملة
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>

      </div>
    </div>
  );
};

// دالة مساعدة لترجمة أسماء أنواع الإعلانات
const getAdTypeName = (type: AdType): string => {
  const names = {
    call: 'إعلانات الاتصال',
    search: 'إعلانات البحث',
    text: 'الإعلانات النصية',
    youtube: 'إعلانات YouTube',
    gmail: 'إعلانات Gmail'
  };
  return names[type] || type;
};

export default AdCreativePage;

