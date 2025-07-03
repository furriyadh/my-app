'use client';

import React, { useState } from 'react';
import { FileText, Upload, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface TextAdsFormData {
  headline: string;
  description: string;
  finalUrl: string;
  businessName: string;
  callToAction: string;
  logo?: File;
}

interface TextAdsFormProps {
  data?: TextAdsFormData;
  onChange: (data: TextAdsFormData) => void;
  errors?: Record<string, string>;
}

export const TextAdsForm: React.FC<TextAdsFormProps> = ({
  data,
  onChange,
  errors = {}
}) => {
  const [formData, setFormData] = useState<TextAdsFormData>(
    data || {
      headline: '',
      description: '',
      finalUrl: '',
      businessName: '',
      callToAction: ''
    }
  );

  const handleChange = (field: keyof TextAdsFormData, value: string | File) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onChange(newData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleChange('logo', file);
    }
  };

  const callToActionOptions = [
    'اتصل الآن',
    'احجز موعد',
    'اطلب الآن',
    'تسوق الآن',
    'احصل على عرض',
    'تعلم المزيد',
    'سجل الآن',
    'ابدأ الآن'
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <FileText className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">الإعلانات النصية</h3>
            <p className="text-sm text-gray-600">إعلانات نصية بسيطة وفعالة</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* المحتوى النصي */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم النشاط التجاري *
              </label>
              <Input
                value={formData.businessName}
                onChange={(e) => handleChange('businessName', e.target.value)}
                placeholder="مثال: مطعم الأصالة"
                error={errors.businessName}
              />
              {errors.businessName && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.businessName}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                العنوان الرئيسي * (حتى 50 حرف)
              </label>
              <Input
                value={formData.headline}
                onChange={(e) => handleChange('headline', e.target.value)}
                placeholder="مثال: أفضل مطعم شرقي في الرياض"
                maxLength={50}
                error={errors.headline}
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.headline.length}/50 حرف
              </div>
              {errors.headline && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.headline}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الوصف * (حتى 120 حرف)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="مثال: أطباق شرقية أصيلة، خدمة سريعة، أسعار مناسبة. تجربة لا تُنسى في قلب الرياض."
                maxLength={120}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.description.length}/120 حرف
              </div>
              {errors.description && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.description}
                </div>
              )}
            </div>
          </div>

          {/* الإعدادات والشعار */}
          <div className="space-y-4">
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
              {errors.callToAction && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.callToAction}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رابط الموقع *
              </label>
              <Input
                value={formData.finalUrl}
                onChange={(e) => handleChange('finalUrl', e.target.value)}
                placeholder="https://example.com"
                error={errors.finalUrl}
              />
              {errors.finalUrl && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.finalUrl}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                شعار النشاط التجاري
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="text-logo-upload"
                />
                <label htmlFor="text-logo-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">
                    {formData.logo ? formData.logo.name : 'اختر ملف الشعار'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    PNG, JPG حتى 2MB
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* معاينة الإعلان */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-3">معاينة الإعلان</h4>
          <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-md">
            <div className="flex items-start gap-3">
              {formData.logo && (
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <div className="text-blue-600 font-medium text-lg mb-1">
                  {formData.headline || 'العنوان الرئيسي'}
                </div>
                <div className="text-gray-600 text-sm mb-2">
                  {formData.description || 'الوصف'}
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  {formData.businessName || 'اسم النشاط التجاري'}
                </div>
                <Button size="sm" className="text-xs">
                  {formData.callToAction || 'دعوة للعمل'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* نصائح للإعلان النصي */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">نصائح للإعلان النصي الفعال</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• استخدم كلمات مفتاحية قوية في العنوان</li>
            <li>• اجعل الوصف واضحاً ومحدداً</li>
            <li>• اختر دعوة للعمل تحفز على التفاعل</li>
            <li>• تأكد من أن الرابط يؤدي للصفحة المناسبة</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

