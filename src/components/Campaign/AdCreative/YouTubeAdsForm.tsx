'use client';

import React, { useState } from 'react';
import { Play, Upload, AlertCircle, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface YouTubeAdsFormData {
  videoUrl: string;
  headline: string;
  description: string;
  finalUrl: string;
  displayUrl: string;
  callToAction: string;
  companionBanner?: File;
  adFormat: 'skippable' | 'non-skippable' | 'bumper' | 'discovery';
}

interface YouTubeAdsFormProps {
  data?: YouTubeAdsFormData;
  onChange: (data: YouTubeAdsFormData) => void;
  errors?: Record<string, string>;
}

export const YouTubeAdsForm: React.FC<YouTubeAdsFormProps> = ({
  data,
  onChange,
  errors = {}
}) => {
  const [formData, setFormData] = useState<YouTubeAdsFormData>(
    data || {
      videoUrl: '',
      headline: '',
      description: '',
      finalUrl: '',
      displayUrl: '',
      callToAction: '',
      adFormat: 'skippable'
    }
  );

  const handleChange = (field: keyof YouTubeAdsFormData, value: string | File) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onChange(newData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleChange('companionBanner', file);
    }
  };

  const adFormats = [
    {
      id: 'skippable',
      name: 'إعلان قابل للتخطي',
      description: 'يمكن تخطيه بعد 5 ثوانٍ',
      duration: 'أي مدة'
    },
    {
      id: 'non-skippable',
      name: 'إعلان غير قابل للتخطي',
      description: 'يجب مشاهدته كاملاً',
      duration: 'حتى 15 ثانية'
    },
    {
      id: 'bumper',
      name: 'إعلان قصير',
      description: 'إعلان قصير وسريع',
      duration: '6 ثوانٍ'
    },
    {
      id: 'discovery',
      name: 'إعلان الاكتشاف',
      description: 'يظهر في نتائج البحث',
      duration: 'أي مدة'
    }
  ];

  const callToActionOptions = [
    'شاهد الآن',
    'تعلم المزيد',
    'تسوق الآن',
    'احجز الآن',
    'اشترك الآن',
    'حمل التطبيق',
    'احصل على عرض',
    'ابدأ الآن'
  ];

  const extractVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const videoId = extractVideoId(formData.videoUrl);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-100 rounded-lg">
            <Play className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">إعلانات YouTube</h3>
            <p className="text-sm text-gray-600">إعلانات فيديو على منصة YouTube</p>
          </div>
        </div>

        {/* نوع الإعلان */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            نوع الإعلان *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {adFormats.map((format) => (
              <div
                key={format.id}
                onClick={() => handleChange('adFormat', format.id as any)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  formData.adFormat === format.id
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-800">{format.name}</div>
                <div className="text-sm text-gray-600 mt-1">{format.description}</div>
                <div className="text-xs text-gray-500 mt-1">المدة: {format.duration}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* معلومات الفيديو */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رابط فيديو YouTube *
              </label>
              <Input
                value={formData.videoUrl}
                onChange={(e) => handleChange('videoUrl', e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                error={errors.videoUrl}
              />
              {errors.videoUrl && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.videoUrl}
                </div>
              )}
              <div className="text-xs text-gray-500 mt-1">
                يجب أن يكون الفيديو عاماً أو غير مدرج
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                العنوان * (حتى 25 حرف)
              </label>
              <Input
                value={formData.headline}
                onChange={(e) => handleChange('headline', e.target.value)}
                placeholder="مثال: منتجات عالية الجودة"
                maxLength={25}
                error={errors.headline}
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.headline.length}/25 حرف
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الوصف * (حتى 35 حرف)
              </label>
              <Input
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="مثال: اكتشف مجموعتنا الجديدة"
                maxLength={35}
                error={errors.description}
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.description.length}/35 حرف
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                دعوة للعمل *
              </label>
              <select
                value={formData.callToAction}
                onChange={(e) => handleChange('callToAction', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">اختر دعوة للعمل</option>
                {callToActionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* الروابط والبانر */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الرابط النهائي *
              </label>
              <Input
                value={formData.finalUrl}
                onChange={(e) => handleChange('finalUrl', e.target.value)}
                placeholder="https://example.com"
                error={errors.finalUrl}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رابط العرض
              </label>
              <Input
                value={formData.displayUrl}
                onChange={(e) => handleChange('displayUrl', e.target.value)}
                placeholder="example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                بانر مصاحب (اختياري)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="youtube-banner-upload"
                />
                <label htmlFor="youtube-banner-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">
                    {formData.companionBanner ? formData.companionBanner.name : 'اختر صورة البانر'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    300x250 بكسل، PNG/JPG
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* معاينة الفيديو */}
        {videoId && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-3">معاينة الفيديو</h4>
            <div className="bg-white rounded-lg overflow-hidden max-w-md">
              <div className="aspect-video bg-gray-200 relative">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  className="w-full h-full"
                  frameBorder="0"
                  allowFullScreen
                />
              </div>
              <div className="p-3">
                <div className="font-medium text-gray-800">
                  {formData.headline || 'العنوان'}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {formData.description || 'الوصف'}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="text-xs text-gray-500">
                    {formData.displayUrl || 'example.com'}
                  </div>
                  <Button size="sm" className="text-xs">
                    {formData.callToAction || 'دعوة للعمل'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* نصائح لإعلانات YouTube */}
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-medium text-red-800 mb-2">نصائح لإعلانات YouTube الفعالة</h4>
          <ul className="text-sm text-red-700 space-y-1">
            <li>• اجذب الانتباه في أول 5 ثوانٍ</li>
            <li>• استخدم محتوى بصري جذاب وعالي الجودة</li>
            <li>• اجعل الرسالة واضحة ومباشرة</li>
            <li>• أضف دعوة واضحة للعمل</li>
            <li>• تأكد من أن الفيديو متوافق مع الجمهور المستهدف</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

