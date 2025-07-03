'use client';

import React from 'react';
import { Zap, Sun, Moon } from 'lucide-react';

interface PresetSchedulesProps {
  selectedPreset?: string;
  onSelect: (preset: string) => void;
  timezone: string;
  className?: string;
}

export const PresetSchedules: React.FC<PresetSchedulesProps> = ({
  selectedPreset,
  onSelect,
  timezone,
  className = ''
}) => {
  const presets = [
    {
      id: 'peak',
      name: 'وقت الذروة',
      description: 'الأوقات الأكثر نشاطاً (مُوصى به)',
      icon: Zap,
      times: '6:00 ص - 10:00 ص، 6:00 م - 11:00 م',
      color: 'from-orange-500 to-red-500',
      recommended: true
    },
    {
      id: 'business',
      name: 'ساعات العمل',
      description: 'أوقات العمل الرسمية',
      icon: Sun,
      times: '9:00 ص - 6:00 م',
      color: 'from-blue-500 to-blue-600',
      recommended: false
    },
    {
      id: 'night',
      name: 'التشغيل الليلي',
      description: 'للوصول للجمهور الليلي',
      icon: Moon,
      times: '10:00 م - 2:00 ص',
      color: 'from-purple-500 to-indigo-600',
      recommended: false
    }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-sm text-gray-600 mb-4">
        التوقيت المحلي للمنطقة المستهدفة: {timezone}
      </div>
      
      {presets.map((preset) => {
        const IconComponent = preset.icon;
        const isSelected = selectedPreset === preset.id;
        
        return (
          <div
            key={preset.id}
            onClick={() => onSelect(preset.id)}
            className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
              isSelected 
                ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200' 
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
          >
            {/* شارة الاختيار */}
            {isSelected && (
              <div className="absolute top-3 left-3">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              </div>
            )}

            {/* شارة الترشيح */}
            {preset.recommended && (
              <div className="absolute top-3 right-3">
                <span className="px-2 py-1 text-xs font-medium text-orange-800 bg-orange-100 rounded-full">
                  مُوصى به
                </span>
              </div>
            )}

            <div className="flex items-center gap-4">
              {/* الأيقونة */}
              <div className={`p-3 rounded-lg bg-gradient-to-r ${preset.color}`}>
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              
              {/* المحتوى */}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-1">{preset.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{preset.description}</p>
                <div className="text-sm font-medium text-gray-700">{preset.times}</div>
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
  );
};

