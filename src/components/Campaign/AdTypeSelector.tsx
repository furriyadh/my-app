// المسار: src/components/Campaign/AdTypeSelector.tsx

import React from 'react';
import { Card } from '../ui/Card';
import { Target, AlertCircle, CheckCircle, Phone, Search, FileText, Youtube, Mail } from 'lucide-react';
import { AdType } from '../../lib/types/campaign';

interface AdTypeSelectorProps {
  selectedType: AdType | null;
  onSelect: (type: AdType) => void;
}

const AdTypeSelector: React.FC<AdTypeSelectorProps> = ({ selectedType, onSelect }) => {
  const adTypes: { type: AdType; icon: React.ReactNode; title: string; description: string; features: string[] }[] = [
    {
      type: 'search',
      icon: <Search className="w-8 h-8 text-blue-600" />,
      title: 'إعلانات البحث',
      description: 'إعلانات نصية تظهر في نتائج البحث',
      features: ['استهداف الكلمات المفتاحية', 'تكلفة منخفضة', 'نتائج سريعة']
    },
    {
      type: 'call',
      icon: <Phone className="w-8 h-8 text-green-600" />,
      title: 'إعلانات المكالمات',
      description: 'إعلانات تشجع على الاتصال المباشر',
      features: ['زيادة المكالمات', 'تفاعل مباشر', 'عملاء محتملون']
    },
    {
      type: 'youtube',
      icon: <Youtube className="w-8 h-8 text-red-600" />,
      title: 'إعلانات الفيديو',
      description: 'إعلانات فيديو على يوتيوب والشبكة',
      features: ['تفاعل عالي', 'محتوى مرئي', 'انتشار واسع']
    },
    {
      type: 'text',
      icon: <FileText className="w-8 h-8 text-purple-600" />,
      title: 'إعلانات نصية',
      description: 'إعلانات نصية بسيطة وفعالة',
      features: ['سهولة الإنشاء', 'تكلفة منخفضة', 'مرونة عالية']
    },
    {
      type: 'gmail',
      icon: <Mail className="w-8 h-8 text-orange-600" />,
      title: 'إعلانات جيميل',
      description: 'إعلانات تفاعلية في صندوق الوارد',
      features: ['وصول مباشر', 'تفاعل شخصي', 'معدل فتح عالي']
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">اختر نوع الإعلان</h2>
        <p className="text-gray-600">حدد نوع الإعلان الذي يناسب أهدافك التسويقية</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adTypes.map((adType) => (
          <div
            key={adType.type}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedType === adType.type
                ? 'ring-2 ring-blue-500 bg-blue-50'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => onSelect(adType.type)}
          >
            <Card>
              <div className="p-6">
                <div className="flex items-center space-x-3 space-x-reverse mb-4">
                  {adType.icon}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{adType.title}</h3>
                    {selectedType === adType.type && (
                      <CheckCircle className="w-5 h-5 text-green-500 float-left" />
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{adType.description}</p>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700 text-sm">المميزات:</h4>
                  <ul className="space-y-1">
                    {adType.features.map((feature, index) => (
                      <li key={index} className="text-xs text-gray-600 flex items-center space-x-2 space-x-reverse">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {selectedType && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 space-x-reverse">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">
              تم اختيار: {adTypes.find(type => type.type === selectedType)?.title}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdTypeSelector;

