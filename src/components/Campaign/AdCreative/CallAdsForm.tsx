'use client';

import React, { useState } from 'react';
import { Phone, Upload, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface CallAdsFormData {
  businessName: string;
  phoneNumber: string;
  headline1: string;
  headline2: string;
  description: string;
  finalUrl: string;
  logo?: File;
}

interface CallAdsFormProps {
  data?: CallAdsFormData;
  onChange: (data: CallAdsFormData) => void;
  errors?: Record<string, string>;
}

export const CallAdsForm: React.FC<CallAdsFormProps> = ({
  data,
  onChange,
  errors = {}
}) => {
  const [formData, setFormData] = useState<CallAdsFormData>(
    data || {
      businessName: '',
      phoneNumber: '',
      headline1: '',
      headline2: '',
      description: '',
      finalUrl: ''
    }
  );

  const handleChange = (field: keyof CallAdsFormData, value: string | File) => {
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

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <Phone className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">إعلانات المكالمات</h3>
            <p className="text-sm text-gray-600">إعلانات تشجع العملاء على الاتصال مباشرة</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* معلومات النشاط التجاري */}
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
                رقم الهاتف *
              </label>
              <Input
                value={formData.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                placeholder="+966 50 123 4567"
                error={errors.phoneNumber}
              />
              {errors.phoneNumber && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.phoneNumber}
                </div>
              )}
              <div className="text-xs text-gray-500 mt-1">
                سيظهر هذا الرقم في الإعلان ويمكن للعملاء الاتصال عليه مباشرة
              </div>
            </div>
          </div>

          {/* رفع الشعار */}
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
                id="logo-upload"
              />
              <label htmlFor="logo-upload" className="cursor-pointer">
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

        {/* محتوى الإعلان */}
        <div className="mt-6 space-y-4">
          <h4 className="font-medium text-gray-800">محتوى الإعلان</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                العنوان الأول * (حتى 30 حرف)
              </label>
              <Input
                value={formData.headline1}
                onChange={(e) => handleChange('headline1', e.target.value)}
                placeholder="مثال: أفضل مطعم في الرياض"
                maxLength={30}
                error={errors.headline1}
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.headline1.length}/30 حرف
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                العنوان الثاني (حتى 30 حرف)
              </label>
              <Input
                value={formData.headline2}
                onChange={(e) => handleChange('headline2', e.target.value)}
                placeholder="مثال: اتصل الآن للحجز"
                maxLength={30}
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.headline2.length}/30 حرف
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الوصف * (حتى 90 حرف)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="مثال: أطباق شرقية أصيلة، خدمة سريعة، أسعار مناسبة. اتصل الآن!"
              maxLength={90}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.description.length}/90 حرف
            </div>
            {errors.description && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {errors.description}
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
        </div>

        {/* معاينة الإعلان */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-3">معاينة الإعلان</h4>
          <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-sm">
            <div className="flex items-start gap-3">
              {formData.logo && (
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
              )}
              <div className="flex-1">
                <div className="text-blue-600 font-medium text-sm">
                  {formData.headline1 || 'العنوان الأول'}
                </div>
                {formData.headline2 && (
                  <div className="text-blue-600 text-sm">
                    {formData.headline2}
                  </div>
                )}
                <div className="text-gray-600 text-sm mt-1">
                  {formData.description || 'الوصف'}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Phone className="w-4 h-4 text-green-600" />
                  <span className="text-green-600 font-medium text-sm">
                    {formData.phoneNumber || 'رقم الهاتف'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

