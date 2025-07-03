'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCampaignData } from '@/lib/hooks/useCampaignData';
import { CampaignBasicInfo } from '@/components/campaign/CampaignBasicInfo';
import { AdTypeSelector } from '@/components/campaign/AdTypeSelector';
import { Button } from '@/components/ui/Button';
import { ProgressIndicator } from '@/components/common/ProgressIndicator';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { AdType, CampaignFormData } from '@/lib/types/campaign';

const CampaignNewPage: React.FC = () => {
  const router = useRouter();
  const { campaignData, updateBasicInfo, validateStep } = useCampaignData();
  
  const [formData, setFormData] = useState<CampaignFormData>({
    name: campaignData?.name || '',
    type: campaignData?.type || null,
    websiteUrl: campaignData?.websiteUrl || ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // التحقق من صحة البيانات
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'اسم الحملة مطلوب';
    }

    if (!formData.websiteUrl.trim()) {
      newErrors.websiteUrl = 'رابط الموقع مطلوب';
    } else if (!formData.websiteUrl.startsWith('https://')) {
      newErrors.websiteUrl = 'يجب أن يبدأ الرابط بـ https://';
    }

    if (!formData.type) {
      newErrors.type = 'يجب اختيار نوع الإعلان';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // معالجة تغيير البيانات
  const handleInputChange = (field: keyof CampaignFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // إزالة الخطأ عند التصحيح
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // الانتقال للخطوة التالية
  const handleNext = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // حفظ البيانات في Context
      await updateBasicInfo(formData);

      // انتقال لصفحة الاستهداف الجغرافي
      router.push('/campaign/location-targeting');
    } catch (error) {
      console.error('Error saving campaign data:', error);
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
            <h1 className="text-3xl font-bold text-gray-800">إنشاء حملة إعلانية جديدة</h1>
            <p className="text-gray-600 mt-1">الخطوة 1 من 4: المعلومات الأساسية</p>
          </div>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator currentStep={1} totalSteps={4} className="mb-8" />

        {/* Campaign Basic Information */}
        <CampaignBasicInfo
          data={formData}
          errors={errors}
          onChange={handleInputChange}
          className="mb-8"
        />

        {/* Ad Type Selection */}
        <AdTypeSelector
          selectedType={formData.type}
          onSelect={(type) => handleInputChange('type', type)}
          error={errors.type}
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
            إلغاء
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
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

export default CampaignNewPage;

