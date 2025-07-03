'use client';

import React, { useState } from 'react';
import { Search, Upload, AlertCircle, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface SearchAdsFormData {
  headlines: string[];
  descriptions: string[];
  finalUrl: string;
  displayUrl: string;
  sitelinks?: {
    text: string;
    url: string;
  }[];
}

interface SearchAdsFormProps {
  data?: SearchAdsFormData;
  onChange: (data: SearchAdsFormData) => void;
  errors?: Record<string, string>;
}

export const SearchAdsForm: React.FC<SearchAdsFormProps> = ({
  data,
  onChange,
  errors = {}
}) => {
  const [formData, setFormData] = useState<SearchAdsFormData>(
    data || {
      headlines: ['', '', ''],
      descriptions: ['', ''],
      finalUrl: '',
      displayUrl: '',
      sitelinks: []
    }
  );

  const handleChange = (field: keyof SearchAdsFormData, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onChange(newData);
  };

  const handleHeadlineChange = (index: number, value: string) => {
    const newHeadlines = [...formData.headlines];
    newHeadlines[index] = value;
    handleChange('headlines', newHeadlines);
  };

  const handleDescriptionChange = (index: number, value: string) => {
    const newDescriptions = [...formData.descriptions];
    newDescriptions[index] = value;
    handleChange('descriptions', newDescriptions);
  };

  const addSitelink = () => {
    const newSitelinks = [...(formData.sitelinks || []), { text: '', url: '' }];
    handleChange('sitelinks', newSitelinks);
  };

  const removeSitelink = (index: number) => {
    const newSitelinks = formData.sitelinks?.filter((_, i) => i !== index) || [];
    handleChange('sitelinks', newSitelinks);
  };

  const updateSitelink = (index: number, field: 'text' | 'url', value: string) => {
    const newSitelinks = [...(formData.sitelinks || [])];
    newSitelinks[index] = { ...newSitelinks[index], [field]: value };
    handleChange('sitelinks', newSitelinks);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Search className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">إعلانات البحث</h3>
            <p className="text-sm text-gray-600">إعلانات نصية تظهر في نتائج البحث</p>
          </div>
        </div>

        {/* العناوين */}
        <div className="space-y-4 mb-6">
          <h4 className="font-medium text-gray-800">العناوين (مطلوب 3 عناوين على الأقل)</h4>
          {formData.headlines.map((headline, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                العنوان {index + 1} {index < 3 ? '*' : ''} (حتى 30 حرف)
              </label>
              <Input
                value={headline}
                onChange={(e) => handleHeadlineChange(index, e.target.value)}
                placeholder={`مثال: ${index === 0 ? 'أفضل خدمة في المملكة' : index === 1 ? 'جودة عالية وأسعار مناسبة' : 'اتصل الآن للحصول على عرض'}`}
                maxLength={30}
                error={errors[`headline${index}`]}
              />
              <div className="text-xs text-gray-500 mt-1">
                {headline.length}/30 حرف
              </div>
              {errors[`headline${index}`] && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors[`headline${index}`]}
                </div>
              )}
            </div>
          ))}
          
          {formData.headlines.length < 15 && (
            <Button
              variant="outline"
              onClick={() => handleChange('headlines', [...formData.headlines, ''])}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              إضافة عنوان آخر
            </Button>
          )}
        </div>

        {/* الأوصاف */}
        <div className="space-y-4 mb-6">
          <h4 className="font-medium text-gray-800">الأوصاف (مطلوب وصفين على الأقل)</h4>
          {formData.descriptions.map((description, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الوصف {index + 1} * (حتى 90 حرف)
              </label>
              <textarea
                value={description}
                onChange={(e) => handleDescriptionChange(index, e.target.value)}
                placeholder={`مثال: ${index === 0 ? 'نقدم أفضل الخدمات بجودة عالية وأسعار تنافسية. فريق محترف ومتخصص.' : 'خدمة عملاء ممتازة على مدار الساعة. ضمان الجودة والرضا التام.'}`}
                maxLength={90}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <div className="text-xs text-gray-500 mt-1">
                {description.length}/90 حرف
              </div>
              {errors[`description${index}`] && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors[`description${index}`]}
                </div>
              )}
            </div>
          ))}
          
          {formData.descriptions.length < 4 && (
            <Button
              variant="outline"
              onClick={() => handleChange('descriptions', [...formData.descriptions, ''])}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              إضافة وصف آخر
            </Button>
          )}
        </div>

        {/* الروابط */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
            {errors.finalUrl && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {errors.finalUrl}
              </div>
            )}
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
            <div className="text-xs text-gray-500 mt-1">
              الرابط الذي سيظهر في الإعلان
            </div>
          </div>
        </div>

        {/* روابط الموقع */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-800">روابط الموقع (اختيارية)</h4>
            <Button
              variant="outline"
              onClick={addSitelink}
              className="flex items-center gap-2"
              disabled={(formData.sitelinks?.length || 0) >= 6}
            >
              <Plus className="w-4 h-4" />
              إضافة رابط
            </Button>
          </div>

          {formData.sitelinks?.map((sitelink, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1 grid grid-cols-2 gap-3">
                <Input
                  value={sitelink.text}
                  onChange={(e) => updateSitelink(index, 'text', e.target.value)}
                  placeholder="نص الرابط"
                  maxLength={25}
                />
                <Input
                  value={sitelink.url}
                  onChange={(e) => updateSitelink(index, 'url', e.target.value)}
                  placeholder="https://example.com/page"
                />
              </div>
              <button
                onClick={() => removeSitelink(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* معاينة الإعلان */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-3">معاينة الإعلان</h4>
          <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-lg">
            <div className="space-y-1">
              {formData.headlines.filter(h => h.trim()).slice(0, 3).map((headline, index) => (
                <div key={index} className="text-blue-600 font-medium text-lg">
                  {headline || `العنوان ${index + 1}`}
                  {index < 2 && formData.headlines[index + 1]?.trim() && ' | '}
                </div>
              ))}
            </div>
            
            <div className="text-green-700 text-sm mt-1">
              {formData.displayUrl || formData.finalUrl || 'example.com'}
            </div>
            
            <div className="text-gray-700 text-sm mt-2 space-y-1">
              {formData.descriptions.filter(d => d.trim()).map((description, index) => (
                <div key={index}>{description || `الوصف ${index + 1}`}</div>
              ))}
            </div>

            {formData.sitelinks && formData.sitelinks.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.sitelinks.filter(s => s.text.trim()).map((sitelink, index) => (
                  <div key={index} className="text-blue-600 text-sm underline">
                    {sitelink.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

