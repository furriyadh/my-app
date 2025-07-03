'use client';

import React from 'react';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Settings, AlertCircle, CheckCircle } from 'lucide-react';
import { CampaignFormData } from '@/lib/types/campaign';

interface CampaignBasicInfoProps {
  data: CampaignFormData;
  errors: {[key: string]: string};
  onChange: (field: keyof CampaignFormData, value: any) => void;
  className?: string;
}

export const CampaignBasicInfo: React.FC<CampaignBasicInfoProps> = ({
  data,
  errors,
  onChange,
  className = ''
}) => {
  
  // التحقق من صحة URL
  const isValidUrl = (url: string): boolean => {
    return url.startsWith('https://');
  };

  return (
    <Card className={`p-8 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Settings className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800">المعلومات الأساسية</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Campaign Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            اسم الحملة *
          </label>
          <Input
            type="text"
            value={data.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="أدخل اسم الحملة"
            error={errors.name}
            className="w-full"
          />
          {errors.name && (
            <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              {errors.name}
            </div>
          )}
        </div>

        {/* Website URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            رابط الموقع *
          </label>
          <Input
            type="url"
            value={data.websiteUrl}
            onChange={(e) => onChange('websiteUrl', e.target.value)}
            placeholder="https://example.com"
            error={errors.websiteUrl}
            className="w-full"
          />
          {errors.websiteUrl && (
            <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              {errors.websiteUrl}
            </div>
          )}
          {data.websiteUrl && isValidUrl(data.websiteUrl) && !errors.websiteUrl && (
            <div className="flex items-center gap-2 mt-2 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4" />
              رابط صحيح
            </div>
          )}
        </div>

      </div>

      {/* Additional Information */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="p-1 bg-blue-200 rounded-full mt-0.5">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-800 mb-1">نصائح مهمة:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• اختر اسماً واضحاً ومميزاً لحملتك</li>
              <li>• تأكد من أن رابط موقعك يعمل بشكل صحيح</li>
              <li>• يجب أن يبدأ الرابط بـ https:// للأمان</li>
            </ul>
          </div>
        </div>
      </div>

    </Card>
  );
};

export default CampaignBasicInfo;

