// المسار: src/app/campaign/AdCreative/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { useRouter } from 'next/navigation';
import { useCampaignContext } from '../../../lib/context/CampaignContext';
import { Button } from '../../../components/ui/Button';
import { ProgressIndicator } from '../../../components/common/ProgressIndicator';
import { AdType } from '../../../lib/types/campaign';

// مكونات نماذج الإعلانات (مبسطة لتجنب الأخطاء)
const CallAdsForm: React.FC<{ onDataChange: (data: any) => void }> = ({ onDataChange }) => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    businessName: '',
    headline: '',
    description: '',
    finalUrl: ''
  });

  useEffect(() => {
    onDataChange(formData);
  }, [formData, onDataChange]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
        <input
          type="tel"
          value={formData.phoneNumber}
          onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="+966 50 123 4567"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">اسم النشاط التجاري</label>
        <input
          type="text"
          value={formData.businessName}
          onChange={(e) => setFormData({...formData, businessName: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="اسم شركتك أو نشاطك"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">العنوان الرئيسي</label>
        <input
          type="text"
          value={formData.headline}
          onChange={(e) => setFormData({...formData, headline: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="عنوان جذاب لإعلانك"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={3}
          placeholder="وصف مختصر لخدماتك"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">رابط الموقع</label>
        <input
          type="url"
          value={formData.finalUrl}
          onChange={(e) => setFormData({...formData, finalUrl: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="https://example.com"
        />
      </div>
    </div>
  );
};

const SearchAdsForm: React.FC<{ onDataChange: (data: any) => void }> = ({ onDataChange }) => {
  const [formData, setFormData] = useState({
    headline: '',
    description: '',
    finalUrl: ''
  });

  useEffect(() => {
    onDataChange(formData);
  }, [formData, onDataChange]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">العنوان الرئيسي</label>
        <input
          type="text"
          value={formData.headline}
          onChange={(e) => setFormData({...formData, headline: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="عنوان جذاب لإعلانك"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={3}
          placeholder="وصف مختصر لخدماتك"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">رابط الموقع</label>
        <input
          type="url"
          value={formData.finalUrl}
          onChange={(e) => setFormData({...formData, finalUrl: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="https://example.com"
        />
      </div>
    </div>
  );
};

const TextAdsForm: React.FC<{ onDataChange: (data: any) => void }> = ({ onDataChange }) => {
  const [formData, setFormData] = useState({
    headline: '',
    description: '',
    finalUrl: ''
  });

  useEffect(() => {
    onDataChange(formData);
  }, [formData, onDataChange]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">العنوان</label>
        <input
          type="text"
          value={formData.headline}
          onChange={(e) => setFormData({...formData, headline: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="عنوان الإعلان النصي"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">النص</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={4}
          placeholder="نص الإعلان"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">رابط الموقع</label>
        <input
          type="url"
          value={formData.finalUrl}
          onChange={(e) => setFormData({...formData, finalUrl: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="https://example.com"
        />
      </div>
    </div>
  );
};

const YouTubeAdsForm: React.FC<{ onDataChange: (data: any) => void }> = ({ onDataChange }) => {
  const [formData, setFormData] = useState({
    videoUrl: '',
    headline: '',
    description: '',
    finalUrl: ''
  });

  useEffect(() => {
    onDataChange(formData);
  }, [formData, onDataChange]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">رابط الفيديو</label>
        <input
          type="url"
          value={formData.videoUrl}
          onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="https://youtube.com/watch?v=..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">العنوان</label>
        <input
          type="text"
          value={formData.headline}
          onChange={(e) => setFormData({...formData, headline: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="عنوان إعلان الفيديو"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={3}
          placeholder="وصف الفيديو"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">رابط الموقع</label>
        <input
          type="url"
          value={formData.finalUrl}
          onChange={(e) => setFormData({...formData, finalUrl: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="https://example.com"
        />
      </div>
    </div>
  );
};

const GmailAdsForm: React.FC<{ onDataChange: (data: any) => void }> = ({ onDataChange }) => {
  const [formData, setFormData] = useState({
    subject: '',
    headline: '',
    description: '',
    finalUrl: ''
  });

  useEffect(() => {
    onDataChange(formData);
  }, [formData, onDataChange]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">موضوع الرسالة</label>
        <input
          type="text"
          value={formData.subject}
          onChange={(e) => setFormData({...formData, subject: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="موضوع جذاب للرسالة"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">العنوان</label>
        <input
          type="text"
          value={formData.headline}
          onChange={(e) => setFormData({...formData, headline: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="عنوان الإعلان"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">المحتوى</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={4}
          placeholder="محتوى الرسالة"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">رابط الموقع</label>
        <input
          type="url"
          value={formData.finalUrl}
          onChange={(e) => setFormData({...formData, finalUrl: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="https://example.com"
        />
      </div>
    </div>
  );
};

const ValidationDisplay: React.FC<{ errors: string[] }> = ({ errors }) => {
  if (errors.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <h3 className="font-medium text-red-800 mb-2">يرجى إصلاح الأخطاء التالية:</h3>
      <ul className="space-y-1">
        {errors.map((error, index) => (
          <li key={index} className="text-sm text-red-700">• {error}</li>
        ))}
      </ul>
    </div>
  );
};

export default function AdCreativePage() {
  const router = useRouter();
  const { state, updateCampaignData } = useCampaignContext();
  const { t, language, isRTL } = useTranslation();
  
  const [selectedAdType, setSelectedAdType] = useState<AdType>('search');
  const [adCreativeData, setAdCreativeData] = useState<any>({});
  const [isValid, setIsValid] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);


  // تحديث بيانات الإعلان
  const handleAdDataChange = (data: any) => {
    setAdCreativeData(data);
    validateAdData(data);
  };

  // التحقق من صحة البيانات
  const validateAdData = (data: any) => {
    const newErrors: string[] = [];

    if (!data.headline || data.headline.length < 5) {
      newErrors.push('العنوان يجب أن يكون 5 أحرف على الأقل');
    }

    if (!data.description || data.description.length < 10) {
      newErrors.push('الوصف يجب أن يكون 10 أحرف على الأقل');
    }

    if (!data.finalUrl || !data.finalUrl.startsWith('http')) {
      newErrors.push('رابط الموقع يجب أن يكون صحيحاً');
    }

    setErrors(newErrors);
    setIsValid(newErrors.length === 0);
  };

  // التنقل للخطوة التالية
  const handleNext = () => {
    if (!isValid) {
      return;
    }

    updateCampaignData({
      type: selectedAdType,
      adCreative: adCreativeData
    });

    router.push('/campaign/location-targeting');
  };

  // التنقل للخطوة السابقة
  const handlePrevious = () => {
    router.push('/campaign/new');
  };

  // رندر نموذج الإعلان حسب النوع
  const renderAdForm = () => {
    switch (selectedAdType) {
      case 'call':
        return <CallAdsForm onDataChange={handleAdDataChange} />;
      case 'search':
        return <SearchAdsForm onDataChange={handleAdDataChange} />;
      case 'text':
        return <TextAdsForm onDataChange={handleAdDataChange} />;
      case 'youtube':
        return <YouTubeAdsForm onDataChange={handleAdDataChange} />;
      case 'gmail':
        return <GmailAdsForm onDataChange={handleAdDataChange} />;
      default:
        return <SearchAdsForm onDataChange={handleAdDataChange} />;
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* مؤشر التقدم */}
        <ProgressIndicator currentStep={2} totalSteps={5} />

        {/* العنوان */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            إنشاء المحتوى الإعلاني
          </h1>
          <p className="text-gray-600">
            قم بإنشاء محتوى إعلانك وتخصيص الرسالة التسويقية
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* اختيار نوع الإعلان */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                نوع الإعلان
              </h2>
              
              <div className="space-y-3">
                {[
                  { type: 'search', label: 'إعلانات البحث' },
                  { type: 'call', label: 'إعلانات المكالمات' },
                  { type: 'text', label: 'إعلانات نصية' },
                  { type: 'youtube', label: 'إعلانات يوتيوب' },
                  { type: 'gmail', label: 'إعلانات جيميل' }
                ].map((option) => (
                  <button
                    key={option.type}
                    onClick={() => setSelectedAdType(option.type as AdType)}
                    className={`w-full text-right p-3 rounded-lg border transition-colors ${
                      selectedAdType === option.type
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* نموذج الإعلان */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                تفاصيل الإعلان
              </h2>
              
              {renderAdForm()}
            </div>
          </div>
        </div>

        {/* عرض الأخطاء */}
        {errors.length > 0 && (
          <div className="mt-6">
            <ValidationDisplay errors={errors} />
          </div>
        )}

        {/* أزرار التنقل */}
        <div className="flex justify-between items-center mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
          >
            السابق
          </Button>

          <Button
            onClick={handleNext}
            disabled={!isValid}
          >
            التالي: الاستهداف الجغرافي
          </Button>
        </div>
      </div>
    </div>
  );
}

