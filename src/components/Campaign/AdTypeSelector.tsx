'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Target, AlertCircle, CheckCircle, Phone, Search, FileText, Youtube, Mail } from 'lucide-react';
import { AdType } from '@/lib/types/campaign';

interface AdTypeSelectorProps {
  selectedType: AdType | null;
  onSelect: (type: AdType) => void;
  error?: string;
  className?: string;
}

// أنواع الإعلانات المتاحة
const AD_TYPES = [
  {
    id: 'call' as AdType,
    name: 'إعلانات الاتصال',
    description: 'إعلانات تهدف لجذب المكالمات الهاتفية المباشرة',
    icon: Phone,
    color: 'from-green-500 to-emerald-600',
    features: ['رقم هاتف مرئي', 'زر اتصال مباشر', 'تتبع المكالمات'],
    backendValue: 'عملاء محتملون'
  },
  {
    id: 'search' as AdType,
    name: 'إعلانات البحث',
    description: 'إعلانات تظهر في نتائج البحث على Google',
    icon: Search,
    color: 'from-blue-500 to-blue-600',
    features: ['ظهور في البحث', 'كلمات مفتاحية', 'نقرات عالية الجودة'],
    backendValue: 'إعلانات البحث'
  },
  {
    id: 'text' as AdType,
    name: 'إعلانات نصية',
    description: 'إعلانات نصية بسيطة وفعالة للشبكة الإعلانية',
    icon: FileText,
    color: 'from-purple-500 to-purple-600',
    features: ['نصوص جذابة', 'انتشار واسع', 'تكلفة منخفضة'],
    backendValue: 'إعلانات نصية'
  },
  {
    id: 'youtube' as AdType,
    name: 'إعلانات YouTube',
    description: 'إعلانات فيديو تفاعلية على منصة YouTube',
    icon: Youtube,
    color: 'from-red-500 to-red-600',
    features: ['فيديوهات جذابة', 'استهداف دقيق', 'تفاعل عالي'],
    backendValue: 'إعلانات يوتيوب'
  },
  {
    id: 'gmail' as AdType,
    name: 'إعلانات Gmail',
    description: 'إعلانات تفاعلية تظهر في صندوق البريد',
    icon: Mail,
    color: 'from-orange-500 to-orange-600',
    features: ['وصول مباشر', 'تصميم تفاعلي', 'معدل فتح عالي'],
    backendValue: 'إعلانات جيميل'
  }
];

export const AdTypeSelector: React.FC<AdTypeSelectorProps> = ({
  selectedType,
  onSelect,
  error,
  className = ''
}) => {

  return (
    <Card className={`p-8 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Target className="w-6 h-6 text-purple-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800">نوع الإعلان</h2>
      </div>

      {error && (
        <div className="flex items-center gap-2 mb-6 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {AD_TYPES.map((adType) => {
          const IconComponent = adType.icon;
          const isSelected = selectedType === adType.id;
          
          return (
            <div
              key={adType.id}
              onClick={() => onSelect(adType.id)}
              className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              {/* أيقونة الاختيار */}
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
              )}

              {/* محتوى الكرت */}
              <div className="text-center">
                {/* الأيقونة الرئيسية */}
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${adType.color} mb-4`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                
                {/* العنوان والوصف */}
                <h3 className="font-semibold text-gray-800 mb-2">{adType.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{adType.description}</p>
                
                {/* المميزات */}
                <div className="space-y-1">
                  {adType.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* تأثير الانتقاء */}
              {isSelected && (
                <div className="absolute inset-0 bg-blue-500 bg-opacity-5 rounded-xl pointer-events-none"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* معلومات إضافية */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-start gap-3">
          <div className="p-1 bg-gray-300 rounded-full mt-0.5">
            <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-800 mb-1">كيف تختار النوع المناسب؟</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>إعلانات الاتصال:</strong> مثالية للخدمات التي تتطلب تواصل مباشر</li>
              <li>• <strong>إعلانات البحث:</strong> الأفضل لزيادة زيارات الموقع</li>
              <li>• <strong>إعلانات YouTube:</strong> مناسبة للعلامات التجارية والمنتجات المرئية</li>
            </ul>
          </div>
        </div>
      </div>

    </Card>
  );
};

export default AdTypeSelector;

